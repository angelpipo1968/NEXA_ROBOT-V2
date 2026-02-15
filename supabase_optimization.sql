-- Database Optimization Headers for Supabase

-- 1. Index for semantic search on memories (Vector Search)
-- Adjust 'lists' based on table size (rows / 1000)
CREATE INDEX IF NOT EXISTS idx_memories_embedding 
ON memories 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 2. Index for faster message history retrieval
CREATE INDEX IF NOT EXISTS idx_messages_user_created 
ON messages(user_id, created_at DESC);

-- 3. Maintenance (Run periodically)
-- VACUUM ANALYZE messages;
-- VACUUM ANALYZE memories;
