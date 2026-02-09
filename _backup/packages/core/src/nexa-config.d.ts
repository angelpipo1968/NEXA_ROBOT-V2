export declare const nexaConfig: {
    security: {
        injectionDetection: {
            enabled: boolean;
            level: string;
            autoBlock: boolean;
            logThreats: boolean;
        };
        rateLimiting: {
            enabled: boolean;
            strategy: string;
            maxRequestsPerMinute: number;
            burstProtection: boolean;
        };
        sandbox: {
            enabled: boolean;
            type: string;
            isolation: string;
            timeout: number;
        };
    };
    tools: {
        enabled: boolean;
        defaultTools: string[];
        requireConfirmation: {
            code_execution: boolean;
            browser: boolean;
        };
        permissions: {
            user: string[];
            pro: string[];
            admin: string[];
        };
    };
    models: {
        routing: {
            enabled: boolean;
            strategy: string;
            fallback: boolean;
            cacheResponses: boolean;
        };
        providers: {
            ollama: {
                enabled: boolean;
                url: string;
                models: string[];
            };
            openai: {
                enabled: boolean;
                apiKey: string | undefined;
                models: string[];
            };
            anthropic: {
                enabled: boolean;
                apiKey: string | undefined;
                models: string[];
            };
        };
        switching: {
            autoSwitch: boolean;
            confirmSwitch: boolean;
            transferContext: boolean;
        };
    };
    memory: {
        vector: {
            enabled: boolean;
            provider: string;
            dimensions: number;
        };
        cache: {
            enabled: boolean;
            provider: string;
            ttl: number;
        };
    };
};
//# sourceMappingURL=nexa-config.d.ts.map