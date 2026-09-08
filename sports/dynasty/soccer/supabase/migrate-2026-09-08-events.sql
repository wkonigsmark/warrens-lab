-- Migration: add events table to an existing dynasty DB (already ran schema.sql before 2026-09-08).
-- Also fills in age groups for the two teams that were missing them.

-- ---------------------------------------------------------------
-- Events: games, practices, byes — one row per team per occurrence
-- ---------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  event_date date not null,
  start_time time,
  end_time time,
  event_type text not null,            -- 'game' | 'practice' | 'training_game' | 'bye'
  opponent text,
  location text,
  notes text,
  created_at timestamptz not null default now(),
  constraint events_type_check check (event_type in ('game', 'practice', 'training_game', 'bye'))
);

create index if not exists events_team_date_idx on public.events (team_id, event_date);
create unique index if not exists events_unique_idx
  on public.events (team_id, event_date, event_type, coalesce(start_time, '00:00'::time));

alter table public.events enable row level security;
drop policy if exists "public can read events" on public.events;
create policy "public can read events" on public.events for select to anon, authenticated using (true);
grant select on public.events to anon, authenticated;

update public.teams set age_group = 'Co-Ed 6' where slug = 'cardiff-city-fall-2026' and age_group is null;
update public.teams set age_group = 'Co-Ed 5' where slug = 'fort-green-fall-2026'   and age_group is null;
