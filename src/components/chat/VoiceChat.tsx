'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useVoiceStore } from '@/store/useVoiceStore';
import { X } from 'lucide-react';
import { LiveVoiceControl } from '../voice/LiveVoiceControl';
import { CognitiveCore3D } from '../visual/CognitiveCore3D';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isThinking?: boolean;
}

interface VoiceChatProps {
    initialMessage?: string;
    autoStart?: boolean;
}

// ─── Waveform Visualizer ────────────────────────────────────────────────────

const VoiceWaveform = ({ isActive }: { isActive: boolean }) => (
    <div className={`h-8 w-32 flex items-center justify-center gap-0.5 ${isActive ? '' : 'opacity-30'}`}>
        {Array.from({ length: 8 }).map((_, i) => (
            <div
                key={i}
                className="w-1 bg-purple-400 rounded-full transition-all duration-150"
                style={{
                    height: isActive ? `${10 + Math.sin(i * 1.3) * 10}px` : '4px',
                    animation: isActive ? `pulse ${0.4 + i * 0.08}s ease-in-out infinite alternate` : 'none',
                }}
            />
        ))}
    </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export function VoiceChat({ initialMessage, autoStart = false }: VoiceChatProps) {
    const { isThinking, sendMessage } = useChatStore();
    const { speak, stopSpeaking, isSpeaking, toggleVoiceMode } = useVoiceStore();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isHandsFree, setIsHandsFree] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const isListeningRef = useRef(false);
    const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ─── Initialize Speech Recognition (once) ──────────────────────────────
    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('[VoiceChat] SpeechRecognition not supported');
            return;
        }

        const recognition = new SpeechRecognition();
        // single-shot is more reliable on Android WebView
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'es-ES';
        recognitionRef.current = recognition;

        let pendingFinal = '';

        recognition.onresult = (event: any) => {
            let interim = '';
            pendingFinal = '';
            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    pendingFinal += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
            setInputText(pendingFinal || interim);
        };

        recognition.onend = () => {
            if (pendingFinal && isListeningRef.current) {
                // We got a complete phrase — process it
                const phrase = pendingFinal;
                pendingFinal = '';
                isListeningRef.current = false;
                setIsListening(false);
                handleSendMessage(phrase);
            } else if (isListeningRef.current) {
                // Still listening but no result yet — restart for next phrase
                restartTimerRef.current = setTimeout(() => {
                    if (isListeningRef.current) {
                        try { recognition.start(); } catch (_) {}
                    }
                }, 300);
            } else {
                setIsListening(false);
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'no-speech' || event.error === 'aborted') return;
            if (event.error === 'not-allowed') {
                alert('🎤 Micrófono bloqueado. Actívalo en Ajustes → Aplicaciones → Nexa AI → Permisos.');
            }
            console.warn('[VoiceChat] Recognition error:', event.error);
            isListeningRef.current = false;
            setIsListening(false);
        };

        return () => {
            isListeningRef.current = false;
            if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
            try { recognition.stop(); } catch (_) {}
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-start
    useEffect(() => {
        if (autoStart && initialMessage) {
            handleSendMessage(initialMessage);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Listening Controls ──────────────────────────────────────────────────

    const handleStartListening = useCallback(() => {
        if (!recognitionRef.current || isListeningRef.current) return;
        stopSpeaking(); // pause any ongoing TTS before recording
        isListeningRef.current = true;
        setIsListening(true);
        setInputText('');
        try {
            recognitionRef.current.start();
        } catch (e) {
            console.error('[VoiceChat] Cannot start recognition:', e);
            isListeningRef.current = false;
            setIsListening(false);
        }
    }, [stopSpeaking]);

    const handleStopListening = useCallback(() => {
        isListeningRef.current = false;
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        setIsListening(false);
        try { recognitionRef.current?.stop(); } catch (_) {}
    }, []);

    // ─── Send Message → Real AI ──────────────────────────────────────────────

    const handleSendMessage = useCallback(async (text?: string) => {
        const message = (text ?? inputText).trim();
        if (!message) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');

        const assistantId = String(Date.now() + 1);
        const thinkingMsg: ChatMessage = {
            id: assistantId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isThinking: true,
        };
        setMessages(prev => [...prev, thinkingMsg]);

        try {
            // ✅ Calls Gemini → Groq → Claude → DeepSeek → Ollama chain
            await sendMessage(message, (responseText: string) => {
                setMessages(prev =>
                    prev.map(m =>
                        m.id === assistantId
                            ? { ...m, content: responseText, isThinking: false }
                            : m
                    )
                );

                // Speak response using native Android TTS or Web Speech API
                speak(responseText, () => {
                    if (isHandsFree) {
                        setTimeout(handleStartListening, 600);
                    }
                });
            });
        } catch (error) {
            console.error('[VoiceChat] sendMessage error:', error);
            setMessages(prev =>
                prev.map(m =>
                    m.id === assistantId
                        ? { ...m, content: '⚠️ Error al conectar. Verifica tu internet.', isThinking: false }
                        : m
                )
            );
        }
    }, [inputText, sendMessage, speak, isHandsFree, handleStartListening]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col h-[100dvh] bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-500">

            {/* Header */}
            <header className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 backdrop-blur-md">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                        <span className="text-[var(--vp-accent-purple)]">Nexa</span> Voice Chat
                    </h1>

                    <div className="flex items-center gap-4">
                        {/* Status indicator */}
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                            isListening
                                ? 'bg-green-900/30 text-green-400'
                                : isSpeaking
                                    ? 'bg-purple-900/30 text-purple-400'
                                    : isThinking
                                        ? 'bg-yellow-900/30 text-yellow-400'
                                        : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                        }`}>
                            <div className={`h-2 w-2 rounded-full ${
                                isListening ? 'bg-green-500 animate-pulse'
                                    : isSpeaking ? 'bg-purple-400 animate-pulse'
                                        : isThinking ? 'bg-yellow-400 animate-pulse'
                                            : 'bg-gray-500'
                            }`} />
                            <span>
                                {isListening ? 'Escuchando...'
                                    : isSpeaking ? 'Hablando...'
                                        : isThinking ? 'Pensando...'
                                            : 'Listo'}
                            </span>
                        </div>

                        {/* Hands-free toggle */}
                        <button
                            onClick={() => setIsHandsFree(v => !v)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                isHandsFree
                                    ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]'
                                    : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                            }`}
                            title="Manos Libres: Nexa escucha automáticamente tras hablar"
                        >
                            {isHandsFree ? '👐 Manos Libres: ON' : '👐 Manos Libres: OFF'}
                        </button>

                        {/* Mic buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleStartListening}
                                disabled={isListening || isSpeaking}
                                className={`p-2 rounded-lg transition-all ${
                                    isListening
                                        ? 'bg-green-600 text-white'
                                        : 'bg-[var(--bg-tertiary)] hover:bg-[var(--card-hover-bg)] border border-[var(--border-color)]'
                                }`}
                                title="Comenzar a hablar"
                            >
                                🎤
                            </button>
                            <button
                                onClick={handleStopListening}
                                disabled={!isListening}
                                className="p-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-40 transition-all"
                                title="Detener"
                            >
                                ⏹️
                            </button>
                        </div>

                        {/* Close */}
                        <button
                            onClick={toggleVoiceMode}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                            title="Cerrar chat de voz"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Body */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-hidden">

                {/* Chat panel */}
                <div className="lg:col-span-2 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto bg-gray-900/50 rounded-xl p-4 space-y-4">

                        {messages.length === 0 && (
                            <div className="text-center h-full flex flex-col items-center justify-center py-8 opacity-80">
                                <div className="w-full max-w-md h-64 mb-6">
                                    <CognitiveCore3D
                                        isActive={isSpeaking}
                                        isThinking={isThinking}
                                        isListening={isListening}
                                    />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 tracking-tight">Núcleo de Cognición Activo</h3>
                                <p className="text-[var(--text-muted)]">Habla o escribe para sincronizar con Nexa</p>
                                <div className="flex gap-6 mt-8 text-xs font-mono opacity-50">
                                    <span>IA: ACTIVA</span>
                                    <span>VOZ: NATIVA</span>
                                    <span>LATENCIA: &lt;80ms</span>
                                </div>
                            </div>
                        )}

                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className={`p-4 rounded-xl shadow-sm max-w-[85%] ${
                                    msg.role === 'user'
                                        ? 'bg-[var(--vp-accent-purple)] text-white ml-auto'
                                        : 'bg-[var(--card-bg)] border border-[var(--border-color)] mr-auto'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 min-w-[2rem] rounded-full flex items-center justify-center text-sm ${
                                        msg.role === 'user' ? 'bg-white/20' : 'bg-[var(--vp-accent-purple)]'
                                    }`}>
                                        {msg.role === 'user' ? '👤' : '✦'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold mb-1 opacity-70">
                                            {msg.role === 'user' ? 'Tú' : 'Nexa AI'}
                                        </div>
                                        {msg.isThinking ? (
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    {[0, 1, 2].map(i => (
                                                        <div
                                                            key={i}
                                                            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: `${i * 0.15}s` }}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs opacity-60">Procesando con IA real...</span>
                                            </div>
                                        ) : (
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                {msg.content}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-xs opacity-40 mt-2 text-right">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="mt-4">
                        <div className="relative">
                            <textarea
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={isListening ? 'Escuchando...' : 'Escribe o usa el micrófono...'}
                                className="w-full p-4 pr-28 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:border-[var(--vp-accent-purple)] resize-none text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors"
                                rows={3}
                            />

                            <div className="absolute right-2 top-2 flex gap-2">
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!inputText.trim() || isSpeaking || isThinking}
                                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg disabled:opacity-40 transition-all text-sm font-medium"
                                >
                                    Enviar
                                </button>
                                <button
                                    onClick={isListening ? handleStopListening : handleStartListening}
                                    className={`p-2 rounded-lg transition-all ${
                                        isListening
                                            ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                                            : 'bg-gray-700 hover:bg-gray-600'
                                    }`}
                                    title={isListening ? 'Detener microfono' : 'Activar micrófono'}
                                >
                                    {isListening ? '⏹️' : '🎤'}
                                </button>
                            </div>

                            {isListening && (
                                <div className="absolute bottom-3 left-4">
                                    <VoiceWaveform isActive={true} />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 px-1">
                            <div>
                                {isListening && <span className="text-green-400">● Escuchando...</span>}
                                {isSpeaking && !isListening && <span className="text-purple-400">♪ Hablando...</span>}
                                {isThinking && !isListening && !isSpeaking && <span className="text-yellow-400">⚙ Procesando...</span>}
                            </div>
                            <span>IA Real: Gemini → Groq → Claude</span>
                        </div>
                    </div>
                </div>

                {/* Side panel */}
                <div className="lg:col-span-1 space-y-4">
                    <LiveVoiceControl />

                    <div className="bg-gray-900/50 p-4 rounded-xl">
                        <h3 className="text-base font-semibold mb-3">⚡ Estado del Sistema</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">IA Engine</span>
                                <span className="text-green-400 font-medium">Gemini 2.0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">TTS</span>
                                <span className="text-green-400 font-medium">Nativo Android</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">STT</span>
                                <span className="text-green-400 font-medium">WebSpeech API</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Manos Libres</span>
                                <span className={isHandsFree ? 'text-green-400 font-medium' : 'text-gray-500'}>
                                    {isHandsFree ? 'ACTIVO' : 'INACTIVO'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="p-3 border-t border-gray-800 text-center text-gray-500 text-xs">
                <div className="flex items-center justify-center gap-6">
                    <span className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        Sistema de voz activo
                    </span>
                    <span>🤖 IA Real — Nexa v4.0 Singularity</span>
                </div>
            </footer>
        </div>
    );
}
