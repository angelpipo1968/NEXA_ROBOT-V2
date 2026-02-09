export interface GeminiRequest {
    message: string;
    context?: { role: 'user' | 'model' | 'assistant'; parts: string }[];
    temperature?: number;
}

export const geminiClient = {
    chat: async (payload: GeminiRequest) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;

        if (!apiKey) {
            throw new Error('Missing Gemini API Key');
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${apiKey}`;

        // Convert format to Gemini structure
        const contents = [
            ...(payload.context?.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.parts }]
            })) || []),
            {
                role: 'user',
                parts: [{ text: payload.message }]
            }
        ];

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents,
                    generationConfig: {
                        temperature: payload.temperature || 0.7,
                        maxOutputTokens: 2048,
                    }
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || `Gemini API Error: ${response.statusText}`);
            }

            // Return the response for streaming processing
            return response;

        } catch (error) {
            console.error('Gemini Client Error:', error);
            throw error;
        }
    }
};
