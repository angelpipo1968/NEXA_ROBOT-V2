import { geminiClient } from '@/lib/gemini';
import { groqClient } from '@/lib/groq';
import { toolService } from '@/lib/toolService';
import { openaiClient } from '@/lib/openai';
import { anthropicClient } from '@/lib/anthropic';
import { deepseekClient } from '@/lib/deepseek';
import { ollamaClient } from '@/lib/ollama';
import { useThoughtStore } from '@/lib/stores/useThoughtStore';
import { performanceMonitor } from '@/lib/services/PerformanceMonitor';
import { getDefaultProvider, getAvailableProviders } from '@/lib/ai/providerConfig';

export interface ModelMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    attachments?: Array<{ type: string, data: string, name: string }>;
}

export interface ModelOptions {
    provider?: 'gemini' | 'groq' | 'openai' | 'anthropic' | 'deepseek' | 'ollama';
    temperature?: number;
    maxTokens?: number;
    useMCP?: boolean;
    reasoningMode?: 'normal' | 'search' | 'deep';
    attachments?: Array<{ type: string, data: string, name: string }>;
}

export class ModelService {
    private static instance: ModelService;

    private constructor() { }

    public static getInstance(): ModelService {
        if (!ModelService.instance) {
            ModelService.instance = new ModelService();
        }
        return ModelService.instance;
    }

    /**
     * Core method to generate response using modern MCP-aware logic
     */
    public async generateResponse(
        messages: ModelMessage[],
        options: ModelOptions = {}
    ): Promise<string> {
        const { provider = getDefaultProvider(), useMCP = true, reasoningMode = 'normal' } = options;
        const resolvedProvider = await this.resolveProvider(provider);

        // Reset tool call counter for new flow
        const { resetToolCalls } = (await import('@/lib/stores/useAchievementStore')).useAchievementStore.getState();
        resetToolCalls();

        console.log(`[ModelService] 🤖 Generating with provider: ${resolvedProvider}, MCP: ${useMCP}, Mode: ${reasoningMode}`);

        const lastMessage = messages[messages.length - 1];
        const context = messages.slice(0, -1).map(m => ({
            role: m.role === 'assistant' ? 'model' : m.role as 'user' | 'model',
            parts: m.content
        }));
        const attachments = options.attachments || lastMessage.attachments;

        // STRATEGY: Try the resolved provider first, with Ollama health fallback built in
        try {
            // Try primary provider first
            if (resolvedProvider === 'ollama') {
                console.log('[ModelService] 📍 Trying Ollama (local)...');
                const response = await ollamaClient.chat({
                    message: lastMessage.content,
                    model: reasoningMode === 'deep' ? 'deepseek-r1:14b' : 'deepseek-r1:8b'
                });
                if (response.includes(':::TOOL_CALL:::')) return await this.handleReactLoop(response, messages, options);
                return response;
            }

            // If not ollama, try primary provider
            if (resolvedProvider === 'gemini') {
                return await this.handleGeminiFlow(messages, options);
            }

            if (resolvedProvider === 'openai') {
                const response = await openaiClient.chat({
                    message: lastMessage.content,
                    context: context,
                    temperature: options.temperature,
                    attachments
                });
                if (response.includes(':::TOOL_CALL:::')) return await this.handleReactLoop(response, messages, options);
                return response;
            }

            if (resolvedProvider === 'anthropic') {
                const response = await anthropicClient.chat({
                    message: lastMessage.content,
                    context: context,
                    temperature: options.temperature,
                    attachments
                });
                if (response.includes(':::TOOL_CALL:::')) return await this.handleReactLoop(response, messages, options);
                return response;
            }

            if (resolvedProvider === 'deepseek') {
                const response = await deepseekClient.chat({
                    message: lastMessage.content,
                    context: context,
                    temperature: options.temperature,
                    model: reasoningMode === 'deep' ? 'deepseek-reasoner' : 'deepseek-chat'
                });
                if (response.includes(':::TOOL_CALL:::')) return await this.handleReactLoop(response, messages, options);
                return response;
            }

            if (resolvedProvider === 'groq') {
                const response = await groqClient.chat({
                    message: lastMessage.content,
                    context: context as any,
                });
                if (response.includes(':::TOOL_CALL:::')) return await this.handleReactLoop(response, messages, options);
                return response;
            }

            throw new Error(`Provider ${resolvedProvider} not available`);
        } catch (primaryError) {
            console.warn(`[ModelService] ⚠️ Primary provider (${resolvedProvider}) failed, trying Ollama local fallback...`, primaryError);
            
            // AUTO-FALLBACK TO OLLAMA IF PRIMARY FAILS
            try {
                const response = await ollamaClient.chat({
                    message: lastMessage.content,
                    model: 'deepseek-r1:8b'
                });
                console.log('[ModelService] ✅ Ollama fallback succeeded');
                if (response.includes(':::TOOL_CALL:::')) return await this.handleReactLoop(response, messages, options);
                return response;
            } catch (ollamaError) {
                const err = new Error(`Primary provider failed: ${(primaryError as any)?.message || primaryError}. Ollama fallback also failed: ${(ollamaError as any)?.message || ollamaError}`);
                console.error('[ModelService] ❌ Ollama fallback also failed:', ollamaError);
                throw err;
            }
        }
    }

