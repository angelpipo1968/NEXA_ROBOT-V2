'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore, Message } from '@/store/useChatStore'
import { useUIStore } from '@/store/useUIStore'
import ChatInput from './ChatInput'
import MessageBubble from './MessageBubble'
import { X, ChevronDown, Sparkles, Brain, Bot, Cpu } from 'lucide-react'
import { useVoiceStore } from '@/store/useVoiceStore'

const GRAVITY_MODELS = [
    { id: 'nexa-unlimited', name: 'Nexa Ilimitada', tag: 'Gravity Master', icon: Sparkles, color: 'text-blue-400', gradient: 'from-blue-500/20 to-indigo-500/10', border: 'border-blue-500/30' },
    { id: 'gemini', name: 'Gemini 1.5 Flash', tag: 'Google', icon: Brain, color: 'text-purple-400', gradient: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-500/20' },
    { id: 'claude', name: 'Claude 3.5 Sonnet', tag: 'Anthropic', icon: Bot, color: 'text-amber-400', gradient: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-500/20' },
    { id: 'gpt', name: 'GPT-4 Turbo', tag: 'OpenAI', icon: Cpu, color: 'text-green-400', gradient: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/20' },
]


// Lazy loaded components
const VoiceChat = React.lazy(() => import('./VoiceChat').then(m => ({ default: m.VoiceChat })))
const VoiceVideoOverlay = React.lazy(() => import('./VoiceVideoOverlay').then(m => ({ default: m.VoiceVideoOverlay })))
const ArtifactPanel = React.lazy(() => import('./ArtifactPanel'))
const ThoughtStream = React.lazy(() => import('../thought/ThoughtStream').then(m => ({ default: m.ThoughtStream })))

interface ChatContainerProps {
    userId?: string
    activeId?: string | null
    initialMessage?: string
    onSelect?: (id: string, title: string) => void
    onNewChat?: () => void
}

export function ChatContainer({ userId, initialMessage }: ChatContainerProps) {
    const { messages, addMessage, deleteMessage, forkChat, regenerateResponse } = useChatStore()
    const { activeModule, setActiveModule, isVideoMode, isArtifactPanelOpen, isThoughtStreamOpen, setThoughtStreamOpen } = useUIStore()
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
                                        Bienvenido a <span className="font-bold">Antigravity Unlimited</span>.
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

                                {/* Mind Map Toggle Button - Premium WOW Feature */}
                                <motion.button
                                    onClick={() => setThoughtStreamOpen(!isThoughtStreamOpen)}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`ml-2 flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-sm font-medium ${
                                        isThoughtStreamOpen 
                                        ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                                        : 'bg-white/5 text-[var(--text-tertiary)] border-white/10 hover:border-purple-500/50 hover:text-purple-300'
                                    }`}
                                >
                                    <Brain size={14} className={isThoughtStreamOpen ? 'animate-pulse' : ''} />
                                    <span>Mapa Mental 3D</span>
                                </motion.button>

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

            {/* 3D Thought Stream Overlay */}
            <AnimatePresence>
                {isThoughtStreamOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 md:inset-10 z-[1000] rounded-3xl overflow-hidden border border-purple-500/30 bg-black/80 backdrop-blur-3xl shadow-[0_0_50px_rgba(168,85,247,0.2)]"
                    >
                        <div className="absolute top-6 right-6 z-[1010]">
                            <button
                                onClick={() => setThoughtStreamOpen(false)}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <Suspense fallback={<div className="flex items-center justify-center h-full text-purple-400">INICIALIZANDO FLUJO COGNITIVO...</div>}>
                            <ThoughtStream />
                        </Suspense>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
