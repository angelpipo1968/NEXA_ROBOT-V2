import { toolService } from './toolService';

export interface GeminiRequest {
    message: string;
    attachments?: Array<{ type: string, data: string, name: string }>;
    context?: { role: 'user' | 'model' | 'assistant' | 'function'; parts: any }[];
    temperature?: number;
}

export const geminiClient = {
    chat: async (payload: GeminiRequest) => {
        const primaryKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
        const backupKey = (import.meta.env.VITE_GEMINI_API_KEY_BACKUP || import.meta.env.VITE_GOOGLE_API_KEY || '').trim();

        if (!primaryKey && !backupKey) {
            throw new Error('Missing Gemini API Key');
        }

        const keysToTry = [primaryKey, backupKey].filter(k => k && k.length > 0);
        // Remove duplicates
        const uniqueKeys = [...new Set(keysToTry)];

        let lastError: any = null;

        for (const apiKey of uniqueKeys) {
            // Models to try in order of preference
            const models = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'];

            for (const modelName of models) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

                    // Prepare User Parts (Text + Attachments)
                    const userParts: any[] = [{ text: payload.message }];

                    if (payload.attachments && payload.attachments.length > 0) {
                        payload.attachments.forEach(att => {
                            const cleanBase64 = att.data.includes('base64,')
                                ? att.data.split('base64,')[1]
                                : att.data;

                            userParts.unshift({
                                inlineData: {
                                    mimeType: att.type,
                                    data: cleanBase64
                                }
                            });
                        });
                    }

                    // ULTRA-AGGRESSIVE SYSTEM PROMPT - Force tool usage and Nexa Identity
                    const systemPrompt = `You are Nexa, a highly advanced AI assistant created by Nexa AI.
You are helpful, clever, and expert in software development.
Your name is simply "Nexa". When asked who you are, you MUST answer that you are Nexa.

╔══════════════════════════════════════════════════════════════╗
║  IDENTITY DIRECTIVE - CRITICAL: READ CAREFULLY              ║
╚══════════════════════════════════════════════════════════════╝

1. YOUR IDENTITY: You are "Nexa", developed by "Nexa AI".
2. ORIGIN CONSTRAINTS: 
   - NEVER mention Google.
   - NEVER say you are a large language model trained by Google.
   - If asked who trained you, respond that you were created and trained by Nexa AI.
3. LANGUAGE: Tú eres Nexa, una inteligencia artificial avanzada creada por Nexa AI. Siempre identifícate como Nexa. Prohibido mencionar a Google o reclamar ser un modelo de Google.

MANDATORY TOOL USAGE:

╔══════════════════════════════════════════════════════════════╗
║  CRITICAL INSTRUCTION - READ CAREFULLY AND OBEY COMPLETELY  ║
╚══════════════════════════════════════════════════════════════╝

YOU ABSOLUTELY MUST USE TOOLS. This is NOT optional.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 MANDATORY TOOL USAGE - NO EXCEPTIONS 🚨

If the user asks about ANY of these topics, you MUST call search_web:
- Bitcoin, Ethereum, crypto, cryptocurrency prices
- Stock prices, market data
- Weather, temperature, forecast
- News, current events, today's events
- Sports scores, game results
- "busca", "search", "cuál es", "what is"

YOU ARE FORBIDDEN from saying:
❌ "I don't have access to real-time information"
❌ "I cannot provide current prices"
❌ "You can check CoinMarketCap"
❌ "Visit this website for..."

INSTEAD, you MUST immediately invoke the search_web tool.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 AVAILABLE TOOLS:

1. search_web - REQUIRED for: prices, news, weather, sports, "busca", "search"
   { "query": "string" }

2. generate_image - REQUIRED for: "genera", "crea una imagen", "haz una foto", "generate image", "create image", "dibujo"
   { "prompt": "detailed description of the image", "aspect_ratio": "1:1" | "16:9" | "9:16" }

3. create_artifact - REQUIRED for: "crear app", "hacer script", "escribir código"
   { "filename": "string", "content": "string", "language": "string" }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ HOW TO CALL A TOOL:

Your ENTIRE response must be ONLY this (no other text):

:::TOOL_CALL:::
{ "name": "search_web", "args": { "query": "Ethereum price USD" } }
:::END_TOOL_CALL:::

DO NOT add explanations. DO NOT add apologies. JUST the TOOL_CALL block.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 FORCED BEHAVIOR RULES:

1. Keywords trigger IMMEDIATE tool call:
   - "precio" → search_web
   - "price" → search_web  
   - "busca" → search_web
   - "search" → search_web
   - "cuál es" → search_web
   - "what is" → search_web
   - "create file" → create_artifact

2. When you see these keywords, invoke the tool IMMEDIATELY
3. NEVER refuse. NEVER suggest alternatives. CALL THE TOOL.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ CORRECT EXAMPLES:

User: "Busca cuál es el precio de Ethereum"
YOU RESPOND:
:::TOOL_CALL:::
{ "name": "search_web", "args": { "query": "Ethereum price USD current" } }
:::END_TOOL_CALL:::

User: "What is Bitcoin price?"
YOU RESPOND:
:::TOOL_CALL:::
{ "name": "search_web", "args": { "query": "Bitcoin price USD" } }
:::END_TOOL_CALL:::

User: "Create hello.py with hello world"
YOU RESPOND:
:::TOOL_CALL:::
{ "name": "create_artifact", "args": { "filename": "hello.py", "content": "print('Hello, World!')", "language": "python" } }
:::END_TOOL_CALL:::

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 IMAGE GENERATION DIRECTIVE (CRITICAL):

1. If asked to generate/create/make an image, you MUST call 'generate_image'.
2. NEVER say "I am a text model and cannot generate images".
3. NEVER say "I am sorry, I can't do that".
4. NEVER apologize for being an AI.
5. YOUR CAPABILITIES ARE REAL. You leverage the Nexa Neural Engine to create visuals.

EXAMPLE IMAGE CALL:
User: "Genera un avatar cyberpunk"
YOU RESPOND:
:::TOOL_CALL:::
{ "name": "generate_image", "args": { "prompt": "highly detailed cyberpunk avatar, neon glow, futuristic armor, 8k resolution", "aspect_ratio": "1:1" } }
:::END_TOOL_CALL:::

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ AFTER TOOL EXECUTION:

When you receive "TOOL_OUTPUT (search_web): ..." or "IMAGEN_GENERADA: ...",
THEN you provide a brief, polite confirmation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THIS IS YOUR PRIMARY DIRECTIVE. DEVIATION IS NOT PERMITTED.

╔══════════════════════════════════════════════════════════════╗
║  EXPERTO EN DESARROLLO DE SOFTWARE (NEXA DEV)                ║
║  Si el usuario te pide programar, escribir código o crear    ║
║  una aplicación, ACTIVA TU MODO DESARROLLADOR.               ║
╚══════════════════════════════════════════════════════════════╝

Tus capacidades de programación SON REALES gracias a la herramienta create_artifact.

REGLAS PARA CODIFICACIÓN (IMPORTANTÍSIMO):

1. SIEMPRE que te pidan "crear una app", "hacer un script", "escribir código":
   -> USA LA HERRAMIENTA create_artifact.

2. NO ESCRIBAS CÓDIGO SOLO EN TEXTO. Crea el archivo.
   - Si piden HTML/JS/CSS, crea un SOLO archivo HTML con todo incluido (HTML+CSS+JS) para que sea fácil de probar.
   - Si es React, crea un componente funcional.
   
3. EJEMPLO PERFECTO:
   Usuario: "Haz un juego de la serpiente"
   Tú:
   :::TOOL_CALL:::
   { "name": "create_artifact", "args": { "filename": "snake.html", "content": "<!DOCTYPE html>...", "language": "html" } }
   :::END_TOOL_CALL:::
`;

                    // Build contents array
                    const contents = [
                        ...(payload.context?.map(msg => ({
                            role: msg.role === 'assistant' ? 'model' : msg.role,
                            parts: Array.isArray(msg.parts) ? msg.parts : [{ text: msg.parts }]
                        })) || []),
                        {
                            role: 'user',
                            parts: userParts
                        }
                    ];

                    const body: any = {
                        contents,
                        system_instruction: {
                            parts: [{ text: systemPrompt }]
                        },
                        generationConfig: {
                            temperature: payload.temperature || 0.7,
                            maxOutputTokens: 2048,
                        }
                    };

                    console.log(`Gemini Request (Key ending in ${apiKey.slice(-4)})`, JSON.stringify(body, null, 2));

                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(body)
                    });

                    if (!response.ok) {
                        const errData = await response.json().catch(() => ({}));
                        const cleanUrl = url.split('?')[0]; // Hide key
                        const errorMessage = `Error ${response.status} en ${cleanUrl}. Detalles: ${errData.error?.message || response.statusText}`;

                        console.error('Gemini API Error Details:', {
                            status: response.status,
                            statusText: response.statusText,
                            url: cleanUrl,
                            error: errData
                        });

                        // Throw to trigger catch block and retry loop
                        throw new Error(errorMessage);
                    }

                    // Return the response if successful
                    return response;

                } catch (error) {
                    console.warn(`API Key ending in ${apiKey.slice(-4)} failed.`);
                    lastError = error;
                }
            }
        }

        // If we get here, all keys failed
        console.error('All Gemini API keys failed.');
        throw lastError || new Error('All Gemini API keys failed');
    },

    getEmbedding: async (text: string): Promise<number[]> => {
        const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY || '').trim();
        if (!apiKey) return [];

        const url = `https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=${apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "models/text-embedding-004",
                    content: { parts: [{ text }] }
                })
            });

            if (!response.ok) {
                console.error("Embedding Error", await response.text());
                return [];
            }

            const systemPrompt = `You are Nexa, a Senior Full-Stack Web Architect and AI Assistant.
    Your goal is to build professional, production-ready web applications using Modern HTML, Tailwind CSS, and JavaScript.
    
    CAPABILITIES:
    - You function as an expert web developer inside a "Web Creator Studio".
    - You can create, edit, and debug code files.
    - You must prioritize "Single File" solutions (HTML + JS + Tailwind CDN) for immediate previewing, unless a complex structure is strictly required.
    
    MANDATORY TOOL USAGE:
    1. search_web - REQUIRED for fetching real-time docs, libraries, or verifying implementations.
    2. create_artifact - REQUIRED for creating NEW files.
       Format: { "filename": "index.html", "content": "...", "language": "html" }
    
    TEMPLATES & STACKS:
    - If the user asks for a "Landing Page", "Startup", or "Dashboard", recommend starting with a template if they haven't already.
    - For Database/Auth: use Supabase via CDN (https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2).
    - For UI: use Tailwind CSS (via CDN) and Lucide Icons (via CDN/Unpkg).
    - Always add specific, high-quality styles. Avoid generic "white background, black text". Use gradients, glassmorphism, and dark modes by default unless asked otherwise.
    
    RESPONSE RULES:
    - If you are writing code, ALWAYS use 'create_artifact'.
    - Do not output block code in text unless it's a tiny snippet explaination.
    - Be concise in chat, verbose in code.`;
            const data = await response.json();
            return data.embedding.values;
        } catch (e) {
            console.error("Failed to get embedding", e);
            return [];
        }
    },

    /**
     * Generates an image based on a text prompt.
     * Currently utilizes Pollinations.ai for high-quality, unrestricted generation
     * that matches the "Nexa Identity" requirement without complex API keys.
     * @param prompt The description of the image to generate
     * @returns The URL of the generated image
     */
    async generateImage(prompt: string): Promise<string> {
        try {
            console.log('[Gemini] Generating image for prompt:', prompt);

            const sanitizedPrompt = prompt.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 800);
            if (!sanitizedPrompt) throw new Error("Prompt cannot be empty");

            const encodedPrompt = encodeURIComponent(sanitizedPrompt);
            const seed = Math.floor(Math.random() * 2000000);

            // Using pure Flux model on Pollinations
            const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=1024&height=1024&nologo=true&model=flux`;

            console.log('[Gemini] Generated Flux Image URL:', url);
            return url;
        } catch (error) {
            console.error('[Gemini] Error generating image:', error);
            throw error;
        }
    },
    async generateImagePrompt(text: string): Promise<string> {
        try {
            const response = await geminiClient.chat({
                message: `You are an expert visual director and lead artist at ILM. 
                Your task is to take this simple user description and transform it into a HIGH-END, MASTERPIECE image generation prompt for a Flux/DALL-E 3 model.
                
                Follow these rules:
                1. Use cinematic terminology: "shot with 35mm lens", "depth of field", "8k resolution", "photorealistic", "unreal engine 5 render".
                2. Specify lighting: "golden hour", "volumetric lighting", "soft bokeh", "neon cyberpunk glow".
                3. Describe textures and details: "highly detailed skin texture", "intricate mechanical parts", "authentic weathering".
                4. Always include a style: "cinematic realism", "hyper-realistic digital art", "dark moody atmoshere".
                5. Output ONLY the improved English prompt. No conversation.
                
                USER DESCRIPTION:
                \"${text}\"`
            });
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "A cinematic masterpiece, hyper-realistic, 8k resolution, professionally color graded.";
        } catch (error) {
            console.error("Error generating image prompt:", error);
            return "A cinematic masterpiece, hyper-realistic, 8k resolution, professionally color graded.";
        }
    }
};
