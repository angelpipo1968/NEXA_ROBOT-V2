"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useNexaStore = void 0;
const zustand_1 = require("zustand");
// Mock initial data
const initialModels = [
    { id: 'llama3', name: 'Llama 3', provider: 'ollama', capabilities: { contextLength: 8192, streaming: true, functionCalling: false } },
    { id: 'mistral', name: 'Mistral', provider: 'ollama', capabilities: { contextLength: 4096, streaming: true, functionCalling: false } }
];
exports.useNexaStore = (0, zustand_1.create)((set) => ({
    user: { id: 'user-1', name: 'User' },
    mode: 'chat',
    memory: { enabled: true, vectorStore: 'pgvector' },
    currentModel: initialModels[0],
    availableModels: initialModels,
    switchModel: async (modelId, reason) => {
        set((state) => ({
            currentModel: state.availableModels.find(m => m.id === modelId) || state.currentModel
        }));
    }
}));
//# sourceMappingURL=nexa.js.map