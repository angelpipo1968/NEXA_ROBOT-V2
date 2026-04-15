// LAST UPDATED: 2026-02-03 12:38 PST - AUTO-TOOL DETECTOR INTEGRATED
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { memoryService } from '@/lib/memory';
import { toolService } from '@/lib/toolService';
import { supabase } from '@/lib/supabase';
import { geminiClient } from '@/lib/gemini';
import { anthropicClient } from '@/lib/anthropic';
import { deepseekClient } from '@/lib/deepseek';
import { memoryBridge } from '@/lib/memoryBridge';
import { groqClient } from '@/lib/groq';
import { elevenlabsClient } from '@/lib/elevenlabs';
import { ollamaClient } from '@/lib/ollama';
import { autoToolDetector } from '@/lib/autoToolDetector';
import { modelService, ModelMessage } from '@/services/ModelService';
import { useVoiceStore } from './useVoiceStore';
import { useProjectStore } from './useProjectStore';
import { syncService } from '@/lib/services/syncService';
import { swarmManager } from '@/lib/swarm/SwarmManager';
import { externalAIService } from '@/lib/services/externalAIService';

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
    reasoningMode: 'normal' | 'search' | 'deep';
    attachments: Array<{ type: string, data: string, name: string }>;
    // Nexa Pro Max Features
    showArtifacts: boolean;
    terminalLogs: string[];

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
    uploadFile: (type: 'video' | 'pdf' | 'image' | 'audio') => Promise<void>;

    deleteMessage: (id: string) => void;
    forkChat: (messageId: string) => void;
    regenerateResponse: () => Promise<void>;

    // Logic
    sendMessage: (content: string, onResponse?: (text: string) => void) => Promise<void>;
    generateAIResponse: (content: string, onResponse?: (text: string) => void) => Promise<void>;
    // Pro Max Actions
    addTerminalLog: (log: string) => void;
    clearTerminalLogs: () => void;
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
            reasoningMode: 'normal',
            attachments: [],
            showArtifacts: false,
            terminalLogs: [],

            setMessages: (messages) => set({ messages }),

            addMessage: (message) => {
                set((state) => ({
                    messages: [...state.messages, message]
                }));
                // CRDT Sync
                const sharedMessages = syncService.getSharedArray('chat-messages');
                sharedMessages.push([message]);
            },

            updateMessage: (id, updates) => {
                set((state) => ({
                    messages: state.messages.map((msg) =>
                        msg.id === id ? { ...msg, ...updates } : msg
                    ),
                }));
                // Actualizar CRDT si es necesario (más complejo con arrays, por ahora local)
            },

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

            addTerminalLog: (log) => set((state) => ({
                terminalLogs: [...state.terminalLogs.slice(-50), `[${new Date().toLocaleTimeString()}] ${log}`]
            })),
            clearTerminalLogs: () => set({ terminalLogs: [] }),

            generateAIResponse: async (content: string, onResponse?: (text: string) => void) => {
                const sanitizeDiagnostic = (value: unknown) => {
                    const text = String((value as any)?.message || value || 'Offline');
                    return text
                        .replace(/sk-[A-Za-z0-9_\-]{12,}/g, 'sk-***')
                        .replace(/gsk_[A-Za-z0-9]{12,}/g, 'gsk_***')
                        .replace(/tvly-[A-Za-z0-9_\-]{12,}/g, 'tvly-***')
                        .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, 'Bearer ***');
                };

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
                // Skip auto-tool in deep mode to allow thorough and structured analysis
                let autoToolResult = null;
                if (get().reasoningMode !== 'deep') {
                    autoToolResult = await autoToolDetector(
                        content,
                        assistantMsgId,
                        get().updateMessage,
                        (searching: boolean) => set({ isSearching: searching }),
                        () => get().messages
                    );
                }

                if (autoToolResult) {
                    get().updateMessage(assistantMsgId, { content: autoToolResult, isStreaming: false });
                    if (useVoiceStore.getState().voiceEnabled) {
                        useVoiceStore.getState().speak(autoToolResult);
                    }
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

                // 🌟 Asynchronous SWARM Analysis (Non-blocking)
                // Spawn a sub-agent to analyze context in the background
                swarmManager.executeTask('ANALYZE_CONTEXT', content).then(result => {
                    if (result.status === 'success') {
                        console.log('🐝 [SWARM] Análisis Local Completado:', result.data);
                    }
                }).catch(err => console.error('Swarm Error:', err));

                // 🌐 Asynchronous EXTERNAL BRAIN Analysis (Hugging Face 16GB RAM)
                // Only for long prompts or if we need extra power
                if (content.length > 300) {
                    externalAIService.processTask(content, 'HEAVY_ANALYSIS').then(result => {
                        if (result) {
                            console.log('🌌 [EXTERNAL BRAIN] Análisis en la Nube Completado:', result.processed_by);
                            get().addTerminalLog(`[CORTEX-16GB] Análisis de nube finalizado exitosamente.`);
                        }
                    });
                }

                // Build messages for ModelService (pre-defined for back-up fallbacks)
                const chatHistory: ModelMessage[] = get().messages.map(m => ({
                    role: m.role,
                    content: m.content
                }));

                try {
                    // 1. Retrieve relevant memories (RAG) using the new Bridge
                    const memories = await memoryBridge.search(content);
                    const memoryContext = memories.length > 0
                        ? `\n\nContexto relevante de memoria:\n${memories.join('\n')}`
                        : '';

                    // 2. Save User Memory via Bridge
                    await memoryBridge.save(content, 'user');

                    const currentAttachments = [...get().attachments];
                    const finalPrompt = contentWithMode + memoryContext;
                    
                    chatHistory.push({ 
                        role: 'user', 
                        content: finalPrompt,
                        attachments: currentAttachments 
                    });

                    // 3. Call Unified Model Service
                    const finalResponse = await modelService.generateResponse(chatHistory, {
                        temperature: get().reasoningMode === 'deep' ? 0.3 : 0.7,
                        reasoningMode: get().reasoningMode,
                        attachments: currentAttachments
                    });

                    // Update UI with Final Response
                    get().updateMessage(assistantMsgId, { content: finalResponse, isStreaming: false });

                    if (useVoiceStore.getState().voiceEnabled) {
                        useVoiceStore.getState().speak(finalResponse);
                    }

                    if (onResponse) onResponse(finalResponse);

                    // 4. Save Assistant Memory via Bridge
                    await memoryBridge.save(finalResponse, 'assistant');

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
                            console.error('Backup (Claude) Error, trying DeepSeek...', backupError);

                            try {
                                // Second Fallback: DeepSeek
                                const deepseekResponse = await deepseekClient.chat({
                                    message: content,
                                    context: get().messages.map(m => ({
                                        role: m.role === 'assistant' ? 'model' : m.role as 'user' | 'model',
                                        parts: m.content
                                    })) as any
                                });

                                get().updateMessage(assistantMsgId, { content: deepseekResponse });
                                if (onResponse) onResponse(deepseekResponse);

                            } catch (finalError) {
                                console.error('DeepSeek Error, trying final local fallback (Ollama)...', finalError);

                                try {
                                    const ollamaAvailable = await ollamaClient.checkHealth();
                                    if (!ollamaAvailable) {
                                        throw new Error('Ollama local no disponible');
                                    }

                                    const ollamaResponse = await modelService.generateResponse(chatHistory, {
                                        provider: 'ollama'
                                    });
                                    get().updateMessage(assistantMsgId, { content: ollamaResponse });
                                    if (onResponse) onResponse(ollamaResponse);
                                } catch (ollamaError: any) {
                                    console.error('Final Fallback (Ollama) Error:', ollamaError);
                                        // SOVEREIGN ARCHITECTURE REPAIR: Recuperar de memoria local si todo falla
                                        console.warn('[Autonomous Sovereign Mode] Modelos externos caídos. Activando caché latente...');
                                        try {
                                            const localMemories = await memoryBridge.search(content, 3);
                                            let simResponse = '';
                                            if (localMemories && localMemories.length > 0) {
                                                simResponse = `NEXA (Sovereign Offline Mode)\nEstoy operando sin conexión, pero aquí están mis recuerdos relevantes:\n\n${localMemories.join('\n\n')}`;
                                            } else {
                                                const errorMsg = ((ollamaError as any)?.message || (finalError as any)?.message || (backupError as any)?.message || '').toLowerCase();
                                                const isOllamaConnection = errorMsg.includes('ollama') || errorMsg.includes('timeout') || errorMsg.includes('localhost:11434');
                                                
                                                if (isOllamaConnection) {
                                                    simResponse = `🔌 **Ollama No Disponible**

Necesito acceso a un modelo local de IA para responder. Ollama no está corriendo actualmente.

**Para activar Ollama:**

1. **Windows**: 
   - Descarga desde https://ollama.ai/download
   - Instala y abre una terminal
   - Ejecuta: \`ollama serve\`

2. **Descargar un modelo** (en otra terminal):
   - \`ollama pull deepseek-r1:8b\`

3. **Vuelve a Nexa** y escribe tu mensaje

📖 Más modelos disponibles en https://ollama.ai/library`;
                                                } else {
                                                    const isBrowserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
                                                    const networkHint = isBrowserOnline
                                                        ? 'La red está activa, pero no se encontró un backend de IA disponible. Comprueba tu servidor Ollama local o tu proveedor en la nube.'
                                                        : 'El dispositivo no tiene conexión de red activa en este momento.';

                                                    simResponse = `NEXA (Sovereign Mode) 🛡️

He entrado en **Conservación de Energía (Modo Desconectado)**. Mis núcleos externos están inaccesibles.

Actualmente dependo de mi red neuronal pasiva y no tengo recuerdos latentes sobre este contexto. ${networkHint}

[Diagnóstico: ${sanitizeDiagnostic(ollamaError || finalError || backupError)}]`;
                                                }
                                            }
                                            
                                            // Enviar la respuesta (sea recuerdo u error custom)
                                            get().updateMessage(assistantMsgId, { content: simResponse });
                                            if (useVoiceStore.getState().voiceEnabled) {
                                                 useVoiceStore.getState().speak("Sistema offline activado. Leyendo desde la memoria central.");
                                            }
                                            if (onResponse) onResponse(simResponse);
                                        } catch (fallbackErr: any) {
                                            // Fallo absoluto del sistema local
                                            const simResponse = `NEXA (Sovereign Mode) 🛡️\n\n**Sistema en Modo de Respuesto Total**\n\nNo puedo procesar tu solicitud en este momento. Las opciones son:\n\n1. **Iniciar Ollama**: Abre una terminal y ejecuta \`ollama serve\`\n2. **Configurar una API**: Añade claves de OpenAI/Gemini en las variables de entorno\n\n[Error: ${fallbackErr.message || 'Sin servicio disponible'}]`;
                                            get().updateMessage(assistantMsgId, { content: simResponse });
                                            if (onResponse) onResponse(simResponse);
                                        }
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
