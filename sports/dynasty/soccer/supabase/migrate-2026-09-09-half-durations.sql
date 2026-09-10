-- Migration: record how long each half ACTUALLY ran.
-- Goal minutes still use the nominal half length, the way real football does — the
-- second half always starts at 20:00 even if the first ran long. These columns are a
-- separate record of what the referee actually played.

alter table public.matches add column if not exists period1_sec integer;
alter table public.matches add column if not exists period2_sec integer;

create or replace function public.coach_match_clock(pin text, p_match_id uuid, p_action text)
returns void language plpgsql security definer set search_path = public as $$
declare m public.matches; el integer;
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
    el := m.period_elapsed_before + case when m.period_started_at is null then 0
          else extract(epoch from now() - m.period_started_at)::int end;
    update public.matches set
      period1_sec = case when m.period = 1 then el else period1_sec end,
      period2_sec = case when m.period = 2 then el else period2_sec end,
      period = least(m.period + 1, 3),
      period_elapsed_before = 0,
      period_started_at = null
    where id = m.id;

  else
    raise exception 'bad_action';
  end if;
end $$;

-- Finalising straight from a running half still captures that half's length.
create or replace function public.coach_match_finalize(pin text, p_match_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare m public.matches; el integer;
begin
  perform public.coach_check(pin);
  select * into m from public.matches where id = p_match_id for update;
  if m.id is null then raise exception 'no_such_match'; end if;
  el := m.period_elapsed_before + case when m.period_started_at is null then 0
        else extract(epoch from now() - m.period_started_at)::int end;
  update public.matches set
    period1_sec = case when m.period = 1 and period1_sec is null then el else period1_sec end,
    period2_sec = case when m.period = 2 and period2_sec is null then el else period2_sec end,
    status = 'final', period = 3, period_started_at = null, finalized_at = now()
  where id = m.id;
end $$;
