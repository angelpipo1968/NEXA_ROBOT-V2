/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_GEMINI_API_KEY: string
    readonly VITE_OPENAI_API_KEY: string
    readonly VITE_ANTHROPIC_API_KEY: string
    readonly VITE_DEEPSEEK_API_KEY: string
    readonly VITE_GROQ_API_KEY: string
    readonly VITE_BRAVE_API_KEY: string
    readonly VITE_TAVILY_API_KEY: string
    readonly VITE_GOOGLE_CSE_API_KEY: string
    readonly VITE_GOOGLE_CSE_ID: string
    readonly VITE_ELEVENLABS_API_KEY: string
    readonly VITE_ELEVENLABS_WSEC: string
    readonly VITE_OLLAMA_URL: string
    readonly VITE_BACKEND_URL: string
    readonly VITE_WS_SYNC_SERVER: string
    readonly VITE_NEXA_CLOUD_MODE: string
    readonly VITE_OPENWEATHER_API_KEY: string
    readonly VITE_EXCHANGERATE_API_KEY: string
    readonly VITE_NEWS_API_KEY: string
    readonly VITE_ALPHA_VANTAGE_API_KEY: string
    readonly VITE_DEFAULT_AI_PROVIDER: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
