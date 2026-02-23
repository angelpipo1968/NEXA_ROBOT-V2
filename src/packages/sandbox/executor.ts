// src/packages/sandbox/executor.ts - Ejecución aislada de código
import { WebContainer } from '@webcontainer/api';

export class SecureExecutor {
    private container: WebContainer | null = null;

    async init() {
        this.container = await WebContainer.boot();
        await this.container.mount({
            'package.json': { file: { contents: JSON.stringify({ type: 'module' }) } },
            'src': { directory: {} }
        });
    }

    async execute(code: string, options: { timeout?: number } = {}) {
        if (!this.container) throw new Error('Sandbox no inicializado');

        // 1. Escribir código en entorno aislado
        await this.container.fs.writeFile('/src/agent-script.js', classToNodeValid(code));

        // 2. Ejecutar con timeout y captura de salida (saltando instalación para este POC)
        const process = await this.container.spawn('node', ['/src/agent-script.js']);
        const output: string[] = [];

        process.output.pipeTo(new WritableStream({
            write(chunk) { output.push(chunk); }
        }));

        const exitCode = await Promise.race([
            process.exit,
            new Promise<number>((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT')), options.timeout || 30000)
            )
        ]);

        return { success: exitCode === 0, output, exitCode };
    }

    // Auto-limpieza post-ejecución
    async reset() {
        try {
            await this.container?.fs.rm('/src', { recursive: true });
            await this.container?.fs.mkdir('/src');
        } catch (e) { /* ignore */ }
    }
}

function classToNodeValid(code: string) {
    // Sanitiza el TS simple a Node JS si es requerido
    return code;
}
