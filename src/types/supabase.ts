export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    plan: 'free' | 'pro' | 'enterprise'
                    credits: number
                    settings: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    plan?: 'free' | 'pro' | 'enterprise'
                    credits?: number
                    settings?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    plan?: 'free' | 'pro' | 'enterprise'
                    credits?: number
                    settings?: Json
                    created_at?: string
                    updated_at?: string
                }
                Relationships: any[]
            }
            conversations: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    model_used: string
                    message_count: number
                    tokens_used: number
                    is_archived: boolean
                    metadata: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    model_used?: string
                    message_count?: number
                    tokens_used?: number
                    is_archived?: boolean
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    model_used?: string
                    message_count?: number
                    tokens_used?: number
                    is_archived?: boolean
                    metadata?: Json
                    created_at?: string
                    updated_at?: string
                }
                Relationships: any[]
            }
            messages: {
                Row: {
                    id: string
                    conversation_id: string
                    role: 'user' | 'assistant' | 'system'
                    content: string
                    tokens: number
                    metadata: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    conversation_id: string
                    role: 'user' | 'assistant' | 'system'
                    content: string
                    tokens?: number
                    metadata?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    conversation_id?: string
                    role?: 'user' | 'assistant' | 'system'
                    content?: string
                    tokens?: number
                    metadata?: Json
                    created_at?: string
                }
                Relationships: any[]
            }
            documents: {
                Row: {
                    id: string
                    user_id: string
                    filename: string
                    file_type: string
                    file_size: number
                    content: string
                    metadata: Json
                    processed: boolean
                    chunks: string[] | null
                    summary: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    filename: string
                    file_type: string
                    file_size: number
                    content: string
                    metadata?: Json
                    processed?: boolean
                    chunks?: string[] | null
                    summary?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    filename?: string
                    file_type?: string
                    file_size?: number
                    content?: string
                    metadata?: Json
                    processed?: boolean
                    chunks?: string[] | null
                    summary?: string | null
                    created_at?: string
                }
                Relationships: any[]
            }
            memory_vectors: {
                Row: {
                    id: string
                    user_id: string
                    content: string
                    embedding: unknown // pgvector doesn't map perfectly in json unless defined specific
                    collection: string
                    metadata: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    content: string
                    embedding: unknown
                    collection?: string
                    metadata?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    content?: string
                    embedding?: unknown
                    collection?: string
                    metadata?: Json
                    created_at?: string
                }
                Relationships: any[]
            }
        },
        Views: {
            [_ in never]: never
        },
        Functions: {
            [_ in never]: never
        },
        Enums: {
            [_ in never]: never
        },
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
