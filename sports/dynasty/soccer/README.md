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
│   ├── pitch.js               # pitch geometry, shared by the builder and print sheet
│   ├── nav.js                 # floating pill nav + live-match badge (every page)
│   ├── drills.js              # drill loading + filtering, shared by library and planner
│   ├── quiz-engine.js         # Leitner-box scheduling for the Laws quiz
│   ├── stopwatch-page.js      # per-player timing, localStorage only
│   ├── practice-page.js       # practice plan builder
│   ├── lineup-page.js         # interactive pitch / lineup builder
│   ├── team-page.js           # team page: roster, coach edit mode, schedule, results
│   └── match-page.js          # live scoring page
├── match/index.html           # ?event=<uuid> — scoreboard for anyone, controls in coach mode
├── lineup/index.html          # ?team=<slug>[&event=&lineup=] — formation builder (coach only)
├── lineup/print.html          # printable blank pitch (no login needed)
├── practice/index.html        # ?team=<slug>[&event=&plan=] — practice plan builder (coach only)
├── stopwatch/index.html       # ?team=<slug>[&event=] — sprint timing (coach only)
├── rules/index.html           # Laws of the Game library (open to everyone)
├── rules/quiz/index.html      # adaptive 3-choice quiz over the Laws
├── drills/index.html          # drill library (reads data/drills.json); ?specialty=&difficulty=&q= deep links
├── shared/themes.css          # club colours + monogram crests keyed by <body data-club>
├── teams/
│   ├── _template/index.html   # copy for a new team
│   ├── arsenal-fall-2026/
│   ├── cardiff-city-fall-2026/
│   └── fort-greene-fall-2026/
└── supabase/
    ├── schema.sql             # full schema incl. events (fresh installs)
    ├── migrate-2026-09-08-events.sql      # adds events to a DB created before 9/8
    ├── migrate-2026-09-08-coach-mode.sql  # PIN, evals, notes, matches, goals + RPCs
    ├── migrate-2026-09-09-lineups.sql     # saved lineups + RPCs
    ├── migrate-2026-09-09-practice.sql    # saved practice plans + RPCs
    ├── seed.sql               # sports + Fall 2026 teams + all three rosters (idempotent)
    ├── seed-events.sql        # Fall 2026 DSL schedule, all three teams (idempotent)
    └── seed-rosters-cardiff-fortgreene.sql  # the two other Fall 2026 rosters
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
| `matches`         | clock state, score, status, actual half durations   | read        |
| `goals`           | per goal: half, seconds, side, scorer, assist, OG   | read        |
| `player_evals`    | skill 1–4, pos 1/2 per roster row (coach only)      | **none**    |
| `player_notes`    | dated coaching notes per roster row (coach only)    | **none**    |
| `coach_settings`  | bcrypt hash of the coach PIN                        | **none**    |
| `lineups`         | a saved formation for a team, optionally a game     | **none**    |
| `lineup_slots`    | which player sits in which slot code                | **none**    |
| `practice_plans`  | a session: name, date, notes, ordered `items` jsonb | **none**    |
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

## Practice planner

`practice/index.html?team=<slug>` builds a session. The drill library sits beside the plan; press
**+** on any drill to append it, and drills already used show an "in plan" badge. Blocks are
reordered with the arrow controls, each carries an editable duration and your own coaching note,
and **+ Text block** inserts free text for anything that is not a library drill (scrimmage, team
talk, water break). The running total updates as you type, so you can fit a session to the time
you actually have.

A plan is stored as an ordered `items` array in jsonb, each entry either
`{type:"drill", drill_id, title, minutes, note}` or `{type:"text", title, body, minutes}`.
Reordering is therefore just array order, with no position columns to renumber. The drill title is
snapshotted alongside its id so editing `drills.json` can never blank out a saved plan; if an id
disappears the block still renders, flagged "not in library".

**Print / PDF** renders a separate clean document — numbered blocks with times, drill summaries,
your notes, coaching cues, equipment and a tick box per block — rather than printing the editor.

## Laws of the Game

`rules/index.html` is a team-agnostic reference for all 17 Laws, reachable from the ⋯ menu and a
hub card. Content lives in `data/rules.json`.

**Written for adults.** The app is not meant to be handed to a young child. Each Law carries an
"Ask your player" prompt — a question to put to them and the answer to listen for — so a parent or
coach drives the conversation. Two depths are available: plain language, and full detail for
anyone studying toward a badge.

**Five stages, each with a stated target**, from sideline basics up to high school refereeing.
Picking a stage shows every Law needed at or before it, so the list grows as the reader does.

**The Laws are not high school rules.** US high school soccer is played under NFHS rules, which
differ on timing, substitutions and cards. Laws 3, 4, 5, 7, 10 and 12 carry an explicit NFHS
callout and a "NFHS differs" badge.

**Copyright.** The Laws are published by IFAB and the official text is copyrighted. Everything in
`rules.json` is original plain-language writing with a link to the official document — never
reproduced text. Keep it that way when adding content.

**Printables:** the full Laws at the current stage, or a cut-up sheet of ask/answer prompt cards.

## Laws quiz

`rules/quiz/index.html` drills the Laws with three-choice questions from `data/quiz.json`
(52 questions, all 17 Laws). Pick a starting bucket and a learner name — progress is stored per
learner in `localStorage` under `dynasty-soccer:quiz:<name>`, so several kids can share a device.

