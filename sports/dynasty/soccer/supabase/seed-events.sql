-- Dynasty Soccer — Fall 2026 schedule seed (DSL). Run after events table exists. Idempotent.

insert into public.events (team_id, event_date, start_time, end_time, event_type, opponent, location)
select t.id, v.d::date, v.s::time, v.e::time, v.ty, v.opp, v.loc
from (values
  ('arsenal-fall-2026', '2026-09-12', '11:00', '11:50', 'game', 'Liverpool', 'BPC Field 04'),
  ('cardiff-city-fall-2026', '2026-09-12', '08:00', '08:50', 'game', 'Blackburn', 'BPC Field 02'),
  ('fort-green-fall-2026', '2026-09-13', '11:00', null, 'training_game', 'Parkchester', 'Pier 25 Field 1'),
  ('arsenal-fall-2026', '2026-09-15', '17:30', null, 'practice', null, 'BPC Field 05'),
  ('arsenal-fall-2026', '2026-09-19', '10:00', '10:50', 'game', 'Wrexham', 'BPC Field 06'),
  ('cardiff-city-fall-2026', '2026-09-19', '09:00', '09:50', 'game', 'Luton Town', 'BPC Field 06'),
  ('fort-green-fall-2026', '2026-09-20', '09:00', null, 'training_game', 'Inwood', 'Pier 25 Field 5'),
  ('arsenal-fall-2026', '2026-09-22', '17:30', null, 'practice', null, 'BPC Field 05'),
  ('arsenal-fall-2026', '2026-09-26', '10:00', '10:50', 'game', 'Everton', 'BPC Field 06'),
  ('cardiff-city-fall-2026', '2026-09-26', '09:00', '09:50', 'game', 'Nottingham', 'BPC Field 03'),
  ('fort-green-fall-2026', '2026-09-27', '11:00', null, 'training_game', 'Harlem', 'Pier 25 Field 1'),
  ('arsenal-fall-2026', '2026-09-29', '17:30', null, 'practice', null, 'BPC Field 05'),
  ('arsenal-fall-2026', '2026-10-03', '10:00', '10:50', 'game', 'Brentford', 'BPC Field 05'),
  ('cardiff-city-fall-2026', '2026-10-03', '08:00', '08:50', 'game', 'Bristol City', 'BPC Field 01'),
  ('fort-green-fall-2026', '2026-10-04', '09:00', null, 'training_game', 'Forest Hills', 'Pier 25 Field 4'),
  ('arsenal-fall-2026', '2026-10-06', '17:30', null, 'practice', null, 'BPC Field 05'),
  ('arsenal-fall-2026', '2026-10-10', null, null, 'bye', null, null),
  ('arsenal-fall-2026', '2026-10-13', '17:30', null, 'practice', null, 'BPC Field 05'),
  ('arsenal-fall-2026', '2026-10-17', '11:00', '11:50', 'game', 'Newcastle', 'BPC Field 05'),
  ('cardiff-city-fall-2026', '2026-10-17', '08:00', '08:50', 'game', 'Sunderland', 'BPC Field 04'),
  ('fort-green-fall-2026', '2026-10-18', '09:00', null, 'training_game', 'Chinatown', 'Pier 25 Field 2'),
  ('arsenal-fall-2026', '2026-10-20', '17:30', null, 'practice', null, 'BPC Field 05'),
  ('arsenal-fall-2026', '2026-10-24', '11:00', '11:50', 'game', 'Aston Villa', 'BPC Field 02'),
  ('cardiff-city-fall-2026', '2026-10-24', '08:00', '08:50', 'game', 'Millwall', 'BPC Field 01'),
  ('fort-green-fall-2026', '2026-10-25', '10:00', null, 'training_game', 'Bed-Stuy', 'Pier 25 Field 2'),
  ('arsenal-fall-2026', '2026-10-27', '17:30', null, 'practice', null, 'BPC Field 05'),
  ('arsenal-fall-2026', '2026-10-31', '11:00', '11:50', 'game', 'Man City', 'BPC Field 03'),
  ('cardiff-city-fall-2026', '2026-10-31', '09:00', '09:50', 'game', 'Preston', 'BPC Field 03'),
  ('fort-green-fall-2026', '2026-11-01', '08:00', null, 'training_game', 'Yorkville', 'Pier 25 Field 2'),
  ('arsenal-fall-2026', '2026-11-03', '17:30', null, 'practice', null, 'BPC Field 05'),
  ('arsenal-fall-2026', '2026-11-07', '10:00', '10:50', 'game', 'Fulham', 'BPC Field 05'),
  ('cardiff-city-fall-2026', '2026-11-07', '09:00', '09:50', 'game', 'Southampton', 'BPC Field 05'),
  ('fort-green-fall-2026', '2026-11-08', '10:00', null, 'training_game', 'Williamsburg', 'Pier 25 Field 6'),
  ('arsenal-fall-2026', '2026-11-10', '17:30', null, 'practice', null, 'BPC Field 05'),
  ('arsenal-fall-2026', '2026-11-14', '11:00', '11:50', 'game', 'West Ham', 'BPC Field 03'),
  ('cardiff-city-fall-2026', '2026-11-14', '09:00', '09:50', 'game', 'Hull City', 'BPC Field 04'),
  ('fort-green-fall-2026', '2026-11-15', '11:00', null, 'training_game', 'Sunnyside', 'Pier 25 Field 6'),
  ('arsenal-fall-2026', '2026-11-17', '17:30', null, 'practice', null, 'BPC Field 05'),
  ('arsenal-fall-2026', '2026-11-21', '11:00', '11:50', 'game', 'Leeds United', 'BPC Field 04'),
  ('cardiff-city-fall-2026', '2026-11-21', '08:00', '08:50', 'game', 'Birmingham', 'BPC Field 04'),
  ('fort-green-fall-2026', '2026-11-22', '09:00', null, 'training_game', 'Silver Lake', 'Pier 25 Field 6')
) as v(slug, d, s, e, ty, opp, loc)
join public.teams t on t.slug = v.slug
on conflict (team_id, event_date, event_type, coalesce(start_time, '00:00'::time)) do nothing;
