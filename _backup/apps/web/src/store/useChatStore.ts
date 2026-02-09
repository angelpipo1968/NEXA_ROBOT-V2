import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    voiceEnabled: boolean;
    isRecording: boolean;
    isVoiceMode: boolean;
    isVideoMode: boolean;
    activeModule: 'chat' | 'studio' | 'hologram';

    // Actions
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    updateMessage: (id: string, updates: Partial<Message>) => void;
    toggleThinking: () => void;
    toggleSearching: () => void;
    setStreaming: (isStreaming: boolean) => void;
    setInput: (input: string) => void;
    clearMessages: () => void;
    toggleVoice: () => void;
    setRecording: (isRecording: boolean) => void;
    toggleVoiceMode: () => void;
    toggleVideoMode: () => void;
    speak: (text: string) => void;
    uploadFile: (type: 'video' | 'pdf' | 'image' | 'audio') => Promise<void>;
    downloadContent: () => void;
    deleteMessage: (id: string) => void;

    // Logic
    setActiveModule: (module: 'chat' | 'studio' | 'hologram') => void;
    sendMessage: (content: string) => Promise<void>;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            messages: [],
            isThinking: false,
            isSearching: false,
            isStreaming: false,
            currentInput: '',
            voiceEnabled: false,
            isRecording: false,
            isVoiceMode: false,
            isVideoMode: false,
            activeModule: 'chat',

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

            setStreaming: (isStreaming) => set({ isStreaming }),

            setInput: (input) => set({ currentInput: input }),

            clearMessages: () => set({ messages: [] }),

            toggleVoice: () => set((state) => ({ voiceEnabled: !state.voiceEnabled })),

            setRecording: (isRecording: boolean) => set({ isRecording }),

            toggleVoiceMode: () => set((state) => ({ isVoiceMode: !state.isVoiceMode, isVideoMode: false })),

            toggleVideoMode: () => set((state) => ({ isVideoMode: !state.isVideoMode, isVoiceMode: false })),

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

            downloadContent: () => {
                const messages = get().messages;
                if (messages.length === 0) return;
                const text = messages.map(m => `[${m.role.toUpperCase()}] ${m.content}`).join('\n\n');
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `nexa-chat-${Date.now()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
            },

            deleteMessage: (id) => set((state) => ({
                messages: state.messages.filter((msg) => msg.id !== id)
            })),

            speak: (text: string) => {
                if (typeof window === 'undefined' || !window.speechSynthesis) return;

                // Cancel any ongoing speech
                window.speechSynthesis.cancel();

                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 1.0;
                utterance.pitch = 1.1;
                utterance.volume = 1.0;

                // Get voices and select a female voice
                const voices = window.speechSynthesis.getVoices();
                const femaleVoice = voices.find(voice =>
                    voice.name.includes('Female') ||
                    voice.name.includes('Zira') ||
                    voice.name.includes('Samantha') ||
                    voice.name.includes('Victoria') ||
                    voice.name.includes('Karen') ||
                    voice.name.includes('Moira') ||
                    voice.name.includes('Tessa') ||
                    voice.name.includes('Google') && voice.name.includes('Female') ||
                    voice.name.toLowerCase().includes('female')
                ) || voices.find(voice =>
                    voice.lang.startsWith('en') && !voice.name.toLowerCase().includes('male')
                ) || voices[0];

                if (femaleVoice) {
                    utterance.voice = femaleVoice;
                }

                window.speechSynthesis.speak(utterance);
            },

            setActiveModule: (module) => set({ activeModule: module }),

            sendMessage: async (content) => {
                if (!content.trim()) return;

                const userMessage: Message = {
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
                const assistantMessage: Message = {
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
                    // Use relative path to avoid CORS/port issues and leverage Next.js internal routing
                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: content,
                            userId: 'user-1', // Default ID for now
                            context: get().messages.slice(0, -2).map(m => ({ role: m.role, content: m.content })),
                            deepThink: get().isThinking,
                            searching: get().isSearching
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(`API Error: ${response.statusText}`);
                    }

                    const data = await response.json();

                    // If the backend returns a direct response (mock/simulated)
                    // We simulate streaming here for the "Cinematic" feel if it's not actually streaming from backend
                    const fullResponse = data.response;
                    const chunks = fullResponse.split(/(?=[ \n])/); // Split preserving delimiters roughly
                    let currentText = '';

                    for (const chunk of chunks) {
                        // Random delay for natural typing feel
                        const delay = Math.max(10, Math.random() * 30);
                        await new Promise((resolve) => setTimeout(resolve, delay));
                        currentText += chunk;
                        get().updateMessage(assistantMsgId, { content: currentText });
                    }

                    // Speak the response if voice is enabled
                    if (get().voiceEnabled) {
                        get().speak(fullResponse);
                    }

                } catch (error) {
                    console.error('Failed to send message:', error);
                    get().updateMessage(assistantMsgId, {
                        content: 'Error de conexión: No se pudo contactar con NEXA Core. Verifica que el servidor de desarrollo esté activo.'
                    });
                } finally {
                    get().updateMessage(assistantMsgId, { isStreaming: false });
                    set({ isStreaming: false });
                }
            },
        }),
        {
            name: 'nexa-chat-storage',
            partialize: (state) => ({ messages: state.messages }), // Only persist messages
        }
    )
);
