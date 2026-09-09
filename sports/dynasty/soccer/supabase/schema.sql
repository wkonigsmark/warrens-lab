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
  live_scoring boolean not null default true,   -- false for rec-only age groups
  half_length_sec integer not null default 1200,
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

-- ===============================================================
-- Coach mode (PIN-gated) + live scoring
-- ===============================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------
-- Private settings (PIN hash). No API access at all.
-- ---------------------------------------------------------------
create table if not exists public.coach_settings (
  key text primary key,
  value text not null
);
alter table public.coach_settings enable row level security;
revoke all on public.coach_settings from anon, authenticated;

insert into public.coach_settings (key, value)
values ('coach_pin', extensions.crypt('2019', extensions.gen_salt('bf')))
on conflict (key) do update set value = excluded.value;

-- ---------------------------------------------------------------
-- Team flags for scoring
-- ---------------------------------------------------------------

-- ---------------------------------------------------------------
-- Coach-only per-roster evaluation + dated notes (private tables)
-- ---------------------------------------------------------------
create table if not exists public.player_evals (
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  skill smallint check (skill between 1 and 4),
  position_1 text,
  position_2 text,
  updated_at timestamptz not null default now(),
  primary key (team_id, player_id)
);
create table if not exists public.player_notes (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);
create index if not exists player_notes_idx on public.player_notes (team_id, player_id, created_at desc);
alter table public.player_evals enable row level security;
alter table public.player_notes enable row level security;
revoke all on public.player_evals, public.player_notes from anon, authenticated;

