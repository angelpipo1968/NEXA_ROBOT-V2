import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fallback mock client if credentials are missing
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
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } })
    },
    from: () => ({
        select: () => ({
            eq: () => ({
                single: () => ({ data: null, error: null }),
                order: () => ({ data: [], error: null }),
            }),
            order: () => ({ data: [], error: null }),
        })
    })
};

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : (mockSupabase as any);

if (!supabaseUrl) {
    console.warn('Supabase credentials missing. Utilizing mock client.');
}
