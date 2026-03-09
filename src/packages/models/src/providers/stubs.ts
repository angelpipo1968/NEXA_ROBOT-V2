import { Model, ModelResponse, ModelRequest, StreamChunk } from '../types';

export interface ModelProvider {
    id: string;
    getModels(): Model[];
    execute(request: ModelRequest): Promise<ModelResponse>;
    streamExecute(request: ModelRequest): AsyncIterable<StreamChunk>;
}

export class OllamaProvider implements ModelProvider {
    id = 'ollama';
    private baseUrl = 'http://localhost:11434/api';
    private isModelLoaded = false;

    getModels(): Model[] {
        return [
            { id: 'llama3.2:3b', name: 'Llama 3.2 3B', provider: 'ollama', capabilities: { contextLength: 8192, streaming: true, functionCalling: false } },
            { id: 'deepseek-r1:8b', name: 'DeepSeek R1 8B', provider: 'ollama', capabilities: { contextLength: 8192, streaming: true, functionCalling: false } }
        ];
    }

    async preloadModel(model = 'llama3.2:3b') {
        try {
            await fetch(`${this.baseUrl}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    prompt: 'ping',
                    stream: false,
                    options: { num_predict: 1 }
                })
            });
            this.isModelLoaded = true;
            console.log(`✅ Model ${model} pre-loaded in memory`);
        } catch (error) {
            console.warn('Failed to pre-load model:', error);
        }
    }

    async execute(request: ModelRequest): Promise<ModelResponse> {
        const modelId = request.requirements?.modelId || 'llama3.2:3b';

        if (!this.isModelLoaded) {
            await this.preloadModel(modelId);
        }

        const start = Date.now();
        try {
            const response = await fetch(`${this.baseUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: modelId,
                    messages: [
                        ...(request.context || []),
                        { role: 'user', content: request.message }
                    ],
                    options: {
                        temperature: 0.7,
                        top_p: 0.9,
                        num_predict: 512,
                        num_thread: 8,
                        repeat_penalty: 1.1,
                        num_parallel: 4,
                        num_gpu_layers: -1,
                        main_gpu: 0,
                        f16_kv: true
                    },
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama error: ${response.status}`);
            }

            const data = await response.json();
            const latency = Date.now() - start;

            return {
                text: data.message.content,
                latency,
                usage: {
                    promptTokens: data.prompt_eval_count || 0,
                    completionTokens: data.eval_count || 0,
                    totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
                },
                cost: 0
            };
        } catch (error: any) {
            console.error('Ollama execution failed:', error);
            return {
                text: `Error connecting to Ollama: ${error.message}. Is Ollama running?`,
                latency: Date.now() - start,
                cost: 0
            };
        }
    }

    async *streamExecute(request: ModelRequest): AsyncIterable<StreamChunk> {
        const modelId = request.requirements?.modelId || 'llama3.2:3b';

        if (!this.isModelLoaded) {
            await this.preloadModel(modelId);
        }

        try {
            const response = await fetch(`${this.baseUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: modelId,
                    messages: [
                        ...(request.context || []),
                        { role: 'user', content: request.message }
                    ],
                    options: {
                        temperature: 0.7,
                        top_p: 0.9,
                        num_predict: 512,
                        num_thread: 8,
                        repeat_penalty: 1.1,
                        num_parallel: 4,
                        num_gpu_layers: -1,
                        main_gpu: 0,
                        f16_kv: true
                    },
                    stream: true
                })
            });

            if (!response.ok || !response.body) {
                throw new Error(`Ollama error: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        yield {
                            text: data.message?.content || '',
                            done: data.done,
                            usage: data.done ? {
                                promptTokens: data.prompt_eval_count || 0,
                                completionTokens: data.eval_count || 0,
                                totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
                            } : undefined
                        };
                    } catch (e) {
                        // Ignore partial lines/parsing errors
                    }
                }
            }
        } catch (error: any) {
            console.error('Ollama streaming failed:', error);
            yield { text: `Error: ${error.message}`, done: true };
        }
    }
}

export class OpenAICloud implements ModelProvider {
    id = 'openai';
    getModels(): Model[] {
        return [
            { id: 'gpt-4', name: 'GPT-4', provider: 'openai', capabilities: { contextLength: 8192, streaming: true, functionCalling: true } }
        ];
    }
    async execute(request: ModelRequest): Promise<ModelResponse> {
        return { text: "Stubbed OpenAI response", latency: 200, cost: 0.03 };
    }
    async *streamExecute(request: ModelRequest): AsyncIterable<StreamChunk> {
        yield { text: "Stubbed OpenAI stream", done: true };
    }
}

export class AnthropicProvider implements ModelProvider {
    id = 'anthropic';
    getModels(): Model[] {
        return [];
    }
    async execute(request: ModelRequest): Promise<ModelResponse> {
        return { text: "Stubbed Anthropic response", latency: 200, cost: 0.03 };
    }
    async *streamExecute(request: ModelRequest): AsyncIterable<StreamChunk> {
        yield { text: "Stubbed Anthropic stream", done: true };
    }
}

export class NexaProvider implements ModelProvider {
    id = 'nexa';
    private baseUrl = 'http://localhost:3002/v1';

    getModels(): Model[] {
        return [
            { id: 'nexa-local-qwen', name: 'Nexa Qwen 0.5B (Local)', provider: 'nexa', capabilities: { contextLength: 4096, streaming: true, functionCalling: false } },
            { id: 'nexa-local-llama', name: 'Nexa Llama 1B (Local)', provider: 'nexa', capabilities: { contextLength: 4096, streaming: true, functionCalling: false } }
        ];
    }

    async execute(request: ModelRequest): Promise<ModelResponse> {
        const start = Date.now();
        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: request.requirements?.modelId || 'gpt-3.5-turbo', // SDK handles internal mapping
                    messages: [
                        ...(request.context || []),
                        { role: 'user', content: request.message }
                    ],
                    stream: false
                })
            });

            if (!response.ok) throw new Error(`Nexa SDK error: ${response.status}`);
            const data = await response.json();

            return {
                text: data.choices[0].message.content,
                latency: Date.now() - start,
                usage: {
                    promptTokens: data.usage?.prompt_tokens || 0,
                    completionTokens: data.usage?.completion_tokens || 0,
                    totalTokens: data.usage?.total_tokens || 0
                },
                cost: 0
            };
        } catch (error: any) {
            return {
                text: `Nexa Local Engine Error: ${error.message}`,
                latency: Date.now() - start,
                cost: 0
            };
        }
    }

    async *streamExecute(request: ModelRequest): AsyncIterable<StreamChunk> {
        // Nexa SDK is OpenAI compatible, so we could implement streaming here
        // For now, let's yield a simple response
        const res = await this.execute(request);
        yield { text: res.text, done: true };
    }
}
