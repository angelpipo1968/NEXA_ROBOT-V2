import React, { useState, useEffect, useRef } from 'react';
import { Bot, MessageSquare, Mic, MicOff, Loader2, Sparkles, X } from 'lucide-react';
import { geminiClient } from '@/lib/gemini';
import { museMemory } from '@/lib/museMemory';
import { NexaVoice } from '@/lib/voice/TextToSpeech';

interface MuseMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    type?: 'suggestion' | 'chat';
}

interface MuseChatProps {
    isOpen: boolean;
    onClose: () => void;
    currentChapterContent: string;
    chapterTitle: string;
    bookTitle: string;
    onInsertContent?: (text: string) => void;
}

export function MuseChat({ isOpen, onClose, currentChapterContent, chapterTitle, bookTitle, onInsertContent }: MuseChatProps) {
    // Muse State - Load from memory
    const [museMessages, setMuseMessages] = useState<MuseMessage[]>(() => {
        const memory = museMemory.load();
        if (memory.museConversations.length > 0) {
            return memory.museConversations.map(msg => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                type: 'chat' as const
            }));
        }
        return [
            {
                id: '1',
                role: 'assistant',
                content: '¡Hola! Soy Nexa Muse 🧚‍♀️\n\nEstoy aquí para ayudarte a crear tu obra maestra. Puedo ayudarte con:\n\n✨ Ideas creativas y desarrollo narrativo\n✍️ Corrección y mejora de estilo\n📚 Estructura y ritmo de la historia\n🎨 Sugerencias de vocabulario y descripciones\n💡 Resolución de bloqueos creativos\n\n¿En qué te ayudo hoy?',
                type: 'chat'
            }
        ];
    });

    const [museInput, setMuseInput] = useState('');
    const [isMuseThinking, setIsMuseThinking] = useState(false);

    // Voice State - Load from memory
    const [voiceEngine] = useState(() => new NexaVoice());
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
        const memory = museMemory.load();
        return memory.preferences.voiceEnabled;
    });
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'es-ES';

            recognitionRef.current.onresult = (event: any) => {
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

                let finalTranscript = '';
                let interimTranscript = '';
                let latestText = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                latestText = finalTranscript || interimTranscript;
                if (latestText) setMuseInput(latestText);

                if (finalTranscript) {
                    handleMuseSend(finalTranscript);
                    return;
                }

                if (interimTranscript.trim().length > 0) {
                    silenceTimerRef.current = setTimeout(() => {
                        handleMuseSend(interimTranscript);
                    }, 2000);
                }
            };

            recognitionRef.current.onend = () => {
                if (isListening && !isMuseThinking) {
                    setIsListening(false);
                }
            };
        }
    }, [isListening]);

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error("Mic error", e);
            }
        }
    };

    const handleMuseSend = async (overrideContent?: string) => {
        const contentToSend = overrideContent || museInput;
        if (!contentToSend.trim()) return;

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }

        const userMsg: MuseMessage = { id: Date.now().toString(), role: 'user', content: contentToSend, type: 'chat' };
        setMuseMessages(prev => [...prev, userMsg]);
        setMuseInput('');
        setIsMuseThinking(true);

        try {
            const memoryContext = museMemory.getContextForMuse();
            const systemPrompt = `Eres Nexa Muse 🧚‍♀️, una musa editorial inteligente y creativa que ayuda a escritores a crear obras maestras literarias.

📖 CONTEXTO DEL LIBRO:
- Título: "${bookTitle || 'Sin título aún'}"
- Capítulo actual: "${chapterTitle}"
- Contenido del capítulo (últimas 5000 palabras):
"""
${currentChapterContent.slice(-5000)}
"""

💾 CONTEXTO DE MEMORIA (Tu historial con este escritor):
"""
${memoryContext}
"""

🎯 TUS CAPACIDADES:
1. ✨ CREATIVIDAD: Desbloquea ideas, sugiere giros narrativos, desarrolla personajes
2. ✍️ EDICIÓN: Corrige gramática, mejora estilo, suaviza transiciones
3. 📚 ESTRUCTURA: Ayuda con arcos narrativos, ritmo, tensión dramática
4. 🎨 ESTILO: Sugiere vocabulario rico, metáforas, descripciones vívidas
5. 💡 INSPIRACIÓN: Resuelve bloqueos creativos, propone alternativas

📋 REGLAS DE COMUNICACIÓN:
- Sé AMABLE, ENCOURAGING y CONSTRUCTIVA
- Responde en ESPAÑOL de forma natural y fluida
- RECUERDA el contexto previo y las conversaciones anteriores
- Si el usuario pregunta algo específico, sé DIRECTA y ÚTIL
- Si piden generar texto, sé CREATIVA y DETALLADA
- Si es una corrección, sé PRECISA y EDUCATIVA
- Mantén respuestas CONCISAS (2-4 párrafos máximo) a menos que pidan más`;

            // @ts-ignore - The Gemini types might be slightly outdated in the current project context
            const response = await geminiClient.chat({
                message: contentToSend,
                systemInstruction: systemPrompt
            });

            if (!response.ok) throw new Error('Error de conexión con Nexa Brain');

            const data = await response.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, tuve un problema pensando en eso.";

            const aiMsg: MuseMessage = { id: Date.now().toString(), role: 'assistant', content: reply, type: 'chat' };
            setMuseMessages(prev => [...prev, aiMsg]);

            museMemory.saveConversation('user', contentToSend);
            museMemory.saveConversation('assistant', reply);

            if (isVoiceEnabled) {
                const speechText = reply.length > 200 ? reply.slice(0, 200) + "..." : reply;
                voiceEngine.speak(speechText);
            }

        } catch (error) {
            console.error('Muse Error:', error);
            setMuseMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: '⚠️ Perdí la conexión con mi núcleo creativo. ¿Podemos intentarlo de nuevo?',
                type: 'chat'
            }]);
        } finally {
            setIsMuseThinking(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute top-20 right-8 bottom-8 w-[400px] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-right-10 fade-in duration-300">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-tertiary)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[var(--text-primary)]">Nexa Muse</h3>
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <Sparkles size={10} className="text-yellow-400" />
                            IA Editorial Activa
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-[var(--text-muted)] transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {museMessages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        <div
                            className={`max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                ? 'bg-[var(--vp-accent-purple)] text-white'
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)]'
                                }`}
                        >
                            {msg.content}
                        </div>
                        {msg.role === 'assistant' && onInsertContent && (
                            <button
                                onClick={() => onInsertContent(msg.content)}
                                className="mt-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--vp-accent-purple)] flex items-center gap-1 transition-colors"
                            >
                                <Sparkles size={10} /> Insertar en editor
                            </button>
                        )}
                    </div>
                ))}
                {isMuseThinking && (
                    <div className="flex justify-start">
                        <div className="bg-[var(--bg-tertiary)] p-3 rounded-2xl border border-[var(--border-color)] flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin text-[var(--vp-accent-purple)]" />
                            <span className="text-xs text-[var(--text-muted)]">Pensando...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={museInput}
                        onChange={(e) => setMuseInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleMuseSend()}
                        placeholder="Pregúntale a tu musa..."
                        className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--vp-accent-purple)] placeholder:text-[var(--text-muted)]"
                    />
                    <button
                        onClick={toggleListening}
                        className={`p-2 rounded-xl border border-[var(--border-color)] transition-all ${isListening
                            ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse'
                            : 'hover:bg-white/5 text-[var(--text-secondary)]'
                            }`}
                    >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                    <button
                        onClick={() => handleMuseSend()}
                        disabled={!museInput.trim() && !isListening}
                        className="p-2 bg-[var(--vp-accent-purple)] text-white rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20"
                    >
                        <MessageSquare size={18} />
                    </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                    <span>✨ Powered by Gemini 2.0 Pro</span>
                    <button
                        onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                        className={`flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors ${!isVoiceEnabled && 'opacity-50'}`}
                    >
                        {isVoiceEnabled ? '🔊 Voz Activa' : 'mute Voz Inactiva'}
                    </button>
                </div>
            </div>
        </div>
    );
}
