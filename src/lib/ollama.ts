
export interface OllamaRequest {
    message: string;
    model?: string;
    context?: any[];
}

export const ollamaClient = {
    chat: async (payload: OllamaRequest) => {
        // Manejar entorno de Capacitor (App Android) vs Web
        const isCapacitor = !!(window as any).Capacitor;
        // En Android, localhost es el móvil. Para PC, configurar IP local o usar loopback default de Android studio (10.0.2.2 dev env)
        const baseUrl = isCapacitor ? (localStorage.getItem('NEXA_OLLAMA_URL') || 'http://10.0.2.2:11434') : '/ollama-api';
        const url = `${baseUrl}/api/generate`;
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
