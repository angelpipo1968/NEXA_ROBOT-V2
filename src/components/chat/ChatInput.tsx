import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Plus, Sparkles, Image as ImageIcon, Code, Globe, Film, FileText, Music, Upload, Square, Wand2, Bot, Video, ChevronDown, Mic2, AudioWaveform, Check, Atom, ArrowUp, Layout, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/store/useChatStore';
import { useUIStore } from '@/store/useUIStore';
import { useVoiceStore } from '@/store/useVoiceStore';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { AudioVisualizer } from './AudioVisualizer';

export default function ChatInput() {
    const [input, setInput] = useState('');
    const [showAttachments, setShowAttachments] = useState(false);
    const navigate = useNavigate();
    const { sendMessage, isThinking, attachments, addAttachment, removeAttachment, clearAttachments, reasoningMode, setReasoningMode } = useChatStore();
    const { setActiveModule, toggleVideoMode, isArtifactPanelOpen, setArtifactPanelOpen } = useUIStore();
    const { toggleVoice, voiceEnabled, stopSpeaking, currentAudio, isSpeaking, toggleVoiceMode, isContinuousListening, toggleContinuousListening, speak } = useVoiceStore();
    const menuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { transcript, isListening, startListening, stopListening, resetTranscript, isSupported } = useSpeechToText();
    const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastClickTimeRef = useRef(0);
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMicClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const now = Date.now();
        const diff = now - lastClickTimeRef.current;

        if (diff < 300) {
            // DOUBLE CLICK detected
            if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
            toggleContinuousListening();
            lastClickTimeRef.current = 0; // Reset
        } else {
            lastClickTimeRef.current = now;
            clickTimeoutRef.current = setTimeout(() => {
                toggleListening();
                clickTimeoutRef.current = null;
            }, 300);
        }
    };

    useEffect(() => {
        if (transcript) {
            setInput(transcript);

            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = setTimeout(() => {
                handleSubmit();
            }, 2000);
        }
    }, [transcript]);

    // Wake Word Integration
    useEffect(() => {
        const handleWake = () => {
            if (isSpeaking) {
                stopSpeaking(); // Interrupt AI immediately
            }
            if (!isContinuousListening) {
                toggleContinuousListening(); // Auto-enable hands-free mode
            }
        };

        window.addEventListener('nexa-wake-word', handleWake);
        return () => window.removeEventListener('nexa-wake-word', handleWake);
    }, [isSpeaking, stopSpeaking, isContinuousListening, toggleContinuousListening]);

    // Logic for hands-free (continuous listening)
    useEffect(() => {
        if (isContinuousListening) {
            if (!voiceEnabled) toggleVoice();

            if (!isSpeaking && !isThinking && !isListening) {
                const timer = setTimeout(() => {
                    if (!isSpeaking && !isThinking && !isListening) {
                        startListening();
                    }
                }, 800);
                return () => clearTimeout(timer);
            }
        } else if (isListening && !isContinuousListening) {
            // Optional: stop if we switched off hands-free? 
            // Better to leave it to the user's manual toggle for the mic icon.
        }
    }, [isContinuousListening, isSpeaking, isThinking, isListening, voiceEnabled, toggleVoice, startListening]);

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

            {/* DESKTOP & MOBILE CONSOLIDATED INPUT (Gemini Style) */}
            <div className="relative z-20 px-4 md:px-0">
                <form 
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-2 w-full max-w-3xl mx-auto"
                >
                    <div className={`relative flex items-end gap-2 p-2 rounded-[28px] bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-lg transition-all focus-within:border-[var(--accent-primary)] focus-within:ring-1 focus-within:ring-[var(--accent-primary)] ${isListening ? 'ring-2 ring-red-500' : ''}`}>
                        
                        <div className="flex items-center self-center pl-2" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setShowAttachments(!showAttachments)}
                                className={`w-10 h-10 flex items-center justify-center rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors ${showAttachments ? 'bg-[var(--bg-tertiary)] rotate-45' : ''}`}
                            >
                                <Plus size={24} />
                            </button>
                            
                            {showAttachments && (
                                <div className="absolute bottom-full left-0 mb-4 w-56 p-2 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl animate-in fade-in slide-in-from-bottom-2 z-50">
                                    {attachmentOptions.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--bg-tertiary)] rounded-xl text-left transition-colors group"
                                            onClick={() => { opt.onClick(); setShowAttachments(false); }}
                                        >
                                            <div className={`p-2 rounded-full bg-[var(--bg-tertiary)] ${opt.color}`}>
                                                <opt.icon size={18} />
                                            </div>
                                            <span className="text-sm font-medium text-[var(--text-secondary)]">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Pregunta a Antigravity Unlimited..."
                            className="flex-1 bg-transparent border-none focus:ring-0 outline-none resize-none py-3 px-2 text-[16px] leading-relaxed text-[var(--text-primary)] placeholder-[var(--text-muted)] max-h-48 overflow-y-auto scrollbar-hide"
                            rows={1}
                            style={{ minHeight: '44px' }}
                        />

                        <div className="flex items-center gap-1 pr-1 self-center">
                            {/* Voice button */}
                            <button
                                type="button"
                                onClick={handleMicClick}
                                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${isContinuousListening ? 'text-green-500 bg-green-500/10' : (isListening ? 'text-red-500 animate-pulse bg-red-500/10' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]')}`}
                            >
                                {isContinuousListening ? <AudioWaveform size={20} /> : <Mic size={20} />}
                            </button>

                            {/* Reasoning Toggle */}
                            <button
                                type="button"
                                onClick={() => setReasoningMode(reasoningMode === 'normal' ? 'deep' : 'normal')}
                                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${reasoningMode === 'deep' ? 'text-purple-500 bg-purple-500/10' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]'}`}
                            >
                                <Atom size={20} />
                            </button>

                            {/* Send Button */}
                            <button
                                type="submit"
                                disabled={isThinking || (!isSpeaking && !input.trim() && attachments.length === 0)}
                                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${(!isSpeaking && !input.trim() && attachments.length === 0) ? 'text-[var(--text-muted)]' : 'bg-[var(--accent-primary)] text-white shadow-md hover:scale-105 active:scale-95'}`}
                            >
                                {isThinking ? <Wand2 size={20} className="animate-pulse" /> : <ArrowUp size={22} strokeWidth={2.5} />}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
