-- Safer public read for share links (no user_id exposed).
-- Run after share-fixtures.sql.

create or replace view public.shared_tournaments as
select
  id,
  name,
  mode,
  teams,
  matches,
  knockout_rounds,
  share_enabled,
  updated_at
from public.tournaments
where share_enabled = true;

grant select on public.shared_tournaments to anon;
grant select on public.shared_tournaments to authenticated;
