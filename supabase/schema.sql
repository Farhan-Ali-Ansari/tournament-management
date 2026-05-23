-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default '',
  mode text not null default 'league' check (mode in ('league', 'knockout', 'custom_league', 'custom_knockout')),
  teams jsonb not null default '[]'::jsonb,
  matches jsonb not null default '[]'::jsonb,
  knockout_rounds jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tournaments_user_id_idx on public.tournaments (user_id);

-- Required: table privileges for Supabase API roles (RLS alone is not enough)
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on table public.tournaments to authenticated;
grant select, insert, update, delete on table public.tournaments to service_role;

alter table public.tournaments enable row level security;

drop policy if exists "Users can view own tournaments" on public.tournaments;
drop policy if exists "Users can insert own tournaments" on public.tournaments;
drop policy if exists "Users can update own tournaments" on public.tournaments;
drop policy if exists "Users can delete own tournaments" on public.tournaments;

create policy "Users can view own tournaments"
  on public.tournaments for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own tournaments"
  on public.tournaments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own tournaments"
  on public.tournaments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own tournaments"
  on public.tournaments for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tournaments_updated_at on public.tournaments;
create trigger tournaments_updated_at
  before update on public.tournaments
  for each row execute function public.handle_updated_at();
