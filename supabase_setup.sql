-- Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- Create a table to store your memories / chat history
create table memories (
  id bigserial primary key,
  content text,
  role text,
  embedding vector(768), -- Gemini text-embedding-004 dimension is 768
  user_id uuid,          -- Link to auth.users
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create a function to search for memories
create or replace function match_memories (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  role text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    memories.id,
    memories.content,
    memories.role,
    1 - (memories.embedding <=> query_embedding) as similarity
  from memories
  where 1 - (memories.embedding <=> query_embedding) > match_threshold
  order by memories.embedding <=> query_embedding
  limit match_count;
end;
$$;
