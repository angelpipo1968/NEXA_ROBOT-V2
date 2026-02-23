'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useChatStore, Message } from '@/store/useChatStore'
import ChatInput from './ChatInput'
import MessageBubble from './MessageBubble'
import { X } from 'lucide-react'
import { useVoiceStore } from '@/store/useVoiceStore'

// Lazy loaded heavy components
const ModernStudio = React.lazy(() => import('@/features/studio/ModernStudio').then(m => ({ default: m.ModernStudio })))
const DevStudio = React.lazy(() => import('../dev/DevStudio'))
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

export function ChatContainer({ userId, initialMessage }: ChatContainerProps) {
    const { messages, activeModule, setActiveModule, addMessage, isVideoMode, deleteMessage, isArtifactPanelOpen, forkChat, regenerateResponse } = useChatStore()
    const { isVoiceMode } = useVoiceStore()
    const messagesEndRef = useRef<HTMLDivElement>(null)

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
                            <div className="w-full max-w-6xl px-4 flex flex-col gap-10 animate-in fade-in zoom-in-95 duration-700">
                                {/* Empty State */}
                            </div>
                        ) : (
                            <div className="w-full max-w-4xl mx-auto py-4 px-4 overflow-x-hidden">
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
                                <Suspense fallback={<div className="flex items-center justify-center h-full text-cyan-400 font-mono uppercase">Cargando Módulo de Estudio...</div>}>
                                    {activeModule === 'studio' ? <ModernStudio /> : <DevStudio />}
                                </Suspense>
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

            {/* Nexa Pro Artifact Panel */}
            {isArtifactPanelOpen && (
                <Suspense fallback={<></>}>
                    <ArtifactPanel />
                </Suspense>
            )}
        </div>
    )
}
