// @ts-ignore
import IORedis from 'ioredis';
const Redis = IORedis as any;
import { TokenBucket, SlidingWindow, FixedWindow, RateLimitAlgorithm, RateLimitResult } from './algorithms'

export interface RateLimitOptions {
    // Add specific options if needed
}

export interface DynamicLimits {
    perMinute: number;
    perHour: number;
    burst: number;
}

export class AdaptiveRateLimiter {
    private redis: any
    private algorithms: Map<string, RateLimitAlgorithm>

    constructor() {
        this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            lazyConnect: true,
            retryStrategy: (times: number) => {
                if (times > 3) {
                    console.warn('[Security] Redis connection failed (RateLimiter), continuing without it.');
                    return null;
                }
                return Math.min(times * 100, 3000);
            }
        });

        this.redis.on('error', (err: any) => {
            // Suppress unhandled error events
            // console.warn('[Security] Redis error:', err.message);
        });

        this.algorithms = new Map([
            ['token_bucket', new TokenBucket()],
            ['sliding_window', new SlidingWindow()],
            ['fixed_window', new FixedWindow()]
        ])
    }

    async check(
        identifier: string,
        endpoint: string,
        options: RateLimitOptions = {}
    ): Promise<RateLimitResult> {
        const key = `rate_limit:${identifier}:${endpoint}`

        // 1. Determinar algoritmo basado en comportamiento
        const algorithm = await this.selectAlgorithm(identifier, endpoint)

        // 2. Aplicar límites dinámicos
        const limits = await this.calculateDynamicLimits(identifier, endpoint)

        // 3. Verificar límite
        const result = await algorithm.check(key, limits)

        // 4. Aprender y ajustar
        await this.learnFromRequest(identifier, endpoint, result)

        return {
            allowed: result.allowed,
            remaining: result.remaining,
            reset: result.reset,
            limit: result.limit,
            retryAfter: result.retryAfter,
            algorithm: algorithm.name
        }
    }

    private async selectAlgorithm(
        identifier: string,
        endpoint: string
    ): Promise<RateLimitAlgorithm> {
        // Análisis de patrones de uso
        const pattern = await this.analyzePattern(identifier, endpoint)

        if (pattern.isBursty) {
            return this.algorithms.get('token_bucket')!
        } else if (pattern.isConsistent) {
            return this.algorithms.get('sliding_window')!
        } else {
            return this.algorithms.get('fixed_window')!
        }
    }

    private async calculateDynamicLimits(
        identifier: string,
        endpoint: string
    ): Promise<DynamicLimits> {
        const baseLimits: Record<string, { perMinute: number; perHour: number }> = {
            '/api/chat': { perMinute: 60, perHour: 1000 },
            '/api/tools': { perMinute: 30, perHour: 500 },
            '/api/admin': { perMinute: 10, perHour: 100 }
        }

        // Ajustar según riesgo
        const riskScore = await this.calculateRiskScore(identifier)
        const multiplier = this.getRiskMultiplier(riskScore)

        const base = baseLimits[endpoint] || baseLimits['/api/chat']

        return {
            perMinute: Math.floor(base.perMinute * multiplier),
            perHour: Math.floor(base.perHour * multiplier),
            burst: Math.floor(5 * multiplier)
        }
    }

    // Helper methods to make the code compile based on the user logic provided
    private async analyzePattern(identifier: string, endpoint: string) {
        // Placeholder logic
        return { isBursty: false, isConsistent: true };
    }

    private async calculateRiskScore(identifier: string) {
        return 0.1;
    }

    private getRiskMultiplier(score: number) {
        return 1.0;
    }

    private async learnFromRequest(identifier: string, endpoint: string, result: RateLimitResult) {
        // Placeholder
    }
}
