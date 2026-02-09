import { Tool } from '../base-tool';
import { ExecutionContext, ToolResult } from '../types';
export declare class WebSearchTool extends Tool {
    name: string;
    description: string;
    parameters: {
        query: {
            type: string;
            required: boolean;
        };
        sources: {
            type: string;
            items: {
                type: string;
                enum: string[];
            };
            default: string[];
        };
        maxResults: {
            type: string;
            default: number;
        };
        timeRange: {
            type: string;
            enum: string[];
        };
    };
    execute(params: any, context: ExecutionContext): Promise<ToolResult>;
    private unifyResults;
    private verifyResults;
    private checkFactuality;
    private checkRecency;
    private checkSourceCredibility;
    private generateSummary;
    private getSourceBreakdown;
}
//# sourceMappingURL=web-search.d.ts.map