    private async handleGeminiFlow(messages: ModelMessage[], options: ModelOptions): Promise<string> {
        const lastMessage = messages[messages.length - 1];
        
        // SICA: Self-Tuning Optimization
        if (performanceMonitor.shouldOptimize()) {
            console.warn('[SICA] ⚡ High latency detected. Opting for ultralight response path.');
            // We don't force it here yet, but we could pass a flag to geminiClient
            // For now, let's just log it to the dashboard via the monitor.
        }

        const context = messages.slice(0, -1).map(m => ({
            role: m.role === 'assistant' ? 'model' : m.role as 'user' | 'model',
            parts: m.content
        }));

        // Initial call to Gemini with support for current attachments
        const response = await geminiClient.chat({
            message: lastMessage.content,
            context: context,
            attachments: options.attachments || lastMessage.attachments,
            temperature: options.temperature ?? 0.7
        });

        let text = '';
        if (typeof response === 'string') {
            text = response;
        } else {
            const data = await response.json();
            text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }

        // If it includes a tool call, we handle it iteratively
        if (text.includes(':::TOOL_CALL:::')) {
            return await this.handleReactLoop(text, messages, options);
        }

        return text;
    }

    /**
     * Handles the ReAct loop for tool execution
     */
    private async resolveProvider(provider?: ModelOptions['provider']): Promise<NonNullable<ModelOptions['provider']>> {
        const preferred = provider || getDefaultProvider();
        if (preferred === 'ollama') {
            const available = getAvailableProviders();
            const healthy = await ollamaClient.checkHealth().catch(() => false);
            if (!healthy && available.length > 1) {
                const fallback = available.find(p => p !== 'ollama');
                if (fallback) {
                    console.warn(`[ModelService] Ollama no está disponible, usando proveedor alternativo: ${fallback}`);
                    return fallback;
                }
            }
        }
        return preferred as NonNullable<ModelOptions['provider']>;
    }

