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

export class TokenBucket implements RateLimitAlgorithm {
    name = 'token_bucket';
    async check(key: string, limits: any): Promise<RateLimitResult> {
        return { allowed: true, remaining: 10, reset: Date.now() + 60000, limit: 100, retryAfter: 0 };
    }
}

export class SlidingWindow implements RateLimitAlgorithm {
    name = 'sliding_window';
    async check(key: string, limits: any): Promise<RateLimitResult> {
        return { allowed: true, remaining: 10, reset: Date.now() + 60000, limit: 100, retryAfter: 0 };
    }
}

export class FixedWindow implements RateLimitAlgorithm {
    name = 'fixed_window';
    async check(key: string, limits: any): Promise<RateLimitResult> {
        return { allowed: true, remaining: 10, reset: Date.now() + 60000, limit: 100, retryAfter: 0 };
    }
}
