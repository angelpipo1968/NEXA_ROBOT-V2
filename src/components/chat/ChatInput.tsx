import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Plus, Sparkles, Image as ImageIcon, Code, Globe, Film, FileText, Music, Upload, Square, Wand2, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/store/useChatStore';

export default function ChatInput() {
    const [input, setInput] = useState('');
    const [showAttachments, setShowAttachments] = useState(false);
    const navigate = useNavigate();
    const { sendMessage, isThinking, toggleVoice, voiceEnabled, stopSpeaking, currentAudio, isSpeaking, attachments, addAttachment, removeAttachment, clearAttachments, reasoningMode, setReasoningMode, setActiveModule } = useChatStore();
    const menuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'es-ES'; // Force Spanish language

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    setInput(prev => {
                        const trimmedPrev = prev.trim();
                        return trimmedPrev + (trimmedPrev ? ' ' : '') + finalTranscript;
                    });

                    // Hands-free: Reset silence timer whenever we get a final result
                    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
                    silenceTimeoutRef.current = setTimeout(() => {
                        handleSubmit();
                        recognitionRef.current?.stop();
                    }, 2000); // 2 seconds of silence triggers auto-submit
                }
            };

            recognitionRef.current.onstart = () => {
                setIsListening(true);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'not-allowed') {
                    alert("Por favor habilita el acceso al micrófono.");
                }
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Tu navegador no soporta reconocimiento de voz. Intenta usar Chrome.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                // Determine if we need to enable voice output in the store
                // We can't access store state directly here without subscribing,
                // but we have voiceEnabled from the hook
                if (!voiceEnabled) {
                    toggleVoice();
                }

                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error("Error starting recognition:", error);
                setIsListening(false);
            }
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowAttachments(false);
            }
        };

        if (showAttachments) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAttachments]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                addAttachment({
                    name: file.name,
                    type: file.type,
                    data: event.target.result as string
                });
                setShowAttachments(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isThinking) return;

        const message = input;
        setInput('');

        // Use the store function (which now handles simulation fallback)
        await sendMessage(message);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const suggestions = [
        { icon: ImageIcon, label: "Edición de imagen" },
        { icon: Sparkles, label: "Aprende" },
        { icon: Globe, label: "Investigación en profundidad" },
    ];

    const attachmentOptions = [
        { icon: FileText, label: "Subir documento", color: "text-blue-400", accept: ".pdf,.doc,.docx,.txt", onClick: () => { if (fileInputRef.current) { fileInputRef.current.accept = ".pdf,.doc,.docx,.txt"; fileInputRef.current.click(); } } },
        { icon: ImageIcon, label: "Subir imagen", color: "text-purple-400", accept: "image/*", onClick: () => { if (fileInputRef.current) { fileInputRef.current.accept = "image/*"; fileInputRef.current.click(); } } },
        { icon: Film, label: "Subir video", color: "text-pink-400", accept: "video/*", onClick: () => { if (fileInputRef.current) { fileInputRef.current.accept = "video/*"; fileInputRef.current.click(); } } },
        { icon: Music, label: "Subir audio", color: "text-yellow-400", accept: "audio/*", onClick: () => { if (fileInputRef.current) { fileInputRef.current.accept = "audio/*"; fileInputRef.current.click(); } } },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto px-4 pb-4">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
            />

            {/* Suggestion Chips */}
            <div className="mb-4 flex flex-wrap justify-center gap-3 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards" style={{ animationDelay: '0.2s' }}>
                {
                    suggestions.map((s, idx) => (
                        <button
                            key={idx}
                            className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] hover:border-[var(--vp-accent-purple)] transition-all text-sm text-[var(--text-secondary)]"
                        >
                            <s.icon size={14} className="text-purple-400" />
                            <span>{s.label}</span>
                        </button>
                    ))
                }
            </div>

            {/* Input Container Pill */}
            <div className={`relative glass-panel rounded-[32px] p-2 flex flex-col bg-[var(--vp-glass-base)] backdrop-blur-xl border border-[var(--vp-glass-border)] shadow-[var(--shadow-lg)] transition-all focus-within:border-[var(--vp-accent-purple)]/30 focus-within:shadow-[var(--shadow-lg)] ${isListening ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : ''}`}>

                <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2">
                    {attachments && attachments.map((att: { type: string, data: string, name: string }, idx: number) => (
                        <div key={idx} className="relative inline-block group">
                            {att.type.startsWith('image/') ? (
                                <img src={att.data} alt="Preview" className="h-16 w-auto rounded-lg border border-[var(--border-color)] shadow-sm" />
                            ) : (
                                <div className="h-16 w-32 flex items-center justify-center bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)] p-2">
                                    <FileText size={20} className="text-[var(--vp-accent-purple)] mr-2" />
                                    <span className="text-[10px] truncate max-w-[80px] font-medium text-[var(--text-secondary)]">{att.name}</span>
                                </div>
                            )}
                            <button
                                onClick={() => removeAttachment(att.name)}
                                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                            >
                                <Plus size={10} className="rotate-45" />
                            </button>
                        </div>
                    ))}
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="¿Cómo puedo ayudarte hoy?"
                        className="w-full bg-transparent border-none focus:ring-0 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none h-[48px] max-h-[200px] overflow-custom py-2 text-lg"
                        style={{ minHeight: '48px' }}
                    />
                </div>

                {/* Bottom Actions Bar */}
                <div className="flex items-center justify-between px-3 pb-2 relative">
                    <div className="flex items-center gap-2">
                        {/* Attachments Menu Wrapper */}
                        <div className="relative" ref={menuRef}>
                            {showAttachments && (
                                <div className="absolute bottom-full left-0 mb-4 w-56 p-1.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] shadow-[var(--shadow-lg)] animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 overflow-hidden">
                                    {attachmentOptions.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg text-left transition-colors group"
                                            onClick={opt.onClick}
                                        >
                                            <div className={`p-1.5 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors ${opt.color}`}>
                                                <opt.icon size={18} />
                                            </div>
                                            <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => setShowAttachments(!showAttachments)}
                                className={`p-2 rounded-full transition-all duration-200 ${showAttachments ? 'bg-white/10 text-white rotate-45' : 'hover:bg-white/10 text-gray-400'}`}
                            >
                                <Plus size={20} />
                            </button>
                        </div>



                        {/* Reasoning Mode Toggle */}
                        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
                            <button
                                onClick={() => {
                                    if (reasoningMode === 'normal') setReasoningMode('search');
                                    else if (reasoningMode === 'search') setReasoningMode('deep');
                                    else setReasoningMode('normal');
                                }}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300 font-medium text-sm ${reasoningMode === 'search'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                    : reasoningMode === 'deep'
                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                                        : 'text-gray-400 hover:text-gray-300 border border-transparent'
                                    }`}
                            >
                                {reasoningMode === 'search' ? (
                                    <Globe size={16} />
                                ) : (
                                    <Sparkles size={16} className={reasoningMode === 'deep' ? "animate-pulse" : ""} />
                                )}
                                <span>Pensamiento Profundo</span>
                            </button>

                            <div className="w-px h-4 bg-white/10 mx-1" />

                            <button
                                onClick={() => navigate('/studio')}
                                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-gray-400 hover:text-[var(--vp-accent-purple)] hover:bg-[var(--vp-accent-purple)]/5 transition-all font-medium text-sm border border-transparent"
                            >
                                <Wand2 size={16} />
                                <span>Studio</span>
                            </button>

                            <div className="w-px h-4 bg-white/10 mx-1" />

                            <button
                                onClick={() => {
                                    setActiveModule('dev');
                                    navigate('/webdev');
                                }}
                                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-gray-400 hover:text-green-500 hover:bg-green-500/5 transition-all font-medium text-sm border border-transparent"
                            >
                                <Globe size={16} />
                                <span>Web Dev</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleListening}
                            className={`p-2 rounded-full transition-all duration-200 ${isListening
                                ? 'bg-red-500/20 text-red-400 animate-pulse' // Recording State
                                : 'hover:bg-white/10 text-gray-400' // Idle State
                                }`}
                            title={isListening ? "Detener grabación" : "Empezar a hablar"}
                        >
                            <Mic size={20} />
                        </button>

                        <button
                            onClick={(e) => {
                                if (isSpeaking) {
                                    e.preventDefault();
                                    stopSpeaking();
                                } else {
                                    handleSubmit(e);
                                }
                            }}
                            disabled={(!input.trim() && attachments.length === 0 && !isSpeaking) || isThinking}
                            className={`p-3 rounded-full transition-all duration-300 ${isSpeaking
                                ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-100 hover:scale-110' // STOP State
                                : (input.trim() || attachments.length > 0)
                                    ? 'bg-[var(--vp-accent-purple)] text-white shadow-[var(--shadow-lg)] scale-100 hover:brightness-110' // SEND State
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] scale-95' // DISABLED State
                                }`}
                        >
                            {isSpeaking ? (
                                <Square size={20} fill="currentColor" className="scale-75" />
                            ) : (
                                <Send size={20} fill={input.trim() ? "currentColor" : "none"} />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