**Scheduling** lives in `shared/quiz-engine.js` and is a Leitner box system. A right answer
promotes a question and pushes it further out; a wrong answer drops it to box 1 so it returns
within about three questions. "Due" is counted in questions answered rather than wall-clock time,
so a session behaves the same however long it runs. A `WORKING_SET` cap keeps roughly nine
questions in circulation — without it, box-1 cards come due so often that new material never gets
introduced.

**Graduation** needs all four of: at least 8 recent answers, 80%+ recent accuracy, every question
in the band seen, and 60%+ mastered (box 4 or higher). Unlocking a stage resets the rolling
accuracy window so the next band is judged on its own.

**Stage keys must match across three places** — `data/rules.json` stages, `data/quiz.json`
question tags, and `STAGES` in `quiz-engine.js`. They are `sideline, playing, club, referee, hs`.

## Drill library

`drills/index.html` reads `data/drills.json` (25 U6–U8 drills, filterable by search,
difficulty and specialty). It accepts deep links — `?specialty=dribbling`, `?difficulty=beginner`,
`?q=cones` — which is how the Practice Planner quick picks on each team page work. The
library links back to every active team.

## Navigation

`shared/nav.js` renders one floating pill nav on every page, sticky at the top. Three game-day
utilities are always visible and never collapse — **⚽ Score**, **📋 Lineup**, **👦👧 Check-in** —
because on a Saturday those are the only things that matter. Everything else (team roster,
stopwatch, practice plan, drill library, all teams) sits behind the **⋯** menu. Class names are
prefixed `an-` because `style-lab.css` already defines its own `.nav-item` menu with a fade-in.

**Where the links point.** The nav resolves the session *nearest to today* — today's if there is
one, otherwise whichever is closest in either direction — so Check-in and Lineup always land on
the right session without being told. **Score** resolves separately to the nearest *scoreable
game* (skipping practices and teams with `live_scoring = false`), and a running match overrides
everything. From there **▶ Start match** opens the match and starts the clock in one tap, so it
is two taps from any page to a live scoreboard.

**Live match badge.** Whenever any match has `status = 'live'`, a pulsing `LIVE 2–1` chip appears
at the left of the nav on every page and links straight back to the scoreboard. It never
collapses. Nothing is lost by navigating away mid-game: goals are written to the database the
moment you tap, and the clock is derived from the stored `period_started_at` timestamp rather
than a JavaScript counter, so it keeps running while you are on another page, on a locked phone,
or offline.

## Stopwatch

`stopwatch/index.html?team=<slug>` times players one at a time. Pick a session and the squad is
filtered to whoever is checked in. Each player gets a tile: Start, Stop, then "Run again" for
another attempt. Every attempt is kept and the best is used for ranking, with the fastest player
flagged. Times live in `localStorage` under `dynasty-soccer:stopwatch:<slug>` — they are never
written to the database, and they survive a refresh or a locked phone. **Print / PDF** produces
a ranked results sheet with every attempt.

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

**Printable blank pitch.** `lineup/print.html` renders the same field on white paper for drawing
tactics by hand — 1, 2 or 4 pitches per sheet, an optional faint formation guide, and blank
date / opponent / notes lines. It needs no PIN, since an empty field is not private. Both pages
draw from `shared/pitch.js`, so the geometry never drifts between screen and paper.

The builder itself lives at `lineup/index.html?team=<slug>`. Tap a player, tap a spot; tap a
filled spot to bench that player. Lineups can be tied to a game and saved. They are coach-only,
since who is benched is not public information.

## Coach mode

Click **Coach mode** on a team or match page and enter the PIN. The PIN is never in the
repo: every `coach_*` Postgres function checks it against a bcrypt hash in `coach_settings`
(wrong PIN sleeps 300 ms then errors). The public key has no write access to any table.
The PIN is kept in `sessionStorage` until the tab closes.

**Setting or changing the PIN.** The schema seeds a placeholder and the real PIN is never stored
in the repo — set it directly against the database:
```sql
update public.coach_settings
set value = extensions.crypt('NEWPIN', extensions.gen_salt('bf'))
where key = 'coach_pin';
```
`PIN_LENGTH` in `shared/coach.js` (currently 4) must match the number of digits, since the form
auto-submits when it is reached.

- **Roster edit** — skill dropdown, free-text Pos 1 / Pos 2, saved on change. "Notes" opens a
  dated log per player; the table shows only the latest entry.
- **Half timing.** Goal minutes use the *nominal* half length, the way real football does: the
second half always starts at 20:00 even if the first ran to 23. Separately, ending a half records
how long it actually ran (`period1_sec`, `period2_sec`), so the scoreboard can show
"1st half 23:12 +3:12" and the results list can show total time played. Finalising straight from a
running half still captures that half. Set the half length in 5-minute steps from the match
controls — before a match opens it sets the team default, after it opens it applies to that match
only, so adjusting it never rewrites a game already played.

**Live scoring** — tap ⚽ Score in the nav, or a game row's *Score* link. Open match → Start 1st half → Goal buttons
  (scorer / assist / own goal) → End half → … → Finalize. The clock is derived from a stored
  kickoff timestamp, so refreshes and locked phones don't lose time. Spectators without the
  PIN see a read-only board that refreshes every 10 s. Teams with `live_scoring = false`
  (Fort Greene) get no scoring controls.

## Phase 2 ideas (not started)

- Substitution planning across periods
- Upgrade the PIN gate to Supabase Auth if notes ever get sensitive
- Load parent contacts into `guardians` behind a coach-only login
