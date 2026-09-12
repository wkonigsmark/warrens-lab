-- Migration: edit shirt numbers from the roster page.
-- The number lives on team_players, so it is per team per season — the same child can
-- wear a different number for a different team without any conflict.

create or replace function public.coach_set_jersey(pin text, p_team_id uuid,
                                                   p_player_id uuid, p_number integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.coach_check(pin);
  if p_number is not null and (p_number < 0 or p_number > 99) then
    raise exception 'number_must_be_0_to_99';
  end if;
  update public.team_players set jersey_number = p_number
  where team_id = p_team_id and player_id = p_player_id;
  if not found then raise exception 'player_not_on_this_team'; end if;
end $$;
