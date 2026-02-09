import { ModelRouter } from '@nexa/models';

export class ProfessionalWritingEngine {
    private modelRouter: ModelRouter;

    constructor() {
        this.modelRouter = new ModelRouter();
    }

    async writeChapter(design: any, style: string) {
        console.log(`✍️ Writing: Crafting chapter using ${style} style`);

        const prompt = `Escribe el capítulo titulado "${design.title}" siguiendo este diseño: ${JSON.stringify(design)}`;

        const response = await this.modelRouter.route({
            userId: 'system-writer',
            message: prompt,
            requirements: { modelId: 'llama3:8b:q4_K_M' },
            priority: 'quality'
        });

        return {
            content: response.text,
            metadata: {
                wordCount: response.text.split(' ').length,
                latency: response.latency
            }
        };
    }

    async refineProse(text: string, stage: string) {
        const prompt = `Actúa como un editor experto en ${stage}. Mejora el siguiente texto sin cambiar la voz del autor:\n\n${text}`;

        const response = await this.modelRouter.route({
            userId: 'system-writer',
            message: prompt,
            requirements: { modelId: 'deepseek-r1:8b:q5_K_M' },
            priority: 'quality'
        });

        return response.text;
    }
    async generateSuggestion(context: string): Promise<string> {
        console.log(`🤖 AI: Generating suggestion based on context...`);
        const prompt = `Based on the following text context, suggest what should happen next. Keep it creative and engaging:\n\n${context}`;

        const response = await this.modelRouter.route({
            userId: 'user-assistant',
            message: prompt,
            requirements: { modelId: 'llama3:8b:q4_K_M' }, // Using a faster model for suggestions
            priority: 'speed'
        });

        return response.text;
    }

    async autoComplete(text: string): Promise<string> {
        console.log(`⚡ AI: Auto-completing text...`);
        const prompt = `Complete the following sentence or paragraph naturally:\n\n${text}`;

        const response = await this.modelRouter.route({
            userId: 'user-assistant',
            message: prompt,
            requirements: { modelId: 'llama3:8b:q4_K_M' },
            priority: 'speed'
        });

        return response.text;
    }

    async inspireMe(genre: string): Promise<string> {
        console.log(`✨ AI: Generating inspiration for ${genre}...`);
        const prompt = `Give me a creative writing prompt or idea for a ${genre} story. Be unique and evocative.`;

        const response = await this.modelRouter.route({
            userId: 'user-assistant',
            message: prompt,
            requirements: { modelId: 'llama3:8b:q4_K_M' },
            priority: 'quality'
        });

        return response.text;
    }
}
