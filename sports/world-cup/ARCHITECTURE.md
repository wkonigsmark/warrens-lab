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

The main score should reward clear group prediction skill. Precision-heavy outcomes, such as exact Round of 32 matchups, should be used as tie-breakers because third-place permutations can become chaotic.

Potential Stage 1 scoring:

- Correct group winner: 3 points
- Correct group runner-up: 2 points
- Correct advancing third-place team: 1 point
- Correct eliminated fourth-place team: 1 point
- Perfect full group order bonus: 2 points

Potential tie-breakers:

1. Correct exact Round of 32 teams.
2. Correct exact Round of 32 matchups.
3. Correct exact Round of 32 slot placement.
4. Correct ordered top 8 third-place teams.
5. Submission time, only if everything else is tied.

## Build Philosophy

The pool entry path should stay simple enough to complete on a phone with one thumb. The broader hub can become richer, but the entry flow should not become cluttered by news, rankings, odds, or editorial content.

The hub should feel like one connected World Cup project, but each section should have a clear job.
