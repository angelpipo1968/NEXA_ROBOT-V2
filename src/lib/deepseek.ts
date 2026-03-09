export interface DeepSeekRequest {
    message: string;
    context?: { role: 'user' | 'model' | 'assistant'; parts: string }[];
    temperature?: number;
    model?: 'deepseek-chat' | 'deepseek-reasoner';
}

import { NEXA_SYSTEM_PROMPT } from './systemPrompt';

export const deepseekClient = {
    chat: async (payload: DeepSeekRequest) => {
        const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

        if (!apiKey) {
            throw new Error('Missing DeepSeek API Key');
        }

        const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
        const url = isNode
            ? 'https://api.deepseek.com/chat/completions'
            : '/deepseek-api/chat/completions';

        const messages = [
            { role: "system", content: NEXA_SYSTEM_PROMPT }, // Nexa Identity
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
            // Reasoner doesn't support temperature
            const body: any = {
                model: payload.model || 'deepseek-chat',
                messages: messages,
            };

            if (payload.model !== 'deepseek-reasoner') {
                body.temperature = payload.temperature || 0.7;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error('DeepSeek API Error:', errData);
                throw new Error(errData.error?.message || `DeepSeek Error: ${response.status}`);
            }

            const data = await response.json();

            // If it's a reasoner model, we might want to capture reasoning_content too
            const content = data.choices[0].message.content;
            const reasoning = data.choices[0].message.reasoning_content;

            if (reasoning) {
                console.log('[DeepSeek] 🧠 Reasoning detected:', reasoning.slice(0, 100) + '...');
                try {
                    // Optimized: Only import if reasoning is present
                    const { useThoughtStore } = await import('./stores/useThoughtStore');
                    useThoughtStore.getState().addNode({
                        id: `reasoning-${Date.now()}`,
                        label: 'DEEP THINKING (DEEPSEEK)',
                        val: 25,
                        color: '#a855f7',
                        details: reasoning,
                        timestamp: Date.now()
                    });
                } catch (e) {
                    console.warn('[DeepSeek] Could not add reasoning to store:', e);
                }
            }

            return content;

        } catch (error) {
            console.error('DeepSeek Client Error:', error);
            throw error;
        }
    }
};
