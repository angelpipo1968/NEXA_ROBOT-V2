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

    public async forceAnalyze() {
        console.log('[ProactiveAgent] ⚡ Force analysis triggered by user');
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = setInterval(() => this.analyzeState(), 120000);
        }
        await this.analyzeState();
    }

    private async analyzeState() {
        const { projectData } = useProjectStore.getState();
        if (projectData.content.length < 2) return; // lower threshold for code files

        console.log('[ProactiveAgent] 🔍 Analyzing project for wisdom...');


        try {
            const content = projectData.content.slice(-2000);

            // Detect intention based on content
            const isCode = /function|const|let|var|class|import|export|=>|\{|\}/.test(content) && content.split('\n').filter(l => l.includes(';')).length > 2;

            const prompt = isCode
                ? `Actúa como un Arquitecto de Software y Analista de Seguridad. Analiza este código y genera 3 sugerencias precisas (refactorización, seguridad, rendimiento o arquitectura).
                Responde ÚNICAMENTE en JSON con este formato exacto: [{"text": "Sugerencia breve", "type": "refactor|security|perf|arch", "relevance": 95}]
                CONTENIDO A ANALIZAR:\n${content}`
                : `Eres un Editor Asistente Creativo. Analiza este texto y genera 3 sugerencias creativas (personajes, trama, estilo o lore mundial). 
                Responde ÚNICAMENTE en JSON con este formato exacto: [{"text": "Sugerencia creativa", "type": "plot|character|world|style", "relevance": 85}]
                CONTENIDO A ANALIZAR:\n${content}`;

            const response = await modelService.generateResponse([{ role: 'user', content: prompt }], { temperature: 0.7, reasoningMode: 'normal' });

            // Clean response to handle potential markdown junk
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const suggestions = JSON.parse(jsonMatch[0]);
                suggestions.forEach((s: any) => {
                    useRightPanelStore.getState().addWisdom({
                        id: Math.random().toString(36).substring(7),
                        text: s.text,
                        type: isCode ? s.type.toUpperCase() : s.type, // Visual distinction
                        relevance: s.relevance || 80
                    });
                });
            }
        } catch (error) {
            console.error('[ProactiveAgent] Failed to gather wisdom:', error);
        }
    }
}

export const proactiveAgent = ProactiveAgent.getInstance();
