-- Migration: roster check-in / attendance. Run once in the SQL Editor.
-- Only exceptions are stored: a player with no row for an event is assumed available,
-- so a full roster needs no writes and marking one child out is a single row.

create table if not exists public.attendance (
  event_id uuid not null references public.events(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  status text not null default 'out' check (status in ('in', 'out', 'maybe')),
  note text,
  updated_at timestamptz not null default now(),
  primary key (event_id, player_id)
);
create index if not exists attendance_event_idx on public.attendance (event_id);

alter table public.attendance enable row level security;
revoke all on public.attendance from anon, authenticated;

-- ---------------------------------------------------------------- RPCs
-- Every player on the team for this event, with their status (default 'in').
create or replace function public.coach_attendance_get(pin text, p_event_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare ev public.events;
begin
  perform public.coach_check(pin);
  select * into ev from public.events where id = p_event_id;
  if ev.id is null then raise exception 'no_such_event'; end if;
  return coalesce((
    select jsonb_agg(row_to_json(r) order by r.last_name, r.first_name) from (
      select p.id as player_id, p.first_name, p.last_name, tp.jersey_number,
             coalesce(a.status, 'in') as status, a.note
      from public.team_players tp
      join public.players p on p.id = tp.player_id
      left join public.attendance a on a.event_id = p_event_id and a.player_id = p.id
      where tp.team_id = ev.team_id
      order by p.last_name, p.first_name
    ) r
  ), '[]'::jsonb);
end $$;

-- 'in' clears the row; anything else upserts it.
create or replace function public.coach_attendance_set(pin text, p_event_id uuid, p_player_id uuid,
                                                       p_status text, p_note text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.coach_check(pin);
  if p_status = 'in' and coalesce(trim(p_note), '') = '' then
    delete from public.attendance where event_id = p_event_id and player_id = p_player_id;
  else
    insert into public.attendance (event_id, player_id, status, note, updated_at)
    values (p_event_id, p_player_id, p_status, nullif(trim(p_note), ''), now())
    on conflict (event_id, player_id) do update
      set status = excluded.status, note = excluded.note, updated_at = now();
  end if;
end $$;

-- Player ids that are NOT available for an event — what the lineup builder filters on.
create or replace function public.coach_attendance_out(pin text, p_event_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform public.coach_check(pin);
  return coalesce((
    select jsonb_object_agg(player_id, status) from public.attendance
    where event_id = p_event_id and status <> 'in'
  ), '{}'::jsonb);
end $$;

-- Counts per event for a team, so the schedule can show "9 in · 2 out" at a glance.
create or replace function public.coach_attendance_summary(pin text, p_team_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform public.coach_check(pin);
  return coalesce((
    select jsonb_object_agg(event_id, counts) from (
      select a.event_id, jsonb_build_object(
               'out',   count(*) filter (where a.status = 'out'),
               'maybe', count(*) filter (where a.status = 'maybe')) as counts
      from public.attendance a
      join public.events e on e.id = a.event_id
      where e.team_id = p_team_id and a.status <> 'in'
      group by a.event_id
    ) s
  ), '{}'::jsonb);
end $$;
