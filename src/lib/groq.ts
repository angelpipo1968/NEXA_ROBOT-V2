export interface GroqRequest {
    message: string;
    context?: { role: 'user' | 'model' | 'assistant'; parts: string }[];
    temperature?: number;
}

export const groqClient = {
    chat: async (payload: GroqRequest) => {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;

        if (!apiKey) {
            throw new Error('Missing Groq API Key');
        }

        const url = '/groq-api/v1/chat/completions';

        const messages = [
            { role: "system", content: "You are a helpful AI assistant." },
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
                    model: 'llama-3.3-70b-versatile',
                    messages: messages,
                    temperature: payload.temperature || 0.7
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error('Groq API Error:', errData);
                throw new Error(errData.error?.message || `Groq Error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error('Groq Client Error:', error);
            throw error;
        }
    }
};
