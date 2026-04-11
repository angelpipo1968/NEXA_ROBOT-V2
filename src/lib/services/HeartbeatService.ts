import { reflectionService } from './ReflectionService';
import { newsService } from './newsService';
import { memoryBridge } from '../memoryBridge';
import { useAutonomyStore } from '@/store/useAutonomyStore';
import { useChatStore } from '@/store/useChatStore';

export class HeartbeatService {
    private static instance: HeartbeatService;
    private timer: any = null;
    private readonly INTERVAL = 1000 * 60 * 60; // 1 Hora en producción
    private readonly MIN_INTERVAL = 1000 * 60 * 5; // 5 Minutos mínimo entre reflexiones

    private constructor() { }

    public static getInstance(): HeartbeatService {
        if (!HeartbeatService.instance) {
            HeartbeatService.instance = new HeartbeatService();
        }
        return HeartbeatService.instance;
    }

    /**
     * Inicia el latido del corazón de Nexa (Ciclo de vida autónomo)
     */
    public start() {
        if (this.timer) return;
        
        console.log('[HeartbeatService] ❤️ Latido de Nexa iniciado (Consolas de Autonomía activadas).');
        
        // Primer pulso (Desfasado para no saturar el inicio de la app)
        setTimeout(() => this.pulse(), 10000);

        // Ciclo recurrente
        this.timer = setInterval(() => this.pulse(), this.INTERVAL);
    }

    private async pulse() {
        const now = Date.now();
        const lastHeartbeat = useAutonomyStore.getState().lastHeartbeat || 0;
        const addLog = useChatStore.getState().addTerminalLog;

        // 1. Fase de Auto-Reflexión (Solo si ha pasado el tiempo necesario)
        if (now - lastHeartbeat > this.MIN_INTERVAL) {
            addLog('❤️ [HEARTBEAT] Latido detectado. Iniciando tareas autónomas...');
            
            // Tarea A: Reflexion sobre el comportamiento
            await reflectionService.performReflection();

            // Tarea B: Búsqueda proactiva de noticias (Actualización de conocimiento global)
            try {
                const news = await newsService.getLatestNews('tecnología inteligencia artificial');
                if (news && news.length > 0) {
                    await memoryBridge.save(`NOTICIAS DEL DÍA (Heartbeat): ${news.slice(0, 3).map((n:any) => n.title).join(', ')}`, 'system', { tool: 'heartbeat_news' });
                    addLog('Conocimiento global actualizado vía Heartbeat.');
                }
            } catch (e) {
                console.warn('[HeartbeatService] Error en búsqueda proactiva de noticias:', e);
            }

            useAutonomyStore.getState().setLastHeartbeat(now);
        } else {
            console.log('[HeartbeatService] ❤️ Latido silenciado (Demasiado pronto para el siguiente ciclo reflexivo).');
        }
    }

    public stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}

export const heartbeatService = HeartbeatService.getInstance();
