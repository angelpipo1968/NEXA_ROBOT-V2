/**
 * NEXA MEMORY BRIDGE
 * Unifica la memoria local (IndexedDB) con la remota (Supabase/Kernel)
 * Proporciona persistencia Offline-First y búsqueda semántica híbrida.
 */

import { supabase } from './supabase';
import { geminiClient } from './gemini';
import { localAI } from './services/localAI';

export interface NexaMemory {
    id: string;
    content: string;
    role: 'user' | 'assistant' | 'system';
    timestamp: number;
    embedding?: number[];
    metadata?: Record<string, any>;
    synced: boolean;
}

class MemoryBridge {
    private static instance: MemoryBridge;
    private dbName = 'NexaOS_Memory';
    private storeName = 'memories';

    private constructor() {
        this.initDB();
    }

    public static getInstance(): MemoryBridge {
        if (!MemoryBridge.instance) {
            MemoryBridge.instance = new MemoryBridge();
        }
        return MemoryBridge.instance;
    }

    private async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = (event: any) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('synced', 'synced', { unique: false });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    private async getDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    public async save(content: string, role: NexaMemory['role'], metadata: any = {}) {
        if (content.length < 3) return;

        // Generar embedding local PROACTIVO
        const localVector = await localAI.getEmbedding(content);

        const memory: NexaMemory = {
            id: crypto.randomUUID(),
            content,
            role,
            timestamp: Date.now(),
            embedding: localVector,
            metadata,
            synced: false
        };

        // 1. Guardar en Local (IndexedDB)
        const db = await this.getDB();
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        store.add(memory);

        // 2. Intentar Sync en background (Nube)
        this.syncMemory(memory);

        return memory.id;
    }

    private async syncMemory(memory: NexaMemory) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.id === 'mock-user-id') return;

            // En la nube preferimos el embedding de Gemini (004) por precisión
            let remoteVector = memory.embedding;
            try {
                remoteVector = await geminiClient.getEmbedding(memory.content);
            } catch {
                console.warn('[MemoryBridge] Usando embedding local para la nube (backup).');
            }

            const { error } = await supabase.from('memories').insert({
                id: memory.id,
                user_id: user.id,
                content: memory.content,
                role: memory.role,
                embedding: remoteVector,
                created_at: new Date(memory.timestamp).toISOString()
            });

            if (!error) {
                const db = await this.getDB();
                const tx = db.transaction(this.storeName, 'readwrite');
                const store = tx.objectStore(this.storeName);
                store.put({ ...memory, synced: true });
            }
        } catch (e) {
            console.warn('[MemoryBridge] Sync deferred:', e);
        }
    }

    public async search(query: string, limit = 5): Promise<string[]> {
        const queryVector = await localAI.getEmbedding(query);

        // 1. Búsqueda Local Semántica (IndexedDB + Cosine Similarity)
        const localResults = await this.localSemanticSearch(queryVector, limit);

        // 2. Intentar Búsqueda Remota para ampliar contexto
        try {
            const remoteVector = await geminiClient.getEmbedding(query);
            const { data, error } = await supabase.rpc('match_memories', {
                query_embedding: remoteVector,
                match_threshold: 0.6,
                match_count: limit
            });

            if (!error && data) {
                const remoteTexts = data.map((m: any) => m.content);
                return [...new Set([...localResults, ...remoteTexts])].slice(0, limit);
            }
        } catch (e) {
            console.warn('[MemoryBridge] Remote search failed, relying on local RAG.');
        }

        return localResults;
    }

    private async localSemanticSearch(queryVector: number[], limit: number): Promise<string[]> {
        const db = await this.getDB();
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);

        return new Promise((resolve) => {
            const topMemories: Array<{ content: string, score: number }> = [];

            store.openCursor().onsuccess = (event: any) => {
                const cursor = event.target.result;
                if (cursor) {
                    const memory = cursor.value;
                    if (memory.embedding) {
                        const score = localAI.cosineSimilarity(queryVector, memory.embedding);
                        if (score > 0.7) {
                            topMemories.push({ content: memory.content, score });
                        }
                    }
                    cursor.continue();
                } else {
                    const sorted = topMemories
                        .sort((a, b) => b.score - a.score)
                        .slice(0, limit)
                        .map(m => m.content);
                    resolve(sorted);
                }
            };
        });
    }
}

export const memoryBridge = MemoryBridge.getInstance();
