import { geminiClient } from '@/lib/gemini';
import { groqClient } from '@/lib/groq';
import { toolService } from '@/lib/toolService';
import { openaiClient } from '@/lib/openai';
import { anthropicClient } from '@/lib/anthropic';
import { deepseekClient } from '@/lib/deepseek';
import { ollamaClient } from '@/lib/ollama';
import { useThoughtStore } from '@/lib/stores/useThoughtStore';
import { performanceMonitor } from '@/lib/services/PerformanceMonitor';

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
        const { provider = 'gemini', useMCP = true, reasoningMode = 'normal' } = options;

        // Reset tool call counter for new flow
        const { resetToolCalls } = (await import('@/lib/stores/useAchievementStore')).useAchievementStore.getState();
        resetToolCalls();

        console.log(`[ModelService] 🤖 Generating with provider: ${provider}, MCP: ${useMCP}, Mode: ${reasoningMode}`);

        try {
            if (provider === 'gemini') {
                return await this.handleGeminiFlow(messages, options);
            }

            const lastMessage = messages[messages.length - 1];
            const context = messages.slice(0, -1).map(m => ({
                role: m.role === 'assistant' ? 'model' : m.role as 'user' | 'model',
                parts: m.content
            }));

            const attachments = options.attachments || lastMessage.attachments;

            if (provider === 'openai') {
                return await openaiClient.chat({
                    message: lastMessage.content,
                    context: context,
                    temperature: options.temperature,
                    attachments
                });
            }

            if (provider === 'anthropic') {
                return await anthropicClient.chat({
                    message: lastMessage.content,
                    context: context,
                    temperature: options.temperature,
                    attachments
                });
            }

            if (provider === 'deepseek') {
                return await deepseekClient.chat({
                    message: lastMessage.content,
                    context: context,
                    temperature: options.temperature,
                    model: reasoningMode === 'deep' ? 'deepseek-reasoner' : 'deepseek-chat'
                });
            }

            if (provider === 'groq') {
                return await groqClient.chat({
                    message: lastMessage.content,
                    context: context as any,
                });
            }

            if (provider === 'ollama') {
                return await ollamaClient.chat({
                    message: lastMessage.content,
                    model: reasoningMode === 'deep' ? 'deepseek-r1:14b' : 'deepseek-r1:8b'
                });
            }

            throw new Error(`Provider ${provider} not fully integrated in ModelService yet.`);
        } catch (error) {
            console.error(`[ModelService] ❌ Error generating response:`, error);
            throw error;
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
    private async handleReactLoop(
        initialText: string,
        messages: ModelMessage[],
        options: ModelOptions
    ): Promise<string> {
        let currentText = initialText;
        let iteration = 0;
        const MAX_ITERATIONS = options.reasoningMode === 'deep' ? 20 : 10;

        while (iteration < MAX_ITERATIONS) {
            const match = currentText.match(/:::TOOL_CALL:::([\s\S]*?):::END_TOOL_CALL:::/);
            if (!match) return currentText;

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
                });

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
}

export const modelService = ModelService.getInstance();
