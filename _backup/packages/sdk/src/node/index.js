"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NexaNode = void 0;
const core_1 = require("../core");
const processors_stub_1 = require("./processors-stub");
const cli_1 = require("./cli");
const startTime = Date.now();
class NexaNode extends core_1.NexaClient {
    constructor(config) {
        super(config);
        this.files = new processors_stub_1.FileProcessor(this.axios); // axios accessible via protected
        this.batch = new processors_stub_1.BatchProcessor(this.axios);
        this.cli = new cli_1.CLI(this);
    }
    async processDirectory(path, options = {}) {
        const files = await this.files.scanDirectory(path, {
            extensions: options.extensions || ['.txt', '.md', '.pdf', '.docx'],
            recursive: options.recursive ?? true
        });
        const results = await this.batch.process(files, async (file) => {
            const content = await this.files.read(file);
            const embeddings = await this.embeddings.create(content, {
                modelId: options.modelId
            });
            return {
                file,
                embeddings,
                metadata: {
                    size: content.length,
                    processedAt: new Date()
                }
            };
        }, {
            concurrency: options.concurrency || 5,
            batchSize: options.batchSize || 10
        });
        return {
            processed: results.successful.length,
            failed: results.failed.length,
            totalTime: Date.now() - startTime,
            results: results.successful
        };
    }
    async createRAGIndex(documents, options = {}) {
        const collection = await this.embeddings.createCollection(options.collectionName || `index_${Date.now()}`);
        const result = await this.embeddings.addToCollection(collection.id, documents, {
            batchSize: options.batchSize,
            generateEmbeddings: true
        });
        return {
            collectionId: collection.id,
            documentCount: result.added,
            embeddingModel: result.model,
            dimensions: result.dimensions
        };
    }
}
exports.NexaNode = NexaNode;
//# sourceMappingURL=index.js.map