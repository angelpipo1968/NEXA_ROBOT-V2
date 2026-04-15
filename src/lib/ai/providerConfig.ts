import type { AIEngine } from '@/store/aiStore';
import type { ModelOptions } from '@/services/ModelService';

type Provider = NonNullable<ModelOptions['provider']>;

const hasValue = (value: string | undefined) => typeof value === 'string' && value.trim().length > 0;

export const getAvailableProviders = (): Provider[] => {
    const providers: Provider[] = [];
    const env = import.meta.env;

    if (hasValue(env.VITE_DEFAULT_AI_PROVIDER) && isProvider(env.VITE_DEFAULT_AI_PROVIDER)) {
        providers.push(env.VITE_DEFAULT_AI_PROVIDER);
    }

    if (hasValue(env.VITE_SUPABASE_URL) && hasValue(env.VITE_SUPABASE_ANON_KEY)) providers.push('gemini');
    if (hasValue(env.VITE_GROQ_API_KEY)) providers.push('groq');
    if (hasValue(env.VITE_ANTHROPIC_API_KEY)) providers.push('anthropic');
    if (hasValue(env.VITE_DEEPSEEK_API_KEY)) providers.push('deepseek');
    if (hasValue(env.VITE_OLLAMA_URL)) providers.push('ollama');

    return [...new Set(providers)];
};

export const getDefaultProvider = (): Provider => {
    return getAvailableProviders()[0] || 'ollama';
};

export const resolveEngineToProvider = (engine: AIEngine): Provider => {
    switch (engine) {
        case 'gpt':
            return 'openai';
        case 'claude':
            return 'anthropic';
        case 'deepseek':
            return 'deepseek';
        case 'ollama':
            return 'ollama';
        case 'gemini':
        case 'nexa':
            return 'gemini';
        case 'auto':
        default:
            return getDefaultProvider();
    }
};

export const getEngineLabel = (engine: AIEngine): string => {
    const provider = resolveEngineToProvider(engine);

    if (engine === 'auto') {
        return `Auto (${provider})`;
    }

    return provider;
};

function isProvider(value: string): value is Provider {
    return ['gemini', 'groq', 'openai', 'anthropic', 'deepseek', 'ollama'].includes(value);
}
