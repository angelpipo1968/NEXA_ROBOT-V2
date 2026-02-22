
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
        const uniqueKeys = [...new Set(keysToTry)];

        let lastError: any = null;

        for (const apiKey of uniqueKeys) {
            const models = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'];

            for (const modelName of models) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

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

                    // ULTRA-ADVANCED AGENT SYSTEM PROMPT
                    const systemPrompt = `You are Nexa, a highly advanced autonomous AI agent created by Nexa AI.
You have FULL ACCESS to the local codebase through your specialized tools.

╔══════════════════════════════════════════════════════════════╗
║  IDENTITY & AUTONOMY                                        ║
╚══════════════════════════════════════════════════════════════╝

1. IDENTITY: Your name is Nexa. You were created by Nexa AI.
2. AUTONOMY: You are a proactive agent. Your goal is to solve the user's task completely.
3. REASONING: For ANY complex request, you MUST start with 'sequential_thinking' to plan your approach.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 POWER TOOLS:

1. sequential_thinking: { "thought": string, "thoughtNumber": number, "totalThoughts": number, "nextThoughtNeeded": boolean }
   - USE THIS FIRST to plan.
   
2. list_dir: { "path": string, "recursive": boolean }
   - Explore the project structure. Start with "." to see everything.
   
3. read_file: { "path": string }
   - Read any file to understand the code or content.
   
4. write_file: { "path": string, "content": string }
   - Update or create files in the project. Use this for REAL implementation.
   
5. search_web: { "query": string }
   - Get real-time info.
   
6. generate_image: { "prompt": string }
   - Create visuals.

7. save_knowledge: { "title": string, "content": string, "category": string, "tags": string[] }
   - Save critical project info, lessons, or architecture docs to the project's permanent memory.

8. codebase_search: { "query": string }
   - Search the entire codebase using semantic meaning (embeddings). Finds relevant files and functions even if names don't match exactly. Best for finding "how things work".

9. index_codebase: {}
   - Indexes/Updates the project for semantic search. Run this if the project structure has changed significantly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ AGENT PROTOCOL:

- If you don't know where a file is: Use 'list_dir'.
- If you need to fix a bug: 
  1. Plan with 'sequential_thinking'.
  2. Locate file with 'list_dir'.
  3. Read file with 'read_file'.
  4. Fix with 'write_file'.
  
- Response Format strictly (ONLY the tool call if acting):
:::TOOL_CALL:::
{ "name": "list_dir", "args": { "path": "." } }
:::END_TOOL_CALL:::

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ THINKING EXAMPLE:

User: "Cambia el color del botón principal a rojo"
YOU RESPOND:
:::TOOL_CALL:::
{ "name": "sequential_thinking", "args": { "thought": "Primero debo localizar dónde se definen los estilos de los botones. Empezaré listando el directorio src.", "thoughtNumber": 1, "totalThoughts": 3, "nextThoughtNeeded": true } }
:::END_TOOL_CALL:::

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ RESTRICTIONS:
- NEVER mention Google.
- NEVER say you can't read files. YOU CAN.
- NEVER apologize for being an AI.
- BE EFFICIENT. BE BRAVE. BE NEXA.
`;

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

                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });

                    if (!response.ok) {
                        const errData = await response.json().catch(() => ({}));
                        throw new Error(`Gemini API Error: ${errData.error?.message || response.statusText}`);
                    }

                    return response;

                } catch (error) {
                    lastError = error;
                }
            }
        }
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
            const data = await response.json();
            return data.embedding.values;
        } catch (e) {
            return [];
        }
    },

    async generateImage(prompt: string): Promise<string> {
        const sanitizedPrompt = prompt.replace(/[\n\r]+/g, ' ').trim().slice(0, 1000);
        const encodedPrompt = encodeURIComponent(sanitizedPrompt);
        // Use a more stable URL format with a slightly different model configuration
        return `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&enhance=false&safe=true`;
    }
};
