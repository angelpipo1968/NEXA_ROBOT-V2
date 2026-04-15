export interface OllamaRequest {
    message: string;
    model?: string;
    context?: any[];
}

export const ollamaClient = {
    chat: async (payload: OllamaRequest) => {
        const isCapacitor = !!(window as any).Capacitor;
        const candidateUrls = isCapacitor
            ? [(localStorage.getItem('NEXA_OLLAMA_URL') || 'http://10.0.2.2:11434')]
            : ['/ollama-api', 'http://localhost:11434', 'http://127.0.0.1:11434', 'http://[::1]:11434'];
        const model = payload.model || 'deepseek-r1:8b';
        const endpoints = ['/api/generate', '/v1/generate'];

        let lastError: any = null;
        for (const baseUrl of candidateUrls) {
            for (const endpoint of endpoints) {
                const url = `${baseUrl}${endpoint}`;
                try {
                    console.log(`[Ollama] Conectando a ${url} con modelo ${model}...`);
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 15000);

                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: model,
                            prompt: payload.message,
                            stream: false,
                        }),
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        const body = await response.text().catch(() => 'Unable to read response body');
                        throw new Error(`Ollama API Error: ${response.statusText} (${response.status}) - ${body}`);
                    }

                    const data = await response.json();
                    const responseText = data.response
                        || data.results?.[0]?.content?.[0]?.text
                        || data.output?.[0]?.content
                        || data.text
                        || data?.result?.[0]?.response;

                    if (!responseText) {
                        throw new Error('Empty response from Ollama');
                    }

                    console.log('[Ollama] Respuesta exitosa');
                    return responseText;
                } catch (error: any) {
                    console.warn(`[Ollama] Falla en ${url}:`, error?.message || error);
                    lastError = error;
                    continue;
                }
            }
        }

        throw lastError || new Error('No se pudo conectar a Ollama en ninguna URL');
    },

    checkHealth: async (): Promise<boolean> => {
        const isCapacitor = !!(window as any).Capacitor;
        const candidateUrls = isCapacitor
            ? [(localStorage.getItem('NEXA_OLLAMA_URL') || 'http://10.0.2.2:11434')]
            : ['/ollama-api', 'http://localhost:11434', 'http://127.0.0.1:11434', 'http://[::1]:11434'];
        const healthEndpoints = ['/api/tags', '/api/models', '/v1/models'];

        for (const baseUrl of candidateUrls) {
            for (const endpoint of healthEndpoints) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 3000);
                    const response = await fetch(`${baseUrl}${endpoint}`, { signal: controller.signal });
                    clearTimeout(timeoutId);
                    if (response.ok) return true;
                } catch {
                    continue;
                }
            }
        }

        return false;
    }
};
