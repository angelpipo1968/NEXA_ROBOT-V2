export type ChunkingStrategy = 'semantic' | 'hybrid' | 'recursive' | 'sliding' | 'fixed';
export interface OptimizationConfig {
    modelId?: string;
    chunking?: ChunkingStrategy;
    dimensions?: number | 'auto';
    cache?: boolean;
    qualityThreshold?: number;
    budget?: number;
    maxLatency?: number;
    enableQuantization?: boolean;
}
export interface EmbeddingModel {
    id: string;
    type: 'local' | 'openai' | 'other';
    dimensions: number;
    maxTokens: number;
    languages: string[];
    quality: number;
    speed: number;
    specialties?: string[];
}
export interface OptimizedEmbeddings {
    embeddings: number[][];
    model: string;
    dimensions: number;
    quality: QualityMetrics;
    chunks: number;
    metadata: {
        processingTime: number;
        compressionRate: number;
    };
}
export interface QualityMetrics {
    variance: number;
    preservation: number;
}
export interface ChunkingOptions {
    strategy?: ChunkingStrategy;
    model?: EmbeddingModel;
    minSize?: number;
    maxSize?: number;
}
export interface TextChunk {
    id: string;
    text: string;
    metadata: {
        sentenceCount: number;
        avgSimilarity: number;
    };
}
//# sourceMappingURL=types.d.ts.map