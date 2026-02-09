import { EmbeddingModel } from './types'

export class ModelSelector {
    async select(factors: any): Promise<EmbeddingModel> {
        // Stub: return a default model
        return {
            id: 'stub-model',
            type: 'local',
            dimensions: 384,
            maxTokens: 512,
            languages: ['en'],
            quality: 0.9,
            speed: 1.0
        };
    }
}
