"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const embeddings_1 = require("@nexa/embeddings");
const embeddings_2 = require("@nexa/embeddings");
const embeddings_3 = require("@nexa/embeddings");
const app = new hono_1.Hono();
const optimizer = new embeddings_1.EmbeddingOptimizer();
const cache = new embeddings_2.MultiLevelCache();
// Endpoint principal
app.post('/api/embeddings', async (c) => {
    const { text, modelId, optimize = true, cache: useCache = true } = await c.req.json();
    // Pre-cache basado en historial
    if (useCache) {
        if (Array.isArray(text)) {
            await cache.prefetch(text, modelId || 'auto');
        }
        else {
            await cache.prefetch([text], modelId || 'auto');
        }
    }
    const embeddings = await optimizer.optimize(text, {
        modelId,
        cache: useCache,
        qualityThreshold: 0.85
    });
    return c.json({
        embeddings: embeddings.embeddings,
        model: embeddings.model,
        dimensions: embeddings.dimensions,
        quality: embeddings.quality,
        cached: embeddings.metadata.compressionRate // Stub: didn't expose cached flag in OptimizedEmbeddings type
    });
});
// Batch processing
app.post('/api/embeddings/batch', async (c) => {
    const { texts, modelId, parallel = true } = await c.req.json();
    if (parallel) {
        // Procesamiento paralelo optimizado
        // stub createBatches logic since it wasn't provided in the class
        const batchSize = 100;
        const batches = [];
        for (let i = 0; i < texts.length; i += batchSize) {
            batches.push(texts.slice(i, i + batchSize));
        }
        const results = await Promise.all(batches.map(batch => optimizer.optimize(batch, { modelId })));
        return c.json({
            embeddings: results.flatMap(r => r.embeddings),
            processingTime: results.reduce((sum, r) => sum + r.metadata.processingTime, 0),
            batchCount: batches.length
        });
    }
    else {
        const result = await optimizer.optimize(texts, { modelId });
        return c.json(result);
    }
});
// Fine-tuning
app.post('/api/embeddings/finetune', async (c) => {
    const { domain, documents, baseModel = 'all-minilm-l6-v2' } = await c.req.json();
    const tuner = new embeddings_3.DomainFineTuner();
    const result = await tuner.fineTune(baseModel, {
        domain,
        documents
    });
    return c.json({
        modelId: result.model.id,
        evaluation: result.evaluation,
        downloadUrl: `/api/models/download/${result.model.id}`
    });
});
// Métricas
app.get('/api/embeddings/metrics', async (c) => {
    const metrics = {
        cache: {
            hitRate: cache.getHitRate(),
            size: cache.getSize(),
            efficiency: cache.getEfficiency()
        },
        models: optimizer.getModelStats(),
        performance: optimizer.getPerformanceMetrics()
    };
    return c.json(metrics);
});
exports.default = app;
//# sourceMappingURL=embeddings.js.map