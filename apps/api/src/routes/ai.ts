import { Hono } from 'hono'
import { ModelRouter } from '@nexa/models'
import { safetyFilter } from '@nexa/core'
import { BookResearchCore } from '@nexa/search-service'
import { MemoryManager } from '@nexa/memory'

/**
 * AI Configuration & Engines
 */
const API_KEY = process.env.GEMINI_API_KEY || "";
const AI_MODEL = "gemini-1.5-pro";

const engines = {
    gemini: `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent`,
    nexa: "http://localhost:3000/api/nexa"
};

/**
 * Retrieves the engine URL based on its name.
 */
function getEngine(engineName: keyof typeof engines) {
    return engines[engineName];
}

const app = new Hono()
const modelRouter = new ModelRouter()
const memory = new MemoryManager()

/**
 * AI Endpoint
 * POST /api/ai
 */
app.post('/api/ai', async (c) => {
    try {
        const body = await c.req.json()
        const { userId = 'anonymous', engine = 'nexa' } = body

        let prompt = body.prompt;
        let contents: any[] = [];

        // Support for Gemini structure (contents)
        if (body.contents && Array.isArray(body.contents)) {
            contents = body.contents;
            const lastMessage = contents[contents.length - 1];
            if (lastMessage && lastMessage.parts && lastMessage.parts[0]) {
                prompt = lastMessage.parts[0].text;
            }
        }
        // Support for messages structure (standard)
        else if (body.messages && Array.isArray(body.messages) && body.messages.length > 0) {
            const lastMessage = body.messages[body.messages.length - 1];
            prompt = lastMessage.content;
            contents = body.messages.map((m: any) => ({
                role: m.role,
                parts: [{ text: m.content }]
            }));
        }

        // 1. Validation
        if (!prompt) {
            return c.json({
                success: false,
                error: 'Missing required field: prompt, messages, or contents'
            }, 400)
        }

        // 2. Safety Check
        const safetyResult = await safetyFilter.validate(prompt)
        if (!safetyResult.allowed) {
            return c.json({
                success: false,
                error: 'Safety violation',
                reason: safetyResult.reason
            }, 400)
        }

        // 3. Memory Retrieval
        const userMemory = await memory.retrieve(userId, prompt);
        const memoryContext = [
            ...userMemory.recent.map(m => ({ role: 'user', parts: [{ text: `Memoria Reciente: ${m.query} -> ${m.response}` }] })),
            ...userMemory.similar.map(s => ({ role: 'model', parts: [{ text: `Hecho Recordado: ${s.content}` }] }))
        ];

        // 4. Engine Routing
        const engineUrl = getEngine(engine as any) || engines.nexa;

        console.log(`[AI-API] Routing to ${engine}: ${engineUrl}`);

        // 5. Model Execution via Nexa ModelRouter
        const result = await modelRouter.route({
            userId,
            message: prompt,
            context: [...memoryContext, ...contents.slice(0, -1)],
            priority: engine === 'gemini' ? 'quality' : 'balanced',
            requirements: engine === 'gemini' ? { modelId: AI_MODEL } : undefined
        })

        // 6. Memory Update (Async)
        memory.update(userId, {
            query: prompt,
            response: result.text,
            metadata: { engine, model: result.modelId }
        }).catch(err => console.error('[Memory-Update-Error]:', err));

        // 5. Response Formatting
        return c.json({
            success: true,
            reply: result.text,
            metadata: {
                engine,
                engineUrl,
                model: engine === 'gemini' ? AI_MODEL : (result.modelId || 'local'),
                latency: result.latency,
                timestamp: new Date().toISOString()
            }
        })

    } catch (error: any) {
        console.error('[AI-API-ERROR]:', error)
        return c.json({
            success: false,
            error: error.message || 'Internal AI processing error'
        }, 500)
    }
})

/**
 * Studio Expansion Endpoint
 * POST /api/ai/expand
 */
