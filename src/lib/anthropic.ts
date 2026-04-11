export interface AnthropicRequest {
    message: string;
    context?: { role: 'user' | 'model' | 'assistant'; parts: string }[];
    temperature?: number;
    attachments?: Array<{ type: string, data: string, name: string }>;
}

export const anthropicClient = {
    chat: async (payload: AnthropicRequest) => {
        const apiKey = (import.meta.env.VITE_ANTHROPIC_API_KEY || '').trim();

        if (!apiKey) {
            throw new Error('Missing Anthropic API Key');
        }

        const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
        const url = isNode
            ? 'https://api.anthropic.com/v1/messages'
            : '/anthropic-api/v1/messages';

        // Construct User Content (supports Vision)
        let userContent: any = payload.message;
        if (payload.attachments && payload.attachments.length > 0) {
            userContent = [
                { type: "text", text: payload.message },
                ...payload.attachments.map(att => {
                    const cleanBase64 = att.data.includes('base64,')
                        ? att.data.split('base64,')[1]
                        : att.data;
                    
                    return {
                        type: "image",
                        source: {
                            type: "base64",
                            media_type: att.type,
                            data: cleanBase64
                        }
                    };
                })
            ];
        }

        const messages = [
            ...(payload.context?.map(msg => ({
                role: msg.role === 'model' ? 'assistant' : msg.role,
                content: msg.parts
            })) || []),
            {
                role: 'user',
                content: userContent
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
                    max_tokens: 2048,
                    messages: messages,
                    temperature: payload.temperature || 0.7
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error('Anthropic API Error:', JSON.stringify(errData, null, 2));
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