    private async handleReactLoop(
        initialText: string,
        messages: ModelMessage[],
        options: ModelOptions
    ): Promise<string> {
        let currentText = initialText;
        let iteration = 0;
        const MAX_ITERATIONS = options.reasoningMode === 'deep' ? 20 : 10;

        while (iteration < MAX_ITERATIONS) {
            // Log Initial Cognition Before Tool Exec
            const cognitionId = `cognition-${Date.now()}`;
            useThoughtStore.getState().addNode({
                id: cognitionId,
                label: 'INTERNAL_COGNITION',
                val: 10,
                color: '#6366f1', // Indigo
                details: iteration === 1 ? 'Analizando intención inicial...' : `Evaluando resultado previo (Paso ${iteration})...`,
                timestamp: Date.now()
            });

            const match = currentText.match(/:::TOOL_CALL:::([\s\S]*?):::END_TOOL_CALL:::/);
            if (!match) {
                // Final Synthesis Node
                useThoughtStore.getState().addNode({
                    id: `synthesis-${Date.now()}`,
                    label: 'SYNTHESIS',
                    val: 20,
                    color: '#f43f5e', // Rose
                    details: 'Generando resolución final y respuesta al usuario.',
                    timestamp: Date.now()
                }, cognitionId);
                return currentText;
            }

            iteration++;
            try {
                let jsonStr = match[1].trim();
                // Clean potential markdown or noise
                if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '');
                else if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '');

                const { name, args } = JSON.parse(jsonStr.trim());
                console.log(`[ModelService] 🛠️ Executing tool: ${name}`, args);

                // ThoughtStream Visualization - Dynamic Agent Detection
                let agentColor = '#8b5cf6'; // Default Purple (Kernel)
                let agentPrefix = 'TOOL';

                if (name.includes('search') || name.includes('tavily')) {
                    agentColor = '#3b82f6'; // Blue (Researcher)
                    agentPrefix = 'RESEARCH';
                } else if (name.includes('file') || name.includes('write')) {
                    agentColor = '#10b981'; // Green (Developer)
                    agentPrefix = 'DEV';
                }

                const nodeId = `tool-${Date.now()}`;
                useThoughtStore.getState().addNode({
                    id: nodeId,
                    label: `[${agentPrefix}] ${name}`,
                    val: 15,
                    color: agentColor,
                    details: `Argumentos: ${JSON.stringify(args).slice(0, 100)}...`,
                    timestamp: Date.now()
                }, cognitionId);

                const result = await toolService.execute(name, args);

                // Track Tool Invocations for Achievements
                const { incrementToolCalls } = (await import('@/lib/stores/useAchievementStore')).useAchievementStore.getState();
                incrementToolCalls();

                // Check for potential errors in result to trigger self-correction
                const isError = String(result).toLowerCase().includes('error');

                if (isError) {
                    useThoughtStore.getState().addNode({
                        id: `correction-${nodeId}`,
                        label: 'SELF-CORRECTION',
                        val: 12,
                        color: '#f59e0b',
                        details: `Singularity Protocol detectó un fallo en ${name}. Re-evaluando estrategia...`,
                        timestamp: Date.now()
                    }, nodeId);
                }

                // Final Link
                useThoughtStore.getState().addNode({
                    id: `res-${nodeId}`,
                    label: 'RESULT',
                    val: 8,
                    color: '#10b981',
                    details: String(result).slice(0, 150),
                    timestamp: Date.now()
                }, nodeId);

                // Continue conversation with tool result
                const conversationContext = [
                    ...messages.map(m => ({
                        role: m.role === 'assistant' ? 'model' : m.role as 'user' | 'model',
                        parts: m.content
                    })),
                    { role: 'model', parts: [{ text: currentText }] },
                    { role: 'user', parts: [{ text: isError ? `TOOL_ERROR (${name}): ${result}. Analiza por qué falló y prueba una estrategia alternativa UNICAMENTE si es necesario. Si no, concluye con lo que tienes.` : `TOOL_OUTPUT (${name}): ${result}` }] }
                ];

                const nextResponse = await geminiClient.chat({
                    message: '',
                    context: conversationContext as any,
                    temperature: options.temperature ?? 0.7
                });

                const nextData = await nextResponse.json();
                currentText = nextData.candidates?.[0]?.content?.parts?.[0]?.text || '';

            } catch (e) {
                console.error('[ModelService] Tool loop error:', e);
                return `${currentText}\n\n[Error: Tool execution failed]`;
            }
        }

        return currentText + "\n\n[System: Max tool iterations reached]";
    }
    /**
     * Communicates with the Supabase Edge Function (Nexa Cloud Core)
     */
    private async handleCloudFlow(messages: ModelMessage[], options: ModelOptions): Promise<string> {
        const { supabase } = await import('@/lib/supabase');
        
        const lastMessage = messages[messages.length - 1];
        const context = messages.slice(0, -1).map(m => ({
            role: m.role === 'assistant' ? 'model' : m.role as 'user' | 'model',
            parts: [{ text: m.content }]
        }));

        const cloudPayload = {
            action: 'chat',
            payload: {
                messages: [
                    ...context,
                    { role: 'user', parts: [{ text: lastMessage.content }] }
                ],
                model: options.provider === 'gemini' ? 'gemini-1.5-flash' : undefined,
                temperature: options.temperature || 0.7,
            }
        };

        const { data, error } = await supabase.functions.invoke('nexa-core', {
            body: cloudPayload
        });

        if (error) throw error;
        
        // Handle Gemini-style response from the Edge Function
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Cloud Core returned an empty response.";
    }
}

export const modelService = ModelService.getInstance();

