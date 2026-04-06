import { NEXA_SYSTEM_PROMPT } from './systemPrompt';

export interface GeminiRequest {
    message: string;
    attachments?: Array<{ type: string, data: string, name: string }>;
    context?: { role: 'user' | 'model' | 'assistant' | 'function'; parts: any }[];
    temperature?: number;
    systemInstruction?: string;
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
            // Updated model list for better compatibility
            const models = [
                'gemini-2.0-flash-thinking-exp',
                'gemini-2.0-flash',
                'gemini-1.5-flash',
                'gemini-1.5-pro',
                'gemini-1.5-flash-8b'
            ];

            const apiVersions = ['v1beta', 'v1']; // Fallback to v1 if v1beta fails

            for (const apiVersion of apiVersions) {
                for (const modelName of models) {
                    try {
                        const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`;

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

                        const systemPrompt = payload.systemInstruction || NEXA_SYSTEM_PROMPT;

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
                                parts: [{ text: payload.systemInstruction || systemPrompt }]
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
                            console.warn(`[Gemini] Model ${modelName} failed on ${apiVersion}: ${errData.error?.message || response.statusText}`);
                            throw new Error(`Gemini API Error: ${errData.error?.message || response.statusText}`);
                        }

                        console.log(`[Gemini] ✅ Successfully used ${modelName} on ${apiVersion}`);
                        return response;

                    } catch (error) {
                        lastError = error;
                    }
                }
            }
        }
        throw lastError || new Error('All Gemini API keys and models failed');
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
        } catch {
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
