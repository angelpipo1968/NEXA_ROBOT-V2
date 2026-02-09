import { supabase } from './supabase';
import { geminiClient } from './gemini';

export const memoryService = {
    addMemory: async (content: string, role: 'user' | 'assistant') => {
        // Only store if content is substantial
        if (content.length < 5) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const embedding = await geminiClient.getEmbedding(content);
            if (!embedding || embedding.length === 0) return;

            const { error } = await supabase
                .from('memories')
                .insert({
                    content,
                    role,
                    user_id: user.id,
                    embedding // Make sure validation allows this
                });

            if (error) console.error('Error saving memory:', error);
        } catch (err) {
            console.error('Memory save failed:', err);
        }
    },

    searchMemories: async (query: string, limit = 5): Promise<string[]> => {
        try {
            const embedding = await geminiClient.getEmbedding(query);
            if (!embedding || embedding.length === 0) return [];

            const { data, error } = await supabase.rpc('match_memories', {
                query_embedding: embedding,
                match_threshold: 0.7,
                match_count: limit
            });

            if (error) {
                // If RPC fails (table missing), fail silently
                console.warn('Memory search failed (DB likely not setup):', error.message);
                return [];
            }

            return data.map((m: any) => m.content);
        } catch (err) {
            console.error('Memory search error:', err);
            return [];
        }
    }
};
