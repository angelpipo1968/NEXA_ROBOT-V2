import React, { useState, useRef, useEffect } from 'react'
import { NexaConfig } from '../../core'
import { useNexa } from '../useNexa'
import { MessageList, InputArea, ToolPanel } from './stubs'

interface ChatProps {
    apiKey: string
    config?: NexaConfig
    modelId?: string
    tools?: string[]
    showThinking?: boolean
    className?: string
}

export function Chat({
    apiKey,
    config,
    modelId = 'llama3',
    tools = [],
    showThinking = false,
    className = ''
}: ChatProps) {
    const {
        messages,
        isLoading,
        error,
        sendMessage,
        streamMessage,
        executeTool
    } = useNexa(apiKey, config)

    const [input, setInput] = useState('')
    const [streaming, setStreaming] = useState(false)
    const [currentStream, setCurrentStream] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, currentStream])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const message = input.trim()
        setInput('')

        if (config?.stream) {
            setStreaming(true)
            setCurrentStream('')

            try {
                const stream = await streamMessage(message, { modelId })

                for await (const chunk of stream) {
                    setCurrentStream(prev => prev + chunk)
                }
            } catch (err) {
                console.error('Stream error:', err)
            } finally {
                setStreaming(false)
                setCurrentStream('')
            }
        } else {
            await sendMessage(message, { modelId })
        }
    }

    const handleToolExecute = async (toolName: string, params: any) => {
        try {
            const result = await executeTool(toolName, params)

            // Auto-enviar resultado al chat
            if (result.success) {
                await sendMessage(
                    `Tool ${toolName} executed successfully. Result: ${JSON.stringify(result.data, null, 2)}`,
                    { modelId }
                )
            }

            return result
        } catch (err) {
            console.error('Tool execution error:', err)
            throw err
        }
    }

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="flex-1 overflow-y-auto p-4">
                <MessageList
                    messages={messages}
                    streaming={streaming}
                    currentStream={currentStream}
                    showThinking={showThinking}
                />
                <div ref={messagesEndRef} />
            </div>

            {tools.length > 0 && (
                <div className="border-t border-gray-200">
                    <ToolPanel
                        tools={tools}
                        onExecute={handleToolExecute}
                        disabled={isLoading || streaming}
                    />
                </div>
            )}

            <div className="border-t border-gray-200 p-4">
                <InputArea
                    value={input}
                    onChange={(val: any) => setInput(typeof val === 'string' ? val : val.target.value)}
                    onSubmit={handleSubmit}
                    isLoading={isLoading || streaming}
                    placeholder="Type your message..."
                />

                {error && (
                    <div className="mt-2 text-red-600 text-sm">
                        Error: {error.message}
                    </div>
                )}
            </div>
        </div>
    )
}
