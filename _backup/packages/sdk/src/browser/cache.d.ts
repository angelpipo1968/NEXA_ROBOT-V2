export declare class BrowserCache {
    private storage;
    constructor(useLocalStorage?: boolean);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    clear(): Promise<void>;
}
//# sourceMappingURL=cache.d.ts.map