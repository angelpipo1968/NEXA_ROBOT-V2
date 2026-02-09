import React, { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/useChatStore';
import ChatInput from '@/components/chat/ChatInput';
import MessageBubble from '@/components/chat/MessageBubble';
import { ChevronDown } from 'lucide-react';

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
        <div className="flex flex-col h-full relative">

            {/* Header: Model Selector */}
            <div className="absolute top-6 left-8 z-10 animate-in fade-in slide-in-from-top-4 duration-500">
                <button className="flex items-center gap-2 text-xl font-medium text-gray-200 hover:text-white transition-colors group">
                    <span>Nexa-Ultra</span>
                    <ChevronDown size={20} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pt-20 pb-32">
                {messages.length === 0 ? (
                    // Empty State: Welcome Screen
                    <div className="h-full flex flex-col items-center justify-center -mt-20">
                        <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight text-center mb-12 drop-shadow-xl animate-in fade-in zoom-in duration-500">
                            Listo cuando tú lo estés.
                        </h1>
                    </div>
                ) : (
                    // Message List
                    <div className="max-w-3xl mx-auto w-full px-4 space-y-6">
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
                        ))}
                        {isThinking && (
                            <div className="flex gap-4 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-white/5 rounded w-1/4"></div>
                                    <div className="h-4 bg-white/5 rounded w-1/2"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area (Fixed Bottom) */}
            <div className="fixed bottom-0 right-0 left-[280px] z-20 bg-gradient-to-t from-[#050505] to-transparent pb-1 pt-10">
                <ChatInput />
            </div>
        </div>
    );
}
