import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Plus, Sparkles, Image as ImageIcon, Code, Globe, Film, FileText, Music, Upload } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';

export default function ChatInput() {
    const [input, setInput] = useState('');
    const [showAttachments, setShowAttachments] = useState(false);
    const { sendMessage, isThinking } = useChatStore();
    const menuRef = useRef<HTMLDivElement>(null);

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
        { icon: ImageIcon, label: "Generación de imágenes" },
        { icon: Film, label: "Generación de Video" },
        { icon: Code, label: "Desarrollo web" },
    ];

    const attachmentOptions = [
        { icon: FileText, label: "Upload document", color: "text-blue-400" },
        { icon: ImageIcon, label: "Upload Image", color: "text-purple-400" },
        { icon: Film, label: "Upload Video", color: "text-pink-400" },
        { icon: Music, label: "Upload Audio", color: "text-yellow-400" },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto px-4 pb-1">
            {/* Input Container Pill */}
            <div className="relative glass-panel rounded-[32px] p-2 flex flex-col bg-[#1e1e2e]/60 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] transition-all focus-within:border-purple-500/30 focus-within:shadow-[0_0_30px_rgba(168,85,247,0.1)]">

                <div className="px-4 pt-3 pb-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="¿Cómo puedo ayudarte hoy?"
                        className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 resize-none h-[48px] max-h-[200px] overflow-custom py-2 text-lg"
                        style={{ minHeight: '48px' }}
                    />
                </div>

                {/* Bottom Actions Bar */}
                <div className="flex items-center justify-between px-3 pb-2 relative">
                    <div className="flex items-center gap-2">
                        {/* Attachments Menu Wrapper */}
                        <div className="relative" ref={menuRef}>
                            {showAttachments && (
                                <div className="absolute bottom-full left-0 mb-4 w-56 p-1.5 rounded-xl bg-[#1e1e2e] border border-white/10 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 overflow-hidden">
                                    {attachmentOptions.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg text-left transition-colors group"
                                            onClick={() => setShowAttachments(false)}
                                        >
                                            <div className={`p-1.5 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors ${opt.color}`}>
                                                <opt.icon size={18} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-300 group-hover:text-white">{opt.label}</span>
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

                        <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 transition-all font-medium text-sm">
                            <Sparkles size={16} />
                            <span>Pensamiento</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
                            <Mic size={20} />
                        </button>
                        <button
                            onClick={() => handleSubmit()}
                            disabled={!input.trim() || isThinking}
                            className={`p-3 rounded-full transition-all duration-300 ${input.trim()
                                ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] scale-100'
                                : 'bg-[#2a2a35] text-gray-500 scale-95'
                                }`}
                        >
                            <Send size={20} fill={input.trim() ? "currentColor" : "none"} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Suggestion Chips */}
            <div className="mt-8 flex flex-wrap justify-center gap-3 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards" style={{ animationDelay: '0.2s' }}>
                {suggestions.map((s, idx) => (
                    <button
                        key={idx}
                        className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-sm text-gray-300"
                    >
                        <s.icon size={14} className="text-purple-400" />
                        <span>{s.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
