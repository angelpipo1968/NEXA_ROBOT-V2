// src/packages/memory/vector.ts - RAG nativo con pgvector
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
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
        // Inicializamos modelo de embeddings local. nomic-embed-text-v1.5 genera vectores 768 dims, alineado a supabase_setup.sql
        this.embeddings = new HuggingFaceTransformersEmbeddings({
            modelName: 'Xenova/nomic-embed-text-v1.5'
        });
    }

    async store(intent: string, solution: any, metadata: Record<string, any>) {
        try {
            const vector = await this.embeddings.embedQuery(intent);

            const { error } = await this.supabase
                .from('memories')
                .insert({
                    content: JSON.stringify(solution),
                    embedding: vector,
                    role: metadata.role || 'assistant',
                    user_id: metadata.user_id || undefined,
                });

            if (error) {
                console.error('[VectorMemory] Error almacenando memoria de Supabase:', error);
            }
        } catch (e) {
            console.error('[VectorMemory] Falló la vectorización/almacenamiento:', e);
        }
    }

    async search(query: string, { limit = 3, threshold = 0.7 }: SearchOptions = {}) {
        try {
            const vector = await this.embeddings.embedQuery(query);

            const { data, error } = await this.supabase.rpc('match_memories', {
                query_embedding: vector,
                match_threshold: threshold,
                match_count: limit
            });

            if (error) {
                console.error('[VectorMemory] Error buscando memoria en Supabase:', error);
                return [];
            }

            return data.map((d: any) => {
                try {
                    return { ...d, content: JSON.parse(d.content) };
                } catch {
                    return { ...d };
                }
            });
        } catch (err) {
            console.error('[VectorMemory] Fallo general RAG:', err);
            return [];
        }
    }
}
