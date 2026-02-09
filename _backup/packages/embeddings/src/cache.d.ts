import { OptimizedEmbeddings } from './types';
interface CacheOptions {
    ttl?: number;
    metadata?: any;
    persistent?: boolean;
}
export declare class MultiLevelCache {
    private l1;
    private l2;
    private l3;
    constructor();
    get(text: string | string[]): Promise<any | null>;
    set(text: string | string[], embedding: OptimizedEmbeddings, options?: CacheOptions): Promise<void>;
    prefetch(queries: string[], modelId: string): Promise<void>;
    private prefetchInBackground;
    private recordHit;
    private recordMiss;
    private predictLikelyTexts;
    getHitRate(): number;
    getSize(): number;
    getEfficiency(): number;
}
export {};
//# sourceMappingURL=cache.d.ts.map