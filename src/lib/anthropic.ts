export interface AnthropicRequest {
    message: string;
    context?: { role: 'user' | 'model' | 'assistant'; parts: string }[];
    temperature?: number;
}

export const anthropicClient = {
    chat: async (payload: AnthropicRequest) => {
        const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

        if (!apiKey) {
            throw new Error('Missing Anthropic API Key');
        }

        const url = '/anthropic-api/v1/messages';

        // Convert context to Anthropic format
        // Anthropic roles: 'user', 'assistant' (not 'model')
        const messages = [
            ...(payload.context?.map(msg => ({
                role: msg.role === 'model' ? 'assistant' : msg.role,
                content: msg.parts
            })) || []),
            {
                role: 'user',
                content: payload.message
            }
        ];

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20240620',
                    max_tokens: 1024,
                    messages: messages,
                    temperature: payload.temperature || 0.7
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error('Anthropic API Error:', errData);
                throw new Error(errData.error?.message || `Anthropic Error: ${response.status}`);
            }

            const data = await response.json();
            return data.content[0].text;

        } catch (error) {
            console.error('Anthropic Client Error:', error);
            throw error;
        }
    }
};
