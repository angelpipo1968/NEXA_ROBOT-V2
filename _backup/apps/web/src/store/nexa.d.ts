interface NexaState {
    user: {
        id: string;
        name: string;
    };
    mode: string;
    memoryEnabled: boolean;
    setMode: (mode: string) => void;
    toggleMemory: () => void;
}
export declare const useNexaStore: import("zustand").UseBoundStore<import("zustand").StoreApi<NexaState>>;
export {};
//# sourceMappingURL=nexa.d.ts.map