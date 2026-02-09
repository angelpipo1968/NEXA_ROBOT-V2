"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingOptimizer = void 0;
const dimensionality_1 = require("./dimensionality");
const quality_1 = require("./quality");
const cache_1 = require("./cache");
const selector_1 = require("./selector");
const startTime = Date.now(); // Stub for timing
class EmbeddingOptimizer {
    constructor() {
        this.models = new Map();
        this.reducer = new dimensionality_1.DimensionalityReducer();
        this.quality = new quality_1.QualityOptimizer();
        this.cache = new cache_1.MultiLevelCache();
        this.selector = new selector_1.ModelSelector();
        this.initializeModels();
    }
    initializeModels() {
        // Modelos locales (optimizados)
        this.registerModel({
            id: 'all-minilm-l6-v2',
            type: 'local',
            dimensions: 384,
            maxTokens: 512,
            languages: ['en'],
            quality: 0.85,
            speed: 0.95
        });
        this.registerModel({
            id: 'gte-small',
            type: 'local',
            dimensions: 384,
            maxTokens: 512,
            languages: ['multi'],
            quality: 0.88,
            speed: 0.90
        });
        // Modelos cloud (alta calidad)
        this.registerModel({
            id: 'text-embedding-3-small',
            type: 'openai',
            dimensions: 1536,
            maxTokens: 8191,
            languages: ['multi'],
            quality: 0.95,
            speed: 0.80
        });
        this.registerModel({
            id: 'text-embedding-3-large',
            type: 'openai',
            dimensions: 3072,
            maxTokens: 8191,
            languages: ['multi'],
            quality: 0.98,
            speed: 0.70
        });
        // Modelos especializados
        this.registerModel({
            id: 'bge-m3',
            type: 'local',
            dimensions: 1024,
            maxTokens: 8192,
            languages: ['multi'],
            quality: 0.92,
            speed: 0.75,
            specialties: ['retrieval', 'reranking']
        });
    }
    registerModel(model) {
        this.models.set(model.id, model);
    }
    async optimize(text, config = {}) {
        const { modelId = 'auto', chunking = 'semantic', dimensions = 'auto', cache = true, qualityThreshold = 0.8 } = config;
        const startTime = Date.now(); // Start time for this request
        // 1. Seleccionar modelo óptimo
        const selectedModel = await this.selectOptimalModel(text, config);
        // 2. Chunking inteligente
        const chunks = await this.chunkText(text, {
            strategy: chunking,
            model: selectedModel
        });
        // 3. Verificar cache
        if (cache) {
            const cacheKey = chunks.map(c => c.text);
            const cached = await this.cache.get(cacheKey);
            if (cached)
                return cached;
        }
        // 4. Generar embeddings
        const embeddings = await this.generateEmbeddings(chunks, selectedModel);
        // 5. Optimizar dimensionalidad
        // Convert 'auto' dimensions to undefined if needed or handle logic in reducer
        // For typescript safety casting 'auto' to undefined if specific type expected, or handling in reducer.
        // Assuming reducer handles 'auto'
        const optimized = await this.reducer.optimize(embeddings, {
            targetDimensions: dimensions,
            preserveQuality: qualityThreshold
        });
        // 6. Evaluar calidad
        const quality = await this.quality.evaluate(optimized, chunks);
        // 7. Aplicar post-procesamiento
        const final = this.postProcess(optimized, quality, config);
        // 8. Construir resultado
        const result = {
            embeddings: final,
            model: selectedModel.id,
            dimensions: final[0].length,
            quality,
            chunks: chunks.length,
            metadata: {
                processingTime: Date.now() - startTime,
                compressionRate: this.calculateCompression(embeddings, final)
            }
        };
        // 9. Cachear resultados
        if (cache) {
            const cacheKey = chunks.map(c => c.text);
            await this.cache.set(cacheKey, result);
        }
        return result;
    }
    async selectOptimalModel(text, config) {
        // Análisis del texto
        const analysis = await this.analyzeText(text);
        // Factores de selección
        const factors = {
            length: analysis.totalTokens,
            language: analysis.primaryLanguage,
            domain: analysis.domain,
            requiredQuality: config.qualityThreshold || 0.8,
            budget: config.budget,
            latency: config.maxLatency
        };
        // Selección basada en ML
        return await this.selector.select(factors);
    }
    async chunkText(text, options) {
        const strategy = options.strategy || 'semantic';
        switch (strategy) {
            case 'semantic':
                return await this.semanticChunking(text, options);
            case 'hybrid':
                return await this.hybridChunking(text, options);
            case 'recursive':
                return await this.recursiveChunking(text, options);
            case 'sliding':
                return await this.slidingWindowChunking(text, options);
            default:
                return await this.fixedSizeChunking(text, options);
        }
    }
    // Chunking stubs
    async hybridChunking(text, options) { return []; }
    async recursiveChunking(text, options) { return []; }
    async slidingWindowChunking(text, options) { return []; }
    async fixedSizeChunking(text, options) { return []; }
    async semanticChunking(text, options) {
        // Chunking basado en significado usando sentence transformers
        const sentences = await this.splitIntoSentences(text);
        // Calcular similitud semántica entre oraciones
        const similarities = await this.calculateSimilarities(sentences);
        // Agrupar oraciones semánticamente similares
        const chunks = this.groupBySimilarity(sentences, similarities, {
            minChunkSize: options.minSize || 50,
            maxChunkSize: options.maxSize || 500,
            similarityThreshold: 0.7
        });
        return chunks.map((chunk, index) => ({
            id: `chunk_${index}`,
            text: chunk.join(' '),
            metadata: {
                sentenceCount: chunk.length,
                avgSimilarity: this.calculateAverageSimilarity(chunk, similarities)
            }
        }));
    }
    async generateEmbeddings(chunks, model) {
        // Batch processing optimizado
        const batchSize = this.calculateOptimalBatchSize(model);
        const embeddings = [];
        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            // Generar embeddings en paralelo
            const batchEmbeddings = await Promise.all(batch.map(chunk => this.embedChunk(chunk, model)));
            embeddings.push(...batchEmbeddings);
            // Throttling inteligente
            await this.throttleIfNeeded(model, batch.length);
        }
        return embeddings;
    }
    // Metrics Methods
    getModelStats() { return { loaded: this.models.size }; }
    getPerformanceMetrics() { return { avgLatency: 50 }; }
    postProcess(embeddings, quality, config // Passed config here
    ) {
        let processed = embeddings;
        // 1. Normalización
        if (quality.variance > 1.0) {
            processed = this.normalize(processed);
        }
        // 2. PCA opcional para reducir dimensionalidad
        if (processed[0].length > 768 && quality.preservation > 0.9) {
            processed = this.applyPCA(processed, 768);
        }
        // 3. Quantization para eficiencia
        if (config.enableQuantization) {
            processed = this.quantize(processed, 8); // 8-bit quantization
        }
        return processed;
    }
    // Helpers Stubs
    async analyzeText(text) { return { totalTokens: 100, primaryLanguage: 'en', domain: 'general' }; }
    async splitIntoSentences(text) { return ["Sentence 1", "Sentence 2"]; } // Stub
    async calculateSimilarities(sentences) { return [0.9]; } // Stub
    groupBySimilarity(sentences, similarities, options) { return [sentences]; } // Stub
    calculateAverageSimilarity(chunk, similarities) { return 0.9; } // Stub
    calculateOptimalBatchSize(model) { return 10; } // Stub
    async embedChunk(chunk, model) { return Array(model.dimensions).fill(0.1); } // Stub
    async throttleIfNeeded(model, batchSize) { } // Stub
    normalize(embeddings) { return embeddings; } // Stub
    applyPCA(embeddings, dim) { return embeddings; } // Stub
    quantize(embeddings, bit) { return embeddings; } // Stub
    calculateCompression(initial, final) { return 1.0; } // Stub
}
exports.EmbeddingOptimizer = EmbeddingOptimizer;
//# sourceMappingURL=optimizer.js.map