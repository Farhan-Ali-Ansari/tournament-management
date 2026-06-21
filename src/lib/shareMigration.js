export const SHARE_FIXTURES_MIGRATION_SQL = `-- Enable public fixture share links
alter table public.tournaments
  add column if not exists share_enabled boolean not null default false;

grant select on table public.tournaments to anon;

drop policy if exists "Anyone can view shared tournaments" on public.tournaments;

create policy "Anyone can view shared tournaments"
  on public.tournaments for select
  to anon
  using (share_enabled = true);`;

export function isShareMigrationError(err) {
  const msg = `${err?.message || ""} ${err?.details || ""}`.toLowerCase();
  return msg.includes("share_enabled") || msg.includes("column");
}
