import { NexaClient } from '../core/index';
import { NexaConfig, EmbeddingOptions, EmbeddingResult, SearchOptions, SearchResult } from '../core/types';
export interface WidgetOptions {
    theme?: 'light' | 'dark';
    position?: 'bottom-right' | 'bottom-left';
}
export declare class ChatWidget {
    private client;
    private container;
    private options;
    constructor(client: NexaBrowser, container: HTMLElement, options: WidgetOptions);
    initialize(): Promise<void>;
}
export declare class NexaBrowser extends NexaClient {
    private cache;
    private worker;
    constructor(config: NexaConfig);
    private setupWorker;
    embedWithWorker(text: string, options?: EmbeddingOptions): Promise<EmbeddingResult>;
    semanticSearch(query: string, documents: string[], options?: SearchOptions): Promise<SearchResult[]>;
    createChatWidget(container: HTMLElement, options?: WidgetOptions): Promise<ChatWidget>;
    private cosineSimilarity;
}
//# sourceMappingURL=index.d.ts.map