export interface User {
    id: string;
    name: string;
}
export interface MemorySettings {
    enabled: boolean;
    vectorStore: string;
}
export interface NexaState {
    user: User | null;
    mode: 'chat' | 'agent';
    memory: MemorySettings;
    currentModel: any;
    availableModels: any[];
    switchModel: (modelId: string, reason?: string) => Promise<void>;
}
export declare const useNexaStore: import("zustand").UseBoundStore<import("zustand").StoreApi<NexaState>>;
//# sourceMappingURL=nexa.d.ts.map