import { useState, useEffect, useCallback } from 'react'
import { NexaClient, ChatMessage, ToolResult, StreamOptions, SendOptions, NexaConfig } from '../core'

export function useNexa(apiKey: string, config?: Partial<NexaConfig>) {
    const [client, setClient] = useState<NexaClient | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [sessionId, setSessionId] = useState<string | null>(null)

    useEffect(() => {
        // Cast config to any to match expected type if properties mismatch slightly due to Partial
        const nexa = new NexaClient({
            apiKey,
            ...config
        } as NexaConfig)

        setClient(nexa)

        // Crear sesión automáticamente
        nexa.createSession().then(session => {
            setSessionId(session.id)
        }).catch(err => console.error("Failed to init session", err))

        return () => {
            // Cleanup
        }
    }, [apiKey])

    const sendMessage = useCallback(async (
        content: string,
        options?: SendOptions
    ): Promise<ChatMessage> => {
        if (!client) throw new Error('Client not initialized')

        setIsLoading(true)
        setError(null)

        try {
            const userMessage: ChatMessage = {
                role: 'user',
                content,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, userMessage])

            const response = await client.chat.send({
                messages: [...messages, userMessage],
                sessionId: sessionId!,
                ...options
            })

            setMessages(prev => [...prev, response.message])
            return response.message
        } catch (err) {
            setError(err as Error)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [client, messages, sessionId])

    const streamMessage = useCallback(async (
        content: string,
        options?: StreamOptions
    ): Promise<AsyncIterable<string>> => {
        if (!client) throw new Error('Client not initialized')

        const userMessage: ChatMessage = {
            role: 'user',
            content,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])

        const stream = await client.streamChat(
            [...messages, userMessage],
            { sessionId: sessionId!, ...options }
        )

        return {
            [Symbol.asyncIterator]: async function* () {
                let fullResponse = ''

                for await (const chunk of stream) {
                    if (chunk.type === 'content') {
                        fullResponse += chunk.content
                        yield chunk.content
                    }

                    if (chunk.type === 'complete') {
                        setMessages(prev => [...prev, {
                            role: 'assistant',
                            content: fullResponse,
                            timestamp: new Date(),
                            metadata: chunk.metadata
                        }])
                    }
                }
            }
        }
    }, [client, messages, sessionId])

    const executeTool = useCallback(async (
        toolName: string,
        parameters: any
    ): Promise<ToolResult> => {
        if (!client) throw new Error('Client not initialized')

        return await client.tools.execute(toolName, parameters, {
            sessionId: sessionId!
        })
    }, [client, sessionId])

    const clearMessages = useCallback(() => {
        setMessages([])
    }, [])

    return {
        client,
        messages,
        isLoading,
        error,
        sendMessage,
        streamMessage,
        executeTool,
        clearMessages,
        sessionId
    }
}
