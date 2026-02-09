export interface AIRequest {
    message: string;
    context?: any[];
    deepThink?: boolean;
    searching?: boolean;
    userId?: string;
}

export interface AIResponse {
    response: string;
    tokens?: number;
    model?: string;
    error?: string;
}

export const aiClient = {
    chat: async (payload: AIRequest): Promise<AIResponse> => {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('AI Client Error:', error);
            throw error;
        }
    }
};
