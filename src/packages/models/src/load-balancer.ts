import { Model, StreamChunk } from './types';

export interface StreamRoute {
    model: string;
    stream: AsyncIterable<StreamChunk>;
    release: () => void;
}

export class ModelLoadBalancer {
    private models = [
        { id: 'llama3.2:3b', speed: 1.0, capacity: 10, quality: 0.7 },
        { id: 'llama3.2:1b', speed: 1.5, capacity: 15, quality: 0.5 },
        { id: 'deepseek-r1:8b', speed: 0.3, capacity: 5, quality: 0.9 }
    ];

    async selectModel(priority: 'speed' | 'quality' | 'balanced'): Promise<string> {
        const available = this.models.filter(m => m.capacity > 0);

        if (available.length === 0) {
            return this.models[0].id; // Fallback
        }

        available.sort((a, b) => {
            if (priority === 'speed') return b.speed - a.speed;
            if (priority === 'quality') return b.quality - a.quality;
            // Balanced
            return (b.speed * 0.6 + b.quality * 0.4) - (a.speed * 0.6 + a.quality * 0.4);
        });

        const selected = available[0];
        selected.capacity--;

        return selected.id;
    }

    release(modelId: string) {
        const model = this.models.find(m => m.id === modelId);
        if (model) {
            model.capacity++;
        }
    }
}
