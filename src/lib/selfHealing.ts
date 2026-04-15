/**
 * NEXA SELF-HEALING KERNEL
 * Monitorea errores de tiempo de ejecución y utiliza IA para proponer soluciones.
 * Las lecciones aprendidas se guardan en el MemoryBridge.
 */

import { memoryBridge } from './memoryBridge';
import { modelService } from '@/services/ModelService';

interface ErrorLesson {
    error: string;
    stack?: string;
    solution?: string;
    context: string;
}

class SelfHealingKernel {
    private static instance: SelfHealingKernel;

    private constructor() {
        this.setupGlobalHandlers();
    }

    public static getInstance(): SelfHealingKernel {
        if (!SelfHealingKernel.instance) {
            SelfHealingKernel.instance = new SelfHealingKernel();
        }
        return SelfHealingKernel.instance;
    }

    private setupGlobalHandlers() {
        if (typeof window === 'undefined') return;

        window.onerror = (message, source, lineno, colno, error) => {
            this.handleError({
                message: String(message),
                source,
                lineno,
                colno,
                error
            });
        };

        window.onunhandledrejection = (event) => {
            this.handleError({
                message: 'Unhandled Promise Rejection',
                error: event.reason
            });
        };
    }

    public async handleError(errorData: any) {
        console.error('[Self-Healing] 🚨 Error detectado:', errorData);

        const errorString = JSON.stringify(errorData);

        // Evitar procesar el mismo error en bucle
        if (errorString.includes('Self-Healing')) return;

        try {
            // 1. Preguntar a la IA qué pudo pasar (sin bloquear la UI)
            this.analyzeError(errorData);
        } catch (e) {
            // Silencioso para no causar bucles
        }
    }

    private async analyzeError(errorData: any) {
        // Enriquecer contexto: ¿qué archivos están involucrados?
        const stack = errorData.error?.stack || '';
        const fileMatch = stack.match(/at\s+.*\((.*):(\d+):(\d+)\)/) || stack.match(/at\s+(.*):(\d+):(\d+)/);
        const fileName = fileMatch ? fileMatch[1] : 'unknown';

        const prompt = `SISTEMA INMUNITARIO NEXA v2.0
        Se ha detectado una anomalía crítica en el Kernel.
        
        DETALLES TÉCNICOS:
        - Mensaje: ${errorData.message}
        - Archivo: ${fileName}
        - Stack: ${stack.slice(0, 500)}

        TAREA:
        1. Analiza la causa raíz.
        2. Genera un parche de código sugerido en formato DIFF.
        3. Si es un error de configuración, propón el comando de corrección.

        Responde en JSON estricto: 
        { 
          "diagnosis": "...", 
          "patch": "string con el diff o código corregido", 
          "severity": "critical|warning",
          "autoFixCommand": "comando de terminal si aplica"
        }`;

        try {
            let analysis = '';
            try {
                // 1. Primary: Groq (Ultra-fast reasoning)
                analysis = await modelService.generateResponse([
                    { role: 'system', content: 'Eres el Agente Inmunitario de Nexa OS. Tu objetivo es la homeostasis total del sistema sin fallar.' },
                    { role: 'user', content: prompt }
                ], { provider: 'groq' });
            } catch (e1) {
                console.warn('[Self-Healing] Fallback activado: Cambiando a Gemini (Cloud Intelligence)...');
                try {
                    // 2. Fallback: Gemini
                    analysis = await modelService.generateResponse([
                        { role: 'system', content: 'Eres el Agente Inmunitario de Nexa OS. Sistema en modo recuperación.' },
                        { role: 'user', content: prompt }
                    ], { provider: 'gemini' });
                } catch (e2) {
                    console.warn('[Self-Healing] Fallback activado: Cambiando a Ollama (Local Limitless Mode)...');
                    // 3. Fallback: Ollama Local (Offline/Limitless)
                    analysis = await modelService.generateResponse([
                        { role: 'system', content: 'Eres el Agente Inmunitario local de Nexa OS.' },
                        { role: 'user', content: prompt }
                    ], { provider: 'ollama' });
                }
            }

            let parsed;
            try {
                // Limpiar posible markdown del JSON (R1 de deepseek envuelve en <think>)
                let cleanStr = analysis.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
                const jsonMatch = cleanStr.match(/\{[\s\S]*\}/);
                const jsonStr = jsonMatch ? jsonMatch[0] : cleanStr;
                parsed = JSON.parse(jsonStr);
            } catch {
                parsed = { diagnosis: analysis.substring(0, 150) + "...", patch: null, severity: "warning" };
            }

            // Guardar en la "Memoria Inmunitaria"
            await memoryBridge.save(
                `[IMMUNE_RECALL] Error en ${fileName}: ${parsed.diagnosis}. Patch: ${parsed.patch}`,
                'system',
                { type: 'immune_patch', metadata: parsed }
            );

            // Notificar al sistema de telemetría local
            console.log('[Self-Healing] 🛡️ Parche inmunológico generado:', parsed.diagnosis);

            // Disparar evento para que la UI pueda reaccionar
            const event = new CustomEvent('nexa-immune-patch', { detail: parsed });
            window.dispatchEvent(event);

        } catch (e) {
            console.warn('[Self-Healing] Fallo en el ciclo de auto-curación:', e);
        }
    }

    public async getSuggestedFixes(currentContext: string): Promise<string[]> {
        const lessons = await memoryBridge.search(`[IMMUNE_RECALL] ${currentContext}`, 5);
        return lessons;
    }
}

export const selfHealing = SelfHealingKernel.getInstance();
