import { Sandbox, SandboxExecutionOptions, SandboxExecutionResult } from './types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const execAsync = promisify(exec);

export class LocalSandbox implements Sandbox {
    type = 'local';
    private runtime: string;

    constructor(runtime: string) {
        this.runtime = runtime;
    }

    async execute(options: SandboxExecutionOptions): Promise<SandboxExecutionResult> {
        const tempDir = os.tmpdir();
        const ext = this.runtime === 'python' ? '.py' : '.js';
        const filename = `nexa_exec_${Date.now()}${ext}`;
        const filepath = path.join(tempDir, filename);

        try {
            fs.writeFileSync(filepath, options.code);
            const cmd = this.runtime === 'python' ? `python "${filepath}"` : `node "${filepath}"`;
            
            const start = performance.now();
            const { stdout, stderr } = await execAsync(cmd, { timeout: 30000 });
            const executionTime = performance.now() - start;

            return {
                success: true,
                output: stdout || stderr || '[Success: No output]',
                executionTime,
                memoryUsed: 0
            };
        } catch (error: any) {
             return {
                success: false,
                output: error.stdout || '',
                error: error.stderr || error.message,
                executionTime: 0,
                memoryUsed: 0
             };
        } finally {
            try {
                if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
            } catch (e) {}
        }
    }
}
