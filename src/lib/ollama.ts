
export interface OllamaRequest {
    message: string;
    model?: string;
    context?: any[];
}

export const ollamaClient = {
    chat: async (payload: OllamaRequest) => {
        // Use proxy to avoid CORS issues
        const url = '/ollama-api/api/generate';
        const model = payload.model || 'deepseek-r1:8b';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    prompt: payload.message,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('[Ollama] Error:', error);
            throw error;
        }
    }
};
