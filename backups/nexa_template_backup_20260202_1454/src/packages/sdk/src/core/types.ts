export interface NexaConfig {
    apiKey?: string;
    baseURL?: string;
    timeout?: number;
    maxRetries?: number;
    stream?: boolean;
}

export interface EmbeddingOptions {
    modelId?: string;
    dimensions?: number;
    optimize?: boolean;
    cache?: boolean;
}

export interface EmbeddingResult {
    embeddings: number[][];
    model: any;
    dimensions: number;
    quality: any;
    metadata: any;
}

export interface EmbeddingBatchOptions {
    modelId?: string;
    parallel?: boolean;
    batchSize?: number;
}
export interface EmbeddingBatchResult {
    embeddings: number[][];
    processingTime: number;
    batchCount: number;
}

export type SimilarityMetric = 'cosine' | 'euclidean' | 'dot';

export interface SearchOptions {
    limit?: number;
    threshold?: number;
    filter?: any;
    modelId?: string;
}
export interface SearchResult {
    id: string;
    score: number;
    document: any;
}

export interface CollectionOptions {
    modelId?: string;
    metadata?: any;
}
export interface Collection {
    id: string;
    name: string;
    metadata: any;
}

export interface Document {
    id?: string;
    content: string;
    metadata?: any;
}
export interface AddOptions {
    batchSize?: number;
    generateEmbeddings?: boolean;
}
export interface AddResult {
    added: number;
    model: any;
    dimensions: number;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
    metadata?: any;
}

export interface ChatChunk {
    type: 'content' | 'complete';
    content: string;
    metadata?: any;
}

export interface ToolResult {
    success: boolean;
    data: any;
    error?: string;
}

export interface HealthResponse {
    status: string;
    version: string;
}

export interface SessionOptions {
    userId?: string;
    metadata?: any;
}
export interface Session {
    id: string;
    userId: string;
    metadata: any;
}
export interface StreamOptions {
    sessionId?: string;
    modelId?: string;
}
export interface SendOptions {
    sessionId?: string;
    modelId?: string;
}
