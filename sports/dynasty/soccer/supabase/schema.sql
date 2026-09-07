-- Dynasty coaching database — core schema
-- Run once in the Supabase SQL Editor for the "dynasty" project.
-- Designed to hold every sport / team / season, not just soccer.

-- ---------------------------------------------------------------
-- Sports (soccer, baseball, ...)
-- ---------------------------------------------------------------
create table if not exists public.sports (
  id text primary key,                 -- 'soccer', 'baseball'
  name text not null
);

-- ---------------------------------------------------------------
-- Teams (one row per team per season)
-- ---------------------------------------------------------------
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  sport_id text not null references public.sports(id),
  slug text unique not null,           -- 'dynasty-soccer-fall-2026'
  name text not null,
  season text,                         -- 'Fall 2026'
  age_group text,                      -- 'U8', '7 Year Old', ...
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Players (a kid exists once, across sports and seasons)
-- ---------------------------------------------------------------
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  birth_year integer,
  notes text,
  created_at timestamptz not null default now(),
  constraint players_name_unique unique (first_name, last_name)
);

-- ---------------------------------------------------------------
-- Roster membership (player <-> team)
-- ---------------------------------------------------------------
create table if not exists public.team_players (
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  jersey_number integer,
  position text,
  added_at timestamptz not null default now(),
  primary key (team_id, player_id)
);

-- ---------------------------------------------------------------
-- Guardians / parent contacts (structure only — no data seeded yet)
-- Never exposed to the anon key. Manage in the dashboard for now.
-- ---------------------------------------------------------------
create table if not exists public.guardians (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.player_guardians (
  player_id uuid not null references public.players(id) on delete cascade,
  guardian_id uuid not null references public.guardians(id) on delete cascade,
  relationship text,                   -- 'mother', 'father', 'guardian'
  is_primary boolean not null default false,
  primary key (player_id, guardian_id)
);

-- ---------------------------------------------------------------
-- Row Level Security
-- Public (anon) can READ roster tables. Nothing else.
-- Writes happen in the Supabase dashboard until auth is added in phase 2.
-- ---------------------------------------------------------------
alter table public.sports           enable row level security;
alter table public.teams            enable row level security;
alter table public.players          enable row level security;
alter table public.team_players     enable row level security;
alter table public.guardians        enable row level security;
alter table public.player_guardians enable row level security;

drop policy if exists "public can read sports"       on public.sports;
drop policy if exists "public can read teams"        on public.teams;
drop policy if exists "public can read players"      on public.players;
drop policy if exists "public can read team_players" on public.team_players;

create policy "public can read sports"       on public.sports       for select to anon, authenticated using (true);
create policy "public can read teams"        on public.teams        for select to anon, authenticated using (true);
create policy "public can read players"      on public.players      for select to anon, authenticated using (true);
create policy "public can read team_players" on public.team_players for select to anon, authenticated using (true);

-- Explicit grants so this works whether or not "Automatically expose new tables" is on.
grant usage on schema public to anon, authenticated;
grant select on public.sports, public.teams, public.players, public.team_players to anon, authenticated;
revoke all on public.guardians, public.player_guardians from anon, authenticated;
