import { Pool } from 'pg'
import { Redis } from 'ioredis'
import { embed } from './embedding'

export interface MemoryContext {
    recent: any[];
    similar: any[];
    longTerm: any[];
    timestamp: Date;
}

export interface MemoryUpdate {
    query: string;
    response: string;
    metadata?: any;
}

export class MemoryManager {
    private pool: Pool
    private redis: Redis
    private localCache: Map<string, string> = new Map()

    constructor() {
        this.pool = new Pool({ connectionString: process.env.DATABASE_URL })
        this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
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

    async retrieve(userId: string, query: string): Promise<MemoryContext> {
        // 1. Cache rápido (últimos mensajes)
        let recentMessages: any[] = [];
        try {
            let cached = null;
            if (this.redis.status === 'ready') {
                cached = await this.redis.get(`chat:${userId}:recent`)
            } else {
                cached = this.localCache.get(`chat:${userId}:recent`) || null
            }
            if (cached) {
                const parsed = JSON.parse(cached);
                // Handle both array format and single message format
                recentMessages = Array.isArray(parsed) ? parsed : [parsed];
            }
        } catch (e) {
            console.warn('[Memory] Cache retrieval failed:', e);
        }

        // 2. Búsqueda vectorial (similitud semántica)
        let similar: any[] = [];
        try {
            const queryEmbedding = await embed(query)
            similar = await this.vectorSearch(userId, queryEmbedding)
        } catch (e) {
            // Vector search failed, continue with empty similar
        }

        // 3. Memoria a largo plazo (preferencias, estilo)
        const longTerm = await this.getLongTermMemory(userId)

        return {
            recent: recentMessages,
            similar,
            longTerm,
            timestamp: new Date()
        }
    }

    async update(userId: string, data: MemoryUpdate): Promise<void> {
        // 1. Almacenar en vector DB
        await this.storeVector(userId, data)

        // 2. Actualizar cache
        try {
            const json = JSON.stringify(data);
            if (this.redis.status === 'ready') {
                await this.redis.setex(
                    `chat:${userId}:recent`,
                    300, // 5 minutos
                    json
                )
            }
            // Always update local cache just in case
            this.localCache.set(`chat:${userId}:recent`, json);
        } catch (e) {
            console.warn('[Memory] Cache update failed:', e);
        }

        // 3. Actualizar preferencias (si es relevante)
        if (data.metadata?.preference) {
            await this.updatePreferences(userId, data.metadata.preference)
        }
    }

    private async vectorSearch(userId: string, embedding: number[]) {
        // Mock for now until DB is set up with pgvector
        try {
            const result = await this.pool.query(`
        SELECT content, metadata, similarity
        FROM memory_vectors
        WHERE user_id = $1
        ORDER BY embedding <=> $2::vector
        LIMIT 5
        `, [userId, embedding])

            return result.rows
        } catch (e) {
            console.error("Vector search failed (likely table missing):", e);
            return [];
        }
    }

    private async getLongTermMemory(userId: string) {
        return []; // Placeholder
    }

    private async storeVector(userId: string, data: MemoryUpdate) {
        // Placeholder
    }

    private async updatePreferences(userId: string, preference: any) {
        // Placeholder
    }
}
