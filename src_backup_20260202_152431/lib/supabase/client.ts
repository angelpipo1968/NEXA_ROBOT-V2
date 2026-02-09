import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (Singleton if needed, but createBrowserClient is cheap)
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (Service Role)
// server-side admin client moved to @/lib/supabase/admin.ts
