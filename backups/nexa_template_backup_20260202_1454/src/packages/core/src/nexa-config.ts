export const nexaConfig = {
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
        llm: {
            provider: 'ollama',
            defaultModel: 'llama3.2:1b', // Even faster default
            fallbackModel: 'llama3.2:3b',
            timeout: 10000,
            streaming: true,
            quantizedModels: {
                'chat': 'llama3.2:3b',
                'fast-chat': 'llama3.2:1b',
                'code': 'codellama:7b',
                'reasoning': 'deepseek-r1:8b'
            },
            modelMapping: {
                'chat': 'llama3.2:3b',
                'code': 'codellama:7b',
                'reasoning': 'deepseek-r1:8b',
                'creative': 'mistral:7b'
            }
        },
        providers: {
            ollama: {
                enabled: true,
                url: 'http://localhost:11434',
                models: ['llama3.2:3b', 'llama3.2:1b', 'deepseek-r1:8b', 'llama3:latest', 'mistral', 'codellama']
            },
            openai: {
                enabled: false,
                apiKey: process.env.OPENAI_API_KEY,
                models: ['gpt-4', 'gpt-3.5-turbo']
            }
        },
        startup: {
            preloadModels: ['llama3.2:3b'],
            warmupPrompt: 'ping'
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
}    
