"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalProvider = exports.AnthropicProvider = exports.OpenAICloud = exports.OllamaProvider = void 0;
class OllamaProvider {
    constructor() {
        this.id = 'ollama';
    }
    getModels() {
        return [
            { id: 'llama3', name: 'Llama 3', provider: 'ollama', capabilities: { contextLength: 8192, streaming: true, functionCalling: false } },
            { id: 'mistral', name: 'Mistral', provider: 'ollama', capabilities: { contextLength: 4096, streaming: true, functionCalling: false } }
        ];
    }
    async execute(request) {
        return { text: "Stubbbed Ollama response", latency: 50, cost: 0 };
    }
}
exports.OllamaProvider = OllamaProvider;
class OpenAICloud {
    constructor() {
        this.id = 'openai';
    }
    getModels() {
        return [
            { id: 'gpt-4', name: 'GPT-4', provider: 'openai', capabilities: { contextLength: 8192, streaming: true, functionCalling: true } }
        ];
    }
    async execute(request) {
        return { text: "Stubbed OpenAI response", latency: 200, cost: 0.03 };
    }
}
exports.OpenAICloud = OpenAICloud;
class AnthropicProvider {
    constructor() {
        this.id = 'anthropic';
    }
    getModels() {
        return [];
    }
    async execute(request) {
        return { text: "Stubbed Anthropic response", latency: 200, cost: 0.03 };
    }
}
exports.AnthropicProvider = AnthropicProvider;
class LocalProvider {
    constructor() {
        this.id = 'local';
    }
    getModels() {
        return [];
    }
    async execute(request) {
        return { text: "Stubbed Local response", latency: 10, cost: 0 };
    }
}
exports.LocalProvider = LocalProvider;
//# sourceMappingURL=stubs.js.map