import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, payload } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (action) {
      case 'chat':
        return await handleChat(payload)
      case 'embedding':
        return await handleEmbedding(payload)
      case 'heartbeat':
        return await handleHeartbeat(supabaseClient)
      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
    }

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error'
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

// ─── GEMINI CHAT ────────────────────────────────────────────────────────────
async function handleChat(payload: {
  messages: unknown[]
  model?: string
  systemInstruction?: string
  temperature?: number
  attachments?: Array<{ type: string; data: string; name: string }>
}) {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured in Supabase secrets' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  const modelsToTry = [
    payload.model || 'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-flash-latest',
  ]
  const versionsToTry = ['v1beta']

  let lastError = ''

  for (const version of versionsToTry) {
    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`

        const body: Record<string, unknown> = {
          contents: payload.messages,
          generationConfig: {
            temperature: payload.temperature ?? 0.7,
            maxOutputTokens: 8192,
            topP: 0.95,
          },
        }

        if (payload.systemInstruction) {
          body['system_instruction'] = { parts: [{ text: payload.systemInstruction }] }
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          lastError = (errData as { error?: { message?: string } }).error?.message || response.statusText
          console.warn(`[nexa-core] ${model}@${version} failed: ${lastError}`)
          continue
        }

        const data = await response.json()
        console.log(`[nexa-core] ✅ Responded with ${model}@${version}`)
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })

      } catch (e: unknown) {
        lastError = e instanceof Error ? e.message : String(e)
      }
    }
  }

  return new Response(JSON.stringify({ error: `All Gemini models failed. Last error: ${lastError}` }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 502,
  })
}

// ─── GEMINI EMBEDDINGS ───────────────────────────────────────────────────────
async function handleEmbedding(payload: { text: string }) {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=${apiKey}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text: payload.text }] },
      }),
    })

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}

// ─── AUTONOMOUS HEARTBEAT ────────────────────────────────────────────────────
async function handleHeartbeat(supabase: ReturnType<typeof createClient>) {
  console.log('❤️ Starting Autonomous Heartbeat Cycle...')

  const { data: recentMemories } = await supabase
    .from('memories')
    .select('content, role')
    .order('created_at', { ascending: false })
    .limit(5)

  const summary = `Nexa pulsó con éxito. Analizando ${recentMemories?.length || 0} recuerdos recientes.`

  const { error } = await supabase
    .from('cognitive_cycles')
    .insert({
      type: 'heartbeat',
      status: 'success',
      summary,
      detail: { memories_count: recentMemories?.length || 0 },
    })

  if (error) throw error

  return new Response(JSON.stringify({ status: 'Cognitive cycle completed', summary }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
}
