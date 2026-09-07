-- Dynasty coaching database — initial seed
-- Run AFTER schema.sql. Safe to re-run (idempotent).

insert into public.sports (id, name) values
  ('soccer',   'Soccer'),
  ('baseball', 'Baseball')
on conflict (id) do nothing;

-- Arsenal, Co-Ed 7 (DSL), Fall 2026
insert into public.teams (sport_id, slug, name, season, age_group)
values ('soccer', 'arsenal-fall-2026', 'Arsenal', 'Fall 2026', 'Co-Ed 7')
on conflict (slug) do nothing;

insert into public.players (first_name, last_name) values
  ('Alexander', 'Wong'),
  ('Ballard',   'Konigsmark'),
  ('Hugo',      'Pola Sjostrom'),
  ('Luca',      'Fettissoff Zakula'),
  ('Miles',     'Kumar'),
  ('Noah',      'Gorelov'),
  ('Oliver',    'Hess'),
  ('Oliver',    'Stodola'),
  ('Quincy',    'Wu'),
  ('Simon',     'Sutta'),
  ('Tate',      'Dhakad')
on conflict (first_name, last_name) do nothing;

insert into public.team_players (team_id, player_id)
select t.id, p.id
from public.teams t
cross join public.players p
where t.slug = 'arsenal-fall-2026'
  and (p.first_name, p.last_name) in (
    ('Alexander', 'Wong'),
    ('Ballard',   'Konigsmark'),
    ('Hugo',      'Pola Sjostrom'),
    ('Luca',      'Fettissoff Zakula'),
    ('Miles',     'Kumar'),
    ('Noah',      'Gorelov'),
    ('Oliver',    'Hess'),
    ('Oliver',    'Stodola'),
    ('Quincy',    'Wu'),
    ('Simon',     'Sutta'),
    ('Tate',      'Dhakad')
  )
on conflict do nothing;
