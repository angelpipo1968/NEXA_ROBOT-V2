import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Fallback mock client for seamless demo experience
const mockSupabase = {
    auth: {
        getUser: async () => ({
            data: {
                user: {
                    email: 'demo@nexa.ai',
                    user_metadata: { full_name: 'Demo User' },
                    id: 'mock-user-id'
                }
            },
            error: null
        }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signUp: async (credentials: any) => {
            console.warn('[MockSupabase] Attempting signUp with:', credentials.email);
            return { data: { user: { id: 'mock-id', email: credentials.email }, session: null }, error: null };
        },
        signInWithPassword: async (credentials: any) => {
            console.warn('[MockSupabase] Attempting signIn with:', credentials.email);
            return { data: { user: { id: 'mock-id', email: credentials.email }, session: {} }, error: null };
        },
        signInWithOAuth: async (options: any) => {
            console.warn('[MockSupabase] Attempting OAuth with:', options.provider);
            alert(`Simulación: Redirigiendo a login de ${options.provider}... (Configura las llaves de Supabase para login real)`);
            return { data: { url: '#' }, error: null };
        },
        resetPasswordForEmail: async (email: string) => {
            console.warn('[MockSupabase] Reset password requested for:', email);
            alert(`Simulación: Correo de recuperación enviado a ${email}.`);
            return { data: {}, error: null };
        },
        updateUser: async (data: any) => {
            console.warn('[MockSupabase] Updating user with:', data);
            return { data: { user: { id: 'mock-id' } }, error: null };
        },
        signOut: async () => ({ error: null }),
        onAuthStateChange: (callback: any) => {
            // Simulate initial state
            setTimeout(() => callback('INITIAL_SESSION', null), 0);
            return { data: { subscription: { unsubscribe: () => { } } } };
        }
    },
    functions: {
        invoke: async (name: string, options: any) => {
            console.warn(`[MockSupabase] Cloud Hub Call: ${name}`, options.body);
            return { data: { candidates: [{ content: { parts: [{ text: `Simulación (Modo Demo): Nexa Cloud recibió tu consulta sobre: ${options.body.payload?.messages?.slice(-1)[0]?.parts[0]?.text || "nada"}` }] } }] }, error: null };
        }
    },
    from: (table: string) => ({
        select: () => ({
            eq: () => ({
                single: () => ({ data: null, error: null }),
                order: () => ({ data: [], error: null }),
            }),
            order: () => ({ data: [], error: null }),
        }),
        insert: () => ({
            select: () => ({
                single: () => ({ data: {}, error: null })
            })
        }),
        update: () => ({
            eq: () => ({
                select: () => ({
                    single: () => ({ data: {}, error: null })
                })
            })
        }),
        upsert: () => ({ data: {}, error: null }),
        delete: () => ({
            eq: () => ({ data: null, error: null })
        })
    }),
    rpc: (name: string, args: any) => {
        console.warn(`[MockSupabase] RPC Call: ${name}`, args);
        return { data: null, error: null };
    }
};

export const supabase = isSupabaseConfigured
    ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    })
    : (mockSupabase as any);

if (!isSupabaseConfigured) {
    console.warn('⚡ NEXA: Supabase credentials missing. Running in DEMO MODE.');
}
