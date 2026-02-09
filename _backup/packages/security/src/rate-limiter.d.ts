import { RateLimitResult } from './algorithms';
export interface RateLimitOptions {
}
export interface DynamicLimits {
    perMinute: number;
    perHour: number;
    burst: number;
}
export declare class AdaptiveRateLimiter {
    private redis;
    private algorithms;
    constructor();
    check(identifier: string, endpoint: string, options?: RateLimitOptions): Promise<RateLimitResult>;
    private selectAlgorithm;
    private calculateDynamicLimits;
    private analyzePattern;
    private calculateRiskScore;
    private getRiskMultiplier;
    private learnFromRequest;
}
//# sourceMappingURL=rate-limiter.d.ts.map