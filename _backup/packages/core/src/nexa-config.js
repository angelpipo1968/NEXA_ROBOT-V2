"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nexaConfig = void 0;
exports.nexaConfig = {
    // Seguridad
    security: {
        injectionDetection: {
            enabled: true,
            level: 'high',
            autoBlock: true,
            logThreats: true
        },
        rateLimiting: {
            enabled: true,
            strategy: 'adaptive',
            maxRequestsPerMinute: 100,
            burstProtection: true
        },
        sandbox: {
            enabled: true,
            type: 'docker',
            isolation: 'high',
            timeout: 10000
        }
    },
    // Herramientas
    tools: {
        enabled: true,
        defaultTools: ['web_search', 'rag_query', 'calculator'],
        requireConfirmation: {
            code_execution: true,
            browser: true
        },
        permissions: {
            user: ['web_search', 'calculator', 'rag_query'],
            pro: ['code_execution', 'browser'],
            admin: ['all']
        }
    },
    // Modelos
    models: {
        routing: {
            enabled: true,
            strategy: 'performance_based',
            fallback: true,
            cacheResponses: true
        },
        providers: {
            ollama: {
                enabled: true,
                url: 'http://localhost:11434',
                models: ['llama3', 'mistral', 'codellama']
            },
            openai: {
                enabled: false,
                apiKey: process.env.OPENAI_API_KEY,
                models: ['gpt-4', 'gpt-3.5-turbo']
            },
            anthropic: {
                enabled: false,
                apiKey: process.env.ANTHROPIC_API_KEY,
                models: ['claude-3-opus', 'claude-3-sonnet']
            }
        },
        switching: {
            autoSwitch: true,
            confirmSwitch: true,
            transferContext: true
        }
    },
    // Memoria
    memory: {
        vector: {
            enabled: true,
            provider: 'pgvector',
            dimensions: 1536
        },
        cache: {
            enabled: true,
            provider: 'redis',
            ttl: 300
        }
    }
};
//# sourceMappingURL=nexa-config.js.map