export class EmbeddingService {
    async embed(chunks: any[]): Promise<number[][]> {
        // Stub implementation returning mock vector
        return chunks.map(() => Array(1536).fill(0.1));
    }
}
