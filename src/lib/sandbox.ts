import { WebContainer } from '@webcontainer/api';

/**
 * Service to manage the lifecycle of WebContainers for the sandbox execution.
 * 
 * Nexa uses this service to test the generated code in an ephemeral environment
 * before proposing changes or merging.
 */
class NexaSandbox {
    private webcontainerInstance: WebContainer | null = null;
    private isBooting = false;

    async getContainer(): Promise<WebContainer> {
        if (this.webcontainerInstance) return this.webcontainerInstance;
        if (this.isBooting) {
            return new Promise((resolve) => {
                const check = setInterval(() => {
                    if (this.webcontainerInstance) {
                        clearInterval(check);
                        resolve(this.webcontainerInstance);
                    }
                }, 100);
            });
        }

        this.isBooting = true;
        try {
            console.log('[SANDBOX] Booting WebContainer environment...');
            this.webcontainerInstance = await WebContainer.boot();
            console.log('[SANDBOX] WebContainer booted successfully!');
        } catch (error) {
            console.error('[SANDBOX] Failed to boot WebContainer:', error);
            throw error;
        } finally {
            this.isBooting = false;
        }

        return this.webcontainerInstance;
    }

    async mountFiles(files: Record<string, { file?: { contents: string | Uint8Array }, directory?: Record<string, any> }>) {
        const container = await this.getContainer();
        await container.mount(files as any);
        console.log('[SANDBOX] Files mounted.');
    }

    async installDependencies(terminalOutput?: (data: string) => void) {
        const container = await this.getContainer();
        const installProcess = await container.spawn('npm', ['install']);

        installProcess.output.pipeTo(new WritableStream({
            write(data) {
                if (terminalOutput) terminalOutput(data);
                console.log(`[npm config] ${data}`);
            }
        }));

        return installProcess.exit;
    }

    async runScript(scriptName: string, terminalOutput?: (data: string) => void) {
        const container = await this.getContainer();
        const scriptProcess = await container.spawn('npm', ['run', scriptName]);

        scriptProcess.output.pipeTo(new WritableStream({
            write(data) {
                if (terminalOutput) terminalOutput(data);
                console.log(`[npm run ${scriptName}] ${data}`);
            }
        }));

        return scriptProcess;
    }

    // Listens to development server url
    onServerReady(callback: (url: string) => void) {
        if (!this.webcontainerInstance) return;
        this.webcontainerInstance.on('server-ready', (port: number, url: string) => {
            console.log(`[SANDBOX] Server ready at ${url}`);
            callback(url);
        });
    }
}

export const sandboxService = new NexaSandbox();
