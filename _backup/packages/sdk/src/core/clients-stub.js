"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryClient = exports.ToolsClient = exports.ChatClient = void 0;
class ChatClient {
    constructor(axios, config) {
        this.axios = axios;
        this.config = config;
    }
    async send(params) { return { message: { role: 'assistant', content: 'Stub response' } }; }
}
exports.ChatClient = ChatClient;
class ToolsClient {
    constructor(axios, config) {
        this.axios = axios;
        this.config = config;
    }
    async execute(name, params, options) { return { success: true, data: {} }; }
}
exports.ToolsClient = ToolsClient;
class MemoryClient {
    constructor(axios, config) {
        this.axios = axios;
        this.config = config;
    }
}
exports.MemoryClient = MemoryClient;
//# sourceMappingURL=clients-stub.js.map