import { NexaClient, NexaConfig } from '../core';
import { FileProcessor, BatchProcessor } from './processors-stub';
import { CLI } from './cli';
interface ProcessOptions {
    extensions?: string[];
    recursive?: boolean;
    modelId?: string;
    concurrency?: number;
    batchSize?: number;
}
interface ProcessResult {
    processed: number;
    failed: number;
    totalTime: number;
    results: any[];
}
interface RAGOptions {
    collectionName?: string;
    batchSize?: number;
}
interface RAGIndex {
    collectionId: string;
    documentCount: number;
    embeddingModel: any;
    dimensions: number;
}
export declare class NexaNode extends NexaClient {
    files: FileProcessor;
    batch: BatchProcessor;
    cli: CLI;
    constructor(config: NexaConfig);
    processDirectory(path: string, options?: ProcessOptions): Promise<ProcessResult>;
    createRAGIndex(documents: any[], options?: RAGOptions): Promise<RAGIndex>;
}
export {};
//# sourceMappingURL=index.d.ts.map