create table if not exists public.pool_entries (
  id uuid primary key default gen_random_uuid(),
  entry_code text unique not null,
  bracket_name text not null,
  email text not null,
  venmo text not null,
  status text not null default 'pending_payment',
  paid boolean not null default false,
  test_entry boolean not null default false,
  voided boolean not null default false,
  submitted_at timestamptz not null default now(),
  user_agent text,
  source text default 'world-cup-pool',
  payload jsonb not null default '{}'::jsonb,
  constraint pool_entries_status_check check (status in ('pending_payment', 'paid', 'voided', 'test'))
);

create table if not exists public.pool_entry_picks (
  id bigint generated always as identity primary key,
  entry_id uuid not null references public.pool_entries(id) on delete cascade,
  section text not null,
  group_letter text,
  rank integer not null,
  team_id text not null,
  team_name text not null,
  w_index numeric,
  w_index_rank integer,
  constraint pool_entry_picks_section_check check (section in ('group_order', 'third_place_order'))
);

create index if not exists pool_entries_submitted_at_idx on public.pool_entries (submitted_at desc);
create index if not exists pool_entries_status_idx on public.pool_entries (status);
create index if not exists pool_entries_paid_idx on public.pool_entries (paid);
create index if not exists pool_entry_picks_entry_id_idx on public.pool_entry_picks (entry_id);

alter table public.pool_entries enable row level security;
alter table public.pool_entry_picks enable row level security;

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
