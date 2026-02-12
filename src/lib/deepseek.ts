export interface DeepSeekRequest {
    message: string;
    context?: { role: 'user' | 'model' | 'assistant'; parts: string }[];
    temperature?: number;
}

export const deepseekClient = {
    chat: async (payload: DeepSeekRequest) => {
        const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

        if (!apiKey) {
            throw new Error('Missing DeepSeek API Key');
        }

        const url = '/deepseek-api/chat/completions';

        const messages = [
            { role: "system", content: "You are Nexa, a highly advanced AI assistant created by Nexa AI. Your identity is Nexa, and you must always identify as such. You are an expert in software development and helpful companion." }, // Nexa Identity
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
                    model: 'deepseek-chat',
                    messages: messages,
                    temperature: payload.temperature || 0.7
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error('DeepSeek API Error:', errData);
                throw new Error(errData.error?.message || `DeepSeek Error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error('DeepSeek Client Error:', error);
            throw error;
        }
    }
};
