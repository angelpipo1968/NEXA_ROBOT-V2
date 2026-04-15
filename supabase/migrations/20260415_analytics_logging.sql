-- Migration: Add analytics and logging tables
-- Purpose: Track inference costs and structured activity logs

-- ═══════════════════════════════════════════════════════════────
-- INFERENCE METRICS TABLE
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.inference_metrics (
  id uuid primary key default gen_random_uuid(),
  model text not null,
  action text not null check (action in ('chat', 'embedding', 'image_generation')),
  tokens_used int default 0,
  latency_ms int not null,
  cost_usd numeric(10, 8) default 0,
  success boolean default true,
  error_message text,
  user_id uuid references auth.users(id) on delete cascade,
  conversation_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices para búsquedas rápidas
create index if not exists idx_inference_model on public.inference_metrics(model);
create index if not exists idx_inference_user_id on public.inference_metrics(user_id);
create index if not exists idx_inference_created_at on public.inference_metrics(created_at);
create index if not exists idx_inference_success on public.inference_metrics(success);

-- Enable RLS
alter table public.inference_metrics enable row level security;

-- Policies
create policy "Users can view their own inference metrics"
  on public.inference_metrics for select
  using (auth.uid() = user_id or user_id is null);

-- ═══════════════════════════════════════════════════════════════
-- ACTIVITY LOGS TABLE
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('debug', 'info', 'warn', 'error')),
  context text not null,
  action text not null,
  data jsonb default '{}'::jsonb,
  error text,
  user_id uuid references auth.users(id) on delete cascade,
  conversation_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices
create index if not exists idx_activity_level on public.activity_logs(level);
create index if not exists idx_activity_context on public.activity_logs(context);
create index if not exists idx_activity_user_id on public.activity_logs(user_id);
create index if not exists idx_activity_created_at on public.activity_logs(created_at);

-- Enable RLS
alter table public.activity_logs enable row level security;

-- Policies
create policy "Users can view their own activity logs"
  on public.activity_logs for select
  using (auth.uid() = user_id);

create policy "Service role can view all activity logs"
  on public.activity_logs for select
  using (auth.role() = 'service_role');

-- Allow authenticated users to insert their own logs
create policy "Users can insert their own logs"
  on public.activity_logs for insert
  with check (auth.uid() = user_id);
