import { create } from 'zustand'

interface Model {
    id: string
    name: string
    provider: string
    capabilities: {
        contextLength: number
        streaming: boolean
        functionCalling: boolean
        vision?: boolean
    }
    recommendationReason?: string
}

interface NexaState {
    user: {
        id: string
        name: string
    }
    mode: string
    memoryEnabled: boolean
    currentModel: Model | null
    availableModels: Model[]
    setMode: (mode: string) => void
    toggleMemory: () => void
    switchModel: (modelId: string, reason: string) => Promise<void>
}

const defaultModels: Model[] = [
    {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'OpenAI',
        capabilities: { contextLength: 8192, streaming: true, functionCalling: true, vision: true },
        recommendationReason: 'High quality reasoning'
    },
    {
        id: 'claude-3',
        name: 'Claude 3',
        provider: 'Anthropic',
        capabilities: { contextLength: 100000, streaming: true, functionCalling: true },
        recommendationReason: 'Large context window'
    },
    {
        id: 'llama-3',
        name: 'Llama 3',
        provider: 'Meta',
        capabilities: { contextLength: 8192, streaming: true, functionCalling: false },
        recommendationReason: 'Cost effective'
    }
]

export const useNexaStore = create<NexaState>((set) => ({
    user: {
        id: 'user-1',
        name: 'Demo User'
    },
    mode: 'interactive',
    memoryEnabled: true,
    currentModel: defaultModels[0],
    availableModels: defaultModels,
    setMode: (mode) => set({ mode }),
    toggleMemory: () => set((state) => ({ memoryEnabled: !state.memoryEnabled })),
    switchModel: async (modelId: string, _reason: string) => {
        const model = defaultModels.find(m => m.id === modelId)
        if (model) {
            set({ currentModel: model })
        }
    }
}))
