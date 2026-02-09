export * from './manager';
export * from './embedding';

export const initMemory = () => {
    console.log('Memory module initialized');
};

// Singleton instance for backward compatibility with initial backend code if needed,
// though backend should instantiate MemoryManager.
import { MemoryManager } from './manager';
export const memoryManager = new MemoryManager();

// VectorStore stub for tools package
export class VectorStore {
    async store(data: {
        userId: string;
        collection: string;
        documents: any[];
        embeddings: any;
        metadata: any;
    }): Promise<void> {
        // Stub implementation
    }

    async query(params: {
        collection: string;
        embedding: number[];
        limit?: number;
        threshold?: number;
    }): Promise<any[]> {
        return [];
    }
}
