/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_GEMINI_API_KEY: string
    readonly VITE_BRAVE_API_KEY: string
    readonly VITE_GOOGLE_CSE_API_KEY: string
    readonly VITE_GOOGLE_CSE_ID: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
