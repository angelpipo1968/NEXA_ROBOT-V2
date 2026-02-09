export enum CacheType {
    WEATHER = 'weather',
    CURRENCY = 'currency',
    NEWS = 'news',
    STOCK = 'stock',
    SEARCH = 'search'
}

interface CacheEntry {
    query: string;
    result: string;
    timestamp: number;
    type: CacheType;
}

interface CacheConfig {
    ttl: number; // milliseconds
    maxSize: number;
}

class SearchCacheService {
    private cache: Map<string, CacheEntry>;
    private readonly MAX_SIZE: number = 100; // Increased for multiple tool types

    // Tool-specific TTL configurations
    private readonly TTL_CONFIG: Record<CacheType, number> = {
        [CacheType.WEATHER]: 10 * 60 * 1000,    // 10 minutes - slow changes
        [CacheType.CURRENCY]: 1 * 60 * 1000,    // 1 minute - moderate volatility
        [CacheType.NEWS]: 5 * 60 * 1000,        // 5 minutes - frequent updates
        [CacheType.STOCK]: 30 * 1000,           // 30 seconds - high volatility
        [CacheType.SEARCH]: 5 * 60 * 1000       // 5 minutes - general web search
    };

    private hits: number = 0;
    private misses: number = 0;

    constructor() {
        this.cache = new Map();
        console.log('[SEARCH CACHE] Initialized with tool-specific TTLs');
    }

    /**
     * Normalize query for cache key (lowercase, trim, remove extra spaces)
     */
    private normalize(query: string): string {
        return query.toLowerCase().trim().replace(/\s+/g, ' ');
    }

    /**
     * Get cache key with type prefix
     */
    private getCacheKey(query: string, type: CacheType): string {
        return `${type}:${this.normalize(query)}`;
    }

    /**
     * Get cached result if fresh (not expired)
     */
    get(query: string, type: CacheType = CacheType.SEARCH): string | null {
        const key = this.getCacheKey(query, type);
        const entry = this.cache.get(key);

        if (!entry) {
            console.log(`[CACHE] MISS [${type}]:`, query);
            this.misses++;
            return null;
        }

        const ttl = this.TTL_CONFIG[type];
        const age = Date.now() - entry.timestamp;

        if (age > ttl) {
            console.log(`[CACHE] EXPIRED [${type}]:`, query, `(age: ${(age / 1000).toFixed(1)}s, ttl: ${(ttl / 1000).toFixed(1)}s)`);
            this.cache.delete(key);
            this.misses++;
            return null;
        }

        console.log(`[CACHE] HIT [${type}]:`, query, `(age: ${(age / 1000).toFixed(1)}s)`);
        this.hits++;
        return entry.result;
    }

    /**
     * Store result in cache with type
     */
    set(query: string, result: string, type: CacheType = CacheType.SEARCH): void {
        const key = this.getCacheKey(query, type);

        // Enforce max size (LRU-like behavior)
        if (this.cache.size >= this.MAX_SIZE) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
                console.log('[CACHE] Evicted oldest entry (LRU)');
            }
        }

        this.cache.set(key, {
            query: this.normalize(query),
            result,
            timestamp: Date.now(),
            type
        });

        console.log(`[CACHE] STORED [${type}]:`, query, `(size: ${this.cache.size}/${this.MAX_SIZE})`);
    }

    /**
     * Clear cache for specific type or all
     */
    clear(type?: CacheType): void {
        if (type) {
            let count = 0;
            for (const [key, entry] of this.cache.entries()) {
                if (entry.type === type) {
                    this.cache.delete(key);
                    count++;
                }
            }
            console.log(`[CACHE] CLEARED [${type}]:`, count, 'entries');
        } else {
            const size = this.cache.size;
            this.cache.clear();
            console.log('[CACHE] CLEARED ALL:', size, 'entries');
        }
        this.hits = 0;
        this.misses = 0;
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const hitRate = this.hits + this.misses > 0
            ? ((this.hits / (this.hits + this.misses)) * 100).toFixed(1)
            : '0.0';

        return {
            size: this.cache.size,
            maxSize: this.MAX_SIZE,
            hits: this.hits,
            misses: this.misses,
            hitRate: `${hitRate}%`,
            ttlConfig: this.TTL_CONFIG
        };
    }

    /**
     * Get entries by type
     */
    getEntriesByType(type: CacheType): Array<{ query: string; age: number }> {
        const entries: Array<{ query: string; age: number }> = [];
        const now = Date.now();

        for (const [, entry] of this.cache.entries()) {
            if (entry.type === type) {
                entries.push({
                    query: entry.query,
                    age: Math.floor((now - entry.timestamp) / 1000)
                });
            }
        }

        return entries;
    }
}

// Export singleton instance
export const searchCache = new SearchCacheService();
