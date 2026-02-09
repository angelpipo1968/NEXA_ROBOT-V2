import { create } from 'zustand'

export interface User {
    id: string;
    name: string;
}

export interface MemorySettings {
    enabled: boolean;
    vectorStore: string;
}

export interface NexaState {
    user: User | null
    mode: 'chat' | 'agent'
    memory: MemorySettings
    currentModel: any,
    availableModels: any[],
    switchModel: (modelId: string, reason?: string) => Promise<void>
}

// Mock initial data
const initialModels = [
    { id: 'llama3', name: 'Llama 3', provider: 'ollama', capabilities: { contextLength: 8192, streaming: true, functionCalling: false } },
    { id: 'mistral', name: 'Mistral', provider: 'ollama', capabilities: { contextLength: 4096, streaming: true, functionCalling: false } }
];

export const useNexaStore = create<NexaState>((set) => ({
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
}))
