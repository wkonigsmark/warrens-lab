# Dynasty Soccer

Coaching hub for the soccer roster. Backed by the shared **dynasty** Supabase project
(one database for every sport/team/season — baseball can move onto it later).

## Layout

```
soccer/
├── index.html                 # basic hub: team picker + roster (read-only)
├── data/supabase-config.js    # project URL + publishable key (safe to commit)
└── supabase/
    ├── schema.sql             # tables + RLS (run once)
    └── seed.sql               # sport, Arsenal (Co-Ed 7, Fall 2026), 11 players (idempotent)
```

## Supabase setup

1. Create the project (`dynasty`, East US). Save the DB password somewhere safe — it is not
   needed by the site, only for direct Postgres access.
2. **SQL Editor → New query** → paste `supabase/schema.sql` → Run.
3. **SQL Editor → New query** → paste `supabase/seed.sql` → Run.
4. **Project Settings → API**: copy *Project URL* and the *publishable* (anon) key into
   `data/supabase-config.js`.
5. Open `index.html` through a local server (ES modules won't load from `file://`):
   ```bash
   python3 -m http.server 8000
   ```
   then visit http://localhost:8000/sports/dynasty/soccer/ from the repo root.

## Data model

| table             | purpose                                             | anon access |
|-------------------|-----------------------------------------------------|-------------|
| `sports`          | soccer, baseball, …                                 | read        |
| `teams`           | one row per team per season (`slug` is the key)     | read        |
| `players`         | a kid exists once, across sports and seasons        | read        |
| `team_players`    | roster membership + jersey number / position        | read        |
| `guardians`       | parent contacts (empty for now)                     | **none**    |
| `player_guardians`| links kids to parents                               | **none**    |

Writes go through the Supabase Table Editor until auth lands in phase 2.

## Phase 2 ideas (not started)

- Per-team subfolders (schedule, practice plans, lineups)
- Supabase Auth so the page can edit rosters directly
- Load parent contacts into `guardians` behind a coach-only login
