import { Json } from './supabase';

export interface ChatMessage {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    tokens: number;
    metadata: Json;
    created_at: string;
}

export interface Conversation {
    id: string;
    user_id: string;
    title: string;
    model_used: string;
    message_count: number;
    tokens_used: number;
    is_archived: boolean;
    metadata: Json;
    created_at: string;
    updated_at: string;
}
