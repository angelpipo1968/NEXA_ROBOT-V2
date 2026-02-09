import { EventEmitter } from 'events'
import axios, { AxiosInstance } from 'axios'
import { z } from 'zod'
import { EmbeddingClient } from './embeddings'
import { ChatClient, ToolsClient, MemoryClient } from './clients-stub'
import { NexaConfig, HealthResponse, SessionOptions, Session, ChatMessage, StreamOptions, ChatChunk } from './types'

export class NexaClient extends EventEmitter {
    private apiKey: string
    private baseURL: string
    protected axios: AxiosInstance // Changed to protected for subclass access
    private config: NexaConfig

    public embeddings: EmbeddingClient
    public chat: ChatClient
    public tools: ToolsClient
    public memory: MemoryClient

    constructor(config: NexaConfig) {
        super()

        this.config = {
            baseURL: 'https://api.nexa-ai.dev/v1',
            timeout: 30000,
            maxRetries: 3,
            ...config
        }

        this.apiKey = this.config.apiKey!
        this.baseURL = this.config.baseURL!

        this.axios = this.initializeAxios()

        // Initialize properties in constructor to satisfy TS strict property initialization
        this.embeddings = new EmbeddingClient(this.axios, this.config)
        this.chat = new ChatClient(this.axios, this.config)
        this.tools = new ToolsClient(this.axios, this.config)
        this.memory = new MemoryClient(this.axios, this.config)
    }

    private initializeAxios(): AxiosInstance {
        const instance = axios.create({
            baseURL: this.baseURL,
            timeout: this.config.timeout,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'X-Nexa-SDK-Version': '1.0.0'
            }
        })

        // Interceptor para retries
        instance.interceptors.response.use(
            response => response,
            async error => {
                const config = error.config
                config.retryCount = config.retryCount || 0

                if (config.retryCount < (this.config.maxRetries || 3)) {
                    config.retryCount++

                    // Backoff exponencial
                    const delay = Math.min(1000 * Math.pow(2, config.retryCount), 10000)
                    await new Promise(resolve => setTimeout(resolve, delay))

                    return instance(config)
                }

                return Promise.reject(error)
            }
        )
        return instance;
    }

    // Note: initializeClients is merged into constructor to avoid TS errors

    async health(): Promise<HealthResponse> {
        const response = await this.axios.get('/health')
        return response.data
    }

    async createSession(options?: SessionOptions): Promise<Session> {
        const response = await this.axios.post('/sessions', options)
        return response.data
    }

    async streamChat(
        messages: ChatMessage[],
        options: StreamOptions = {}
    ): Promise<AsyncIterable<ChatChunk>> {
        const sessionId = options.sessionId || await this.createSession().then(s => s.id)

        const response = await this.axios.post(
            '/chat/stream',
            { messages, ...options },
            { responseType: 'stream' }
        )

        return this.createStream(response.data)
    }

    private createStream(stream: any): AsyncIterable<ChatChunk> {
        return {
            [Symbol.asyncIterator]: async function* () {
                for await (const chunk of stream) {
                    const data = JSON.parse(chunk.toString())
                    yield data
                }
            }
        }
    }
}
