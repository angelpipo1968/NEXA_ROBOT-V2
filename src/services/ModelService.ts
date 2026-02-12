import { geminiClient } from '@/lib/gemini';
import { groqClient } from '@/lib/groq';
import { toolService } from '@/lib/toolService';

export interface ModelMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ModelOptions {
    provider?: 'gemini' | 'groq' | 'openai' | 'anthropic';
    temperature?: number;
    maxTokens?: number;
    useMCP?: boolean;
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
        const { provider = 'gemini', useMCP = true } = options;

        console.log(`[ModelService] 🤖 Generating with provider: ${provider}, MCP: ${useMCP}`);

        try {
            if (provider === 'gemini') {
                return await this.handleGeminiFlow(messages, options);
            }

            // Placeholder for other providers
            throw new Error(`Provider ${provider} not fully integrated in ModelService yet.`);
        } catch (error) {
            console.error(`[ModelService] ❌ Error generating response:`, error);
            throw error;
        }
    }

    private async handleGeminiFlow(messages: ModelMessage[], options: ModelOptions): Promise<string> {
        const lastMessage = messages[messages.length - 1].content;
        const context = messages.slice(0, -1).map(m => ({
            role: m.role === 'assistant' ? 'model' : m.role as 'user' | 'model',
            parts: m.content
        }));

        // Initial call to Gemini
        const response = await geminiClient.chat({
            message: lastMessage,
            context: context,
            temperature: options.temperature ?? 0.7
        });

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

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
        const MAX_ITERATIONS = 5;

        while (iteration < MAX_ITERATIONS) {
            const match = currentText.match(/:::TOOL_CALL:::([\s\S]*?):::END_TOOL_CALL:::/);
            if (!match) return currentText;

            iteration++;
            try {
                const { name, args } = JSON.parse(match[1].trim());
                console.log(`[ModelService] 🛠️ Executing tool: ${name}`, args);

                const result = await toolService.execute(name, args);

                // Continue conversation with tool result
                const conversationContext = [
                    ...messages.map(m => ({
                        role: m.role === 'assistant' ? 'model' : m.role as 'user' | 'model',
                        parts: m.content
                    })),
                    { role: 'model', parts: [{ text: currentText }] },
                    { role: 'user', parts: [{ text: `TOOL_OUTPUT (${name}): ${result}` }] }
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
