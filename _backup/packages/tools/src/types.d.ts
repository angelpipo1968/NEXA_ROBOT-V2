export interface ExecutionContext {
    userId: string;
    sessionId?: string;
    metadata?: any;
}
export interface ToolResult {
    success: boolean;
    error?: string;
    data: any;
    metadata?: any;
}
export interface ToolValidationResult {
    valid: boolean;
    errors: string[];
}
export interface SearchResult {
    title: string;
    url: string;
    content: string;
    source: string;
    publishedDate?: string;
}
export interface VerifiedResult extends SearchResult {
    verification: {
        factual: boolean;
        recent: boolean;
        credible: boolean;
        confidence: number;
    };
}
export interface ToolRoutingResult {
    tool: string;
    confidence: number;
    parameters: any;
    alternativeTools?: string[];
}
//# sourceMappingURL=types.d.ts.map