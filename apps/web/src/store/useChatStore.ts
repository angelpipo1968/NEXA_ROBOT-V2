import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { memoryService } from '@/lib/memory';
import { toolService } from '@/lib/toolService';
import { geminiClient } from '@/lib/gemini';
import { anthropicClient } from '@/lib/anthropic';
import { openaiClient } from '@/lib/openai';
import { deepseekClient } from '@/lib/deepseek';
import { groqClient } from '@/lib/groq';
import { elevenlabsClient } from '@/lib/elevenlabs';
import { autoToolDetector } from '@/lib/autoToolDetector';

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
    userName: string;
    hasGreeted: boolean;
    voiceEnabled: boolean;
    isRecording: boolean;
    isVoiceMode: boolean;
    isVideoMode: boolean;

    activeModule: 'chat' | 'studio' | 'hologram';
    isSpeaking: boolean;
    currentAudio: HTMLAudioElement | null;
    attachment: string | null; // Base64 image

    // Actions
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    updateMessage: (id: string, updates: Partial<Message>) => void;
    toggleThinking: () => void;
    toggleSearching: () => void;
    setStreaming: (isStreaming: boolean) => void;
    setInput: (input: string) => void;
    setAttachment: (attachment: string | null) => void;
    clearMessages: () => void;
    toggleVoice: () => void;
    setHasGreeted: (hasGreeted: boolean) => void;
    setRecording: (isRecording: boolean) => void;
    toggleVoiceMode: () => void;
    toggleVideoMode: () => void;
    speak: (text: string) => void;
    uploadFile: (type: 'video' | 'pdf' | 'image' | 'audio') => Promise<void>;

    deleteMessage: (id: string) => void;
    stopSpeaking: () => void;

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
            userName: 'Ángel',
            hasGreeted: false,
            voiceEnabled: false,
            isRecording: false,
            isVoiceMode: false,
            isVideoMode: false,

            activeModule: 'chat',
            isSpeaking: false,

            currentAudio: null,
            attachment: null,

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

            setAttachment: (attachment) => set({ attachment }),

            clearMessages: () => set({ messages: [] }),

            toggleVoice: () => set((state) => ({ voiceEnabled: !state.voiceEnabled })),

            setHasGreeted: (hasGreeted) => set({ hasGreeted }),

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

            stopSpeaking: () => {
                const { currentAudio } = get();
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                    set({ currentAudio: null });
                }
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                }
                set({ isSpeaking: false });
            },

            speak: async (text: string) => {

                const playBrowserTTS = async () => {
                    // Fallback to Browser TTS
                    if (typeof window === 'undefined' || !window.speechSynthesis) return;

                    // Helper to get voices reliably
                    const getVoicesLoaded = (): Promise<SpeechSynthesisVoice[]> => {
                        return new Promise((resolve) => {
                            const voices = window.speechSynthesis.getVoices();
                            if (voices.length > 0) {
                                resolve(voices);
                                return;
                            }
                            window.speechSynthesis.onvoiceschanged = () => {
                                resolve(window.speechSynthesis.getVoices());
                            };
                            // Timeout just in case
                            setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
                        });
                    };

                    const voices = await getVoicesLoaded();
                    console.log("Voces disponibles:", voices.map(v => v.name));

                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.rate = 1.0;
                    utterance.volume = 1.0;

                    // Prioritize High Quality Spanish Female Voices (Google, Microsoft)
                    const femaleVoice = voices.find(v => v.lang.startsWith('es') && (v.name.toLowerCase().includes('google') || v.name.includes('Español'))) ||
                        voices.find(v => v.lang.startsWith('es') && v.name.includes('Helena')) ||
                        voices.find(v => v.lang.startsWith('es') && v.name.includes('Sabina')) ||
                        voices.find(v => v.lang.startsWith('es') && v.name.includes('Paulina')) ||
                        voices.find(v => v.lang.startsWith('es') && v.name.includes('Laura')) ||
                        voices.find(v => v.lang.startsWith('es') && v.name.toLowerCase().includes('female')) ||
                        voices.find(v => v.lang.includes('es')); // Last resort: any Spanish

                    if (femaleVoice) {
                        console.log("Voz seleccionada:", femaleVoice.name);
                        utterance.voice = femaleVoice;
                        // If it's a known female voice, natural pitch. If it's generic, boost it slightly.
                        if (femaleVoice.name.includes('Male') || femaleVoice.name.includes('Raul') || femaleVoice.name.includes('Pablo')) {
                            utterance.pitch = 1.4; // Force feminine pitch on male voice
                        } else {
                            utterance.pitch = 1.1; // Slight brightness for female
                        }
                    } else {
                        console.log("No se encontró voz específica, usando default.");
                        utterance.pitch = 1.3; // Default boost
                    }

                    utterance.onstart = () => set({ isSpeaking: true });
                    utterance.onend = () => set({ isSpeaking: false });
                    utterance.onerror = (e) => {
                        console.error("Browser TTS Error:", e);
                        set({ isSpeaking: false });
                    };

                    window.speechSynthesis.cancel(); // Cancel previous
                    window.speechSynthesis.speak(utterance);
                };

                // Try ElevenLabs First
                try {
                    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
                    if (apiKey) {
                        const audioData = await elevenlabsClient.speakText(text);
                        const blob = new Blob([audioData], { type: 'audio/mpeg' });
                        const url = URL.createObjectURL(blob);
                        const audio = new Audio(url);

                        await new Promise((resolve, reject) => {
                            set({ currentAudio: audio, isSpeaking: true });
                            audio.onended = () => {
                                set({ currentAudio: null, isSpeaking: false });
                                URL.revokeObjectURL(url);
                                resolve(true);
                            };
                            audio.onerror = (e) => {
                                set({ isSpeaking: false });
                                reject(e);
                            };
                            audio.play().catch(reject);
                        });
                        return; // Successfully played
                    }
                } catch (error) {
                    console.error("ElevenLabs/Audio error, falling back...", error);
                    set({ currentAudio: null });
                    // Fallback will handle isSpeaking=true
                }

                // Fallback if ElevenLabs skipped or failed
                await playBrowserTTS();
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
                    isThinking: true,
                    isStreaming: true
                }));

                const assistantMsgId = (Date.now() + 1).toString();

                // Optimistic UI update
                set((state) => ({
                    messages: [...state.messages, {
                        id: assistantMsgId,
                        role: 'assistant',
                        content: '',
                        timestamp: Date.now(),
                        isStreaming: true
                    }]
                }));

                // AUTO-TOOL DETECTION: Try to handle search queries directly
                console.log('[CHAT STORE] 🔍 Invoking autoToolDetector with content:', content);
                const autoToolResult = await autoToolDetector(
                    content,
                    assistantMsgId,
                    get().updateMessage,
                    (searching) => set({ isSearching: searching }),
                    () => get().messages
                );
                console.log('[CHAT STORE] 📊 autoToolDetector returned:', autoToolResult ? 'SUCCESS' : 'NULL (falling back to AI)');

                if (autoToolResult) {
                    // Auto-tool succeeded! Update message and finish
                    console.log('[CHAT STORE] ✅ Using auto-tool result, skipping AI');
                    get().updateMessage(assistantMsgId, { content: autoToolResult, isStreaming: false });
                    if (get().voiceEnabled) get().speak(autoToolResult);
                    memoryService.addMemory(autoToolResult, 'assistant');
                    set({ isThinking: false, isStreaming: false });
                    return;
                }

                console.log('[CHAT STORE] ⚠️ Auto-tool returned null, proceeding with normal AI flow');

                // 1. Retrieve relevant memories (RAG)
                const memories = await memoryService.searchMemories(content);
                const memoryContext = memories.length > 0
                    ? `\n\nContexto relevante de memoria:\n${memories.join('\n')}`
                    : '';

                // Build full context
                const context = get().messages.map(m => ({ role: m.role, parts: m.content }));

                // Add memory to the last user message or as a system hint?
                // Gemini supports context better in previous turns.
                // We'll append it to the current message content strictly for the API call (not UI).
                const contentWithMemory = content + memoryContext;

                try {

                    // Call Gemini API
                    const initialGeminiResponse = await geminiClient.chat({
                        message: contentWithMemory,
                        image: undefined,
                        context: context,
                        temperature: 0.7
                    });

                    // 2. Save User Memory asynchronously
                    memoryService.addMemory(content, 'user');

                    // Handle Agent Loop with Tool Calling
                    let finalResponse = '';
                    let currentResponse = initialGeminiResponse;
                    let iterationCount = 0;
                    const MAX_ITERATIONS = 5; // Prevent infinite loops

                    while (iterationCount < MAX_ITERATIONS) {
                        iterationCount++;

                        // CRITICAL FIX: Call .json() only once per response
                        const data = await currentResponse.json();
                        console.log(`[Iteration ${iterationCount}] Gemini Response:`, data);

                        // Check for errors
                        if (data.error) {
                            console.error('Gemini API Error:', data.error);
                            throw new Error(data.error.message || 'Gemini API Error');
                        }

                        const candidate = data.candidates?.[0];
                        const part = candidate?.content?.parts?.[0];
                        const text = part?.text || '';

                        console.log(`[Iteration ${iterationCount}] AI Text:`, text);

                        // Check for TOOL_CALL block (ReAct Pattern)
                        const toolCallMatch = text.match(/:::TOOL_CALL:::([\\s\\S]*?):::END_TOOL_CALL:::/);

                        if (toolCallMatch) {
                            try {
                                const jsonStr = toolCallMatch[1].trim();
                                const { name, args } = JSON.parse(jsonStr);

                                console.log(`[Tool Call] Executing: ${name}`, args);

                                // Update UI with tool execution indicator
                                set(state => ({
                                    messages: state.messages.map(msg =>
                                        msg.id === assistantMsgId
                                            ? { ...msg, content: `🔍 Using tool: ${name}...` }
                                            : msg
                                    ),
                                    isSearching: name === 'search_web'
                                }));

                                // Execute Tool
                                const toolResult = await toolService.execute(name, args);
                                console.log(`[Tool Result] ${name}:`, toolResult);

                                // Build new context with tool result
                                const newContext = [
                                    ...context,
                                    { role: 'user', parts: contentWithMemory },
                                    { role: 'model', parts: [{ text: text }] },
                                    { role: 'user', parts: [{ text: `TOOL_OUTPUT (${name}): ${toolResult}` }] }
                                ];

                                // Get new response with tool result
                                currentResponse = await geminiClient.chat({
                                    message: '',
                                    context: newContext as any,
                                    temperature: 0.7
                                });

                                set({ isSearching: false });
                                continue; // Continue the loop with new response

                            } catch (e) {
                                console.error("Failed to parse/execute tool call:", e);
                                finalResponse = text + "\\n\\n[Error: Tool execution failed]";
                                break;
                            }
                        }

                        // No tool call - this is the final response
                        if (text && !toolCallMatch) {
                            finalResponse = text;
                            console.log('[Final Response]', finalResponse);
                            break;
                        }

                        // Safety check - no text and no tool call
                        if (!text) {
                            console.warn('[Warning] Empty response from Gemini');
                            finalResponse = "Lo siento, no pude generar una respuesta.";
                            break;
                        }
                    }

                    if (iterationCount >= MAX_ITERATIONS) {
                        console.warn('[Warning] Max iterations reached');
                        finalResponse += "\\n\\n[Sistema: Iteraciones máximas alcanzadas]";
                    }

                    // Display Final Response
                    get().updateMessage(assistantMsgId, { content: finalResponse, isStreaming: false });

                    if (get().voiceEnabled) {
                        get().speak(finalResponse);
                    }

                    // 3. Save Assistant Memory
                    memoryService.addMemory(finalResponse, 'assistant');

                } catch (error: any) {
                    console.error('Gemini Error, trying backup...', error);

                    // Optional: Notify user of internal error (debug mode)
                    // set(state => ({ messages: [...state.messages, { id: crypto.randomUUID(), role: 'assistant', content: `[Debug Error]: ${error.message || 'Unknown Gemini Error'}` }] }));

                    try {
                        // Fallback to Groq
                        const groqResponse = await groqClient.chat({
                            message: content,
                            context: context.map(c => ({
                                role: c.role === 'assistant' ? 'model' : c.role as 'user' | 'model',
                                parts: c.parts
                            }))
                        });

                        get().updateMessage(assistantMsgId, { content: groqResponse });
                        if (get().voiceEnabled) get().speak(groqResponse);

                    } catch (groqError) {
                        console.error('Groq Error, trying backup (Claude)...', groqError);

                        try {
                            // Fallback to Anthropic (Claude)
                            const claudeResponse = await anthropicClient.chat({
                                message: content,
                                context: context.map(c => ({
                                    role: c.role === 'assistant' ? 'model' : c.role as 'user' | 'model',
                                    parts: c.parts // Fixed: use parts, not content
                                }))
                            });

                            get().updateMessage(assistantMsgId, { content: claudeResponse });

                            if (get().voiceEnabled) {
                                get().speak(claudeResponse);
                            }

                        } catch (backupError) {
                            console.error('Backup (Claude) Error, trying OpenAI...', backupError);

                            try {
                                // Second Fallback: OpenAI
                                const openaiResponse = await openaiClient.chat({
                                    message: content,
                                    context: context.map(c => ({
                                        role: c.role === 'assistant' ? 'model' : c.role as 'user' | 'model',
                                        parts: c.parts
                                    }))
                                });

                                get().updateMessage(assistantMsgId, { content: openaiResponse });
                                if (get().voiceEnabled) get().speak(openaiResponse);

                            } catch (finalError) {
                                console.error('OpenAI Error, trying DeepSeek...', finalError);

                                try {
                                    // Third Fallback: DeepSeek
                                    const deepseekResponse = await deepseekClient.chat({
                                        message: content,
                                        context: context.map(c => ({
                                            role: c.role === 'assistant' ? 'model' : c.role as 'user' | 'model',
                                            parts: c.parts
                                        }))
                                    });

                                    get().updateMessage(assistantMsgId, { content: deepseekResponse });
                                    if (get().voiceEnabled) get().speak(deepseekResponse);

                                } catch (deepseekError) {
                                    console.error('Final Fallback (DeepSeek) Error:', deepseekError);
                                    // Absolute Final Failure
                                    const simResponse = "⚠️ Error TOTAL (Gemini, Claude, OpenAI, DeepSeek). \n\n¡REINICIA LA TERMINAL!";
                                    get().updateMessage(assistantMsgId, { content: simResponse });
                                    if (get().voiceEnabled) get().speak("Por favor reinicia el servidor.");
                                }
                            }
                        }
                    }
                } finally {
                    set({ isThinking: false, isStreaming: false, attachment: null }); // Clear attachment
                    get().updateMessage(assistantMsgId, { isStreaming: false });
                }
            },
        }),
        {
            name: 'nexa-chat-storage',
            partialize: (state) => ({
                messages: state.messages,
                voiceEnabled: state.voiceEnabled // Persist voice preference
            }),
        }
    )
);
