/// <reference lib="webworker" />
import { pipeline, env } from '@xenova/transformers';

// Evitar usar caché pesada en el worker si no está disponible, usar WASM local
env.allowLocalModels = false;
env.useBrowserCache = true;

let extractor: any = null;

async function getExtractor() {
    if (!extractor) {
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
            progress_callback: (x: any) => {
                self.postMessage({ type: 'PROGRESS', payload: x });
            }
        });
    }
    return extractor;
}

self.onmessage = async (e: MessageEvent) => {
    const { id, type, payload } = e.data;

    try {
        let resultData = null;

        switch (type) {
            case 'ANALYZE_CONTEXT':
                resultData = await simulateHeavyAnalysis(payload);
                break;
            case 'GET_EMBEDDING':
                const ext = await getExtractor();
                const output = await ext(payload.text, { pooling: 'mean', normalize: true });
                resultData = { embedding: Array.from(output.data) };
                break;
            case 'SEMANTIC_SEARCH':
                // Here we perform cosine similarity logic off-thread
                const { queryEmbedding, memories, limit } = payload;
                const topMemories = [];
                for (const memory of memories) {
                    if (memory.embedding) {
                        const score = cosineSimilarity(queryEmbedding, memory.embedding);
                        if (score > 0.7) {
                            topMemories.push({ content: memory.content, score });
                        }
                    }
                }
                resultData = topMemories
                    .sort((a, b) => b.score - a.score)
                    .slice(0, limit)
                    .map(m => m.content);
                break;
            case 'PREFETCH_MEMORY':
                resultData = { message: "Memory pre-fetched", size: payload.length };
                break;
            case 'SUMMARIZE_LOGS':
                resultData = { summary: `Resumidos ${payload.logs.length} logs.` };
                break;
            default:
                throw new Error(`Unknown task type: ${type}`);
        }

        self.postMessage({ id, status: 'success', data: resultData });
    } catch (error: any) {
        self.postMessage({ id, status: 'error', error: error.message });
    }
};

function cosineSimilarity(vecA: number[], vecB: number[]): number {
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

async function simulateHeavyAnalysis(text: string) {
    const tokens = text.split(' ').length;
    // Basic off-thread extraction
    const entities = text.split(/[\s,.;:!?]+/).filter(w =>
        w.length > 3 && /^[A-ZÁÉÍÓÚ][a-zñ]/.test(w)
    );
    return {
        tokens,
        sentiment: text.includes('error') ? 'negative' : 'neutral',
        entities: Array.from(new Set(entities))
    };
}
