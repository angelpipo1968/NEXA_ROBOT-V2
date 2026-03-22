export type SwarmTaskType = 'ANALYZE_CONTEXT' | 'PREFETCH_MEMORY' | 'SUMMARIZE_LOGS' | 'GET_EMBEDDING' | 'SEMANTIC_SEARCH';

export interface SwarmTask {
    id: string;
    type: SwarmTaskType;
    payload: any;
}

export interface SwarmResult {
    id: string;
    status: 'success' | 'error';
    data?: any;
    error?: string;
}

class SwarmManager {
    private worker: Worker | null = null;
    private callbacks = new Map<string, (result: SwarmResult) => void>();

    init() {
        if (typeof window === 'undefined') return;
        
        if (!this.worker) {
            this.worker = new Worker(new URL('./swarm.worker.ts', import.meta.url), {
                type: 'module'
            });

            this.worker.onmessage = (e: MessageEvent<SwarmResult>) => {
                const { id } = e.data;
                const callback = this.callbacks.get(id);
                if (callback) {
                    callback(e.data);
                    this.callbacks.delete(id);
                }
            };
        }
    }

    async executeTask(type: SwarmTaskType, payload: any): Promise<SwarmResult> {
        return new Promise((resolve) => {
            if (!this.worker) this.init();
            
            const id = crypto.randomUUID();
            this.callbacks.set(id, resolve);
            
            this.worker?.postMessage({
                id,
                type,
                payload
            });
        });
    }

    terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}

export const swarmManager = new SwarmManager();
