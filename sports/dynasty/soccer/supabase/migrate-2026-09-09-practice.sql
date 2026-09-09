-- Migration: saved practice plans. Run once in the SQL Editor.
-- A plan is an ordered list of blocks held as jsonb, so reordering is just array order
-- and a block can be either a drill reference or free text.
--   {"type":"drill","drill_id":"traffic-lights","title":"Traffic Lights","minutes":6,"note":"..."}
--   {"type":"text","title":"Water break","body":"...","minutes":3}
-- Drill bodies live in data/drills.json; the title is snapshotted so an edited library
-- never leaves a saved plan blank.

create table if not exists public.practice_plans (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  name text not null,
  plan_date date,
  notes text,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists practice_plans_team_idx on public.practice_plans (team_id, updated_at desc);

alter table public.practice_plans enable row level security;
revoke all on public.practice_plans from anon, authenticated;

-- ---------------------------------------------------------------- RPCs
create or replace function public.coach_practice_list(pin text, p_team_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform public.coach_check(pin);
  return coalesce((
    select jsonb_agg(row_to_json(r) order by r.updated_at desc) from (
      select p.id, p.name, p.plan_date, p.event_id, p.updated_at,
             jsonb_array_length(p.items) as block_count,
             coalesce((select sum((i->>'minutes')::int) from jsonb_array_elements(p.items) i
                       where i->>'minutes' ~ '^[0-9]+$'), 0) as minutes,
             e.event_date, e.location
      from public.practice_plans p
      left join public.events e on e.id = p.event_id
      where p.team_id = p_team_id
      order by p.updated_at desc
    ) r
  ), '[]'::jsonb);
end $$;

create or replace function public.coach_practice_get(pin text, p_plan_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare p public.practice_plans;
begin
  perform public.coach_check(pin);
  select * into p from public.practice_plans where id = p_plan_id;
  if p.id is null then raise exception 'no_such_plan'; end if;
  return to_jsonb(p);
end $$;

create or replace function public.coach_practice_save(pin text, p_plan_id uuid, p_team_id uuid,
                                                      p_event_id uuid, p_name text, p_plan_date date,
                                                      p_notes text, p_items jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  perform public.coach_check(pin);
  if trim(coalesce(p_name, '')) = '' then raise exception 'name_required'; end if;
  if jsonb_typeof(coalesce(p_items, '[]'::jsonb)) <> 'array' then raise exception 'items_must_be_array'; end if;

  if p_plan_id is null then
    insert into public.practice_plans (team_id, event_id, name, plan_date, notes, items)
    values (p_team_id, p_event_id, trim(p_name), p_plan_date, p_notes, coalesce(p_items, '[]'::jsonb))
    returning id into pid;
  else
    update public.practice_plans
      set event_id = p_event_id, name = trim(p_name), plan_date = p_plan_date,
          notes = p_notes, items = coalesce(p_items, '[]'::jsonb), updated_at = now()
      where id = p_plan_id returning id into pid;
    if pid is null then raise exception 'no_such_plan'; end if;
  end if;
  return pid;
end $$;

create or replace function public.coach_practice_delete(pin text, p_plan_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.coach_check(pin);
  delete from public.practice_plans where id = p_plan_id;
end $$;
