export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    reset: number;
    limit: number;
    retryAfter: number;
    algorithm?: string;
}
export interface RateLimitAlgorithm {
    name: string;
    check(key: string, limits: any): Promise<RateLimitResult>;
}
export declare class TokenBucket implements RateLimitAlgorithm {
    name: string;
    check(key: string, limits: any): Promise<RateLimitResult>;
}
export declare class SlidingWindow implements RateLimitAlgorithm {
    name: string;
    check(key: string, limits: any): Promise<RateLimitResult>;
}
export declare class FixedWindow implements RateLimitAlgorithm {
    name: string;
    check(key: string, limits: any): Promise<RateLimitResult>;
}
//# sourceMappingURL=algorithms.d.ts.map