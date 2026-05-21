-- Run in Supabase SQL Editor (after schema.sql)

create table if not exists public.saved_teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists saved_teams_user_name_lower_idx
  on public.saved_teams (user_id, lower(name));

create index if not exists saved_teams_user_id_idx on public.saved_teams (user_id);

grant select, insert, update, delete on table public.saved_teams to authenticated;
grant select, insert, update, delete on table public.saved_teams to service_role;

alter table public.saved_teams enable row level security;

drop policy if exists "Users can view own saved teams" on public.saved_teams;
drop policy if exists "Users can insert own saved teams" on public.saved_teams;
drop policy if exists "Users can update own saved teams" on public.saved_teams;
drop policy if exists "Users can delete own saved teams" on public.saved_teams;

create policy "Users can view own saved teams"
  on public.saved_teams for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own saved teams"
  on public.saved_teams for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own saved teams"
  on public.saved_teams for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own saved teams"
  on public.saved_teams for delete to authenticated
  using (auth.uid() = user_id);
