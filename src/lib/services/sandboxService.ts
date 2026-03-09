import { WebContainer } from '@webcontainer/api';

class SandboxService {
    private static instance: SandboxService;
    private webcontainerInstance: WebContainer | null = null;

    private constructor() { }

    public static getInstance(): SandboxService {
        if (!SandboxService.instance) {
            SandboxService.instance = new SandboxService();
        }
        return SandboxService.instance;
    }

    public async boot() {
        if (this.webcontainerInstance) return this.webcontainerInstance;

        console.log('[Sandbox] 🚀 Booting WebContainer...');
        this.webcontainerInstance = await WebContainer.boot();
        return this.webcontainerInstance;
    }

    public async runCode(files: any, command: string, args: string[]) {
        const instance = await this.boot();

        // Mount files
        await instance.mount(files);

        // Run command
        const process = await instance.spawn(command, args);

        return new Promise((resolve) => {
            let output = '';
            process.output.pipeTo(new WritableStream({
                write(data) {
                    output += data;
                    console.log(`[Sandbox Output] ${data}`);
                }
            }));

            process.exit.then((code) => {
                console.log(`[Sandbox] Process exited with code ${code}`);
                resolve({ code, output });
            });
        });
    }
}

export const sandboxService = SandboxService.getInstance();
