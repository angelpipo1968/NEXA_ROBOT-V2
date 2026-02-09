import { ExecutionContext, ToolResult, ToolValidationResult } from './types';
export declare abstract class Tool {
    abstract name: string;
    abstract description: string;
    abstract parameters: any;
    requiresSandbox: boolean;
    validate(params: any): ToolValidationResult;
    abstract execute(params: any, context: ExecutionContext): Promise<ToolResult>;
    protected calculateConfidence(verifications: any[]): number;
}
//# sourceMappingURL=base-tool.d.ts.map