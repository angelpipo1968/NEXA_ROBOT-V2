import { modelService } from '@/services/ModelService';
import { useProjectStore } from '@/store/projectStore';
import { useRightPanelStore } from '@/lib/stores/useRightPanelStore';

class ProactiveAgent {
    private static instance: ProactiveAgent;
    private isRunning: boolean = false;
    private interval: any = null;

    private constructor() { }

    public static getInstance(): ProactiveAgent {
        if (!ProactiveAgent.instance) {
            ProactiveAgent.instance = new ProactiveAgent();
        }
        return ProactiveAgent.instance;
    }

    public start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('[ProactiveAgent] 🧠 Pulse started...');

        // Analyze every 2 minutes
        this.interval = setInterval(() => this.analyzeState(), 120000);
        this.analyzeState(); // Initial run
    }

    public stop() {
        if (this.interval) clearInterval(this.interval);
        this.isRunning = false;
    }

    private async analyzeState() {
        const { projectData } = useProjectStore.getState();
        if (projectData.content.length < 50) return;

        console.log('[ProactiveAgent] 🔍 Analyzing project for wisdom...');

        try {
            const prompt = `Analiza este fragmento de proyecto y genera 3 sugerencias creativas (personajes, trama, estilo o mundo). 
            Responde ÚNICAMENTE en JSON con este formato: [{"text": "Sugerencia", "type": "plot|character|world|style", "relevance": 0-100}]
            
            CONTENIDO: ${projectData.content.slice(-2000)}`;

            const response = await modelService.generateResponse([{ role: 'user', content: prompt }], { temperature: 0.9 });

            // Clean response to handle potential markdown junk
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const suggestions = JSON.parse(jsonMatch[0]);
                suggestions.forEach((s: any) => {
                    useRightPanelStore.getState().addWisdom({
                        id: Math.random().toString(36).substring(7),
                        text: s.text,
                        type: s.type,
                        relevance: s.relevance
                    });
                });
            }
        } catch (error) {
            console.error('[ProactiveAgent] Failed to gather wisdom:', error);
        }
    }
}

export const proactiveAgent = ProactiveAgent.getInstance();
