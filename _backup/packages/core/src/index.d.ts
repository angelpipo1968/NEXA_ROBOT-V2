export declare const CORE_VERSION = "0.0.1";
export declare const APP_NAME = "Nexa AI";
export * from './nexa-config';
export * from './types';
export declare const safetyFilter: {
    validate: (message: string) => Promise<{
        allowed: boolean;
        reason: null;
    }>;
};
export declare const llmRouter: {
    route: (params: any) => Promise<{
        content: string;
        reasoning: string;
        sources: never[];
        metadata: {};
    }>;
};
//# sourceMappingURL=index.d.ts.map