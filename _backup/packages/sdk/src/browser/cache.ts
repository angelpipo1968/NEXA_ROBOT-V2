export class BrowserCache {
    private storage: Storage

    constructor(useLocalStorage = true) {
        this.storage = useLocalStorage ? localStorage : sessionStorage
    }

    async get<T>(key: string): Promise<T | null> {
        const item = this.storage.getItem(key)
        if (!item) return null

        try {
            const parsed = JSON.parse(item)
            if (parsed.expiry && parsed.expiry < Date.now()) {
                this.storage.removeItem(key)
                return null
            }
            return parsed.value
        } catch (e) {
            return null
        }
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const item: any = { value }
        if (ttlSeconds) {
            item.expiry = Date.now() + ttlSeconds * 1000
        }
        this.storage.setItem(key, JSON.stringify(item))
    }

    async clear(): Promise<void> {
        this.storage.clear()
    }
}
