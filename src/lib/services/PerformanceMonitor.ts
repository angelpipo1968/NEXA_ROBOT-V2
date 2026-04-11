import { useAutonomyStore } from '@/store/useAutonomyStore';

export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private startTime: number = 0;

    private constructor() { }

    public static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    /**
     * Inicia la medición de una operación (ej: llamada a la IA)
     */
    public startOperation() {
        this.startTime = performance.now();
    }

    /**
     * Finaliza la medición y registra los resultados en el AutonomyStore
     */
    public endOperation(provider: string = 'gemini') {
        if (this.startTime === 0) return;
        
        const duration = performance.now() - this.startTime;
        this.startTime = 0;

        useAutonomyStore.getState().updateMetrics(duration, provider);
        
        // Si la latencia es demasiado alta (> 5s), loggear para reflexión
        if (duration > 5000) {
            useAutonomyStore.getState().addLog(`ALERTA: Alta latencia detectada en ${provider} (${(duration / 1000).toFixed(2)}s).`);
        }
    }

    /**
     * Detecta si el sistema debería cambiar a un modelo más ligero
     */
    public shouldOptimize(): boolean {
        const { avgLatency } = useAutonomyStore.getState().metrics;
        return avgLatency > 3000; // Si el promedio supera los 3 segundos
    }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
