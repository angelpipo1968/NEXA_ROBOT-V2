import { spawn, ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';

export type NexaStatus = 'stopped' | 'starting' | 'running' | 'error';

class NexaLocalBridge extends EventEmitter {
    private static instance: NexaLocalBridge;
    private processes: Map<string, { proc: ChildProcess; status: NexaStatus; logs: string[] }> = new Map();
    private binPath = 'c:\\nexa\\bin\\nexa.exe';

    private constructor() {
        super();
    }

    public static getInstance(): NexaLocalBridge {
        if (!NexaLocalBridge.instance) {
            NexaLocalBridge.instance = new NexaLocalBridge();
        }
        return NexaLocalBridge.instance;
    }

    public getStatus(id: string = 'llm'): { status: NexaStatus; logs: string[] } {
        const p = this.processes.get(id);
        return {
            status: p?.status || 'stopped',
            logs: p?.logs.slice(-50) || []
        };
    }

    public async start(id: string, modelId: string, port: number) {
        if (this.processes.get(id)?.proc) return;

        this.processes.set(id, { proc: null as any, status: 'starting', logs: [`Starting ${id} with model: ${modelId}...`] });
        this.emit('status', { id, status: 'starting' });

        try {
            // Some models need specific commands like 'nexa vlm' or just 'nexa serve'
            const isVlm = id.toLowerCase() === 'vlm' || modelId.toLowerCase().includes('vl');
            const cmd = isVlm ? 'vlm-server' : 'serve'; // Adjusting based on standard nexa CLI

            const proc = spawn(this.binPath, [cmd, '--model', modelId, '--port', port.toString()], {
                shell: true,
                windowsHide: true,
            });

            this.processes.get(id)!.proc = proc;

            proc.stdout?.on('data', (data) => {
                const text = data.toString();
                this.addLog(id, text);
                if (text.includes('Uvicorn running on') || text.includes('Server started')) {
                    this.processes.get(id)!.status = 'running';
                    this.emit('status', { id, status: 'running' });
                }
            });

            proc.stderr?.on('data', (data) => {
                this.addLog(id, `[ERROR] ${data.toString()}`, true);
            });

            proc.on('close', (code) => {
                this.addLog(id, `Process ${id} exited with code ${code}`);
                this.processes.get(id)!.status = 'stopped';
                this.processes.delete(id);
                this.emit('status', { id, status: 'stopped' });
            });

        } catch (error: any) {
            this.processes.get(id)!.status = 'error';
            this.addLog(id, `Failed to spawn: ${error.message}`, true);
        }
    }

    public stop(id: string) {
        const p = this.processes.get(id);
        if (p?.proc) {
            p.proc.kill();
            this.processes.delete(id);
            this.emit('status', { id, status: 'stopped' });
        }
    }

    private addLog(id: string, message: string, isError: boolean = false) {
        const p = this.processes.get(id);
        if (!p) return;
        const entry = `[${new Date().toLocaleTimeString()}] ${message.trim()}`;
        p.logs.push(entry);
        if (p.logs.length > 100) p.logs.shift();
        this.emit('log', { id, log: entry });
    }
}

export const nexaLocalBridge = NexaLocalBridge.getInstance();
