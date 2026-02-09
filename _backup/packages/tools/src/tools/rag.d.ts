import { Tool } from '../base-tool';
import { ExecutionContext, ToolResult } from '../types';
interface IndexingResult {
    totalFiles: number;
    totalChunks: number;
    results: any[];
    collectionId: string;
}
export declare class RAGTool extends Tool {
    name: string;
    description: string;
    parameters: {
        query: {
            type: string;
            required: boolean;
        };
        collection: {
            type: string;
            required: boolean;
        };
        maxResults: {
            type: string;
            default: number;
        };
        similarityThreshold: {
            type: string;
            default: number;
        };
    };
    execute(params: any, context: ExecutionContext): Promise<ToolResult>;
    indexDocuments(files: File[], collection: string, userId: string): Promise<IndexingResult>;
    private retrieveContext;
    private generateAnswer;
    private verifyAgainstSources;
    private formatResponse;
}
export {};
//# sourceMappingURL=rag.d.ts.map