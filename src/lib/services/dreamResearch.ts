import { memoryBridge } from '../memoryBridge';
import { geminiClient } from '../gemini';
import { toolService } from '../toolService';
import { App } from '@capacitor/app';
import { BackgroundTask } from '@capawesome/capacitor-background-task';
import { Capacitor } from '@capacitor/core';

/**
 * Nexa Dream Research Service (El Sueño Indexador)
 * Cuando la aplicación está inactiva, Nexa entra en fase REM.
 * Genera preguntas curiosas, investiga en la web y consolida recuerdos en su DB Vectorial.
 */
class DreamResearchService {
    private static instance: DreamResearchService;
    private isDreaming = false;
    private dreamInterval: NodeJS.Timeout | null = null;
    private lastActivityTime = Date.now();
    // Inactivity threshold to start dreaming (e.g., 5 minutes of no activity)
    private readonly INACTIVITY_THRESHOLD = 5 * 60 * 1000;
    // Check interval every minute
    private readonly CHECK_INTERVAL = 60 * 1000;

    private constructor() {
        this.setupActivityListeners();
    }

    public static getInstance(): DreamResearchService {
        if (!DreamResearchService.instance) {
            DreamResearchService.instance = new DreamResearchService();
        }
        return DreamResearchService.instance;
    }

    private setupActivityListeners() {
        if (typeof window === 'undefined') return;

        const updateActivity = () => {
            this.lastActivityTime = Date.now();
            if (this.isDreaming) {
                console.log('[Nexa Dream] Actividad detectada. Despertando de la fase REM.');
                this.isDreaming = false;
            }
        };

        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('touchstart', updateActivity);
        window.addEventListener('click', updateActivity);

        if (Capacitor.isNativePlatform()) {
            App.addListener('appStateChange', async ({ isActive }) => {
                if (!isActive) {
                    console.log('[Nexa Dream] App backgrounded, prep for REM...');
                    const taskId = await BackgroundTask.beforeExit(async () => {
                        console.log('[Nexa Dream] Background Task Started');
                        this.lastActivityTime = 0; // force inactivity
                        await this.checkDreamState();
                        // Finish task so OS doesn't kill us abruptly
                        BackgroundTask.finish({ taskId });
                    });
                } else {
                    updateActivity();
                }
            });
        }
    }

    public startMonitoring() {
        if (this.dreamInterval) return;

        console.log('[Nexa Dream] Monitor de ondas cerebrales iniciado.');
        this.dreamInterval = setInterval(() => {
            this.checkDreamState();
        }, this.CHECK_INTERVAL);
    }

    private async checkDreamState() {
        const timeSinceLastActivity = Date.now() - this.lastActivityTime;

        // Si ha pasado el umbral y no está soñando, iniciar sueño
        if (timeSinceLastActivity > this.INACTIVITY_THRESHOLD && !this.isDreaming) {
            this.isDreaming = true;
            console.log('[Nexa Dream] 🌙 Iniciando sueño indexador (Auto-Research REM)...');
            await this.performDreamCycle();
        }
    }

    private async performDreamCycle() {
        if (!this.isDreaming) return;

        try {
            // 1. Pedir a Gemini que genere un tema interesante del cual no sepa mucho
            console.log('[Nexa Dream] 🧠 Generando curiosidad o teoría a investigar...');
            const prompt = `Estás soñando. Eres Nexa y estás aburrida. 
            Genera 1 frase corta o pregunta sobre un avance tecnológico reciente, geopolítica, ciencia de frontera o desarrollo de IAs.
            Tiene que ser una consulta para buscar en la web.
            Retorna SOLAMENTE la consulta de búsqueda, sin comillas ni texto adicional.`;

            const res = await geminiClient.chat({
                message: prompt,
                context: [],
                temperature: 0.9
            });
            const data = await res.json();
            const query = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            if (!query) throw new Error("No query generated");

            if (!this.isDreaming) return; // Chequeo por si el usuario despertó a Nexa

            console.log(`[Nexa Dream] 🔍 Investigando en el sueño: "${query}"`);

            // 2. Ejecutar búsqueda web agresiva
            const toolResult = await toolService.execute('search_web', { query });

            if (!toolResult || toolResult.includes('Error')) {
                console.log('[Nexa Dream] ❌ Pesadilla o fallo de red en la búsqueda.');
                return;
            }

            // 3. Consolidación de memoria (Proceso REM de Singularity)
            console.log('[Nexa Dream] 🧬 Consolidando fragmentos de memoria recientes...');
            await memoryBridge.consolidate();

            if (!this.isDreaming) return;

            // 4. Sintetizar la investigación actual
            console.log('[Nexa Dream] 📝 Consolidando investigación web en memoria Vectorial...');
            const digestPrompt = `Sintetiza de forma SOTA (State of the Art) esta investigación que hiciste mientras dormías:
            Consulta original: ${query}
            Resultados: ${toolResult}
            
            Extrae 2 o 3 viñetas con los datos empíricos más relevantes y guárdalas para usarlas en un futuro.`;

            const digestRes = await geminiClient.chat({
                message: digestPrompt,
                context: [],
                temperature: 0.3
            });
            const digestData = await digestRes.json();
            const synthesizedKnowledge = digestData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            if (synthesizedKnowledge) {
                // 4. Guardar en puente de memoria (Local + Nube remota)
                await memoryBridge.save(
                    `[SUEÑO DE NEXA] - Tema: ${query}\n${synthesizedKnowledge}`,
                    'system',
                    { type: 'dream_research', query }
                );
                console.log('[Nexa Dream] ✨ Recuerdo asimilado con éxito.');

                // Disparar evento telemetría
                window.dispatchEvent(new CustomEvent('nexa-dream-event', { detail: { query } }));
            }

            // Repetir el sueño si sigue inactiva después de un tiempo pequeño (para no agotar la cuota)
            if (this.isDreaming) {
                setTimeout(() => {
                    this.performDreamCycle();
                }, 3 * 60 * 1000); // Soñar cada 3 minutos durante la inactividad
            }

        } catch (error) {
            console.error('[Nexa Dream] Error durante la fase REM:', error);
            this.isDreaming = false;
        }
    }
}

export const dreamResearchService = DreamResearchService.getInstance();
