import { AxiosInstance } from 'axios';
import { NexaConfig, EmbeddingOptions, EmbeddingResult, EmbeddingBatchOptions, EmbeddingBatchResult, SimilarityMetric, SearchOptions, SearchResult, CollectionOptions, Collection, Document, AddOptions, AddResult } from './types';
export declare class EmbeddingClient {
    private axios;
    private config;
    constructor(axios: AxiosInstance, config: NexaConfig);
    create(input: string | string[], options?: EmbeddingOptions): Promise<EmbeddingResult>;
    createBatch(inputs: string[], options?: EmbeddingBatchOptions): Promise<EmbeddingBatchResult>;
    similarity(embedding1: number[], embedding2: number[], metric?: SimilarityMetric): Promise<number>;
    search(query: string, collection: string, options?: SearchOptions): Promise<SearchResult[]>;
    createCollection(name: string, options?: CollectionOptions): Promise<Collection>;
    addToCollection(collectionId: string, documents: Document[], options?: AddOptions): Promise<AddResult>;
}
//# sourceMappingURL=embeddings.d.ts.map