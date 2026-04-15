/**
 * gemini.ts — Gemini client seguro
 *
 * La API key de Gemini vive ÚNICAMENTE como secreto en el servidor de Supabase.
 * Este cliente llama al Edge Function `nexa-core` que actúa como proxy seguro.
 * La key NUNCA se incluye en el bundle del cliente ni en el APK.
 */

import { NEXA_SYSTEM_PROMPT } from './systemPrompt';
import { useAutonomyStore } from '@/store/useAutonomyStore';
import { performanceMonitor } from './services/PerformanceMonitor';

// URL del Edge Function — seguro en el servidor de Supabase
const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nexa-core`;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export interface GeminiRequest {
    message: string;
    attachments?: Array<{ type: string, data: string, name: string }>;
    context?: { role: 'user' | 'model' | 'assistant' | 'function'; parts: any }[];
    temperature?: number;
    systemInstruction?: string;
}

async function callEdgeFunction(action: string, payload: Record<string, unknown>) {
    const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error((errData as any).error || `Edge Function error: ${response.status}`);
    }

    return response;
}

export const geminiClient = {
    chat: async (payload: GeminiRequest): Promise<Response> => {
        if (!EDGE_FUNCTION_URL || !SUPABASE_ANON_KEY) {
            throw new Error('Supabase no configurado. Verifica VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env');
        }

        const dynamicRules = useAutonomyStore.getState().getSystemRulesPrompt();
        const systemInstruction = (payload.systemInstruction || NEXA_SYSTEM_PROMPT) + dynamicRules;

        // Construir el array `contents` en formato Gemini
        const userParts: any[] = [{ text: payload.message }];

        if (payload.attachments && payload.attachments.length > 0) {
            payload.attachments.forEach(att => {
                const cleanBase64 = att.data.includes('base64,')
                    ? att.data.split('base64,')[1]
                    : att.data;
                userParts.unshift({
                    inlineData: { mimeType: att.type, data: cleanBase64 }
                });
            });
        }

        const messages = [
            ...(payload.context?.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : msg.role,
                parts: Array.isArray(msg.parts) ? msg.parts : [{ text: msg.parts }]
            })) || []),
            { role: 'user', parts: userParts }
        ];

        performanceMonitor.startOperation();

        const response = await callEdgeFunction('chat', {
            messages,
            systemInstruction,
            temperature: payload.temperature ?? 0.7,
        });

        performanceMonitor.endOperation('gemini-via-edge');
        console.log('[Gemini] ✅ Respuesta recibida a través del Edge Function seguro');
        return response;
    },

    getEmbedding: async (text: string): Promise<number[]> => {
        if (!EDGE_FUNCTION_URL || !SUPABASE_ANON_KEY) return [];

        try {
            const response = await callEdgeFunction('embedding', { text });
            const data = await response.json();
            return data?.embedding?.values ?? [];
        } catch (e) {
            console.warn('[Gemini Embedding] Error via Edge Function:', e);
            return [];
        }
    },

    async generateImage(prompt: string): Promise<string> {
        const sanitizedPrompt = prompt.replace(/[\n\r]+/g, ' ').trim().slice(0, 1000);
        const encodedPrompt = encodeURIComponent(sanitizedPrompt);
        return `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&enhance=false&safe=true`;
    }
};
