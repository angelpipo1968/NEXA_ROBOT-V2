export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    isStreaming?: boolean;
}
interface ChatState {
    messages: Message[];
    isThinking: boolean;
    isSearching: boolean;
    isStreaming: boolean;
    currentInput: string;
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    updateMessage: (id: string, updates: Partial<Message>) => void;
    toggleThinking: () => void;
    toggleSearching: () => void;
    setStreaming: (isStreaming: boolean) => void;
    setInput: (input: string) => void;
    clearMessages: () => void;
    sendMessage: (content: string) => Promise<void>;
}
export declare const useChatStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<ChatState>, "setState" | "persist"> & {
    setState(partial: ChatState | Partial<ChatState> | ((state: ChatState) => ChatState | Partial<ChatState>), replace?: false | undefined): unknown;
    setState(state: ChatState | ((state: ChatState) => ChatState), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<ChatState, {
            messages: Message[];
        }, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: ChatState) => void) => () => void;
        onFinishHydration: (fn: (state: ChatState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<ChatState, {
            messages: Message[];
        }, unknown>>;
    };
}>;
export {};
//# sourceMappingURL=useChatStore.d.ts.map