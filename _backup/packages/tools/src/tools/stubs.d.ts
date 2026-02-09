import { Tool, ToolResult, ExecutionContext } from '../base-tool';
import { SearchResult } from '../types';
export declare class SandboxManager {
    execute(tool: Tool, params: any, context: ExecutionContext): Promise<ToolResult>;
}
export declare class PermissionManager {
    check(userId: string, toolName: string, params: any): Promise<boolean>;
}
export declare function searchWeb(query: string, options: any): Promise<SearchResult>;
export declare function searchAcademic(query: string, options: any): Promise<SearchResult>;
export declare function searchNews(query: string, options: any): Promise<SearchResult>;
export declare class CodeExecutionTool extends Tool {
    name: string;
    description: string;
    parameters: {};
    requiresSandbox: boolean;
    execute(params: any, context: ExecutionContext): Promise<ToolResult>;
}
export declare class RAGTool extends Tool {
    name: string;
    description: string;
    parameters: {};
    execute(params: any, context: ExecutionContext): Promise<ToolResult>;
}
export declare class BrowserTool extends Tool {
    name: string;
    description: string;
    parameters: {};
    execute(params: any, context: ExecutionContext): Promise<ToolResult>;
}
export declare class CalculatorTool extends Tool {
    name: string;
    description: string;
    parameters: {};
    execute(params: any, context: ExecutionContext): Promise<ToolResult>;
}
//# sourceMappingURL=stubs.d.ts.map