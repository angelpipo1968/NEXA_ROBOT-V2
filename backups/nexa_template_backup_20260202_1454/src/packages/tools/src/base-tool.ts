import { ExecutionContext, ToolResult, ToolValidationResult } from './types';

export abstract class Tool {
    abstract name: string;
    abstract description: string;
    abstract parameters: any;
    requiresSandbox: boolean = false;

    validate(params: any): ToolValidationResult {
        // Basic validation implementation
        const errors: string[] = [];
        // Simplified validation logic for MVP
        if (!params && this.parameters) {
            // errors.push('Parameters required'); 
        }
        return { valid: errors.length === 0, errors };
    }

    abstract execute(params: any, context: ExecutionContext): Promise<ToolResult>;

    // Optional methods that might be used by specific tools or orchestrator
    protected calculateConfidence(verifications: any[]): number {
        return 1.0;
    }
}
