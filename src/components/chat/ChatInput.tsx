import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Plus, Sparkles, Image as ImageIcon, Code, Globe, Film, FileText, Music, Upload, Square, Wand2, Bot, Video, ChevronDown, Mic2, AudioWaveform, Check, Atom, ArrowUp, Layout, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/store/useChatStore';
import { useVoiceStore } from '@/store/useVoiceStore';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { AudioVisualizer } from './AudioVisualizer';

export default function ChatInput() {
    const [input, setInput] = useState('');
    const [showAttachments, setShowAttachments] = useState(false);
    const navigate = useNavigate();
    const { sendMessage, isThinking, attachments, addAttachment, removeAttachment, clearAttachments, reasoningMode, setReasoningMode, setActiveModule, toggleVideoMode, isArtifactPanelOpen, setArtifactPanelOpen } = useChatStore();
    const { toggleVoice, voiceEnabled, stopSpeaking, currentAudio, isSpeaking, toggleVoiceMode, isContinuousListening, toggleContinuousListening, speak } = useVoiceStore();
    const menuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { transcript, isListening, startListening, stopListening, resetTranscript, isSupported } = useSpeechToText();
    const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (transcript) {
            setInput(transcript);

            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = setTimeout(() => {
                handleSubmit();
            }, 2000);
        }
    }, [transcript]);

    const toggleListening = () => {
        if (!isSupported) {
            alert("Tu navegador no soporta reconocimiento de voz. Intenta usar Chrome.");
            return;
        }

        if (isListening) {
            stopListening();
            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        } else {
            if (!voiceEnabled) {
                toggleVoice();
            }
            startListening();
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
        if (!input.trim() && attachments.length === 0) return;
        if (isThinking) return;

        const message = input;
        setInput('');
        resetTranscript();

        if (isListening) stopListening();

        await sendMessage(message);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const attachmentOptions = [
        { icon: FileText, label: "Subir documento", color: "text-blue-400", accept: ".pdf,.doc,.docx,.txt", onClick: () => { if (fileInputRef.current) { fileInputRef.current.accept = ".pdf,.doc,.docx,.txt"; fileInputRef.current.click(); } } },
        { icon: ImageIcon, label: "Subir imagen", color: "text-purple-400", accept: "image/*", onClick: () => { if (fileInputRef.current) { fileInputRef.current.accept = "image/*"; fileInputRef.current.click(); } } },
        { icon: Film, label: "Subir video", color: "text-pink-400", accept: "video/*", onClick: () => { if (fileInputRef.current) { fileInputRef.current.accept = "video/*"; fileInputRef.current.click(); } } },
        { icon: Music, label: "Subir audio", color: "text-yellow-400", accept: "audio/*", onClick: () => { if (fileInputRef.current) { fileInputRef.current.accept = "audio/*"; fileInputRef.current.click(); } } },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto md:px-4 md:pb-6 pb-0 px-0">
            <input
                type="file"
                ref={fileInputRef}
                className="opacity-0 absolute pointer-events-none w-px h-px top-0 left-0" // Fix for Android WebView: display:none blocks click()
                accept="image/*"
                onChange={handleFileSelect}
            />

            {/* Attachments Preview */}
            {attachments && attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-2 mb-2">
                    {attachments.map((att: { type: string, data: string, name: string }, idx: number) => (
                        <div key={idx} className="relative inline-block group">
                            {att.type.startsWith('image/') ? (
                                <div className="relative">
                                    <img src={att.data} alt="Preview" className="h-14 w-auto rounded-xl border border-gray-100 dark:border-white/10 shadow-sm" />
                                    <button
                                        onClick={() => removeAttachment(att.name)}
                                        className="absolute -top-1.5 -right-1.5 bg-gray-900/80 backdrop-blur-md rounded-full p-0.5 text-white hover:bg-gray-900 transition-colors shadow-sm"
                                    >
                                        <Plus size={10} className="rotate-45" />
                                    </button>
                                </div>
                            ) : (
                                <div className="h-14 w-28 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 p-2">
                                    <FileText size={18} className="text-blue-500 mr-2" />
                                    <span className="text-[10px] truncate max-w-[60px] font-medium text-gray-600 dark:text-gray-400">{att.name}</span>
                                    <button
                                        onClick={() => removeAttachment(att.name)}
                                        className="absolute -top-1.5 -right-1.5 bg-gray-900/80 backdrop-blur-md rounded-full p-0.5 text-white hover:bg-gray-900 transition-colors shadow-sm"
                                    >
                                        <Plus size={10} className="rotate-45" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* MOBILE INPUT (Nexa-style) */}
            <div className="md:hidden">
                <div className="bg-gray-50 dark:bg-[#1a1b1e] rounded-t-2xl p-3 flex flex-col gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] border-t border-gray-100 dark:border-white/5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Mensaje a Nexa..."
                        className="w-full bg-transparent !border-none focus:ring-0 !outline-none focus:outline-none appearance-none !ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none min-h-[44px] max-h-[150px] py-2 px-1 text-[16px] leading-snug"
                        style={{ scrollbarWidth: 'none' }}
                    />

                    <div className="flex items-center justify-between px-2 pb-1">
                        <div className="flex items-center gap-1.5">

                            {/* ATTACHMENT MENU (Mobile) */}
                            {showAttachments && (
                                <div className="absolute bottom-16 left-4 mb-2 w-48 p-1.5 rounded-xl bg-white dark:bg-[#25262b] border border-gray-100 dark:border-white/10 shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    {attachmentOptions.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-left transition-colors group"
                                            onClick={() => { opt.onClick(); setShowAttachments(false); }}
                                        >
                                            <div className={`p-1.5 rounded-full bg-gray-50 dark:bg-white/5 group-hover:bg-gray-100 dark:group-hover:bg-white/10 transition-colors ${opt.color}`}>
                                                <opt.icon size={18} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => setShowAttachments(!showAttachments)}
                                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 ${showAttachments ? 'bg-gray-200 dark:bg-white/10 text-black dark:text-white' : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                            >
                                <Plus size={24} className={showAttachments ? 'rotate-45 transition-transform duration-200' : 'transition-transform duration-200'} />
                            </button>

                            {/* REASONING MODE TOGGLE */}
                            <button
                                onClick={() => setReasoningMode(reasoningMode === 'normal' ? 'deep' : 'normal')}
                                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 ${reasoningMode === 'deep' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                title={reasoningMode === 'deep' ? 'Modo Pensamiento Profundo' : 'Modo Rápido'}
                            >
                                <Atom size={20} className={reasoningMode === 'deep' ? 'animate-pulse' : ''} />
                            </button>

                            {/* VOICE MODE TOGGLE */}
                            <button
                                onClick={toggleListening}
                                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 ${isListening ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 animate-pulse' : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                            >
                                <Mic size={20} />
                            </button>

                        </div>

                        <button
                            onClick={(e) => {
                                if (isSpeaking) {
                                    e.preventDefault();
                                    stopSpeaking();
                                } else {
                                    handleSubmit(e);
                                }
                            }}
                            disabled={isThinking || (!isSpeaking && !input.trim() && attachments.length === 0)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${(!isSpeaking && !input.trim() && attachments.length === 0)
                                ? 'bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-gray-600'
                                : 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg'
                                }`}
                        >
                            {isSpeaking ? <Square size={16} fill="currentColor" /> : (isThinking ? <Wand2 size={20} className="animate-pulse" /> : <ArrowUp size={20} strokeWidth={2.5} />)}
                        </button>

                    </div>
                    <p className="text-[10px] text-center mt-3 text-gray-400 dark:text-gray-600 px-6">
                        By using Nexa Chat, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
                    </p>
                </div>
            </div>

            {/* DESKTOP INPUT (Original PC design kept intact) */}
            <div className="hidden md:flex flex-col gap-3">
                <div className="flex items-end gap-3">
                    <div className={`flex-1 relative glass-panel rounded-3xl pl-2 pr-2 py-3.5 flex items-center bg-[var(--vp-glass-base)] backdrop-blur-xl border border-[var(--vp-glass-border)] shadow-md transition-all focus-within:border-[var(--vp-accent-purple)]/50 focus-within:shadow-[0_0_20px_rgba(109,93,254,0.1)] ${isListening ? 'border-red-500/50' : ''}`}>

                        <div className="relative flex-none" ref={menuRef}>
                            <button
                                onClick={() => setShowAttachments(!showAttachments)}
                                className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white/5 ${showAttachments ? 'bg-white/10 text-[var(--text-primary)]' : ''}`}
                            >
                                <Plus size={20} className={showAttachments ? 'rotate-45 transition-transform' : 'transition-transform'} />
                            </button>

                            {showAttachments && (
                                <div className="absolute bottom-full left-0 mb-4 w-56 p-1.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 overflow-hidden">
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
                        </div>

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="¿Cómo puedo ayudarte hoy?"
                            className="flex-1 bg-transparent !border-none focus:ring-0 !outline-none focus:outline-none appearance-none !ring-0 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none h-[24px] max-h-[150px] overflow-y-auto py-0 px-3 text-[16px] leading-normal scrollbar-hide"
                            style={{ minHeight: '24px' }}
                        />

                        <div className="flex items-center gap-1.5 pr-2">
                            <button
                                onClick={() => sendMessage("index_codebase")}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all text-[var(--text-tertiary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                                title="Indexar proyecto (Búsqueda semántica)"
                            >
                                <Database size={17} />
                            </button>
                            <div className="w-px h-5 bg-[var(--border-color)] mx-1"></div>
                            <button
                                onClick={() => setArtifactPanelOpen(!isArtifactPanelOpen)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isArtifactPanelOpen ? 'bg-blue-500/20 text-blue-400' : 'text-[var(--text-tertiary)] hover:bg-white/5 hover:text-[var(--text-primary)]'}`}
                                title="Panel Pro de Artefactos"
                            >
                                <Layout size={18} />
                            </button>
                            <div className="w-px h-5 bg-[var(--border-color)] mx-1"></div>
                            <button
                                onClick={() => reasoningMode === 'normal' ? setReasoningMode('deep') : setReasoningMode('normal')}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${reasoningMode !== 'normal' ? 'bg-purple-500/20 text-purple-400' : 'text-[var(--text-tertiary)] hover:bg-white/5 hover:text-[var(--text-primary)]'}`}
                                title="Razonamiento"
                            >
                                <Atom size={18} />
                            </button>
                            <div className="w-px h-5 bg-[var(--border-color)] mx-1"></div>
                            <button
                                onClick={toggleContinuousListening}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isContinuousListening ? 'bg-green-500/20 text-green-400' : 'text-[var(--text-tertiary)] hover:bg-white/5 hover:text-[var(--text-primary)]'}`}
                                title="Modo manos libres"
                            >
                                <AudioWaveform size={18} />
                            </button>
                            <div className="w-px h-5 bg-[var(--border-color)] mx-1"></div>
                            <button
                                onClick={toggleListening}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-[var(--text-tertiary)] hover:bg-white/5 hover:text-[var(--text-primary)]'}`}
                                title="Dictado por voz"
                            >
                                <Mic size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pb-1.5">
                        <AudioVisualizer />
                        <button
                            onClick={(e) => isSpeaking ? stopSpeaking() : handleSubmit(e)}
                            disabled={isThinking || (!isSpeaking && !input.trim() && attachments.length === 0)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${(!isSpeaking && !input.trim() && attachments.length === 0) ? 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] shadow-none' : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/30'}`}
                        >
                            {isSpeaking ? <Square size={16} fill="currentColor" /> : <ArrowUp size={22} strokeWidth={2.5} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
