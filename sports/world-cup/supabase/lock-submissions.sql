-- RUN ONLY WHEN THE POOL IS OFFICIALLY CLOSED.
-- This blocks new anonymous entries without affecting reads, admin access,
-- existing entries, the public scoreboard, or purse summary functions.

begin;

drop policy if exists "public can submit entries" on public.pool_entries;
drop policy if exists "public can submit picks" on public.pool_entry_picks;

revoke insert on public.pool_entries from anon;
revoke insert on public.pool_entry_picks from anon;
revoke usage on sequence public.pool_entry_picks_id_seq from anon;

commit;
