"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryManager = void 0;
const pg_1 = require("pg");
const ioredis_1 = require("ioredis");
const embedding_1 = require("./embedding");
class MemoryManager {
    constructor() {
        this.localCache = new Map();
        this.pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
        this.redis = new ioredis_1.Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            lazyConnect: true,
            retryStrategy: (times) => {
                if (times > 3) {
                    console.warn('[Memory] Redis connection failed, falling back to local cache.');
                    return null;
                }
                return Math.min(times * 100, 3000);
            }
        });
        this.redis.on('error', (err) => {
            // Suppress unhandled error events to prevent crash
            // console.warn('[Memory] Redis error:', err.message); 
        });
    }
    async retrieve(userId, query) {
        // 1. Cache rápido (últimos 5 mensajes)
        let cached = null;
        try {
            if (this.redis.status === 'ready') {
                cached = await this.redis.get(`chat:${userId}:recent`);
            }
            else {
                cached = this.localCache.get(`chat:${userId}:recent`) || null;
            }
        }
        catch (e) {
            console.warn('[Memory] Cache retrieval failed:', e);
        }
        if (cached)
            return JSON.parse(cached);
        // 2. Búsqueda vectorial (similitud semántica)
        const queryEmbedding = await (0, embedding_1.embed)(query);
        const similar = await this.vectorSearch(userId, queryEmbedding);
        // 3. Memoria a largo plazo (preferencias, estilo)
        const longTerm = await this.getLongTermMemory(userId);
        return {
            recent: cached ? JSON.parse(cached) : [],
            similar,
            longTerm,
            timestamp: new Date()
        };
    }
    async update(userId, data) {
        // 1. Almacenar en vector DB
        await this.storeVector(userId, data);
        // 2. Actualizar cache
        try {
            const json = JSON.stringify(data);
            if (this.redis.status === 'ready') {
                await this.redis.setex(`chat:${userId}:recent`, 300, // 5 minutos
                json);
            }
            // Always update local cache just in case
            this.localCache.set(`chat:${userId}:recent`, json);
        }
        catch (e) {
            console.warn('[Memory] Cache update failed:', e);
        }
        // 3. Actualizar preferencias (si es relevante)
        if (data.metadata?.preference) {
            await this.updatePreferences(userId, data.metadata.preference);
        }
    }
    async vectorSearch(userId, embedding) {
        // Mock for now until DB is set up with pgvector
        try {
            const result = await this.pool.query(`
        SELECT content, metadata, similarity
        FROM memory_vectors
        WHERE user_id = $1
        ORDER BY embedding <=> $2::vector
        LIMIT 5
        `, [userId, embedding]);
            return result.rows;
        }
        catch (e) {
            console.error("Vector search failed (likely table missing):", e);
            return [];
        }
    }
    async getLongTermMemory(userId) {
        return []; // Placeholder
    }
    async storeVector(userId, data) {
        // Placeholder
    }
    async updatePreferences(userId, preference) {
        // Placeholder
    }
}
exports.MemoryManager = MemoryManager;
//# sourceMappingURL=manager.js.map