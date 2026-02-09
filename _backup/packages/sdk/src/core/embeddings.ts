import { AxiosInstance } from 'axios'
import { NexaConfig, EmbeddingOptions, EmbeddingResult, EmbeddingBatchOptions, EmbeddingBatchResult, SimilarityMetric, SearchOptions, SearchResult, CollectionOptions, Collection, Document, AddOptions, AddResult } from './types'

export class EmbeddingClient {
    constructor(private axios: AxiosInstance, private config: NexaConfig) { }

    async create(
        input: string | string[],
        options: EmbeddingOptions = {}
    ): Promise<EmbeddingResult> {
        const response = await this.axios.post('/embeddings', {
            text: input,
            modelId: options.modelId,
            dimensions: options.dimensions,
            optimize: options.optimize ?? true,
            cache: options.cache ?? true
        })

        return response.data
    }

    async createBatch(
        inputs: string[],
        options: EmbeddingBatchOptions = {}
    ): Promise<EmbeddingBatchResult> {
        const response = await this.axios.post('/embeddings/batch', {
            texts: inputs,
            modelId: options.modelId,
            parallel: options.parallel ?? true,
            batchSize: options.batchSize
        })

        return response.data
    }

    async similarity(
        embedding1: number[],
        embedding2: number[],
        metric: SimilarityMetric = 'cosine'
    ): Promise<number> {
        const response = await this.axios.post('/embeddings/similarity', {
            embedding1,
            embedding2,
            metric
        })

        return response.data.similarity
    }

    async search(
        query: string,
        collection: string,
        options: SearchOptions = {}
    ): Promise<SearchResult[]> {
        const response = await this.axios.post('/embeddings/search', {
            query,
            collection,
            limit: options.limit || 10,
            threshold: options.threshold || 0.7,
            filter: options.filter
        })

        return response.data.results
    }

    async createCollection(
        name: string,
        options: CollectionOptions = {}
    ): Promise<Collection> {
        const response = await this.axios.post('/collections', {
            name,
            modelId: options.modelId,
            metadata: options.metadata
        })

        return response.data
    }

    async addToCollection(
        collectionId: string,
        documents: Document[],
        options: AddOptions = {}
    ): Promise<AddResult> {
        const response = await this.axios.post(`/collections/${collectionId}/documents`, {
            documents,
            batchSize: options.batchSize || 100,
            generateEmbeddings: options.generateEmbeddings ?? true
        })

        return response.data
    }
}
