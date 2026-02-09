import { ModelRouter } from '@nexa/models';

export interface DeepThought {
    levels: string[];
    insights: string[];
    questions: string[];
}

export interface BookConcept {
    title: string;
    genre: string;
    seed: string;
    ideas: any[];
    marketFit: any;
    uniquenessScore: number;
    developmentPath: string[];
}

export class DeepThoughtEngine {
    private modelRouter: ModelRouter;
    private readonly models = {
        brainstorming: 'llama3:latest',
        analysis: 'mistral:latest',
        synthesis: 'deepseek-r1:8b',
        creative: 'deepseek-r1:8b'
    };

    constructor() {
        this.modelRouter = new ModelRouter();
    }

    async developBookConcept(seedIdea: string): Promise<BookConcept> {
        console.log(`🧠 Developing concept for: ${seedIdea}`);

        // Phase 1: Brainstorming
        const brainstorm = await this.parallelBrainstorm(seedIdea, 4);

        // Phase 2: Synthesis & Analysis (Mocked for now)
        return {
            title: "Untitled Book Idea",
            genre: "General",
            seed: seedIdea,
            ideas: brainstorm.ideas,
            marketFit: { score: 0.85, audience: "General readers" },
            uniquenessScore: 0.9,
            developmentPath: ["Conception", "Scaffolding", "Drafting"]
        };
    }

    private async parallelBrainstorm(seed: string, variations: number) {
        const variations_list = ['comercial', 'literario', 'educativo', 'disruptivo'];
        const results = await Promise.all(
            variations_list.map(v => this.think(`Desarrolla una variación ${v} del concepto: "${seed}"`, this.models.brainstorming))
        );

        return {
            seed,
            ideas: results.map((r, i) => ({
                variation: variations_list[i],
                content: r.insights.join(' '),
                originality: 0.8
            }))
        };
    }

    async think(prompt: string, model: string, context?: any[]): Promise<DeepThought> {
        const response = await this.modelRouter.route({
            userId: 'system-writer',
            message: prompt,
            requirements: { modelId: model },
            priority: 'quality',
            context: context
        });

        try {
            // Intentamos parsear JSON si el modelo lo devuelve, si no, lo estructuramos
            return JSON.parse(response.text);
        } catch (e) {
            return {
                levels: ["Fact Based"],
                insights: [response.text],
                questions: ["What comes next?"]
            };
        }
    }
}
