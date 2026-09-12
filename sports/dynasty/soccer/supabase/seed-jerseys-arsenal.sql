-- Arsenal shirt numbers, Fall 2026. Safe to re-run.

update public.team_players tp
set jersey_number = v.num
from public.players p, public.teams t, (values
    ('Alexander', 'Wong', 2),
    ('Quincy', 'Wu', 3),
    ('Miles', 'Kumar', 4),
    ('Hugo', 'Pola Sjostrom', 5),
    ('Oliver', 'Stodola', 6),
    ('Luca', 'Fettissoff Zakula', 7),
    ('Tate', 'Dhakad', 8),
    ('Simon', 'Sutta', 9),
    ('Ballard', 'Konigsmark', 10),
    ('Oliver', 'Hess', 11),
    ('Noah', 'Gorelov', 12)
) as v(first_name, last_name, num)
where p.first_name = v.first_name
  and p.last_name  = v.last_name
  and t.slug = 'arsenal-fall-2026'
  and tp.team_id = t.id
  and tp.player_id = p.id;
