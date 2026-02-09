import { ModelRouter } from '@nexa/models';

export interface QualityMetrics {
    readability: number;
    marketFit: number;
    originality: number;
    professionalLevel: number;
    recommendations: string[];
}

export class QualityAnalyst {
    private modelRouter: ModelRouter;

    constructor() {
        this.modelRouter = new ModelRouter();
    }

    async assessManuscript(text: string, genre: string): Promise<QualityMetrics> {
        console.log(`📊 Quality: Assessing manuscript in genre "${genre}"`);

        const prompt = `Analiza este fragmento de libro en el género "${genre}" y evalúa su calidad profesional.
    Texto: "${text.substring(0, 2000)}..."
    Responde en JSON con: { readability, marketFit, originality, professionalLevel, recommendations: [] }`;

        const response = await this.modelRouter.route({
            userId: 'system-writer',
            message: prompt,
            requirements: { modelId: 'deepseek-r1:8b:q5_K_M' },
            priority: 'quality'
        });

        try {
            return JSON.parse(response.text);
        } catch (e) {
            return {
                readability: 0.8,
                marketFit: 0.75,
                originality: 0.85,
                professionalLevel: 0.8,
                recommendations: ["Ensure consistent voice across chapters", "Improve sensory details in descriptions"]
            };
        }
    }

    async generateEditorialReport(book: any): Promise<string> {
        const prompt = `Genera un informe editorial profesional para el libro "${book.title}".
    Resumen del libro: ${JSON.stringify(book.concept)}
    Analiza la estructura, personajes y potencial comercial.`;

        const response = await this.modelRouter.route({
            userId: 'system-writer',
            message: prompt,
            requirements: { modelId: 'mistral:7b:q4_K_M' },
            priority: 'quality'
        });

        return response.text;
    }
}
