-- Migration: let a recorded goal be amended afterwards.
-- The goal itself is written the instant the Goal button is tapped, so the score is
-- never wrong and a goal can never be lost mid-entry. Naming the scorer, adding an
-- assist or flagging an own goal are all edits to that existing row.

create or replace function public.coach_goal_update(pin text, p_goal_id uuid,
                                                    p_scorer_id uuid, p_assist_id uuid,
                                                    p_own_goal boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare g public.goals; m public.matches;
begin
  perform public.coach_check(pin);
  select * into g from public.goals where id = p_goal_id;
  if g.id is null then raise exception 'no_such_goal'; end if;
  select * into m from public.matches where id = g.match_id;
  if m.status = 'final' then raise exception 'match_final'; end if;

  update public.goals
    set scorer_id = p_scorer_id,
        assist_id = p_assist_id,
        own_goal  = coalesce(p_own_goal, false)
  where id = p_goal_id
  returning * into g;
  return to_jsonb(g);
end $$;
