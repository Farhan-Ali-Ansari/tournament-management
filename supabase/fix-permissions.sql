-- Run this in Supabase → SQL Editor if you see "permission denied for table tournaments"

-- 1) Let logged-in users access the table (required in addition to RLS policies)
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on table public.tournaments to authenticated;
grant select on table public.tournaments to anon;
grant select, insert, update, delete on table public.tournaments to service_role;

-- 2) Ensure RLS is on
alter table public.tournaments enable row level security;

-- 3) Recreate policies (safe to re-run)
drop policy if exists "Users can view own tournaments" on public.tournaments;
drop policy if exists "Users can insert own tournaments" on public.tournaments;
drop policy if exists "Users can update own tournaments" on public.tournaments;
drop policy if exists "Users can delete own tournaments" on public.tournaments;
drop policy if exists "Anyone can view shared tournaments" on public.tournaments;

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

create policy "Anyone can view shared tournaments"
  on public.tournaments for select
  to anon
  using (share_enabled = true);

-- Saved teams (run saved-teams.sql first if table is missing)
grant select, insert, update, delete on table public.saved_teams to authenticated;
grant select, insert, update, delete on table public.saved_teams to service_role;
