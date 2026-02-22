import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from './useChatStore';

describe('useChatStore', () => {
    beforeEach(() => {
        // Reset state before each test to ensure isolation
        useChatStore.setState({ messages: [], currentInput: '', attachments: [] });
    });

    it('should initialize with empty messages', () => {
        const store = useChatStore.getState();
        expect(store.messages).toEqual([]);
    });

    it('should add a message', () => {
        const store = useChatStore.getState();
        store.addMessage({
            id: 'test-msg-1',
            role: 'user',
            content: 'Hello Nexa',
            timestamp: 123456789
        });

        const stateAfterAdd = useChatStore.getState();
        expect(stateAfterAdd.messages.length).toBe(1);
        expect(stateAfterAdd.messages[0].content).toBe('Hello Nexa');
        expect(stateAfterAdd.messages[0].role).toBe('user');
    });

    it('should clear all messages', () => {
        const store = useChatStore.getState();
        store.addMessage({
            id: 'test-msg-1',
            role: 'user',
            content: 'Hello Nexa',
            timestamp: 123456789
        });

        expect(useChatStore.getState().messages.length).toBe(1);

        useChatStore.getState().clearMessages();
        expect(useChatStore.getState().messages.length).toBe(0);
    });

    it('should toggle reasoning modes properly', () => {
        const store = useChatStore.getState();
        expect(store.reasoningMode).toBe('normal');

        store.setReasoningMode('deep');
        expect(useChatStore.getState().reasoningMode).toBe('deep');

        store.setReasoningMode('search');
        expect(useChatStore.getState().reasoningMode).toBe('search');
    });

    it('should update current input', () => {
        const store = useChatStore.getState();
        store.setInput('Writing tests is fun');
        expect(useChatStore.getState().currentInput).toBe('Writing tests is fun');
    });
});
