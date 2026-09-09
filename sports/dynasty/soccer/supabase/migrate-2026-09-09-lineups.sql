-- Migration: saved lineups. Run once in the SQL Editor.
-- Formations and the position taxonomy live in shared/positions.js (they are geometry,
-- not records); only the player-to-slot assignment is stored here.
-- Lineups are coach-only: who sits on the bench is not public information.

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
