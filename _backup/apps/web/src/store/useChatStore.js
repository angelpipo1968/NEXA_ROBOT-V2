"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChatStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
exports.useChatStore = (0, zustand_1.create)()((0, middleware_1.persist)((set, get) => ({
    messages: [],
    isThinking: false,
    isSearching: false,
    isStreaming: false,
    currentInput: '',
    setMessages: (messages) => set({ messages }),
    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),
    updateMessage: (id, updates) => set((state) => ({
        messages: state.messages.map((msg) => msg.id === id ? { ...msg, ...updates } : msg),
    })),
    toggleThinking: () => set((state) => ({ isThinking: !state.isThinking })),
    toggleSearching: () => set((state) => ({ isSearching: !state.isSearching })),
    setStreaming: (isStreaming) => set({ isStreaming }),
    setInput: (input) => set({ currentInput: input }),
    clearMessages: () => set({ messages: [] }),
    sendMessage: async (content) => {
        if (!content.trim())
            return;
        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: Date.now(),
        };
        set((state) => ({
            messages: [...state.messages, userMessage],
            isStreaming: true
        }));
        // Assistant Response Placeholder
        const assistantMsgId = (Date.now() + 1).toString();
        const assistantMessage = {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            isStreaming: true,
        };
        set((state) => ({
            messages: [...state.messages, assistantMessage]
        }));
        try {
            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: content,
                    userId: 'user-123', // Hardcoded for now
                    context: get().messages.slice(0, -2).map(m => ({ role: m.role, content: m.content }))
                }),
            });
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }
            const data = await response.json();
            // Simulate streaming for the backend response text
            const fullResponse = data.response;
            const chunks = fullResponse.split(' ');
            let currentText = '';
            for (const chunk of chunks) {
                await new Promise((resolve) => setTimeout(resolve, 50));
                currentText += chunk + ' ';
                get().updateMessage(assistantMsgId, { content: currentText });
            }
        }
        catch (error) {
            console.error('Failed to send message:', error);
            get().updateMessage(assistantMsgId, {
                content: 'Error: Failed to connect to Nexa AI. Please ensure the server is running.'
            });
        }
        finally {
            get().updateMessage(assistantMsgId, { isStreaming: false });
            set({ isStreaming: false });
        }
    },
}), {
    name: 'nexa-chat-storage',
    partialize: (state) => ({ messages: state.messages }), // Only persist messages
}));
//# sourceMappingURL=useChatStore.js.map