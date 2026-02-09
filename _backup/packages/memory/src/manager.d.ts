export interface MemoryContext {
    recent: any[];
    similar: any[];
    longTerm: any[];
    timestamp: Date;
}
export interface MemoryUpdate {
    query: string;
    response: string;
    metadata?: any;
}
export declare class MemoryManager {
    private pool;
    private redis;
    private localCache;
    constructor();
    retrieve(userId: string, query: string): Promise<MemoryContext>;
    update(userId: string, data: MemoryUpdate): Promise<void>;
    private vectorSearch;
    private getLongTermMemory;
    private storeVector;
    private updatePreferences;
}
//# sourceMappingURL=manager.d.ts.map