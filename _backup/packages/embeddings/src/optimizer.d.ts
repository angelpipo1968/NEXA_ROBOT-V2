import { OptimizationConfig, OptimizedEmbeddings } from './types';
export declare class EmbeddingOptimizer {
    private models;
    private reducer;
    private quality;
    private cache;
    private selector;
    constructor();
    private initializeModels;
    private registerModel;
    optimize(text: string | string[], config?: OptimizationConfig): Promise<OptimizedEmbeddings>;
    private selectOptimalModel;
    private chunkText;
    private hybridChunking;
    private recursiveChunking;
    private slidingWindowChunking;
    private fixedSizeChunking;
    private semanticChunking;
    private generateEmbeddings;
    getModelStats(): {
        loaded: number;
    };
    getPerformanceMetrics(): {
        avgLatency: number;
    };
    private postProcess;
    private analyzeText;
    private splitIntoSentences;
    private calculateSimilarities;
    private groupBySimilarity;
    private calculateAverageSimilarity;
    private calculateOptimalBatchSize;
    private embedChunk;
    private throttleIfNeeded;
    private normalize;
    private applyPCA;
    private quantize;
    private calculateCompression;
}
//# sourceMappingURL=optimizer.d.ts.map