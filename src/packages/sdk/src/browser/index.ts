import { NexaClient } from '../core/index'
import { NexaConfig, EmbeddingOptions, EmbeddingResult, SearchOptions, SearchResult } from '../core/types'
import { BrowserCache } from './cache'

export interface WidgetOptions {
    theme?: 'light' | 'dark'
    position?: 'bottom-right' | 'bottom-left'
}

export class ChatWidget {
    constructor(private client: NexaBrowser, private container: HTMLElement, private options: WidgetOptions) { }

    async initialize() {
        // Render simple chat widget
        const div = document.createElement('div')
        div.style.position = 'fixed'
        div.style.bottom = '20px'
        div.style.right = this.options.position === 'bottom-left' ? 'auto' : '20px'
        div.style.left = this.options.position === 'bottom-left' ? '20px' : 'auto'
        div.style.backgroundColor = 'white'
        div.style.padding = '20px'
        div.style.borderRadius = '10px'
        div.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)'
        div.innerText = 'Nexa Chat (Optimized)'
        this.container.appendChild(div)
    }
}

export class NexaBrowser extends NexaClient {
    private cache: BrowserCache
    private worker: Worker | null = null

    constructor(config: NexaConfig) {
        super({
            ...config,
            // Fallback for browser environment
            baseURL: config.baseURL || (typeof window !== 'undefined' ? window.location.origin + '/api' : '')
        })

        this.cache = new BrowserCache()

        if (typeof Worker !== 'undefined') {
            try {
                // Determine worker URL - in a real app this depends on build setup
                this.worker = new Worker(new URL('./worker.js', import.meta.url))
                this.setupWorker()
            } catch (e) {
                console.warn('Web Workers not supported or script not found', e)
            }
        }
    }

    private setupWorker() {
        if (!this.worker) return
        this.worker.onerror = (e) => console.error('Worker error:', e)
    }

    async embedWithWorker(text: string, options: EmbeddingOptions = {}): Promise<EmbeddingResult> {
        if (!this.worker) {
            return await this.embeddings.create(text, options)
        }

        return new Promise((resolve, reject) => {
            const requestId = Math.random().toString(36).substring(7)

            const handler = (event: MessageEvent) => {
                if (event.data.id === requestId) {
                    this.worker!.removeEventListener('message', handler)

                    if (event.data.error) {
                        reject(new Error(event.data.error))
                    } else {
                        resolve(event.data.result)
                    }
                }
            }

            this.worker!.addEventListener('message', handler)
            this.worker!.postMessage({
                id: requestId,
                type: 'embed',
                text,
                options
            })
        })
    }

    async semanticSearch(query: string, documents: string[], options: SearchOptions = {}): Promise<SearchResult[]> {
        const cacheKey = `search:${query}:${documents.length}`
        const cached = await this.cache.get<SearchResult[]>(cacheKey)

        if (cached) {
            return cached
        }

        const queryEmbedding = await this.embeddings.create(query, {
            modelId: options.modelId,
            optimize: true
        })

        const documentEmbeddings = await this.embeddings.createBatch(documents, {
            modelId: options.modelId,
            parallel: true
        })

        const similarities = documentEmbeddings.embeddings.map((embedding: number[], index: number) => ({
            id: `doc_${index}`,
            score: this.cosineSimilarity(queryEmbedding.embeddings[0], embedding),
            document: documents[index],
            index
        }))

        const results: SearchResult[] = similarities
            .sort((a, b) => b.score - a.score)
            .slice(0, options.limit || 10)
            .filter(r => r.score >= (options.threshold || 0.5))
            .map(({ id, score, document }) => ({ id, score, document }))

        await this.cache.set(cacheKey, results, 300)

        return results
    }

    async createChatWidget(container: HTMLElement, options: WidgetOptions = {}): Promise<ChatWidget> {
        const widget = new ChatWidget(this, container, options)
        await widget.initialize()
        return widget
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
        const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
        const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
        return dotProduct / (magnitudeA * magnitudeB)
    }
}
