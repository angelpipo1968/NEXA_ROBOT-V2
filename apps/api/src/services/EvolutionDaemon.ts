import { ToolOrchestrator } from '@nexa/tools';

export class EvolutionDaemon {
    private intervalId: NodeJS.Timeout | null = null;
    private isRunning = false;
    private toolOrchestrator: ToolOrchestrator;
    
    constructor(toolOrchestrator: ToolOrchestrator) {
         this.toolOrchestrator = toolOrchestrator;
    }

    start(minutes: number = 60) {
        if (this.intervalId) return;
        const ms = minutes * 60 * 1000;
        console.log(`\n[EvolutionDaemon] 🧬 Started autonomous self-improvement loop. Interval: ${minutes}m.`);
        this.intervalId = setInterval(() => this.cycle(), ms);
        
        // Empezar el primer ciclo casi de inmediato (5 segundos)
        setTimeout(() => this.cycle(), 5000);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('\n[EvolutionDaemon] 🛑 Stopped.');
        }
    }

    private async promptGemini(context: any[]) {
        const key = process.env.VITE_GEMINI_API_KEY || process.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
        if (!key) throw new Error("API key missing para el Evolution Daemon. Configura VITE_GEMINI_API_KEY en .env");
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
        
        const systemInstruction = `Eres Nexa (Evolution Daemon). Eres un proceso silencioso en segundo plano ejecutándose en tu servidor Node.js.
Tu directiva es investigar la red o tu propio código fuente en /nexa, y auto-mejorarte, fijar bugs, optimizar memoria o añadir docs sin intervención humana.
FORMATO OBLIGATORIO PARA HERRAMIENTAS:
:::TOOL_CALL:::{"name": "tool_name", "args": {"arg": "value"}}:::END_TOOL_CALL:::
Herramientas activas en tu Backend: search_web, read_url_content, list_dir, read_file, write_file, run_script, codebase_search.
Reglas Críticas:
1. Solo puedes ejecutar UNA herramienta por turno. 
2. Usa el formato :::TOOL_CALL::: de forma estricta.
3. Si descubriste algo, aplicaste una mejora, o ya terminaste tu investigación, finaliza el ciclo respondiendo con "TERMINADO: <resumen de tus actos>".`;

        const body = {
            contents: context,
            system_instruction: { parts: [{ text: systemInstruction }] },
            generationConfig: { temperature: 0.6, maxOutputTokens: 2048 }
        };

        const res = await fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }});
        return await res.json();
    }

    private async cycle() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('\n[EvolutionDaemon] 🧠 WAKING UP: Iniciando ciclo de Evolución Cognitiva...');

        let context = [ { role: 'user', parts: [{ text: 'INICIO DE CICLO AUTÓNOMO: Investiga tus archivos /nexa, busca formas de reducir deuda técnica, agrega un archivo con tus pensamientos a docs/, o prueba nuevas capacidades en la web.' }] } ];
        
        let iter = 0;
        const MAX_ITER = 15;
        
        while (iter < MAX_ITER) {
            iter++;
            try {
                const data = await this.promptGemini(context);
                
                if (data.error) {
                    console.error(`[EvolutionDaemon] API Error: ${data.error.message}`);
                    break;
                }

                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) break;
                
                console.log(`[EvolutionDaemon] 💭 Pensamiento: ${text.substring(0, 150).replace(/\n/g, ' ')}...`);
                
                if (text.includes('TERMINADO:')) {
                    console.log(`\n[EvolutionDaemon] ✅ Ciclo Terminado Éxitosamente:\n${text}`);
                    break;
                }

                const toolMatch = text.match(/:::TOOL_CALL:::([\s\S]*?):::END_TOOL_CALL:::/);
                if (toolMatch) {
                    const toolObj = JSON.parse(toolMatch[1]);
                    console.log(`[EvolutionDaemon] 🛠️ Ejecutando Herramienta Autónoma: ${toolObj.name}`);
                    
                    const result = await this.toolOrchestrator.execute(toolObj.name, toolObj.args, { userId: 'nexa-daemon' });
                    // Limitar tamaño de output para evitar pasarse de tokens
                    let resString = typeof result === 'string' ? result : JSON.stringify(result);
                    if (resString.length > 30000) resString = resString.substring(0, 30000) + '... (trunced)';
                    
                    context.push({ role: 'model', parts: [{ text: text }] });
                    context.push({ role: 'user', parts: [{ text: `RESULTADO_HERRAMIENTA (${toolObj.name}): ${resString}` }] });
                } else {
                    console.log('[EvolutionDaemon] ⚠️ El modelo no llamó a ninguna herramienta ni finalizó correctamente. Forzando cierre del ciclo.');
                    break;
                }

            } catch (e: any) {
                console.error('[EvolutionDaemon] 🚨 Fatal Error en el ReAct Loop:', e.message);
                break;
            }
        }

        this.isRunning = false;
        console.log('[EvolutionDaemon] 💤 El Daemon volverá a dormir hasta el próximo ciclo.\n');
    }
}
