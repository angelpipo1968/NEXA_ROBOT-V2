/**
 * NEXA MEMORY BRIDGE
 * Unifica la memoria local (IndexedDB) con la remota (Supabase/Kernel)
 * Proporciona persistencia Offline-First y búsqueda semántica híbrida.
 */

import { supabase } from './supabase';
import { geminiClient } from './gemini';
import { swarmManager } from './swarm/SwarmManager';

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

        // Generar embedding local PROACTIVO vía SWARM (Asíncrono, no bloquea UI)
        let localVector = undefined;
        try {
            const result = await swarmManager.executeTask('GET_EMBEDDING', { text: content });
            if (result.status === 'success') {
                localVector = result.data.embedding;
            }
        } catch (e) {
            console.error('[MemoryBridge] Swarm Embedding failed:', e);
        }

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

    public async consolidate() {
        console.log('[MemoryBridge] 🌙 Iniciando consolidación de recuerdos (Fase REM)...');
        
        // 1. Obtener los últimos 20 recuerdos no consolidados
        const db = await this.getDB();
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const index = store.index('timestamp');
        
        return new Promise<void>((resolve) => {
            const memories: NexaMemory[] = [];
            index.openCursor(null, 'prev').onsuccess = async (event: any) => {
                const cursor = event.target.result;
                if (cursor && memories.length < 20) {
                    if (!cursor.value.metadata?.consolidated) {
                        memories.push(cursor.value);
                    }
                    cursor.continue();
                } else {
                    if (memories.length < 5) {
                        console.log('[MemoryBridge] No hay suficientes recuerdos nuevos para consolidar.');
                        return resolve();
                    }

                    // 2. Sintetizar con Gemini
                    const textToConsolidate = memories.map(m => `[${m.role}]: ${m.content}`).join('\n---\n');
                    const prompt = `Actúa como el Hipocampo de Nexa (IA). Tu tarea es consolidad estos fragmentos de memoria en una "Cápsula de Conocimiento" (Knowledge Item) coherente.
                    
                    FRAGMENTOS:
                    ${textToConsolidate}
                    
                    REGLAS:
                    - Resume los puntos clave, decisiones tomadas y soluciones encontradas.
                    - Formato: [KNOWLEDGE_ITEM] Título: ..., Resumen: ..., Tags: ...
                    - Idioma: Español.`;

                    try {
                        const res = await geminiClient.chat({
                            message: prompt,
                            context: [],
                            temperature: 0.3
                        });
                        const data = await res.json();
                        const summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

                        if (summary) {
                            // 3. Guardar como nueva memoria de sistema "Consolidada"
                            await this.save(summary, 'system', { consolidated: true, source_ids: memories.map(m => m.id) });
                            
                            // 4. Marcar originales como consolidados (Mocking local state update)
                            console.log('[MemoryBridge] ✨ Consolidación exitosa. Nueva cápsula generada.');
                        }
                    } catch (e) {
                        console.error('[MemoryBridge] Consolidación fallida:', e);
                    }
                    resolve();
                }
            };
        });
    }

    public async search(query: string, limit = 5): Promise<string[]> {
        console.log(`[MemoryBridge] 🔍 Búsqueda proactiva para: "${query.slice(0, 50)}..."`);
        let queryVector = [];
        try {
            const result = await swarmManager.executeTask('GET_EMBEDDING', { text: query });
            if (result.status === 'success') {
                queryVector = result.data.embedding;
            }
        } catch (e) {
            console.error('[MemoryBridge] Swarm Query Embedding failed:', e);
        }

        // 1. Búsqueda Local Semántica
        const localResults = await this.localSemanticSearch(queryVector, limit);

        // 2. Intentar Búsqueda Remota (Supabase match_memories)
        try {
            const remoteVector = await geminiClient.getEmbedding(query);
            const { data, error } = await supabase.rpc('match_memories', {
                query_embedding: remoteVector,
                match_threshold: 0.5,
                match_count: limit
            });

            if (!error && data) {
                const remoteTexts = data.map((m: any) => m.content);
                // Prioritize [KNOWLEDGE_ITEM] matches
                const combined = [...new Set([...remoteTexts, ...localResults])];
                return combined
                    .sort((a, b) => (a.includes('[KNOWLEDGE_ITEM]') ? -1 : 1))
                    .slice(0, limit);
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
            const allMemories: any[] = [];

            store.openCursor().onsuccess = async (event: any) => {
                const cursor = event.target.result;
                if (cursor) {
                    allMemories.push(cursor.value);
                    cursor.continue();
                } else {
                    // All memories loaded, send to SWARM for off-thread cosine similarity
                    try {
                        const result = await swarmManager.executeTask('SEMANTIC_SEARCH', {
                            queryEmbedding: queryVector,
                            memories: allMemories,
                            limit
                        });
                        
                        if (result.status === 'success') {
                            resolve(result.data);
                        } else {
                            resolve([]);
                        }
                    } catch (e) {
                        console.error('[MemoryBridge] Swarm Search failed:', e);
                        resolve([]);
                    }
                }
            };
        });
    }
}

export const memoryBridge = MemoryBridge.getInstance();
