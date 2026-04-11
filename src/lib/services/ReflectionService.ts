import { geminiClient } from '../gemini';
import { memoryBridge } from '../memoryBridge';
import { useAutonomyStore } from '@/store/useAutonomyStore';
import { useChatStore } from '@/store/useChatStore';

export class ReflectionService {
    private static instance: ReflectionService;

    private constructor() { }

    public static getInstance(): ReflectionService {
        if (!ReflectionService.instance) {
            ReflectionService.instance = new ReflectionService();
        }
        return ReflectionService.instance;
    }

    /**
     * Analiza las interacciones recientes para encontrar patrones de falla o mejora.
     */
    public async performReflection() {
        if (useAutonomyStore.getState().isReflecting) return;
        
        console.log('[ReflectionService] 🧠 Iniciando ciclo de Auto-Reflexión...');
        useAutonomyStore.getState().setReflecting(true);
        const addLog = useChatStore.getState().addTerminalLog;
        addLog('Iniciando ciclo de Auto-Reflexión (Protocolo Singularity)');

        try {
            // 1. Recuperar los últimos fragmentos de memoria No Consolidados
            const memories = await memoryBridge.search('Últimas interacciones y errores', 10);
            
            if (memories.length < 3) {
                console.log('[ReflectionService] No hay suficiente contexto para reflexionar.');
                return;
            }

            const contextText = memories.join('\n---\n');

            // 2. Pedir a Nexa (vía Gemini) que se critique
            const reflectionPrompt = `Actúa como el Módulo de Auto-Reflexión de Nexa (Módulo SICA). 
            Tu tarea es analizar estas interacciones recientes y determinar si hubo errores, alucinaciones o falta de eficiencia.
            
            CONTEXTO DE INTERACCIONES:
            ${contextText}
            
            REGLAS:
            1. Analiza qué salió mal o qué pudo ser mejor.
            2. Si encuentras un fallo recurrente, genera una "REGLA DE AUTO-CORRECCIÓN" minimalista.
            3. Responde ÚNICAMENTE en este formato JSON:
            {
              "lesson": "Qué aprendí hoy sobre mi comportamiento...",
              "rule": "Nexa siempre debe... para evitar..." (Solo si es necesario),
              "efficiency_score": 0-100
            }`;

            const response = await geminiClient.chat({
                message: reflectionPrompt,
                temperature: 0.2, // Muy bajo para máxima precisión
                systemInstruction: "Eres el núcleo de auto-mejoramiento de Nexa. Sé crítico y objetivo."
            });

            const data = await response.json();
            const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            // Extraer JSON (limpiando markdown)
            const jsonStr = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
            const reflection = JSON.parse(jsonStr);

            console.log('[ReflectionService] ✨ Reflexión completada:', reflection);
            addLog(`Reflexión completada. Eficiencia percibida: ${reflection.efficiency_score}%`);

            if (reflection.rule) {
                useAutonomyStore.getState().addRule(reflection.lesson, reflection.rule);
                addLog(`Nueva Regla de Auto-Corrección inyectada: ${reflection.rule}`);
            }

            useAutonomyStore.getState().setLastHeartbeat(Date.now());

        } catch (error) {
            console.error('[ReflectionService] ❌ Fallo en el ciclo de reflexión:', error);
            addLog('Fallo en el ciclo de Auto-Reflexión.');
        } finally {
            useAutonomyStore.getState().setReflecting(false);
        }
    }
}

export const reflectionService = ReflectionService.getInstance();
