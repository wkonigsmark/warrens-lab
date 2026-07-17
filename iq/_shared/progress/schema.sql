-- iq-progress schema
-- Run once in the Supabase SQL Editor of the new `iq-progress` project.
-- Safe to re-run: everything is idempotent (pins are never overwritten on re-run).

-- ── Roster ────────────────────────────────────────────────────────────────
-- PINs live ONLY here. The anon key gets no read access to this table;
-- clients verify via the verify_pin() RPC below.
create table if not exists students (
  id        text primary key,       -- matches TRACKED_USERS ids ('ruby-l', ...)
  name      text not null,
  emoji     text,
  color     text,
  birthdate date,                    -- optional; the roster view exposes only the
                                     -- derived age, never the raw birthdate
  gender    text,                    -- optional, free-form & nullable (inclusive)
  pin       text not null,
  active    boolean not null default true
);

-- Upgrade existing installs (the `create table if not exists` above is a no-op
-- once the table exists, so add any newer columns explicitly & idempotently).
alter table students add column if not exists birthdate date;
alter table students add column if not exists gender    text;

-- ── Progress events ───────────────────────────────────────────────────────
-- One row per completed quiz/climb session. `payload` keeps the full client
-- session object so no tool-specific field is ever lost; the extracted
-- columns exist for easy querying in the admin console.
create table if not exists progress_sessions (
  id          uuid primary key default gen_random_uuid(),
  student_id  text not null references students(id),
  tool_id     text not null,        -- 'ants-angles' | 'ants-algebra-2' | 'ants-axes' | ...
  client_id   text not null,        -- the client-side session id (Date.now())
  ts          timestamptz not null default now(),  -- when the kid played (client clock)
  level_id    text,
  topic_id    text,
  score       int,
  total       int,
  verified    boolean not null default true,  -- false if PIN was checked offline-only
  payload     jsonb not null default '{}'::jsonb,
  inserted_at timestamptz not null default now(),
  unique (student_id, tool_id, client_id)     -- makes sync retries idempotent
);

create index if not exists progress_sessions_student_ts
  on progress_sessions (student_id, ts desc);

-- ── Access rules ──────────────────────────────────────────────────────────
alter table students          enable row level security;
alter table progress_sessions enable row level security;

-- No policies on `students` = anon is fully locked out (default deny).
revoke all on students from anon;

-- Public roster view — never the pin or the raw birthdate. Exposes the derived
-- age (always current, computed from birthdate) plus gender. Lets the admin
-- console (and any tool's user picker) list every active student live from the
-- database instead of a hardcoded array: add a row to `students` and it shows up
-- everywhere automatically, no code change.
create or replace view public.student_roster as
  select
    id, name, emoji, color,
    extract(year from age(birthdate))::int as age,   -- whole years, recomputed live
    gender
  from students where active;

grant select on public.student_roster to anon;

drop policy if exists anon_insert_progress on progress_sessions;
create policy anon_insert_progress on progress_sessions
  for insert to anon with check (true);

drop policy if exists anon_read_progress on progress_sessions;
create policy anon_read_progress on progress_sessions
  for select to anon using (true);
-- (no update/delete policies: browsers can add and read history, never rewrite it)

-- RLS policies only restrict access on top of base table privileges — they
-- don't grant it. Without this, anon gets a bare "permission denied" 401
-- even though the policies above say insert/select are fine.
grant select, insert on public.progress_sessions to anon;

-- ── PIN check ─────────────────────────────────────────────────────────────
-- SECURITY DEFINER so it can consult `students` even though anon cannot.
create or replace function verify_pin(p_student_id text, p_pin text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from students
    where id = p_student_id and pin = p_pin and active
  );
$$;

grant execute on function verify_pin(text, text) to anon;

-- ── Seed roster ───────────────────────────────────────────────────────────
-- ⚠️ Placeholder PINs below (except Ruby L. = 2036 per Warren's example, and
-- Guest = 0000, which the client never prompts for). Change them in
-- Table Editor → students after running this.
insert into students (id, name, emoji, color, pin) values
  ('ballard',  'Ballard',   '🦁', '#6366f1', '1001'),
  ('elle',     'Elle',      '🌸', '#ec4899', '1002'),
  ('edie',     'Edie',      '⭐', '#f59e0b', '1003'),
  ('ruby-l',   'Ruby L.',   '💎', '#ef4444', '2036'),
  ('winnie-l', 'Winnie L.', '🐻', '#0d9488', '1005'),
  ('elle-s',   'Elle S.',   '🦋', '#8b5cf6', '1006'),
  ('guest',    'Guest',     '🎈', '#64748b', '0000')
on conflict (id) do update
  set name = excluded.name, emoji = excluded.emoji, color = excluded.color;
