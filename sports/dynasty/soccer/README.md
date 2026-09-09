# Dynasty Soccer

Coaching hub for the soccer roster. Backed by the shared **dynasty** Supabase project
(one database for every sport/team/season — baseball can move onto it later).

## Layout

```
soccer/
├── index.html                 # hub: every soccer team from the DB, grouped by season
├── data/supabase-config.js    # project URL + publishable key (safe to commit)
├── shared/
│   ├── soccer.css             # shared styles (on top of /style-lab.css)
│   ├── db.js                  # Supabase REST helper
│   ├── schedule.js            # events fetch + table renderer (hub + team pages)
│   ├── coach.js               # PIN gate (sessionStorage) + coachCall() wrapper
│   ├── positions.js           # position taxonomy, formations, lineup-matching engine
│   ├── lineup-page.js         # interactive pitch / lineup builder
│   ├── team-page.js           # team page: roster, coach edit mode, schedule, results
│   └── match-page.js          # live scoring page
├── match/index.html           # ?event=<uuid> — scoreboard for anyone, controls in coach mode
├── lineup/index.html          # ?team=<slug>[&event=&lineup=] — formation builder (coach only)
├── drills/index.html          # drill library (reads data/drills.json); ?specialty=&difficulty=&q= deep links
├── shared/themes.css          # club colours + monogram crests keyed by <body data-club>
├── teams/
│   ├── _template/index.html   # copy for a new team
│   ├── arsenal-fall-2026/
│   ├── cardiff-city-fall-2026/
│   └── fort-green-fall-2026/
└── supabase/
    ├── schema.sql             # full schema incl. events (fresh installs)
    ├── migrate-2026-09-08-events.sql      # adds events to a DB created before 9/8
    ├── migrate-2026-09-08-coach-mode.sql  # PIN, evals, notes, matches, goals + RPCs
    ├── migrate-2026-09-09-lineups.sql     # saved lineups + RPCs
    ├── seed.sql               # sports + Fall 2026 teams + all three rosters (idempotent)
    ├── seed-events.sql        # Fall 2026 DSL schedule, all three teams (idempotent)
    └── seed-rosters-cardiff-fortgreen.sql  # the two other Fall 2026 rosters
```

## Adding a team (new season, new club)

1. Insert a row in `teams`: `sport_id = 'soccer'`, a unique `slug` (e.g. `arsenal-fall-2027`),
   `name`, `season` ("Fall 2027"), `age_group`.
2. Copy `teams/_template/` to `teams/<slug>/` and set `data-team="<slug>"` in its `index.html`.
3. Add players in `players` (if new) and link them in `team_players`.
4. When a season ends, set `active = false` on the team; the hub dims it but keeps it.

Anything team-specific (schedule pages, practice plans, photos) lives inside that team's folder
next to its `index.html`.

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
| `events`          | games / practices / byes per team (`event_type`)    | read        |
| `matches`         | one per scored game: clock state, score, status     | read        |
| `goals`           | per goal: half, seconds, side, scorer, assist, OG   | read        |
| `player_evals`    | skill 1–4, pos 1/2 per roster row (coach only)      | **none**    |
| `player_notes`    | dated coaching notes per roster row (coach only)    | **none**    |
| `coach_settings`  | bcrypt hash of the coach PIN                        | **none**    |
| `lineups`         | a saved formation for a team, optionally a game     | **none**    |
| `lineup_slots`    | which player sits in which slot code                | **none**    |
| `guardians`       | parent contacts (empty for now)                     | **none**    |
| `player_guardians`| links kids to parents                               | **none**    |

Writes go through the Supabase Table Editor until auth lands in phase 2.

## Schedule

The hub shows a master schedule across all active teams, filterable by team, with a
"Hide past" toggle (both remembered in localStorage). Each team page shows its own.
`event_type` is one of `game`, `practice`, `training_game`, `bye`. Add or edit rows in the
Table Editor; the pages read live.

## Club themes

`shared/themes.css` keys off `<body data-club="…">`, derived from the team slug minus the
season (`arsenal-fall-2026` → `arsenal`). Arsenal and Cardiff City have colour palettes,
gradient header bands and inline-SVG monogram crests (original badges in club colours, not
official club marks). Any team without a theme falls back to the neutral lab look
automatically — add a new club by appending one `body[data-club="…"]` block.

## Drill library

`drills/index.html` reads `data/drills.json` (25 U6–U8 drills, filterable by search,
difficulty and specialty). It accepts deep links — `?specialty=dribbling`, `?difficulty=beginner`,
`?q=cones` — which is how the Practice Planner quick picks on each team page work. The
library links back to every active team.

## Positions, formations and lineups

`shared/positions.js` is the source of truth and holds three things.

**A position taxonomy.** Every code (GK, LB, LCB, CB, RCB, RB, SW, STP, LM, LCM, CM, RCM, RM,
LW, LF, CF, CS, RF, RW) is a point in a two-axis space: `line` (0 keeper → 3 attack, fractional
for in-between roles like sweeper and stopper) and `side` (-1 left → +1 right). This is what
makes positions portable: nothing is defined relative to one formation. The roster dropdowns on
each team page are generated from this list, grouped by line.

**Formations.** Each is a set of slots carrying a position code plus x/y for drawing
(x 0–1 left to right, y 0 own goal → 1 opponent's). Shipping with 3-3, 4-2, 2-3-1 and 3-2-1 at
7v7, plus 3-3-2 and 3-2-3 at 9v9. Adding one is a single array entry — no migration, because a
formation is geometry, not a record.

**The matching engine.** `fitScore(player, slotCode)` rates a player against a slot: an exact
code match wins, then same line scaled by how far the side differs, then a neighbouring line.
Keeper is treated as a specialist in both directions, and skill is a small tiebreak.
`autoAssign` greedily takes the best remaining pair, honouring any locked slots.
`remapFormation` keeps anyone whose slot still exists and re-matches the rest — so a center back
in a 3-3 lands at left or right center back in a 4-2 without you touching anything.

The builder itself lives at `lineup/index.html?team=<slug>`. Tap a player, tap a spot; tap a
filled spot to bench that player. Lineups can be tied to a game and saved. They are coach-only,
since who is benched is not public information.

## Coach mode

Click **Coach mode** on a team or match page and enter the PIN. The PIN is never in the
repo: every `coach_*` Postgres function checks it against a bcrypt hash in `coach_settings`
(wrong PIN sleeps 300 ms then errors). The public key has no write access to any table.
The PIN is kept in `sessionStorage` until the tab closes.

Change the PIN:
```sql
update public.coach_settings set value = extensions.crypt('NEWPIN', extensions.gen_salt('bf')) where key = 'coach_pin';
```

- **Roster edit** — skill dropdown, free-text Pos 1 / Pos 2, saved on change. "Notes" opens a
  dated log per player; the table shows only the latest entry.
- **Live scoring** — from a game row click *Score*. Open match → Start 1st half → Goal buttons
  (scorer / assist / own goal) → End half → … → Finalize. The clock is derived from a stored
  kickoff timestamp, so refreshes and locked phones don't lose time. Spectators without the
  PIN see a read-only board that refreshes every 10 s. Teams with `live_scoring = false`
  (Fort Green) get no scoring controls.

## Phase 2 ideas (not started)

- Substitution planning across periods; practice sessions saved from the drill library
- Upgrade the PIN gate to Supabase Auth if notes ever get sensitive
- Load parent contacts into `guardians` behind a coach-only login
