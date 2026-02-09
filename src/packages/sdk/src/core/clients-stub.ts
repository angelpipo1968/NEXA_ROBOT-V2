export class ChatClient {
    constructor(private axios: any, private config: any) { }
    async send(params: any): Promise<any> { return { message: { role: 'assistant', content: 'Stub response' } }; }
}

export class ToolsClient {
    constructor(private axios: any, private config: any) { }
    async execute(name: string, params: any, options: any): Promise<any> { return { success: true, data: {} }; }
}

export class MemoryClient {
    constructor(private axios: any, private config: any) { }
}
