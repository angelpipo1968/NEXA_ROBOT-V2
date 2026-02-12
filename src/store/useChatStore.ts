// LAST UPDATED: 2026-02-03 12:38 PST - AUTO-TOOL DETECTOR INTEGRATED
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { memoryService } from '@/lib/memory';
import { toolService } from '@/lib/toolService';
import { supabase } from '@/lib/supabase';
import { geminiClient } from '@/lib/gemini';
import { anthropicClient } from '@/lib/anthropic';
import { openaiClient } from '@/lib/openai';
import { deepseekClient } from '@/lib/deepseek';
import { groqClient } from '@/lib/groq';
import { elevenlabsClient } from '@/lib/elevenlabs';
import { autoToolDetector } from '@/lib/autoToolDetector';
import { modelService, ModelMessage } from '@/services/ModelService';
import { useVoiceStore } from './useVoiceStore';
import { useProjectStore } from './useProjectStore';

// Store definition

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    isStreaming?: boolean;
}

export interface ProjectFile {
    name: string;
    content: string;
    language: string;
    path: string;
}

interface ChatState {
    messages: Message[];
    isThinking: boolean;
    isSearching: boolean;
    isStreaming: boolean;
    currentInput: string;
    userName: string;
    hasGreeted: boolean;
    isVideoMode: boolean;
    reasoningMode: 'normal' | 'search' | 'deep';

    activeModule: 'chat' | 'studio' | 'dev';
    attachments: Array<{ type: string, data: string, name: string }>; // Base64 files

    // Actions
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    updateMessage: (id: string, updates: Partial<Message>) => void;
    toggleThinking: () => void;
    toggleSearching: () => void;
    setReasoningMode: (mode: 'normal' | 'search' | 'deep') => void;
    setStreaming: (isStreaming: boolean) => void;
    setInput: (input: string) => void;
    addAttachment: (attachment: { type: string, data: string, name: string }) => void;
    removeAttachment: (name: string) => void;
    clearAttachments: () => void;
    clearMessages: () => void;
    setHasGreeted: (hasGreeted: boolean) => void;
    toggleVideoMode: () => void;
    uploadFile: (type: 'video' | 'pdf' | 'image' | 'audio') => Promise<void>;

    deleteMessage: (id: string) => void;
    forkChat: (messageId: string) => void;

    // Logic
    setActiveModule: (module: 'chat' | 'studio' | 'dev') => void;
    sendMessage: (content: string, onResponse?: (text: string) => void) => Promise<void>;
    generateAIResponse: (content: string, onResponse?: (text: string) => void) => Promise<void>;
    regenerateResponse: () => Promise<void>;
    syncUser: () => Promise<void>;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            messages: [],
            isThinking: false,
            isSearching: false,
            isStreaming: false,
            currentInput: '',
            userName: 'Ángel',
            hasGreeted: false,
            isVideoMode: false,
            reasoningMode: 'normal',
            activeModule: 'chat',
            attachments: [],

            setMessages: (messages) => set({ messages }),

            addMessage: (message) => set((state) => ({
                messages: [...state.messages, message]
            })),

            updateMessage: (id, updates) => set((state) => ({
                messages: state.messages.map((msg) =>
                    msg.id === id ? { ...msg, ...updates } : msg
                ),
            })),

            toggleThinking: () => set((state) => ({ isThinking: !state.isThinking })),

            toggleSearching: () => set((state) => ({ isSearching: !state.isSearching })),

            setReasoningMode: (mode) => set({ reasoningMode: mode }),

            setStreaming: (isStreaming) => set({ isStreaming }),

            setInput: (input) => set({ currentInput: input }),

            addAttachment: (attachment) => set((state) => ({
                attachments: [...state.attachments, attachment]
            })),

            removeAttachment: (name) => set((state) => ({
                attachments: state.attachments.filter(a => a.name !== name)
            })),

            clearAttachments: () => set({ attachments: [] }),

            clearMessages: () => set({ messages: [] }),

            setHasGreeted: (hasGreeted) => set({ hasGreeted }),

            toggleVideoMode: () => set((state) => ({ isVideoMode: !state.isVideoMode })),

