-- Enable Row Level Security (RLS) for all tables
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- If chats and files tables exist, enable RLS for them too
-- ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Policy for memories: users can only see their own data
CREATE POLICY "Users can only access their own memories" 
ON memories 
FOR ALL 
USING (auth.uid() = user_id);

-- Policy for chats (assuming table name is 'chats' and has 'user_id' column)
-- CREATE POLICY "Users can only access their own chats" 
-- ON chats 
-- FOR ALL 
-- USING (auth.uid() = user_id);

-- Policy for files (assuming table name is 'files' and has 'user_id' column)
-- CREATE POLICY "Users can only access their own files" 
-- ON files 
-- FOR ALL 
-- USING (auth.uid() = user_id);

-- Ensure user_id is automatically set on insert (if not handled by app code)
-- ALTER TABLE memories ALTER COLUMN user_id SET DEFAULT auth.uid();
