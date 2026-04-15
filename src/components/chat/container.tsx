'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useChatStore } from '@/store/useChatStore'
import { useUIStore } from '@/store/useUIStore'
import ChatInput from './ChatInput'
import MessageBubble from './MessageBubble'
import { ChevronDown, Brain, Bot } from 'lucide-react'
import { useVoiceStore } from '@/store/useVoiceStore'

const GRAVITY_MODELS = [
    { id: 'llama-3', name: 'Llama 3', tag: 'Local', icon: Bot, color: 'text-orange-400', gradient: 'from-orange-500/20 to-yellow-500/10', border: 'border-orange-500/30' },
    { id: 'mistral', name: 'Mistral', tag: 'Local', icon: Brain, color: 'text-red-400', gradient: 'from-red-500/20 to-pink-500/10', border: 'border-red-500/30' },
]


// Lazy loaded components
const VoiceChat = React.lazy(() => import('./VoiceChat').then(m => ({ default: m.VoiceChat })))
const VoiceVideoOverlay = React.lazy(() => import('./VoiceVideoOverlay').then(m => ({ default: m.VoiceVideoOverlay })))
const ArtifactPanel = React.lazy(() => import('./ArtifactPanel'))

interface ChatContainerProps {
    userId?: string
    activeId?: string | null
    initialMessage?: string
    onSelect?: (id: string, title: string) => void
    onNewChat?: () => void
}

export function ChatContainer({ initialMessage }: ChatContainerProps) {
    const { messages, addMessage, deleteMessage, forkChat, regenerateResponse } = useChatStore()
    const { activeModule, isVideoMode, isArtifactPanelOpen } = useUIStore()
    const { isVoiceMode } = useVoiceStore()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [activeModel, setActiveModel] = useState(GRAVITY_MODELS[0])
    const [showModelPicker, setShowModelPicker] = useState(false)
    const ActiveIcon = activeModel.icon

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (initialMessage && messages.length === 0) {
            addMessage({ id: Date.now().toString(), role: 'assistant', content: initialMessage, timestamp: Date.now() })
        }
    }, [initialMessage, messages.length, addMessage])

    // Voice Mode View
    if (isVoiceMode) {
        return (
            <div className="fixed inset-0 z-50 bg-[#05060a]">
                <Suspense fallback={<div className="flex items-center justify-center h-full text-cyan-500 font-mono tracking-widest text-sm">INICIALIZANDO MOTOR VOCAL...</div>}>
                    <VoiceChat autoStart={true} />
                </Suspense>
            </div>
        )
    }

    // Video Mode View
    if (isVideoMode) {
        return (
            <div className="relative h-full w-full">
                <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-cyan-500 z-[100] bg-black/50">Cargando Overlay de Video...</div>}>
                    <VoiceVideoOverlay />
                </Suspense>
                {/* Fallback to normal chat behind overlay, blurred */}
                <div className="flex flex-col h-full w-full relative overflow-hidden bg-transparent filter blur-md pointer-events-none">
                    <div className="flex-1 overflow-y-auto custom-scrollbar pb-4 w-full relative">
                        <div className="w-full max-w-4xl mx-auto py-4 px-4">
                            {messages.map((message) => (
                                <MessageBubble
                                    key={message.id}
                                    id={message.id}
                                    role={message.role}
                                    content={message.content}
                                    deleteMessage={deleteMessage}
                                    forkChat={forkChat}
                                    regenerateResponse={regenerateResponse}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full w-full relative overflow-hidden bg-transparent">
            {/* Status Debug (Ephemeral) */}
            <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[10000] px-3 py-1 bg-purple-600 text-white text-[10px] font-bold rounded-full transition-opacity duration-500 ${isArtifactPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                NEXA PRO PANEL ACTIVE
            </div>

            {/* Main Chat Area */}
            <div className={`flex flex-col h-full transition-all duration-300 ${isArtifactPanelOpen ? 'w-[55%]' : 'w-full'}`}>
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
                            <div className="w-full h-full flex flex-col items-center justify-center pt-20 px-8">
                                <div className="text-center space-y-6 max-w-2xl">
                                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)]">
                                        Hola, soy <span className="text-[var(--accent-primary)]">Nexa</span>
                                    </h1>
                                    <p className="text-lg md:text-2xl text-[var(--text-secondary)] font-normal leading-relaxed">
                                        Bienvenido a <span className="font-bold">NEXA Unlimited</span>.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <motion.div 
                                initial="hidden"
                                animate="show"
                                variants={{
                                    show: {
                                        transition: {
                                            staggerChildren: 0.1
                                        }
                                    }
                                }}
                                className="w-full max-w-4xl mx-auto py-4 px-4 overflow-x-hidden"
                            >
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            show: { opacity: 1, y: 0 }
                                        }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                    >
                                        <MessageBubble
                                            id={message.id}
                                            role={message.role}
                                            content={message.content}
                                            deleteMessage={deleteMessage}
                                            forkChat={forkChat}
                                            regenerateResponse={regenerateResponse}
                                        />
                                    </motion.div>
                                ))}
                                <div ref={messagesEndRef} />
                            </motion.div>
                        )
                    ) : null}
                </div>

                {/* Model Picker + Input Area - Fixed at bottom */}
                {activeModule === 'chat' && (
                    <div className="w-full bg-transparent pb-0 px-4 md:px-8 z-20">
                        <div className="max-w-4xl mx-auto">
                            {/* Model Selector Chip */}
                            <div className="flex justify-center mb-2 relative">
                                <button
                                    onClick={() => setShowModelPicker(!showModelPicker)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border bg-gradient-to-r ${activeModel.gradient} ${activeModel.border} hover:opacity-90 transition-all text-sm font-medium ${activeModel.color}`}
                                >
                                    <ActiveIcon size={14} />
                                    <span>{activeModel.name}</span>
                                    <ChevronDown size={12} className={`transition-transform ${showModelPicker ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Model Dropdown */}
                                {showModelPicker && (
                                    <div className="absolute bottom-full mb-2 w-72 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50">
                                        <div className="p-2 border-b border-[var(--border-color)]">
                                            <p className="text-xs text-[var(--text-muted)] px-2 py-1 font-semibold uppercase tracking-wider">Seleccionar Modelo</p>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            {GRAVITY_MODELS.map((model) => {
                                                const Icon = model.icon
                                                return (
                                                    <button
                                                        key={model.id}
                                                        onClick={() => { setActiveModel(model); setShowModelPicker(false); }}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left hover:bg-[var(--bg-tertiary)] group ${
                                                            activeModel.id === model.id ? `bg-gradient-to-r ${model.gradient} border ${model.border}` : ''
                                                        }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${model.gradient} border ${model.border} flex items-center justify-center flex-shrink-0`}>
                                                            <Icon size={14} className={model.color} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{model.name}</p>
                                                            <p className={`text-xs font-medium ${model.color}`}>{model.tag}</p>
                                                        </div>
                                                        {activeModel.id === model.id && (
                                                            <div className={`w-2 h-2 rounded-full bg-current ${model.color} flex-shrink-0`} />
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <ChatInput />
                        </div>
                    </div>
                )}
            </div>

            {isArtifactPanelOpen && (
                <Suspense fallback={<></>}>
                    <ArtifactPanel />
                </Suspense>
            )}
        </div>
    )
}
