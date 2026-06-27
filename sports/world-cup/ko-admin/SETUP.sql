-- ============================================================
-- KNOCKOUT POOL — Supabase Schema
-- Run this in the Supabase SQL Editor for the
-- "World Cup Knockout Pool" project.
-- ============================================================

-- 1. KNOCKOUT ENTRIES
--    One row per participant. All bracket picks stored as JSONB.
create table if not exists knockout_entries (
  id            uuid        primary key default gen_random_uuid(),
  entry_code    text        unique not null,
  bracket_name  text        not null,
  email         text        not null,
  venmo         text        not null,
  submitted_at  timestamptz default now(),
  paid          boolean     default false,
  status        text        default 'pending_payment',
  voided        boolean     default false,

  -- bracket_picks shape:
  -- {
  --   r32:   ["TEAM_ID", ...],   -- 16 winners (slots 0-15, matching match order)
  --   r16:   ["TEAM_ID", ...],   -- 8 winners
  --   qf:    ["TEAM_ID", ...],   -- 4 winners
  --   sf:    ["TEAM_ID", ...],   -- 2 winners
  --   third: "TEAM_ID",          -- winner of 3rd place match
  --   final: "TEAM_ID"           -- champion
  -- }
  bracket_picks       jsonb   not null default '{}',

  -- Tiebreakers
  golden_boot_pick    text    not null,  -- player name string
  penalty_games_pick  integer not null,  -- predicted # of KO matches going to PKs (0-32)
  ko_total_goals_pick integer not null   -- predicted total goals in KO round
);

-- 2. KNOCKOUT MATCH RESULTS
--    Commissioner enters scores via ko-admin server.
--    match_slot: position within the round (1-based), left-to-right top-to-bottom
create table if not exists knockout_match_results (
  id                 uuid        primary key default gen_random_uuid(),
  match_number       integer     unique not null,
  round              text        not null,  -- 'r32','r16','qf','sf','third','final'
  match_slot         integer     not null,  -- 1-based position in round
  home_team_id       text,
  away_team_id       text,
  home_score         integer,
  away_score         integer,
  winner_id          text,
  went_to_penalties  boolean     default false,
  status             text        default 'upcoming'  -- 'upcoming','live','completed'
);

-- 3. ROW LEVEL SECURITY

alter table knockout_entries       enable row level security;
alter table knockout_match_results enable row level security;

-- Public can read non-voided entries (for scoreboard)
create policy "ko_entries_public_read"
  on knockout_entries for select
  using (not voided);

-- Entry form can insert (publishable key / anon role)
create policy "ko_entries_public_insert"
  on knockout_entries for insert
  with check (true);

-- Public can read match results
create policy "ko_results_public_read"
  on knockout_match_results for select
  using (true);

-- Service role (admin server) bypasses RLS, so no *policy* is needed for it —
-- but it STILL needs the table-level GRANTs below to touch the tables at all.

-- 3b. TABLE-LEVEL GRANTS  ← REQUIRED in addition to the RLS policies above.
--     RLS policies decide *which rows* a role may touch; the base GRANT decides
--     whether the role may touch the table at all. Without these, the public
--     entry form, the public scoreboard read, AND the admin server all fail with
--     "permission denied for table knockout_entries" (error 42501),
--     even though the policies exist.

-- Public (browser, publishable key / anon role)
grant insert on knockout_entries to anon;   -- entry form (knockout/index.html)
grant select on knockout_entries to anon;   -- scoreboard read (RLS still hides voided rows)
grant select on knockout_match_results to anon;  -- future public results read

-- Admin server (secret key / service_role). Supabase usually grants these by
-- default, but on RLS-enabled tables created via SQL they must be set explicitly.
grant all on knockout_entries       to service_role;  -- list entries, mark paid/void/status
grant all on knockout_match_results to service_role;  -- commissioner enters scores

-- 4. PUBLIC READ RPCs (called by browser with publishable key)

create or replace function get_ko_entries()
returns setof knockout_entries
language sql security definer
as $$
  select * from knockout_entries
  where not voided
  order by submitted_at;
$$;

create or replace function get_ko_results()
returns setof knockout_match_results
language sql security definer
as $$
  select * from knockout_match_results
  order by match_number;
$$;

-- Grant execute on RPCs to anon role
grant execute on function get_ko_entries() to anon;
grant execute on function get_ko_results()  to anon;
