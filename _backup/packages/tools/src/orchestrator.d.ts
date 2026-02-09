import { Tool } from './base-tool';
import { ToolResult, ExecutionContext, ToolRoutingResult } from './types';
export declare class ToolOrchestrator {
    private tools;
    private sandbox;
    private permissionManager;
    constructor();
    private registerDefaultTools;
    registerTool(tool: Tool): void;
    execute(toolName: string, params: any, context: ExecutionContext): Promise<ToolResult>;
    route(query: string, availableTools: string[], context: ExecutionContext): Promise<ToolRoutingResult>;
    private logExecution;
    private analyzeIntent;
    private selectTool;
    private extractParameters;
}
//# sourceMappingURL=orchestrator.d.ts.map