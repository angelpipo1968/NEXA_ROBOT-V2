import { EventEmitter } from 'events';
import { AxiosInstance } from 'axios';
import { EmbeddingClient } from './embeddings';
import { ChatClient, ToolsClient, MemoryClient } from './clients-stub';
import { NexaConfig, HealthResponse, SessionOptions, Session, ChatMessage, StreamOptions, ChatChunk } from './types';
export declare class NexaClient extends EventEmitter {
    private apiKey;
    private baseURL;
    protected axios: AxiosInstance;
    private config;
    embeddings: EmbeddingClient;
    chat: ChatClient;
    tools: ToolsClient;
    memory: MemoryClient;
    constructor(config: NexaConfig);
    private initializeAxios;
    health(): Promise<HealthResponse>;
    createSession(options?: SessionOptions): Promise<Session>;
    streamChat(messages: ChatMessage[], options?: StreamOptions): Promise<AsyncIterable<ChatChunk>>;
    private createStream;
}
//# sourceMappingURL=nexa.d.ts.map