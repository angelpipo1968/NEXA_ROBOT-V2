'use client'

import { useState, useEffect, useRef } from 'react'
import { useChatStore, Message } from '@/store/useChatStore'
import ChatInput from './ChatInput'
import { ModernStudio } from '@/features/studio/ModernStudio'
import DevStudio from '../dev/DevStudio'
import { X, Sparkles, Brain, AudioWaveform, Search } from 'lucide-react'

interface ChatContainerProps {
    userId?: string
    activeId?: string | null
    initialMessage?: string
    onSelect?: (id: string, title: string) => void
    onNewChat?: () => void
}

function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === 'user'
    const [isThoughtExpanded, setIsThoughtExpanded] = useState(false)

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-8 w-full group`}>
            <div className={`max-w-[85%] flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar/Icon */}
                {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-black text-xs italic flex-shrink-0 mt-1 shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10">
                        N
                    </div>
                )}

                <div className="flex flex-col gap-3 overflow-hidden">
                    {/* Thinking Section (for Assistant) */}
                    {!isUser && message.content && (
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setIsThoughtExpanded(!isThoughtExpanded)}
                                className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-200 transition-colors w-fit px-2 py-1 rounded-lg hover:bg-white/5"
                            >
                                <Sparkles size={14} className="text-[#6D5DFE]" />
                                <span>{isThoughtExpanded ? 'Hide thinking' : 'Show thinking'}</span>
                            </button>

                            {isThoughtExpanded && (
                                <div className="text-sm text-gray-400 italic bg-white/5 rounded-2xl px-4 py-3 border-l-2 border-[#6D5DFE]">
                                    Analizando la solicitud...
                                </div>
                            )}
                        </div>
                    )}

                    <div
                        className={`rounded-3xl px-5 py-3.5 text-[16px] leading-relaxed ${isUser
                            ? 'bg-blue-600 dark:bg-white/10 text-white border border-transparent dark:border-white/5 backdrop-blur-sm'
                            : 'bg-transparent text-gray-800 dark:text-gray-100'
                            }`}
                    >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.isStreaming && (
                            <span className="inline-block w-2 h-4 bg-[#6D5DFE] animate-pulse ml-1 align-middle" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export function ChatContainer({ userId, initialMessage }: ChatContainerProps) {
    const { messages, activeModule, setActiveModule, addMessage } = useChatStore()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (initialMessage && messages.length === 0) {
            addMessage({ id: Date.now().toString(), role: 'assistant', content: initialMessage, timestamp: Date.now() })
        }
    }, [initialMessage, messages.length, addMessage])

    return (
        <div className="flex flex-col h-full w-full relative overflow-hidden bg-transparent">
            {/* Header / Top Bar (Optional, can be added here) */}

            {/* Messages Area - Grows to fill space */}
            <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth pb-4 w-full relative">
                {/* Header / Logo Section - Only show when no messages */}
                {activeModule === 'chat' && messages.length === 0 && (
                    <div className="flex flex-col items-center mt-10 mb-6 z-10 md:hidden">
                        <div className="text-2xl font-bold tracking-tight mb-2 text-white">
                            NEXA
                        </div>
                    </div>
                )}

                {activeModule === 'chat' ? (
                    messages.length === 0 ? (
                        <div className="w-full max-w-6xl px-4 flex flex-col gap-10 animate-in fade-in zoom-in-95 duration-700">
                            {/* Empty State */}
                        </div>
                    ) : (
                        <div className="w-full max-w-4xl mx-auto py-4 px-4">
                            {messages.map((message) => (
                                <MessageBubble key={message.id} message={message} />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )
                ) : (
                    <div className="absolute inset-0 z-50 bg-[#05060a] flex flex-col">
                        <div className="flex justify-end p-4 absolute top-0 right-0 z-[60]">
                            <button
                                onClick={() => setActiveModule('chat')}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            {activeModule === 'studio' ? <ModernStudio /> :
                                <DevStudio />}
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area - Fixed at bottom */}
            {activeModule === 'chat' && (
                <div className="w-full bg-transparent pb-0 px-4 md:px-8 z-20">
                    <div className="max-w-4xl mx-auto">
                        <ChatInput />
                    </div>
                </div>
            )}
        </div>
    )
}
