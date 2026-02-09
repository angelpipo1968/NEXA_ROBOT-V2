"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserCache = void 0;
class BrowserCache {
    constructor(useLocalStorage = true) {
        this.storage = useLocalStorage ? localStorage : sessionStorage;
    }
    async get(key) {
        const item = this.storage.getItem(key);
        if (!item)
            return null;
        try {
            const parsed = JSON.parse(item);
            if (parsed.expiry && parsed.expiry < Date.now()) {
                this.storage.removeItem(key);
                return null;
            }
            return parsed.value;
        }
        catch (e) {
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        const item = { value };
        if (ttlSeconds) {
            item.expiry = Date.now() + ttlSeconds * 1000;
        }
        this.storage.setItem(key, JSON.stringify(item));
    }
    async clear() {
        this.storage.clear();
    }
}
exports.BrowserCache = BrowserCache;
//# sourceMappingURL=cache.js.map