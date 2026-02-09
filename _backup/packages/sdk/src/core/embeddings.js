"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingClient = void 0;
class EmbeddingClient {
    constructor(axios, config) {
        this.axios = axios;
        this.config = config;
    }
    async create(input, options = {}) {
        const response = await this.axios.post('/embeddings', {
            text: input,
            modelId: options.modelId,
            dimensions: options.dimensions,
            optimize: options.optimize ?? true,
            cache: options.cache ?? true
        });
        return response.data;
    }
    async createBatch(inputs, options = {}) {
        const response = await this.axios.post('/embeddings/batch', {
            texts: inputs,
            modelId: options.modelId,
            parallel: options.parallel ?? true,
            batchSize: options.batchSize
        });
        return response.data;
    }
    async similarity(embedding1, embedding2, metric = 'cosine') {
        const response = await this.axios.post('/embeddings/similarity', {
            embedding1,
            embedding2,
            metric
        });
        return response.data.similarity;
    }
    async search(query, collection, options = {}) {
        const response = await this.axios.post('/embeddings/search', {
            query,
            collection,
            limit: options.limit || 10,
            threshold: options.threshold || 0.7,
            filter: options.filter
        });
        return response.data.results;
    }
    async createCollection(name, options = {}) {
        const response = await this.axios.post('/collections', {
            name,
            modelId: options.modelId,
            metadata: options.metadata
        });
        return response.data;
    }
    async addToCollection(collectionId, documents, options = {}) {
        const response = await this.axios.post(`/collections/${collectionId}/documents`, {
            documents,
            batchSize: options.batchSize || 100,
            generateEmbeddings: options.generateEmbeddings ?? true
        });
        return response.data;
    }
}
exports.EmbeddingClient = EmbeddingClient;
//# sourceMappingURL=embeddings.js.map