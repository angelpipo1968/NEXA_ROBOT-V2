import { pipeline } from '@xenova/transformers';

class LocalEmbeddings {
    private static instance: LocalEmbeddings;
    private extractor: any = null;
    private isInitializing: boolean = false;

    private constructor() { }

    public static getInstance(): LocalEmbeddings {
        if (!LocalEmbeddings.instance) {
            LocalEmbeddings.instance = new LocalEmbeddings();
        }
        return LocalEmbeddings.instance;
    }

    public async init() {
        if (this.extractor || this.isInitializing) return;
        this.isInitializing = true;
        console.log('[LocalAI] 🧠 Descargando modelo de embeddings (all-MiniLM-L6-v2)...');
        try {
            this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            console.log('[LocalAI] ✅ Modelo listo.');
        } catch (error) {
            console.error('[LocalAI] Error cargando modelo:', error);
        } finally {
            this.isInitializing = false;
        }
    }

    public async getEmbedding(text: string): Promise<number[]> {
        await this.init();
        if (!this.extractor) return [];

        const output = await this.extractor(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }

    public async extractEntities(text: string): Promise<string[]> {
        // High-speed heuristic for browser-side entity extraction
        const words = text.split(/[\s,.;:!?]+/);
        const candidates = words.filter(w =>
            w.length > 3 &&
            /^[A-ZÁÉÍÓÚ][a-zñ]/.test(w) &&
            !['Este', 'Esa', 'Todo', 'Como', 'Pero', 'Para', 'Cuando'].includes(w)
        );
        return Array.from(new Set(candidates));
    }

    public cosineSimilarity(vecA: number[], vecB: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}

export const localAI = LocalEmbeddings.getInstance();
