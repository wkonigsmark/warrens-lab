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

grant usage on schema public to anon;
grant insert on public.pool_entries to anon;
grant insert on public.pool_entry_picks to anon;
grant usage on sequence public.pool_entry_picks_id_seq to anon;

grant usage on schema public to service_role;
grant select, update, delete on public.pool_entries to service_role;
grant select on public.pool_entry_picks to service_role;

create or replace function public.get_pool_purse_summary()
returns table (
  total_entries bigint,
  paid_entries bigint,
  pending_entries bigint,
  total_purse integer,
  paid_purse integer,
  pending_purse integer,
  organizer_fee integer,
  net_pool integer,
  first_prize integer,
  second_prize integer,
  third_prize integer
)
language sql
security definer
set search_path = public
as $$
  with purse as (
    select
      count(*) filter (where voided = false and test_entry = false) as total_entries,
      count(*) filter (where voided = false and test_entry = false and paid = true) as paid_entries,
      count(*) filter (where voided = false and test_entry = false and paid = false) as pending_entries,
      (count(*) filter (where voided = false and test_entry = false) * 50)::numeric as total_purse,
      (count(*) filter (where voided = false and test_entry = false and paid = true) * 50)::numeric as paid_purse,
      (count(*) filter (where voided = false and test_entry = false and paid = false) * 50)::numeric as pending_purse
    from public.pool_entries
  )
  select
    total_entries,
    paid_entries,
    pending_entries,
    total_purse::integer,
    paid_purse::integer,
    pending_purse::integer,
    round(paid_purse * 0.05)::integer as organizer_fee,
    round(paid_purse * 0.95)::integer as net_pool,
    round((paid_purse * 0.95) * 0.70)::integer as first_prize,
    round((paid_purse * 0.95) * 0.20)::integer as second_prize,
    round((paid_purse * 0.95) * 0.10)::integer as third_prize
  from purse;
$$;

grant execute on function public.get_pool_purse_summary() to anon;

create or replace function public.get_public_scoreboard_entries()
returns table (
  id uuid,
  entry_code text,
  bracket_name text,
  status text,
  paid boolean,
  test_entry boolean,
  voided boolean,
  submitted_at timestamptz,
  payload jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    id,
    entry_code,
    bracket_name,
    status,
    paid,
    test_entry,
    voided,
    submitted_at,
    payload
  from public.pool_entries
  where voided = false
    and test_entry = false
  order by submitted_at desc;
$$;

grant execute on function public.get_public_scoreboard_entries() to anon;
