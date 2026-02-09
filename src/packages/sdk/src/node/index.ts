import { NexaClient, NexaConfig } from '../core'
import { FileProcessor, BatchProcessor } from './processors-stub'
import { CLI } from './cli'

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

const startTime = Date.now();

export class NexaNode extends NexaClient {
    public files: FileProcessor
    public batch: BatchProcessor
    public cli: CLI

    constructor(config: NexaConfig) {
        super(config)

        this.files = new FileProcessor(this.axios) // axios accessible via protected
        this.batch = new BatchProcessor(this.axios)
        this.cli = new CLI(this)
    }

    async processDirectory(
        path: string,
        options: ProcessOptions = {}
    ): Promise<ProcessResult> {
        const files = await this.files.scanDirectory(path, {
            extensions: options.extensions || ['.txt', '.md', '.pdf', '.docx'],
            recursive: options.recursive ?? true
        })

        const results = await this.batch.process(
            files,
            async (file: string) => {
                const content = await this.files.read(file)
                const embeddings = await this.embeddings.create(content, {
                    modelId: options.modelId
                })

                return {
                    file,
                    embeddings,
                    metadata: {
                        size: content.length,
                        processedAt: new Date()
                    }
                }
            },
            {
                concurrency: options.concurrency || 5,
                batchSize: options.batchSize || 10
            }
        )

        return {
            processed: results.successful.length,
            failed: results.failed.length,
            totalTime: Date.now() - startTime,
            results: results.successful
        }
    }

    async createRAGIndex(
        documents: any[],
        options: RAGOptions = {}
    ): Promise<RAGIndex> {
        const collection = await this.embeddings.createCollection(
            options.collectionName || `index_${Date.now()}`
        )

        const result = await this.embeddings.addToCollection(
            collection.id,
            documents,
            {
                batchSize: options.batchSize,
                generateEmbeddings: true
            }
        )

        return {
            collectionId: collection.id,
            documentCount: result.added,
            embeddingModel: result.model,
            dimensions: result.dimensions
        }
    }
}
