-- Run once in Supabase SQL Editor to enable public fixture sharing links.

alter table public.tournaments
  add column if not exists share_enabled boolean not null default false;

grant select on table public.tournaments to anon;

drop policy if exists "Anyone can view shared tournaments" on public.tournaments;

create policy "Anyone can view shared tournaments"
  on public.tournaments for select
  to anon
  using (share_enabled = true);
