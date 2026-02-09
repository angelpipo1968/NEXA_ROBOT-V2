import { Tool } from '../base-tool';
import { ExecutionContext, ToolResult } from '../types';
export declare class CodeExecutionTool extends Tool {
    name: string;
    description: string;
    requiresSandbox: boolean;
    parameters: {
        language: {
            type: string;
            required: boolean;
            enum: string[];
        };
        code: {
            type: string;
            required: boolean;
        };
        timeout: {
            type: string;
            default: number;
        };
        memory: {
            type: string;
            default: number;
        };
        inputs: {
            type: string;
            items: {
                type: string;
            };
        };
    };
    execute(params: any, context: ExecutionContext): Promise<ToolResult>;
    private analyzeCodeSecurity;
    private selectSandbox;
    private checkForbiddenImports;
    private checkSystemCalls;
    private checkInfiniteLoops;
    private checkMemoryAbuse;
    private checkNetworkAccess;
    private calculateSecurityLevel;
    private getEnvironment;
    private analyzeExecution;
}
//# sourceMappingURL=code-execution.d.ts.map