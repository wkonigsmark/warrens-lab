-- Migration: let a coach set the half length in 5-minute steps.
-- Before a match is opened this sets the TEAM default (which new matches inherit);
-- once a match exists it sets that match only, so changing it never rewrites history.

create or replace function public.coach_set_half_length(pin text, p_match_id uuid,
                                                        p_team_id uuid, p_seconds integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.coach_check(pin);
  if p_seconds is null or p_seconds < 300 or p_seconds > 3600 or p_seconds % 300 <> 0 then
    raise exception 'half_length_must_be_5_minute_steps_between_5_and_60';
  end if;

  if p_match_id is not null then
    update public.matches set half_length_sec = p_seconds where id = p_match_id and status <> 'final';
    if not found then raise exception 'no_such_open_match'; end if;
  elsif p_team_id is not null then
    update public.teams set half_length_sec = p_seconds where id = p_team_id;
    if not found then raise exception 'no_such_team'; end if;
  else
    raise exception 'need_a_match_or_team';
  end if;
end $$;
