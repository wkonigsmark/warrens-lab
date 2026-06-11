-- Emergency rollback for lock-submissions.sql.
-- Run only if submissions must be reopened.

begin;

grant usage on schema public to anon;
grant insert on public.pool_entries to anon;
grant insert on public.pool_entry_picks to anon;
grant usage on sequence public.pool_entry_picks_id_seq to anon;

drop policy if exists "public can submit entries" on public.pool_entries;
drop policy if exists "public can submit picks" on public.pool_entry_picks;

create policy "public can submit entries"
on public.pool_entries
for insert
to anon
with check (true);

create policy "public can submit picks"
on public.pool_entry_picks
for insert
to anon
with check (true);

commit;
