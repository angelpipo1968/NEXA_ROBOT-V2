"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NexaClient = void 0;
const events_1 = require("events");
const axios_1 = __importDefault(require("axios"));
const embeddings_1 = require("./embeddings");
const clients_stub_1 = require("./clients-stub");
class NexaClient extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.config = {
            baseURL: 'https://api.nexa-ai.dev/v1',
            timeout: 30000,
            maxRetries: 3,
            ...config
        };
        this.apiKey = this.config.apiKey;
        this.baseURL = this.config.baseURL;
        this.axios = this.initializeAxios();
        // Initialize properties in constructor to satisfy TS strict property initialization
        this.embeddings = new embeddings_1.EmbeddingClient(this.axios, this.config);
        this.chat = new clients_stub_1.ChatClient(this.axios, this.config);
        this.tools = new clients_stub_1.ToolsClient(this.axios, this.config);
        this.memory = new clients_stub_1.MemoryClient(this.axios, this.config);
    }
    initializeAxios() {
        const instance = axios_1.default.create({
            baseURL: this.baseURL,
            timeout: this.config.timeout,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'X-Nexa-SDK-Version': '1.0.0'
            }
        });
        // Interceptor para retries
        instance.interceptors.response.use(response => response, async (error) => {
            const config = error.config;
            config.retryCount = config.retryCount || 0;
            if (config.retryCount < (this.config.maxRetries || 3)) {
                config.retryCount++;
                // Backoff exponencial
                const delay = Math.min(1000 * Math.pow(2, config.retryCount), 10000);
                await new Promise(resolve => setTimeout(resolve, delay));
                return instance(config);
            }
            return Promise.reject(error);
        });
        return instance;
    }
    // Note: initializeClients is merged into constructor to avoid TS errors
    async health() {
        const response = await this.axios.get('/health');
        return response.data;
    }
    async createSession(options) {
        const response = await this.axios.post('/sessions', options);
        return response.data;
    }
    async streamChat(messages, options = {}) {
        const sessionId = options.sessionId || await this.createSession().then(s => s.id);
        const response = await this.axios.post('/chat/stream', { messages, ...options }, { responseType: 'stream' });
        return this.createStream(response.data);
    }
    createStream(stream) {
        return {
            [Symbol.asyncIterator]: async function* () {
                for await (const chunk of stream) {
                    const data = JSON.parse(chunk.toString());
                    yield data;
                }
            }
        };
    }
}
exports.NexaClient = NexaClient;
//# sourceMappingURL=nexa.js.map