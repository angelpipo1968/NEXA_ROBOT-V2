"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdaptiveRateLimiter = void 0;
const ioredis_1 = require("ioredis");
const algorithms_1 = require("./algorithms");
class AdaptiveRateLimiter {
    constructor() {
        this.redis = new ioredis_1.Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            lazyConnect: true,
            retryStrategy: (times) => {
                if (times > 3) {
                    console.warn('[Security] Redis connection failed (RateLimiter), continuing without it.');
                    return null;
                }
                return Math.min(times * 100, 3000);
            }
        });
        this.redis.on('error', (err) => {
            // Suppress unhandled error events
            // console.warn('[Security] Redis error:', err.message);
        });
        this.algorithms = new Map([
            ['token_bucket', new algorithms_1.TokenBucket()],
            ['sliding_window', new algorithms_1.SlidingWindow()],
            ['fixed_window', new algorithms_1.FixedWindow()]
        ]);
    }
    async check(identifier, endpoint, options = {}) {
        const key = `rate_limit:${identifier}:${endpoint}`;
        // 1. Determinar algoritmo basado en comportamiento
        const algorithm = await this.selectAlgorithm(identifier, endpoint);
        // 2. Aplicar límites dinámicos
        const limits = await this.calculateDynamicLimits(identifier, endpoint);
        // 3. Verificar límite
        const result = await algorithm.check(key, limits);
        // 4. Aprender y ajustar
        await this.learnFromRequest(identifier, endpoint, result);
        return {
            allowed: result.allowed,
            remaining: result.remaining,
            reset: result.reset,
            limit: result.limit,
            retryAfter: result.retryAfter,
            algorithm: algorithm.name
        };
    }
    async selectAlgorithm(identifier, endpoint) {
        // Análisis de patrones de uso
        const pattern = await this.analyzePattern(identifier, endpoint);
        if (pattern.isBursty) {
            return this.algorithms.get('token_bucket');
        }
        else if (pattern.isConsistent) {
            return this.algorithms.get('sliding_window');
        }
        else {
            return this.algorithms.get('fixed_window');
        }
    }
    async calculateDynamicLimits(identifier, endpoint) {
        const baseLimits = {
            '/api/chat': { perMinute: 60, perHour: 1000 },
            '/api/tools': { perMinute: 30, perHour: 500 },
            '/api/admin': { perMinute: 10, perHour: 100 }
        };
        // Ajustar según riesgo
        const riskScore = await this.calculateRiskScore(identifier);
        const multiplier = this.getRiskMultiplier(riskScore);
        const base = baseLimits[endpoint] || baseLimits['/api/chat'];
        return {
            perMinute: Math.floor(base.perMinute * multiplier),
            perHour: Math.floor(base.perHour * multiplier),
            burst: Math.floor(5 * multiplier)
        };
    }
    // Helper methods to make the code compile based on the user logic provided
    async analyzePattern(identifier, endpoint) {
        // Placeholder logic
        return { isBursty: false, isConsistent: true };
    }
    async calculateRiskScore(identifier) {
        return 0.1;
    }
    getRiskMultiplier(score) {
        return 1.0;
    }
    async learnFromRequest(identifier, endpoint, result) {
        // Placeholder
    }
}
exports.AdaptiveRateLimiter = AdaptiveRateLimiter;
//# sourceMappingURL=rate-limiter.js.map