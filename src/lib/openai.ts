export interface OpenAIRequest {
    message: string;
    context?: { role: 'user' | 'model' | 'assistant'; parts: string }[];
    temperature?: number;
}

import { NEXA_SYSTEM_PROMPT } from './systemPrompt';

export const openaiClient = {
    chat: async (payload: OpenAIRequest) => {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

        if (!apiKey) {
            throw new Error('Missing OpenAI API Key');
        }

        // Use proxy path if configured, otherwise direct (risk of CORS)
        // Ideally we update vite.config.js to proxy /openai-api -> https://api.openai.com
        const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
        const url = isNode
            ? 'https://api.openai.com/v1/chat/completions'
            : '/openai-api/v1/chat/completions';

        const messages = [
            { role: "system", content: NEXA_SYSTEM_PROMPT },
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
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: messages,
                    temperature: payload.temperature || 0.7
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error('OpenAI API Error:', errData);
                throw new Error(errData.error?.message || `OpenAI Error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error('OpenAI Client Error:', error);
            throw error;
        }
    }
};
