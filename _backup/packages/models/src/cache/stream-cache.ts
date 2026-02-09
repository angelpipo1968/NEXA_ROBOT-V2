import { StreamChunk } from '../types';

export class StreamingCache {
    private cache = new Map<string, { chunks: StreamChunk[], timestamp: number }>();
    private ttl = 1000 * 60 * 60; // 1 hour

    async hashPrompt(prompt: string): Promise<string> {
        // Simple hash function for demonstration
        let hash = 0;
        for (let i = 0; i < prompt.length; i++) {
            const char = prompt.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString();
    }

    async *getOrStream(
        prompt: string,
        generator: AsyncIterable<StreamChunk>
    ): AsyncIterable<StreamChunk> {
        const key = await this.hashPrompt(prompt);
        const cached = this.cache.get(key);

        if (cached && (Date.now() - cached.timestamp < this.ttl)) {
            console.log(`🚀 [Cache Hit] Serving tokens for: "${prompt.substring(0, 20)}..."`);
            for (const chunk of cached.chunks) {
                yield chunk;
            }
            return;
        }

        console.log(`⚡ [Cache Miss] Streaming and caching: "${prompt.substring(0, 20)}..."`);
        const chunks: StreamChunk[] = [];
        for await (const chunk of generator) {
            chunks.push(chunk);
            yield chunk;
        }

        this.cache.set(key, {
            chunks,
            timestamp: Date.now()
        });
    }
}
