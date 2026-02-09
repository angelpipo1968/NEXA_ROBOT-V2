import { NexaClient, ChatMessage, ToolResult, StreamOptions, SendOptions, NexaConfig } from '../core';
export declare function useNexa(apiKey: string, config?: Partial<NexaConfig>): {
    client: NexaClient | null;
    messages: ChatMessage[];
    isLoading: boolean;
    error: Error | null;
    sendMessage: (content: string, options?: SendOptions) => Promise<ChatMessage>;
    streamMessage: (content: string, options?: StreamOptions) => Promise<AsyncIterable<string>>;
    executeTool: (toolName: string, parameters: any) => Promise<ToolResult>;
    clearMessages: () => void;
    sessionId: string | null;
};
//# sourceMappingURL=useNexa.d.ts.map