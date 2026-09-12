-- Migration: squad size per team, and playing-time tracking.
--
-- Playing time is recorded as stints: a row per spell a player spends on the field,
-- stamped in ACTUAL elapsed match seconds. Goal minutes elsewhere use the nominal
-- half length because that is how football reads a clock; minutes played must use
-- real elapsed time or the totals would be wrong whenever a half runs long.

alter table public.teams add column if not exists squad_size integer not null default 7;
update public.teams set squad_size = 6 where slug = 'cardiff-city-fall-2026';

create table if not exists public.match_stints (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  on_sec integer not null,
  off_sec integer,
  created_at timestamptz not null default now()
);
create index if not exists match_stints_idx on public.match_stints (match_id, player_id);
create unique index if not exists match_stints_open_idx
  on public.match_stints (match_id, player_id) where off_sec is null;

alter table public.match_stints enable row level security;
revoke all on public.match_stints from anon, authenticated;

-- Real seconds played so far: completed halves plus however far into the current one.
create or replace function public.match_elapsed(m public.matches)
returns integer language sql immutable set search_path = public as $$
  select greatest(0,
    case when m.period >= 2 then coalesce(m.period1_sec, 0) else 0 end +
    case when m.period >= 3 then coalesce(m.period2_sec, 0) else 0 end +
    case when m.period < 3
         then m.period_elapsed_before +
              case when m.period_started_at is null then 0
                   else extract(epoch from now() - m.period_started_at)::int end
         else 0 end);
$$;

create or replace function public.coach_set_squad_size(pin text, p_team_id uuid, p_size integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.coach_check(pin);
  if p_size not in (6, 7, 9, 11) then raise exception 'unsupported_squad_size'; end if;
  update public.teams set squad_size = p_size where id = p_team_id;
  if not found then raise exception 'no_such_team'; end if;
end $$;

-- Declare exactly who is on the field now. Closes stints for anyone who came off and
-- opens them for anyone who went on; players already on are left untouched.
create or replace function public.coach_stint_set(pin text, p_match_id uuid, p_on_field uuid[])
returns jsonb language plpgsql security definer set search_path = public as $$
declare m public.matches; t integer;
begin
  perform public.coach_check(pin);
  select * into m from public.matches where id = p_match_id for update;
  if m.id is null then raise exception 'no_such_match'; end if;
  t := public.match_elapsed(m);

  update public.match_stints
    set off_sec = t
  where match_id = p_match_id and off_sec is null
    and not (player_id = any(coalesce(p_on_field, '{}'::uuid[])));

  insert into public.match_stints (match_id, player_id, on_sec)
  select p_match_id, pid, t
  from unnest(coalesce(p_on_field, '{}'::uuid[])) as pid
  where not exists (
    select 1 from public.match_stints s
    where s.match_id = p_match_id and s.player_id = pid and s.off_sec is null);

  return public.coach_stints_get(pin, p_match_id);
end $$;

-- Every player's minutes, plus how long anyone currently off has been sitting.
create or replace function public.coach_stints_get(pin text, p_match_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare m public.matches; t integer;
begin
  perform public.coach_check(pin);
  select * into m from public.matches where id = p_match_id;
  if m.id is null then raise exception 'no_such_match'; end if;
  t := public.match_elapsed(m);

  return jsonb_build_object(
    'elapsed', t,
    'running', (m.period_started_at is not null),
    'players', coalesce((
      select jsonb_agg(row_to_json(r)) from (
        select tp.player_id,
               p.first_name, p.last_name, tp.jersey_number,
               coalesce(sum(case when s.off_sec is null then t - s.on_sec else s.off_sec - s.on_sec end), 0)::int as played_sec,
               bool_or(s.off_sec is null) as on_field,
               max(coalesce(s.off_sec, 0)) as last_off_sec,
               count(s.id) filter (where s.id is not null)::int as stints
        from public.team_players tp
        join public.players p on p.id = tp.player_id
        left join public.match_stints s on s.match_id = p_match_id and s.player_id = tp.player_id
        where tp.team_id = m.team_id
        group by tp.player_id, p.first_name, p.last_name, tp.jersey_number
        order by p.last_name, p.first_name
      ) r), '[]'::jsonb));
end $$;