-- ---------------------------------------------------------------
-- Matches + goals (public read so parents can follow; writes via PIN RPCs)
-- ---------------------------------------------------------------
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique references public.events(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  status text not null default 'live' check (status in ('live', 'final')),
  half_length_sec integer not null default 1200,
  period integer not null default 1,              -- 1, 2, 3 = full time
  period_elapsed_before integer not null default 0,  -- seconds banked in this period before the current run
  period_started_at timestamptz,                  -- null when clock is stopped
  our_score integer not null default 0,
  their_score integer not null default 0,
  finalized_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  period integer not null,
  elapsed_sec integer not null,
  side text not null check (side in ('us', 'them')),
  scorer_id uuid references public.players(id) on delete set null,
  assist_id uuid references public.players(id) on delete set null,
  own_goal boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists goals_match_idx on public.goals (match_id, period, elapsed_sec);
alter table public.matches enable row level security;
alter table public.goals enable row level security;
drop policy if exists "public can read matches" on public.matches;
drop policy if exists "public can read goals" on public.goals;
create policy "public can read matches" on public.matches for select to anon, authenticated using (true);
create policy "public can read goals"   on public.goals   for select to anon, authenticated using (true);
grant select on public.matches, public.goals to anon, authenticated;

-- ---------------------------------------------------------------
-- PIN check helper (not callable from the API)
-- ---------------------------------------------------------------
create or replace function public.coach_check(pin text)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare h text;
begin
  select value into h from public.coach_settings where key = 'coach_pin';
  if h is null or pin is null or extensions.crypt(pin, h) <> h then
    perform pg_sleep(0.3);
    raise exception 'invalid_pin' using errcode = '28000';
  end if;
end $$;
revoke execute on function public.coach_check(text) from public, anon, authenticated;

create or replace function public.coach_verify_pin(pin text)
returns boolean language plpgsql security definer set search_path = public as $$
begin perform public.coach_check(pin); return true; end $$;

-- ---------------------------------------------------------------
-- Roster evals + notes
-- ---------------------------------------------------------------
create or replace function public.coach_get_roster(pin text, p_team_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform public.coach_check(pin);
  return coalesce((
    select jsonb_agg(row_to_json(r)) from (
      select p.id as player_id, p.first_name, p.last_name, tp.jersey_number,
             e.skill, e.position_1, e.position_2,
             n.note as latest_note, n.created_at as latest_note_at,
             (select count(*) from public.player_notes x where x.team_id = tp.team_id and x.player_id = p.id) as note_count
      from public.team_players tp
      join public.players p on p.id = tp.player_id
      left join public.player_evals e on e.team_id = tp.team_id and e.player_id = p.id
      left join lateral (
        select note, created_at from public.player_notes x
        where x.team_id = tp.team_id and x.player_id = p.id
        order by created_at desc limit 1
      ) n on true
      where tp.team_id = p_team_id
      order by p.last_name, p.first_name
    ) r
  ), '[]'::jsonb);
end $$;

create or replace function public.coach_save_eval(pin text, p_team_id uuid, p_player_id uuid,
                                                  p_skill integer, p_pos1 text, p_pos2 text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.coach_check(pin);
  insert into public.player_evals (team_id, player_id, skill, position_1, position_2, updated_at)
  values (p_team_id, p_player_id, p_skill, nullif(trim(p_pos1), ''), nullif(trim(p_pos2), ''), now())
  on conflict (team_id, player_id) do update
    set skill = excluded.skill, position_1 = excluded.position_1, position_2 = excluded.position_2, updated_at = now();
end $$;

create or replace function public.coach_get_notes(pin text, p_team_id uuid, p_player_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform public.coach_check(pin);
  return coalesce((
    select jsonb_agg(jsonb_build_object('id', id, 'note', note, 'created_at', created_at) order by created_at desc)
    from public.player_notes where team_id = p_team_id and player_id = p_player_id
  ), '[]'::jsonb);
end $$;

create or replace function public.coach_add_note(pin text, p_team_id uuid, p_player_id uuid, p_note text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r public.player_notes;
begin
  perform public.coach_check(pin);
  if trim(coalesce(p_note, '')) = '' then raise exception 'empty_note'; end if;
  insert into public.player_notes (team_id, player_id, note) values (p_team_id, p_player_id, trim(p_note)) returning * into r;
  return jsonb_build_object('id', r.id, 'note', r.note, 'created_at', r.created_at);
end $$;

create or replace function public.coach_delete_note(pin text, p_note_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.coach_check(pin);
  delete from public.player_notes where id = p_note_id;
end $$;

-- ---------------------------------------------------------------
-- Live match scoring
-- ---------------------------------------------------------------
create or replace function public.match_recount(p_match_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.matches m set
    our_score   = (select count(*) from public.goals g where g.match_id = m.id and g.side = 'us'),
    their_score = (select count(*) from public.goals g where g.match_id = m.id and g.side = 'them')
  where m.id = p_match_id;
$$;
revoke execute on function public.match_recount(uuid) from public, anon, authenticated;

-- Create (or fetch) the match for a schedule event.
create or replace function public.coach_match_open(pin text, p_event_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare mid uuid; t public.teams; ev public.events;
begin
  perform public.coach_check(pin);
  select id into mid from public.matches where event_id = p_event_id;
  if mid is not null then return mid; end if;
  select * into ev from public.events where id = p_event_id;
  if ev.id is null then raise exception 'no_such_event'; end if;
  select * into t from public.teams where id = ev.team_id;
  if not t.live_scoring then raise exception 'scoring_disabled'; end if;
  insert into public.matches (event_id, team_id, half_length_sec)
  values (ev.id, ev.team_id, t.half_length_sec) returning id into mid;
  return mid;
end $$;

-- Clock actions: 'start' | 'pause' | 'end_period'
create or replace function public.coach_match_clock(pin text, p_match_id uuid, p_action text)
returns void language plpgsql security definer set search_path = public as $$
declare m public.matches;
begin
  perform public.coach_check(pin);
  select * into m from public.matches where id = p_match_id for update;
  if m.id is null then raise exception 'no_such_match'; end if;
  if m.status = 'final' then raise exception 'match_final'; end if;
  if p_action = 'start' then
    if m.period >= 3 then raise exception 'full_time'; end if;
    if m.period_started_at is null then
      update public.matches set period_started_at = now() where id = m.id;
    end if;
  elsif p_action = 'pause' then
    if m.period_started_at is not null then
      update public.matches set
        period_elapsed_before = m.period_elapsed_before + extract(epoch from now() - m.period_started_at)::int,
        period_started_at = null
      where id = m.id;
    end if;
  elsif p_action = 'end_period' then
    update public.matches set period = least(m.period + 1, 3), period_elapsed_before = 0, period_started_at = null where id = m.id;
  else
    raise exception 'bad_action';
  end if;
end $$;

create or replace function public.coach_goal_add(pin text, p_match_id uuid, p_side text,
                                                 p_scorer_id uuid, p_assist_id uuid, p_own_goal boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare m public.matches; el integer; g public.goals;
begin
  perform public.coach_check(pin);
  select * into m from public.matches where id = p_match_id;
  if m.id is null then raise exception 'no_such_match'; end if;
  if m.status = 'final' then raise exception 'match_final'; end if;
  el := m.period_elapsed_before + case when m.period_started_at is null then 0
        else extract(epoch from now() - m.period_started_at)::int end;
  insert into public.goals (match_id, period, elapsed_sec, side, scorer_id, assist_id, own_goal)
  values (m.id, least(m.period, 2), el, p_side, p_scorer_id, p_assist_id, coalesce(p_own_goal, false))
  returning * into g;
  perform public.match_recount(m.id);
  return to_jsonb(g);
end $$;

create or replace function public.coach_goal_delete(pin text, p_goal_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare mid uuid;
begin
  perform public.coach_check(pin);
  select match_id into mid from public.goals where id = p_goal_id;
  delete from public.goals where id = p_goal_id;
  if mid is not null then perform public.match_recount(mid); end if;
end $$;

create or replace function public.coach_match_finalize(pin text, p_match_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.coach_check(pin);
  update public.matches set status = 'final', period = 3, period_started_at = null, finalized_at = now()
  where id = p_match_id;
end $$;

-- Undo finalize, or wipe the match to start over.
create or replace function public.coach_match_reopen(pin text, p_match_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.coach_check(pin);
  update public.matches set status = 'live', finalized_at = null where id = p_match_id;
end $$;

create or replace function public.coach_match_reset(pin text, p_match_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.coach_check(pin);
  delete from public.matches where id = p_match_id;
end $$;

-- ===============================================================
-- Saved lineups (coach-only)
-- ===============================================================

create table if not exists public.lineups (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  name text not null,
  formation_code text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists lineups_team_idx on public.lineups (team_id, created_at desc);

create table if not exists public.lineup_slots (
  lineup_id uuid not null references public.lineups(id) on delete cascade,
  slot_code text not null,
  player_id uuid not null references public.players(id) on delete cascade,
  primary key (lineup_id, slot_code)
);

alter table public.lineups enable row level security;
alter table public.lineup_slots enable row level security;
revoke all on public.lineups, public.lineup_slots from anon, authenticated;

-- ---------------------------------------------------------------- RPCs
create or replace function public.coach_lineup_list(pin text, p_team_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform public.coach_check(pin);
  return coalesce((
    select jsonb_agg(row_to_json(r) order by r.updated_at desc) from (
      select l.id, l.name, l.formation_code, l.notes, l.event_id, l.updated_at,
             e.event_date, e.opponent,
             (select count(*) from public.lineup_slots s where s.lineup_id = l.id) as filled
      from public.lineups l
      left join public.events e on e.id = l.event_id
      where l.team_id = p_team_id
      order by l.updated_at desc
    ) r
  ), '[]'::jsonb);
end $$;

create or replace function public.coach_lineup_get(pin text, p_lineup_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare l public.lineups;
begin
  perform public.coach_check(pin);
  select * into l from public.lineups where id = p_lineup_id;
  if l.id is null then raise exception 'no_such_lineup'; end if;
  return jsonb_build_object(
    'id', l.id, 'team_id', l.team_id, 'event_id', l.event_id, 'name', l.name,
    'formation_code', l.formation_code, 'notes', l.notes, 'updated_at', l.updated_at,
    'slots', coalesce((
      select jsonb_object_agg(slot_code, player_id) from public.lineup_slots where lineup_id = l.id
    ), '{}'::jsonb));
end $$;

-- p_slots: {"GK":"<uuid>","LB":"<uuid>", ...}. Pass p_lineup_id to update in place.
create or replace function public.coach_lineup_save(pin text, p_lineup_id uuid, p_team_id uuid,
                                                    p_event_id uuid, p_name text,
                                                    p_formation_code text, p_slots jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare lid uuid;
begin
  perform public.coach_check(pin);
  if trim(coalesce(p_name, '')) = '' then raise exception 'name_required'; end if;

  if p_lineup_id is null then
    insert into public.lineups (team_id, event_id, name, formation_code)
    values (p_team_id, p_event_id, trim(p_name), p_formation_code) returning id into lid;
  else
    update public.lineups
      set event_id = p_event_id, name = trim(p_name), formation_code = p_formation_code, updated_at = now()
      where id = p_lineup_id returning id into lid;
    if lid is null then raise exception 'no_such_lineup'; end if;
    delete from public.lineup_slots where lineup_id = lid;
  end if;

  insert into public.lineup_slots (lineup_id, slot_code, player_id)
  select lid, key, value::uuid from jsonb_each_text(coalesce(p_slots, '{}'::jsonb))
  where value is not null and value <> '';

  return lid;
end $$;

create or replace function public.coach_lineup_delete(pin text, p_lineup_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.coach_check(pin);
  delete from public.lineups where id = p_lineup_id;
end $$;
