import { Sandbox, SandboxExecutionOptions, SandboxExecutionResult } from './types';
export declare class DockerSandbox implements Sandbox {
    type: string;
    private image;
    private options;
    constructor(image: string, options: any);
    execute(options: SandboxExecutionOptions): Promise<SandboxExecutionResult>;
}
export declare class DatabaseSandbox implements Sandbox {
    type: string;
    private dialect;
    private options;
    constructor(dialect: string, options: any);
    execute(options: SandboxExecutionOptions): Promise<SandboxExecutionResult>;
}
//# sourceMappingURL=docker.d.ts.map