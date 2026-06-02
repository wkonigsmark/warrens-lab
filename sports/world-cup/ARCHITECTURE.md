# Warren's World Cup Hub Architecture

This project is intended to grow from a simple World Cup pool entry tool into a broader hub for pool entries, tournament data, rankings, odds, news, commentary, simulation, and live pool tracking.

The core idea is to separate the project into clear product areas while keeping tournament data and shared logic centralized. The pool entry experience should stay fast and simple, while the wider hub can become richer over time.

## Primary Goals

1. Make it extremely easy for someone to submit a valid pool entry.
2. Keep tournament data accurate, explicit, and reusable across every tool.
3. Build scoring and scoreboard systems that can handle payment status, voided entries, and tie-breakers.
4. Preserve the fun exploratory tools, including simulation and rankings, without mixing them into official pool scoring.
5. Create a central World Cup destination for fixtures, news, odds, rankings, commentary, and pool standings.

## Directory Roles

`/pool`

The public entry flow. This is where users submit their group-stage pool picks. It should remain mobile-first, fast, and low-friction.

`/admin`

Private operational tooling. This should handle entry review, payment confirmation, duplicate or voided entries, exports, and eventually scoring administration.

`/simulation`

The fun simulator experience. This can reuse shared tournament data but should remain separate from official pool entries and official scoring.

`/meta`

The tournament reference layer. This should include groups, fixtures, venues, kickoff times, bracket rules, third-place advancement rules, and any static explanatory pages.

`/rankings-odds`

The W-Index, team rankings, odds, implied probabilities, model notes, and related analysis.

`/news`

World Cup news feeds and curated headlines.

`/scoreboard`

The live pool tracking experience. This will eventually show leaderboard position, scoring details, who is alive, who is eliminated, and what outcomes each entry needs.

`/editorial`

Original commentary, previews, observations, embedded media, and curated links.

`/data`

The source of truth for tournament data. This should eventually contain explicit JSON or JS modules for teams, groups, fixtures, venues, bracket rules, third-place maps, and scoring rules.

`/shared`

Reusable UI, helpers, scoring logic, data parsing, flag utilities, and common components used by multiple sections.

`/archive`

Old experiments, deprecated prototypes, snapshots, and prior versions that should not clutter the active product areas.

## Data Principles

Tournament data should be explicit, not inferred from stale schedule rows or unrelated tools. The same source of truth should feed the pool, simulation, scoreboard, metadata pages, and rankings.

Core data sets to maintain:

- `teams`
- `groups`
- `fixtures`
- `venues`
- `third-place-map`
- `bracket-rules`
- `scoring-rules`

## Pool Architecture

The pool should be split into stages.

Stage 1 is the group-stage pool:

- Rank every group from 1st through 4th.
- Pick the top 8 third-place teams.
- Generate the predicted Round of 32 field and matchups.
- Stop before knockout winner picks.

Stage 2 can be a separate knockout-only pool:

- Launched once the real knockout bracket is known.
- Uses the actual Round of 32 matchups.
- Lets users pick winners through champion, including the third-place match.

## Entry Storage

A database layer will be needed before launch. Supabase is a strong candidate because it can handle structured entries, simple admin workflows, authentication, and exports.

Likely core tables:

- `entries`
- `entry_group_picks`
- `entry_third_place_picks`
- `payments`
- `actual_group_results`
- `scores`

Entry status should support at least:

- `pending`
- `paid`
- `void`
- `duplicate`

## Scoring Thinking

The main score rewards exact group-play prediction skill. The pool is group play only; the projected Round of 32 bracket is useful context, but knockout results are not part of this stage's score.

Stage 1 scoring:

- Correct group winner: 4 points
- Correct group runner-up: 3 points
- Correct group third place: 2 points
- Correct group fourth place: 1 point
- Correct third-place team advancing to the knockout round: 2 additional points

Maximum score is `12 groups x 10 points = 120`, plus `8 advancing third-place teams x 2 points = 16`, for a total ceiling of `136`.

Tie-breakers:

1. Number of groups picked perfectly from 1st through 4th.
2. Number of third-place knockout advancers picked correctly.
3. Closest absolute difference to total goals scored in group play.

Payout structure:

- Total purse: confirmed paid entries x `$50`
- Organizer fee: `5%` of total purse
- Net pool: `95%` of total purse
- Winner: `70%` of net pool
- Runner-up: `20%` of net pool
- Third place: `10%` of net pool

## Build Philosophy

The pool entry path should stay simple enough to complete on a phone with one thumb. The broader hub can become richer, but the entry flow should not become cluttered by news, rankings, odds, or editorial content.

The hub should feel like one connected World Cup project, but each section should have a clear job.
