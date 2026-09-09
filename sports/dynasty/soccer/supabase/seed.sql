-- Dynasty coaching database — initial seed
-- Run AFTER schema.sql. Safe to re-run (idempotent).

insert into public.sports (id, name) values
  ('soccer',   'Soccer'),
  ('baseball', 'Baseball')
on conflict (id) do nothing;

-- Fall 2026 teams (DSL). Slug = folder name under teams/.
insert into public.teams (sport_id, slug, name, season, age_group) values
  ('soccer', 'arsenal-fall-2026',      'Arsenal',      'Fall 2026', 'Co-Ed 7'),
  ('soccer', 'cardiff-city-fall-2026', 'Cardiff City', 'Fall 2026', 'Co-Ed 6'),
  ('soccer', 'fort-greene-fall-2026',   'Fort Greene',   'Fall 2026', 'Co-Ed 5')
on conflict (slug) do update set age_group = excluded.age_group;

update public.teams set live_scoring = false where slug = 'fort-greene-fall-2026';

-- arsenal-fall-2026
insert into public.players (first_name, last_name) values
    ('Alexander', 'Wong'),
    ('Ballard', 'Konigsmark'),
    ('Hugo', 'Pola Sjostrom'),
    ('Luca', 'Fettissoff Zakula'),
    ('Miles', 'Kumar'),
    ('Noah', 'Gorelov'),
    ('Oliver', 'Hess'),
    ('Oliver', 'Stodola'),
    ('Quincy', 'Wu'),
    ('Simon', 'Sutta'),
    ('Tate', 'Dhakad')
on conflict (first_name, last_name) do nothing;

insert into public.team_players (team_id, player_id)
select t.id, p.id
from public.teams t
cross join public.players p
where t.slug = 'arsenal-fall-2026'
  and (p.first_name, p.last_name) in (
    ('Alexander', 'Wong'),
    ('Ballard', 'Konigsmark'),
    ('Hugo', 'Pola Sjostrom'),
    ('Luca', 'Fettissoff Zakula'),
    ('Miles', 'Kumar'),
    ('Noah', 'Gorelov'),
    ('Oliver', 'Hess'),
    ('Oliver', 'Stodola'),
    ('Quincy', 'Wu'),
    ('Simon', 'Sutta'),
    ('Tate', 'Dhakad')
  )
on conflict do nothing;

-- cardiff-city-fall-2026
insert into public.players (first_name, last_name) values
    ('Aston', 'Politi'),
    ('Belle', 'Keller'),
    ('Elle', 'Konigsmark'),
    ('Elle', 'Secor'),
    ('Everly', 'Alexander'),
    ('Juni', 'Woodger'),
    ('Luna', 'Kochisarli'),
    ('Mateo', 'Izen'),
    ('Sofia', 'Kopelioff'),
    ('Tanner', 'Herschenfeld'),
    ('Theodore', 'Johnston'),
    ('Willow', 'deRegt')
on conflict (first_name, last_name) do nothing;

insert into public.team_players (team_id, player_id)
select t.id, p.id
from public.teams t
cross join public.players p
where t.slug = 'cardiff-city-fall-2026'
  and (p.first_name, p.last_name) in (
    ('Aston', 'Politi'),
    ('Belle', 'Keller'),
    ('Elle', 'Konigsmark'),
    ('Elle', 'Secor'),
    ('Everly', 'Alexander'),
    ('Juni', 'Woodger'),
    ('Luna', 'Kochisarli'),
    ('Mateo', 'Izen'),
    ('Sofia', 'Kopelioff'),
    ('Tanner', 'Herschenfeld'),
    ('Theodore', 'Johnston'),
    ('Willow', 'deRegt')
  )
on conflict do nothing;

-- fort-greene-fall-2026
insert into public.players (first_name, last_name) values
    ('Bowen', 'Makavy'),
    ('Dylan', 'Bernstein'),
    ('Edie', 'Konigsmark'),
    ('Jack', 'Stein'),
    ('Logan', 'Ward'),
    ('Noa', 'Kopelioff'),
    ('Olivia', 'Banschick'),
    ('Sloane', 'Secor'),
    ('Smith', 'Hart'),
    ('Stella', 'Cohen'),
    ('Summer', 'Izbicki'),
    ('Theodore', 'Sutta')
on conflict (first_name, last_name) do nothing;

insert into public.team_players (team_id, player_id)
select t.id, p.id
from public.teams t
cross join public.players p
where t.slug = 'fort-greene-fall-2026'
  and (p.first_name, p.last_name) in (
    ('Bowen', 'Makavy'),
    ('Dylan', 'Bernstein'),
    ('Edie', 'Konigsmark'),
    ('Jack', 'Stein'),
    ('Logan', 'Ward'),
    ('Noa', 'Kopelioff'),
    ('Olivia', 'Banschick'),
    ('Sloane', 'Secor'),
    ('Smith', 'Hart'),
    ('Stella', 'Cohen'),
    ('Summer', 'Izbicki'),
    ('Theodore', 'Sutta')
  )
on conflict do nothing;