            syncUser: async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    set({
                        userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'
                    });
                }
            },

            uploadFile: async (type) => {
                const input = document.createElement('input');
                input.type = 'file';
                let accept = '';
                switch (type) {
                    case 'video': accept = 'video/*'; break;
                    case 'pdf': accept = '.pdf,.doc,.docx,.txt'; break;
                    case 'image': accept = 'image/*'; break;
                    case 'audio': accept = 'audio/*'; break;
                }
                input.accept = accept;
                input.onchange = (e: any) => {
                    const file = e.target.files[0];
                    if (file) {
                        alert(`File selected: ${file.name}. (Upload logic would go here)`);
                    }
                };
                input.click();
            },


            deleteMessage: (id) => set((state) => ({
                messages: state.messages.filter((msg) => msg.id !== id)
            })),

            forkChat: (messageId: string) => set((state) => {
                const index = state.messages.findIndex(m => m.id === messageId);
                if (index === -1) return {};
                return {
                    messages: state.messages.slice(0, index + 1),
                    attachments: []
                };
            }),

            setActiveModule: (module) => set({ activeModule: module }),

            generateAIResponse: async (content: string, onResponse?: (text: string) => void) => {
                const assistantMsgId = (Date.now() + 1).toString();

                // Optimistic UI update
                set((state) => ({
                    messages: [...state.messages, {
                        id: assistantMsgId,
                        role: 'assistant',
                        content: '',
                        timestamp: Date.now(),
                        isStreaming: true
                    }],
                    isThinking: state.reasoningMode === 'deep',
                    isSearching: state.reasoningMode === 'search',
                    isStreaming: true
                }));

                // AUTO-TOOL DETECTION: Try to handle search queries directly
                const autoToolResult = await autoToolDetector(
                    content,
                    assistantMsgId,
                    get().updateMessage,
                    (searching) => set({ isSearching: searching }),
                    () => get().messages
                );

                if (autoToolResult) {
                    get().updateMessage(assistantMsgId, { content: autoToolResult, isStreaming: false });
                    // if (useVoiceStore.getState().voiceEnabled) {
                    //     useVoiceStore.getState().speak(autoToolResult);
                    // }
                    if (onResponse) onResponse(autoToolResult);
                    memoryService.addMemory(autoToolResult, 'assistant');
                    set({ isThinking: false, isStreaming: false });
                    return;
                }

                console.log('[CHAT STORE] ⚠️ Auto-tool returned null, proceeding with normal AI flow');

                // Add mode-specific hints to the content
                let contentWithMode = content;
                if (get().reasoningMode === 'search') {
                    contentWithMode = `🔍 MODO BÚSQUEDA RÁPIDA: Realiza una búsqueda exhaustiva en la web para responder con la información más actual y precisa posible.\n\n${content}`;
                } else if (get().reasoningMode === 'deep') {
                    contentWithMode = `🧠 MODO PENSAMIENTO PROFUNDO: Analiza este problema paso a paso con máximo detalle, considerando todas las posibilidades y ramificaciones antes de dar una respuesta final.\n\n${content}`;
                }

                try {
                    // 1. Retrieve relevant memories (RAG)
                    const memories = await memoryService.searchMemories(content);
                    const memoryContext = memories.length > 0
                        ? `\n\nContexto relevante de memoria:\n${memories.join('\n')}`
                        : '';

                    // Build messages for ModelService
                    const history: ModelMessage[] = get().messages.map(m => ({
                        role: m.role,
                        content: m.content
                    }));

                    const finalPrompt = contentWithMode + memoryContext;
                    history.push({ role: 'user', content: finalPrompt });

                    // 2. Save User Memory asynchronously
                    memoryService.addMemory(content, 'user');

                    // 3. Call Unified Model Service
                    const finalResponse = await modelService.generateResponse(history, {
                        temperature: get().reasoningMode === 'deep' ? 0.3 : 0.7
                    });

                    // Update UI with Final Response
                    get().updateMessage(assistantMsgId, { content: finalResponse, isStreaming: false });

                    // if (useVoiceStore.getState().voiceEnabled) {
                    //     useVoiceStore.getState().speak(finalResponse);
                    // }

                    if (onResponse) onResponse(finalResponse);

                    // 4. Save Assistant Memory
                    memoryService.addMemory(finalResponse, 'assistant');

                    set({ isThinking: false, isStreaming: false, isSearching: false });

                } catch (error: any) {
                    console.error('ModelService Error, trying backups...', error);

                    try {
                        // Fallback to Groq
                        const groqResponse = await groqClient.chat({
                            message: content,
                            context: get().messages.map(m => ({
                                role: m.role === 'assistant' ? 'model' : m.role as 'user' | 'model',
                                parts: m.content
                            })) as any
                        });

                        get().updateMessage(assistantMsgId, { content: groqResponse });
                        // if (useVoiceStore.getState().voiceEnabled) {
                        //     useVoiceStore.getState().speak(groqResponse);
                        // }

                    } catch (groqError) {
                        console.error('Groq Error, trying backup (Claude)...', groqError);

                        try {
                            // Fallback to Anthropic (Claude)
                            const claudeResponse = await anthropicClient.chat({
                                message: content,
                                context: get().messages.map(m => ({
                                    role: m.role === 'assistant' ? 'model' : m.role as 'user' | 'model',
                                    parts: m.content
                                })) as any
                            });

                            get().updateMessage(assistantMsgId, { content: claudeResponse });

                            // if (useVoiceStore.getState().voiceEnabled) {
                            //     useVoiceStore.getState().speak(claudeResponse);
                            // }

                        } catch (backupError) {
                            console.error('Backup (Claude) Error, trying OpenAI...', backupError);

                            try {
                                // Second Fallback: OpenAI
                                const openaiResponse = await openaiClient.chat({
                                    message: content,
                                    context: get().messages.map(m => ({
                                        role: m.role === 'assistant' ? 'model' : m.role as 'user' | 'model',
                                        parts: m.content
                                    })) as any
                                });

                                get().updateMessage(assistantMsgId, { content: openaiResponse });
                                // if (useVoiceStore.getState().voiceEnabled) {
                                //     useVoiceStore.getState().speak(openaiResponse);
                                // }

                            } catch (finalError) {
                                console.error('OpenAI Error, trying DeepSeek...', finalError);

                                try {
                                    // Third Fallback: DeepSeek
                                    const deepseekResponse = await deepseekClient.chat({
                                        message: content,
                                        context: get().messages.map(m => ({
                                            role: m.role === 'assistant' ? 'model' : m.role as 'user' | 'model',
                                            parts: m.content
                                        })) as any
                                    });

                                    get().updateMessage(assistantMsgId, { content: deepseekResponse });
                                    // if (useVoiceStore.getState().voiceEnabled) {
                                    //     useVoiceStore.getState().speak(deepseekResponse);
                                    // }
                                    if (onResponse) onResponse(deepseekResponse);

                                } catch (deepseekError) {
                                    console.error('Final Fallback (DeepSeek) Error:', deepseekError);
                                    // Absolute Final Failure
                                    const simResponse = "⚠️ Error TOTAL (Gemini, Claude, OpenAI, DeepSeek). \n\n¡REINICIA LA TERMINAL!";
                                    get().updateMessage(assistantMsgId, { content: simResponse });
                                    // if (useVoiceStore.getState().voiceEnabled) {
                                    //     useVoiceStore.getState().speak("Por favor reinicia el servidor.");
                                    // }
                                    if (onResponse) onResponse(simResponse);
                                }
                            }
                        }
                    }
                } finally {
                    set({ isThinking: false, isStreaming: false, attachments: [] }); // Clear attachments
                    get().updateMessage(assistantMsgId, { isStreaming: false });
                }
            },

            regenerateResponse: async () => {
                const { messages } = get();
                if (messages.length === 0) return;

                const lastMsg = messages[messages.length - 1];
                let targetUserMsg: Message | undefined;

                if (lastMsg.role === 'assistant') {
                    // Remove the assistant message
                    get().deleteMessage(lastMsg.id);
                    // Get the previous message (User)
                    const newMessages = get().messages; // state updated by deleteMessage
                    targetUserMsg = newMessages[newMessages.length - 1];
                } else {
                    targetUserMsg = lastMsg;
                }

                if (targetUserMsg && targetUserMsg.role === 'user') {
                    await get().generateAIResponse(targetUserMsg.content);
                }
            },

            sendMessage: async (content, onResponse) => {
                if (!content.trim()) return;

                const userMessage: Message = {
                    id: Date.now().toString(),
                    role: 'user',
                    content,
                    timestamp: Date.now(),
                };

                set((state) => ({
                    messages: [...state.messages, userMessage],
                    // We don't set isStreaming/Thinking here anymore, generateAIResponse handles it
                }));

                await get().generateAIResponse(content, onResponse);
            },
        }),
        {
            name: 'nexa-chat-storage',
            partialize: (state) => ({
                messages: state.messages,
            }),
        }
    )
);
