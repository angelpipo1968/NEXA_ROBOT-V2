'use client';

import React, { useRef, useEffect } from 'react';
import { Activity, ScanLine } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { cn } from '@/lib/utils';

export function ChatInput() {
    const {
        isThinking, toggleThinking,
        isStreaming, sendMessage,
        currentInput, setInput,
        setActiveModule
    } = useChatStore();


    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [currentInput]);

    const handleSend = () => {
        if (!currentInput.trim() || isStreaming) return;
        sendMessage(currentInput);
        setInput('');
    };

    return (
        <div className="vp-input-section">
            <div className="vp-input-shell">
                <div className="vp-input-bar">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={currentInput}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={isThinking ? "Pensando..." : "Escribe un mensaje o describe tu idea..."}
                        className="vp-input"
                        style={{ height: '24px', maxHeight: '120px', resize: 'none' }}
                        disabled={isThinking}
                        autoFocus
                    />

                    <div className="vp-input-right">
                        {/* Vision Toggle */}
                        <div
                            onClick={() => setActiveModule('vision')}
                            className="flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-100 transition-opacity mr-2"
                        >
                            <ScanLine size={16} />
                        </div>
                        {/* Thinking Indicator/Toggle */}
                        <div
                            onClick={toggleThinking}
                            className="flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                        >
                            <div className={cn(
                                "vp-thinking-dot",
                                !isThinking && "grayscale opacity-50 animation-none bg-gray-500 shadow-none"
                            )} />
                            <span className="vp-thinking-text hidden sm:block">
                                Pensamiento
                            </span>
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={handleSend}
                            disabled={!currentInput.trim() && !isStreaming}
                            className="vp-send"
                        >
                            {isStreaming ? (
                                <Activity size={14} className="animate-spin" />
                            ) : (
                                "Enviar"
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <p className="vp-hint">
                NEXA OS puede generar errores. Verifica la información importante.
            </p>
        </div>
    );
}
