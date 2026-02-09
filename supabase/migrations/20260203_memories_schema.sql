-- Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- Create the memories table
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade shadow-sm, -- Added shadow-sm here for consistency if needed, but standard DDL doesn't need it. Fix:
  -- Correction: id is standard. user_id should be references auth.users
  content text not null,
  role text check (role in ('user', 'assistant')),
  embedding vector(768), -- Adjust dimensions if using Gemini embeddings (768 is standard for text-embedding-004)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.memories enable row level security;

-- Create RLS Policies
create policy "Users can view their own memories"
  on public.memories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own memories"
  on public.memories for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own memories"
  on public.memories for delete
  using (auth.uid() = user_id);

-- Create a function to match memories based on vector similarity
create or replace function match_memories (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    memories.id,
    memories.content,
    1 - (memories.embedding <=> query_embedding) as similarity
  from memories
  where 1 - (memories.embedding <=> query_embedding) > match_threshold
  order by memories.embedding <=> query_embedding
  limit match_count;
end;
$$;
