// src/packages/memory/vector.ts - RAG nativo con pgvector
import { createClient } from '@supabase/supabase-js';
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/hf_transformers';

export interface SearchOptions {
    limit?: number;
    threshold?: number;
}

export class VectorMemory {
    private supabase;
    private embeddings;

    constructor(supabaseUrl: string, key: string) {
        this.supabase = createClient(supabaseUrl, key);
        // Inicializamos el modelo de embeddings local, corre asíncronamente
        this.embeddings = new HuggingFaceTransformersEmbeddings({
            modelName: 'Xenova/all-MiniLM-L6-v2' // Modelo local ligero
        });
    }

    async store(intent: string, solution: any, metadata: Record<string, any>) {
        const vector = await this.embeddings.embedQuery(intent);

        const { error } = await this.supabase
            .from('nexa_memory')
            .insert({
                content: JSON.stringify(solution),
                embedding: vector,
                metadata: { ...metadata, timestamp: new Date().toISOString() },
                tags: metadata.tags || []
            });

        if (error) {
            console.error('[VectorMemory] Error almacenando memoria:', error);
        }
    }

    async search(query: string, { limit = 3, threshold = 0.7 }: SearchOptions = {}) {
        try {
            const vector = await this.embeddings.embedQuery(query);

            const { data, error } = await this.supabase.rpc('match_memory', {
                query_embedding: vector,
                match_threshold: threshold,
                match_count: limit
            });

            if (error) {
                console.error('[VectorMemory] Error buscando memoria:', error);
                return [];
            }

            return data.map((d: any) => ({
                ...d,
                content: JSON.parse(d.content)
            }));
        } catch (err) {
            console.error('[VectorMemory] Fallo general RAG:', err);
            return [];
        }
    }
}