app.post('/api/ai/expand', async (c) => {
    try {
        const body = await c.req.json()
        const { text, mode, subMode } = body

        if (!text) return c.json({ error: 'Falta el texto de contexto' }, 400)

        const researchCore = new BookResearchCore()
        let suggestions: any[] = []

        if (mode === 'investigacion') {
            try {
                const research = await researchCore.researchContext(text)

                // Synthesis of results for "Clear and Precise" response
                const synthesisPrompt = `Actúa como un Investigador Documental de élite. 
                Basado en estos resultados de búsqueda para el contexto: "${text.substring(0, 500)}", 
                proporciona un RESUMEN EJECUTIVO claro, preciso y profundo (máximo 3 párrafos).
                
                Resultados:
                ${research.sources.map(s => `- ${s.apa}: ${s.raw.snippet}`).join('\n')}
                
                Responde en formato JSON: { "summary": "...", "key_facts": ["...", "..."] }`;

                const synthesis = await modelRouter.route({
                    userId: 'studio',
                    message: synthesisPrompt,
                    priority: 'quality'
                });

                const parsedSynthesis = JSON.parse(synthesis.text.replace(/```json|```/g, '').trim() || '{}');

                suggestions = [
                    {
                        titulo: 'Resumen de Investigación Deep',
                        contenido: parsedSynthesis.summary || 'Síntesis no disponible.',
                        tipo: 'Sintesis',
                        facts: parsedSynthesis.key_facts || []
                    },
                    ...research.sources.map((s: any) => ({
                        titulo: s.raw.title,
                        contenido: s.raw.snippet,
                        tipo: 'Fuente',
                        sourceUrl: s.raw.url,
                        cita: s.apa
                    }))
                ]
            } catch (err: any) {
                console.error('[INVESTIGACION-ERROR]:', err)
                // Fallback to a simple message if search fails (e.g. no API keys)
                suggestions = [{
                    titulo: 'Investigación Limitada',
                    contenido: 'No se pudieron obtener resultados externos en este momento. Intenta de nuevo más tarde.',
                    tipo: 'Info'
                }]
            }
        } else if (mode === 'imagenes') {
            // prompt for Gemini to generate image prompts
            const prompt = `Analiza este fragmento literario y genera 3 descripciones visuales conceptuales (en inglés) para crear imágenes artísticas.
             Texto: "${text}"
             Responde ÚNICAMENTE con un JSON format: { "images": [ { "title": "...", "prompt": "..." } ] }`

            const result = await modelRouter.route({
                userId: 'studio',
                message: prompt,
                priority: 'quality'
            });

            try {
                const content = result.text.replace(/```json|```/g, '').trim();
                const parsed = JSON.parse(content)
                suggestions = parsed.images.map((img: any) => ({
                    titulo: img.title,
                    contenido: img.prompt,
                    tipo: 'Imagen',
                    imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(img.prompt)}?nologo=true`
                }))
            } catch (e) {
                suggestions = [{
                    titulo: 'Inspiración Visual',
                    contenido: text.substring(0, 100),
                    tipo: 'Imagen',
                    imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(text.substring(0, 200))}?nologo=true`
                }]
            }
        } else {
            // mode === 'ideas'
            const prompt = `Actúa como un asistente creativo literario experto en "Estilo Rico" y "Claridad Mental". 
            Basado en este fragmento: "${text}", genera 3 sugerencias potentes, viscerales y originales para expandir la historia enfocándote en: ${subMode}.
            Responde ÚNICAMENTE con un JSON format: { "suggestions": [ { "title": "...", "content": "...", "type": "..." } ] }`

            const result = await modelRouter.route({
                userId: 'studio',
                message: prompt,
                priority: 'quality'
            });

            try {
                const content = result.text.replace(/```json|```/g, '').trim();
                const parsed = JSON.parse(content)
                suggestions = parsed.suggestions.map((s: any) => ({
                    titulo: s.title,
                    contenido: s.content,
                    tipo: s.type || subMode
                }))
            } catch (e) {
                suggestions = [{
                    titulo: 'Sugerencia Creativa',
                    contenido: 'Considera profundizar en la motivación interna del personaje en este momento para dar más peso emocional a la escena.',
                    tipo: subMode
                }]
            }
        }

        return c.json({ suggestions })
    } catch (error: any) {
        console.error('[AI-EXPAND-ERROR]:', error)
        return c.json({ error: 'Internal Error', message: error.message }, 500)
    }
})

export default app
