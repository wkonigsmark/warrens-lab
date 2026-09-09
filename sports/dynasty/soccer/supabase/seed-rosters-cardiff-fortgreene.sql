-- Cardiff City + Fort Greene rosters, Fall 2026. Idempotent.

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
