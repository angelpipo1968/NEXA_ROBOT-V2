'use client';

import React, { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { ChatInput } from '@/components/chat/ChatInput';

export default function ChatPage() {
    const { messages, isThinking } = useChatStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    return (
        <section className="vp-chat flex flex-col h-full overflow-hidden relative">
            <div className="flex-none p-8 pb-0">
                <h1 className="vp-hero-title text-4xl mb-2">Chat NEXA</h1>
                <p className="vp-hero-subtitle text-sm">
                    Conversación continua con tu modelo Nexa-Ultra.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-20 text-sm">
                        Inicia una conversación para comenzar...
                    </div>
                )}

                {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 ${m.role === 'user'
                                ? 'bg-[#00E5FF]/10 text-white border border-[#00E5FF]/20'
                                : 'bg-white/5 text-gray-100 border border-white/10'
                            }`}>
                            <strong className="block text-xs uppercase tracking-wider mb-1 opacity-50">
                                {m.role === 'user' ? 'Tú' : 'NEXA'}
                            </strong>
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                {m.content}
                            </div>
                        </div>
                    </div>
                ))}

                {isThinking && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">NEXA está pensando...</p>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex-none p-4 md:p-8 pt-0 z-10">
                <ChatInput />
            </div>
        </section>
    );
}
