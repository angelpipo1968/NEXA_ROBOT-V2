import { supabaseAdmin } from '@/lib/supabase/admin';

export class EmbeddingService {
    private cache = new Map<string, number[]>();

    async generateEmbedding(text: string): Promise<number[]> {
        // Verificar cache
        const cacheKey = this.hashText(text);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        try {
            // Usar modelo local (Ollama)
            const response = await fetch(`${process.env.OLLAMA_URL || 'http://localhost:11434'}/api/embeddings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3.2:3b', // Default model, adjustable via env or param
                    prompt: text
                })
            });

            const data = await response.json();
            const embedding = data.embedding;

            if (!embedding) throw new Error('No embedding returned from Ollama');

            // Almacenar en cache
            this.cache.set(cacheKey, embedding);

            // Almacenar en Supabase para reuso (Optional, if table exists)
            // await this.storeEmbedding(text, embedding);

            return embedding;
        } catch (error) {
            console.warn('Error with local embedding, falling back to simple hash', error);
            return this.fallbackEmbedding(text);
        }
    }

    /* 
    // Commented out as 'embedding_cache' table definition was not in the provided schema
    private async storeEmbedding(text: string, embedding: number[]): Promise<void> {
      try {
        await supabaseAdmin
          .from('embedding_cache')
          .insert({
            text_hash: this.hashText(text),
            embedding,
            text_preview: text.substring(0, 200)
          });
      } catch (error) {
        // Ignorar errores de cache
      }
    }
    */

    private hashText(text: string): string {
        // Simple hash para cache (Use Buffer for node env compatibility in Next.js server actions)
        return Buffer.from(text).toString('base64');
    }

    private fallbackEmbedding(text: string): number[] {
        // Dummy embedding generators for when AI is offline
        const hash = this.hashText(text);
        const embedding = new Array(1536).fill(0);

        for (let i = 0; i < Math.min(hash.length, 1536); i++) {
            // Just a clear deterministic pattern
            embedding[i] = (hash.charCodeAt(i % hash.length) / 255);
        }

        return embedding;
    }
}
