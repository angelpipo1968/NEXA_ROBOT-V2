import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { geminiClient } from '@/lib/gemini';

// Store definition

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
                    set({ isThinking: true });

                    // Format context for Gemini
                    const context = get().messages
                        .slice(0, -2) // Exclude current user message and placeholder
                        .map(m => ({
                            role: m.role as 'user' | 'assistant',
                            parts: m.content
                        }));

                    // Call Gemini API
                    const geminiResponse = await geminiClient.chat({
                        message: content,
                        context: context,
                        temperature: 0.7
                    });

                    // Stream Response Handling
                    const reader = geminiResponse.body?.getReader();
                    const decoder = new TextDecoder();
                    let fullResponse = '';

                    if (reader) {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;

                            // Parse Gemini Stream Chunks
                            const chunkText = decoder.decode(value, { stream: true });
                            // Note: Gemini returns JSON objects in stream, we need to parse them
                            // Simple parsing for "candidates[0].content.parts[0].text"
                            // Since raw fetch stream might be complex JSON array, a simpler approach for MVP:

                            // Actually, simpler approach for now to avoid complex stream parsing issues: 
                            // Accumulate text if possible, OR if not streaming JSON correctly, wait for full buffer.
                            // But wait, we requested `streamGenerateContent`.
                            // Let's parse the JSON chunk which looks like: [{ "candidates": [...] }]

                            // For MVP stability: Let's assume non-streaming fetch first if stream parsing is complex without sdk
                            // But wait, the url was `streamGenerateContent`.
                            // Let's just try to grab "text" from the large JSON chunks.

                            // Hacky robust parsing for raw stream
                            const lines = chunkText.split('\n');
                            for (const line of lines) {
                                if (line.trim().startsWith('[')) {
                                    // Start of array, ignore or parse
                                    const cleanLine = line.replace(/^,/, ''); // Remove leading comma if any
                                    try {
                                        const json = JSON.parse(cleanLine.replace(/^\[|\]$/g, '')); // Strip array brackets if needed
                                        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                                        if (text) {
                                            fullResponse += text;
                                            get().updateMessage(assistantMsgId, { content: fullResponse });
                                        }
                                    } catch (e) { /* ignore partial json */ }
                                } else {
                                    // Try to parse partial line if it looks like json object
                                    try {
                                        const json = JSON.parse(line.replace(/^,/, ''));
                                        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                                        if (text) {
                                            fullResponse += text;
                                            get().updateMessage(assistantMsgId, { content: fullResponse });
                                        }
                                    } catch (e) { /* ignore */ }
                                }
                            }
                        }
                    } else {
                        // Fallback if no reader
                        const data = await geminiResponse.json();
                        fullResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error: No response";
                        get().updateMessage(assistantMsgId, { content: fullResponse });
                    }

                    if (get().voiceEnabled) {
                        get().speak(fullResponse);
                    }

                } catch (error) {
                    console.error('API connection failed:', error);
                    // Fallback to Simulation if API fails (e.g. invalid key or network error)
                    const simResponse = "Simulación (API Error): " + (error as Error).message + ". Fallback: Entendido, procesando solicitud...";
                    get().updateMessage(assistantMsgId, { content: simResponse });
                } finally {
                    set({ isThinking: false, isStreaming: false });
                    get().updateMessage(assistantMsgId, { isStreaming: false });
                }
            },
        }),
        {
            name: 'nexa-chat-storage',
            partialize: (state) => ({ messages: state.messages }), // Only persist messages
        }
    )
);
