export const CORE_VERSION = '0.0.1';
export const APP_NAME = 'Nexa AI';

export * from './nexa-config';
export * from './types';
export const safetyFilter = {
    validate: async (message: string) => {
        return { allowed: true, reason: null };
    }
};

export const llmRouter = {
    route: async (params: any) => {
        return {
            content: "This is a mock response from llmRouter.",
            reasoning: "Mock reasoning",
            sources: [],
            metadata: {}
        };
    }
};
