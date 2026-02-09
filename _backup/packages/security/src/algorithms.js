"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixedWindow = exports.SlidingWindow = exports.TokenBucket = void 0;
class TokenBucket {
    constructor() {
        this.name = 'token_bucket';
    }
    async check(key, limits) {
        return { allowed: true, remaining: 10, reset: Date.now() + 60000, limit: 100, retryAfter: 0 };
    }
}
exports.TokenBucket = TokenBucket;
class SlidingWindow {
    constructor() {
        this.name = 'sliding_window';
    }
    async check(key, limits) {
        return { allowed: true, remaining: 10, reset: Date.now() + 60000, limit: 100, retryAfter: 0 };
    }
}
exports.SlidingWindow = SlidingWindow;
class FixedWindow {
    constructor() {
        this.name = 'fixed_window';
    }
    async check(key, limits) {
        return { allowed: true, remaining: 10, reset: Date.now() + 60000, limit: 100, retryAfter: 0 };
    }
}
exports.FixedWindow = FixedWindow;
//# sourceMappingURL=algorithms.js.map