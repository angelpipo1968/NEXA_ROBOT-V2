export interface GenerationOptions {
    mode: 'creative' | 'professional' | 'technical' | 'academic' | 'storytelling';
    length?: 'short' | 'medium' | 'detailed';
    audience?: string;
    instruction?: string;
}

export interface GeneratedContent {
    raw: string;
    processed: string;
    model: string;
    tokens: number;
    suggestions: string[];
}

export interface SuggestionOptions {
    mode?: string;
    depth?: string;
}

export class AIWritingEngine {
    private models = {
        creative: 'llama3.2:3b:q4_0',
        professional: 'mistral:7b:q4_K_M',
        technical: 'codellama:7b:q4_K_M',
        academic: 'neural-chat:7b:q4_0',
        storytelling: 'mythomax:13b:q4_K_M'
    };

    async generateContent(
        prompt: string,
        options: GenerationOptions
    ): Promise<GeneratedContent> {
        const model = this.selectModel(options.mode);
        const enhancedPrompt = this.enhancePrompt(prompt, options);

        console.log(`Generating content with model ${model} for prompt: ${prompt.substring(0, 50)}...`);

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: enhancedPrompt,
                    engine: 'ollama'
                })
            });
            const data = await response.json();

            return {
                raw: data.reply || "Error generating output",
                processed: data.reply || "Error generating output",
                model: data.metadata?.model || 'local',
                tokens: 0,
                suggestions: []
            };
        } catch (e) {
            console.error(e);
            return {
                raw: "Communication Error",
                processed: "Communication Error: Could not reach the local Nexa Engine.",
                model: 'local',
                tokens: 0,
                suggestions: []
            };
        }
    }

    private selectModel(mode: string): string {
        return (this.models as any)[mode] || this.models.professional;
    }

    private getTemperature(mode: string): number {
        switch (mode) {
            case 'creative': return 0.8;
            case 'technical': return 0.2;
            default: return 0.5;
        }
    }

    private getLength(length?: string): number {
        switch (length) {
            case 'short': return 100;
            case 'detailed': return 1000;
            default: return 500;
        }
    }

    private enhancePrompt(prompt: string, options: GenerationOptions): string {
        const action = options.instruction === 'expand' ? 'Expande' :
            options.instruction === 'improve' ? 'Mejora la redacción de' :
                options.instruction === 'summarize' ? 'Resume' : 'Reescribe';

        const templates: any = {
            professional: `Eres un editor profesional. ${action} el siguiente texto con estas características:
        - Estilo profesional y claro
        - Tono adecuado para: ${options.audience || 'público general'}
        
        Texto a procesar: 
        ${prompt}
        
        Respuesta (solo el resultado):`,

            creative: `Eres un escritor creativo experto. ${action} el siguiente texto con:
        - Originalidad y creatividad
        - Descripciones vívidas
        
        Texto a procesar: 
        ${prompt}
        
        Respuesta (solo el resultado):`,

            technical: `Eres un experto técnico. ${action} el siguiente texto con:
        - Precisión técnica
        - Claridad absoluta
        
        Texto a procesar: 
        ${prompt}
        
        Respuesta (solo el resultado):`
        };

        return templates[options.mode] || templates.professional;
    }

    async getSuggestions(
        text: string,
        options: SuggestionOptions
    ): Promise<any> {
        // const analysis = await this.analyzeText(text);

        return {
            improvements: ["Improve sentence structure", "Vary word choice"],
            alternatives: ["Alternative opening...", "Different perspective..."],
            structure: "Introduction -> Body -> Conclusion",
            style: "Professional",
            vocabulary: "Advanced",
            confidence: 0.95
        };
    }
}
