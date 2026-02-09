import { Sandbox, SandboxExecutionOptions, SandboxExecutionResult } from './types';
export declare class VM implements Sandbox {
    type: string;
    private runtime;
    private options;
    constructor(runtime: string, options: any);
    execute(options: SandboxExecutionOptions): Promise<SandboxExecutionResult>;
}
//# sourceMappingURL=vm.d.ts.map