export declare class ChatClient {
    private axios;
    private config;
    constructor(axios: any, config: any);
    send(params: any): Promise<any>;
}
export declare class ToolsClient {
    private axios;
    private config;
    constructor(axios: any, config: any);
    execute(name: string, params: any, options: any): Promise<any>;
}
export declare class MemoryClient {
    private axios;
    private config;
    constructor(axios: any, config: any);
}
//# sourceMappingURL=clients-stub.d.ts.map