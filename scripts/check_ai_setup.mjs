import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const envFiles = ['.env.local', '.env'];

function parseEnv(content) {
    const result = {};

    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;

        const eqIndex = line.indexOf('=');
        if (eqIndex === -1) continue;

        const key = line.slice(0, eqIndex).trim();
        let value = line.slice(eqIndex + 1).trim();

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        result[key] = value;
    }

    return result;
}

const env = {};
const loadedFiles = [];

for (const file of envFiles) {
    const fullPath = path.join(cwd, file);
    if (!fs.existsSync(fullPath)) continue;

    Object.assign(env, parseEnv(fs.readFileSync(fullPath, 'utf8')));
    loadedFiles.push(file);
}

const providers = [
    {
        name: 'Gemini',
        ok: Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY),
        detail: env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY
            ? 'Supabase Edge Function path configured'
            : 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY',
    },
    {
        name: 'OpenAI',
        ok: Boolean(env.VITE_OPENAI_API_KEY),
        detail: env.VITE_OPENAI_API_KEY ? 'API key found' : 'Missing VITE_OPENAI_API_KEY',
    },
    {
        name: 'Anthropic',
        ok: Boolean(env.VITE_ANTHROPIC_API_KEY),
        detail: env.VITE_ANTHROPIC_API_KEY ? 'API key found' : 'Missing VITE_ANTHROPIC_API_KEY',
    },
    {
        name: 'Groq',
        ok: Boolean(env.VITE_GROQ_API_KEY),
        detail: env.VITE_GROQ_API_KEY ? 'API key found' : 'Missing VITE_GROQ_API_KEY',
    },
    {
        name: 'DeepSeek',
        ok: Boolean(env.VITE_DEEPSEEK_API_KEY),
        detail: env.VITE_DEEPSEEK_API_KEY ? 'API key found' : 'Missing VITE_DEEPSEEK_API_KEY',
    },
    {
        name: 'Ollama',
        ok: Boolean(env.VITE_OLLAMA_URL || env.OLLAMA_HOST),
        detail: env.VITE_OLLAMA_URL || env.OLLAMA_HOST || 'Missing VITE_OLLAMA_URL / OLLAMA_HOST',
    },
];

console.log('Nexa AI setup check');
console.log(`Loaded env files: ${loadedFiles.length > 0 ? loadedFiles.join(', ') : 'none'}`);
console.log('');

for (const provider of providers) {
    console.log(`${provider.ok ? 'OK' : 'MISS'} ${provider.name}: ${provider.detail}`);
}

const availableProviders = providers.filter((provider) => provider.ok).map((provider) => provider.name);
console.log('');
console.log(`Available providers: ${availableProviders.length > 0 ? availableProviders.join(', ') : 'none'}`);

if (availableProviders.length === 0) {
    process.exitCode = 1;
}
