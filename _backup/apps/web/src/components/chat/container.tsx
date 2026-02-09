'use client'

import { useState, useEffect, useRef } from 'react'
import { useChatStore, Message } from '@/store/useChatStore'
import { ChatInput } from './ChatInput'
import { ModernStudio } from '../studio/ModernStudio'
import { AvatarPlatform } from '../hologram/avatar/AvatarPlatform'
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
                            ? 'bg-white/10 text-white border border-white/5 backdrop-blur-sm'
                            : 'bg-transparent text-gray-100'
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
        <div className="h-full flex flex-col relative bg-transparent font-sans overflow-hidden">

            {/* Header / Logo Section - Only show when no messages */}
            {activeModule === 'chat' && messages.length === 0 && (
                <div className="flex flex-col items-center mt-10 mb-6 z-10 md:hidden">
                    <div className="text-2xl font-bold tracking-tight mb-2 text-white">
                        NEXA
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className={`flex-1 overflow-y-auto w-full relative scrollbar-hide flex flex-col items-center justify-start py-4 ${messages.length === 0 ? 'justify-center' : ''}`}>
                {activeModule === 'chat' ? (
                    messages.length === 0 ? (
                        <div className="w-full max-w-6xl px-4 flex flex-col gap-10 animate-in fade-in zoom-in-95 duration-700">

                            {/* Vision Pro Hero Section */}
                            <div className="vp-hero">
                                <div className="vp-hero-left">
                                    <h1 className="vp-hero-title">
                                        ¿En qué estás <br />
                                        trabajando hoy?
                                    </h1>
                                    <p className="vp-hero-subtitle">
                                        NEXA OS es tu espacio para crear, pensar y construir sin fricción. Diseñado para la era espacial de la información.
                                    </p>

                                    {/* Quick Actions */}
                                    <div className="vp-actions">
                                        {[
                                            { id: 'image', label: 'Generar imagen', icon: <Sparkles size={14} />, primary: true },
                                            { id: 'research', label: 'Investigar tema', icon: <Brain size={14} /> },
                                            { id: 'voice', label: 'Análisis de voz', icon: <AudioWaveform size={14} /> },
                                            { id: 'search', label: 'Búsqueda web', icon: <Search size={14} /> }
                                        ].map((action) => (
                                            <button
                                                key={action.id}
                                                onClick={() => addMessage({ id: Date.now().toString(), role: 'user', content: `Iniciar ${action.label}`, timestamp: Date.now() })}
                                                className={`vp-action ${action.primary ? 'vp-action--primary' : ''}`}
                                            >
                                                {action.icon}
                                                <span>{action.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Hero Visual (3D Glass Cards) */}
                                <div className="vp-hero-right hidden lg:flex">
                                    <div className="vp-card vp-card--main">
                                        <div className="vp-card-header">
                                            <span className="vp-card-label">Estado del Sistema</span>
                                            <div className="vp-card-dot" />
                                        </div>
                                        <h3 className="vp-card-title">NEXA Core Online</h3>
                                        <p className="vp-card-text">
                                            Todos los sistemas operativos. <br />
                                            Listo para procesamiento cuántico.
                                        </p>
                                        <div className="vp-card-row mt-4">
                                            <div className="vp-card vp-card--small">
                                                <span className="vp-card-label">CPU</span>
                                                <span className="vp-card-value">12%</span>
                                            </div>
                                            <div className="vp-card vp-card--small">
                                                <span className="vp-card-label">RAM</span>
                                                <span className="vp-card-value">3.4GB</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="vp-card vp-card--small w-64 self-end">
                                        <span className="vp-card-label">Modelo Activo</span>
                                        <div className="vp-card-value vp-card-value--accent text-lg">
                                            Nexa-Ultra v4.0
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                            {activeModule === 'studio' ? <ModernStudio /> : <AvatarPlatform />}
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area - Only show in Chat Mode */}
            {activeModule === 'chat' && (
                <div className="w-full relative z-20 pb-6 px-6">
                    <ChatInput />
                </div>
            )}
        </div>
    )
}
