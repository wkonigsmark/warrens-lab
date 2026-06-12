# World Cup Directory Review

Last reviewed: June 11, 2026

## Purpose

This document separates the files required to operate Warren's World Cup Pool from historical prototypes, paused ideas, generated artifacts, and redundant files.

No files should be deleted solely because they appear in a cleanup list below. Follow the dependency notes and cleanup sequence first.

## Executive Summary

The active product is a static website with a small local Python admin service and Supabase as the database.

The critical runtime is:

- Public homepage and feature pages
- Central tournament and W-Index data
- Shared CSS
- Pool entry and Supabase submission logic
- Scoreboard and scoring engine
- Local admin service
- Supabase schema, lock, and results SQL

The largest cleanup opportunities are:

- Old `world-cup-1` and `world-cup-2` prototypes
- Paused and unreliable squad datasets
- The unused music file
- Finder and Python cache files
- Older duplicate backups
- Placeholder pages that are still linked from navigation

One important exception: `archive/world-cup-1/bracket_lookup.js` is still imported by the live pool, scoreboard, and simulator. The archive cannot be removed until that file is moved into an active shared location and its imports are updated.

## Critical Runtime Files

These files are required by the public site and should be retained.

| Path | Role |
| --- | --- |
| `index.html` | Public homepage, purse display, primary navigation, W-Index ticker |
| `shared/world-cup.css` | Shared visual system used across the project |
| `pool/index.html` | Pool rules, entry workflow, validation, review, and submission |
| `scoreboard/index.html` | Public standings, projections, match center, commissioner controls |
| `scoreboard/scoreboard-engine.js` | Group tables, scoring, tiebreakers, and standings calculations |
| `fixtures/index.html` | Searchable tournament schedule |
| `groups/index.html` | Group-strength and matchup analysis |
| `rankings-odds/index.html` | W-Index flagship interface |
| `simulation/index.html` | Tournament simulation and visualizations |
| `data/world-cup-2026.js` | Canonical teams, groups, fixtures, venues, and tournament structure |
| `data/w-index-baseline.js` | Fast local W-Index baseline and live CSV helper |
| `data/supabase-config.js` | Public Supabase URL and publishable browser key |
| `assets/eagle-world-cup.png` | Homepage visual asset |
| `archive/world-cup-1/bracket_lookup.js` | Live Round of 32 mapping dependency; move before archive cleanup |

`data/supabase-config.js` may be committed because it contains the publishable browser key, not a secret service-role key. Its safety depends on correct Supabase Row Level Security and RPC permissions.

## Critical Operational Files

These files support administration, backups, database setup, submission locking, and official results.

| Path | Role |
| --- | --- |
| `admin/index.html` | Local pool administration interface |
| `admin/admin_server.py` | Protected local API for entries, payments, exports, and official scores |
| `admin/backup_submissions.py` | Full entry and pick backup utility |
| `admin/.env` | Local Supabase service-role credentials; never commit |
| `admin/.env.example` | Safe setup template for the local admin service |
| `supabase/schema.sql` | Full database schema, policies, RPCs, and official result table |
| `supabase/live-match-results.sql` | Focused migration for official match results |
| `supabase/lock-submissions.sql` | Submission shutdown script |
| `supabase/unlock-submissions.sql` | Emergency reopening script |
| `LOCK_AND_BACKUP_RUNBOOK.md` | Cutoff and backup operating procedure |
| `SUBMISSIONS_ARCHITECTURE.md` | Submission, payment, validation, and security design |
| `BETA_TESTING_AND_LIVE_SCORING.md` | Scoring QA and live-results operating guide |

The `BETA_TESTING_AND_LIVE_SCORING.md` filename is now dated because the pool is live. Rename it to `LIVE_SCORING_RUNBOOK.md` in a later cleanup pass after checking for external bookmarks or documentation references.

## Final Submission Backup

The authoritative completed backup currently appears to be:

`admin/backups/20260611T200243Z/`

Its manifest reports:

- 102 entries
- 5,712 normalized picks
- 102 valid entries
- 0 invalid entries
- 0 orphan picks

This directory and `World-Cup-Pool-2026-Final-Entries.xlsx` should be retained in at least two secure locations outside the deployed website repository.

The backup contains names, emails, Venmo handles, entry codes, and picks. It is sensitive operational data and must never be deployed publicly or committed to Git.

## Supporting Reference Files

These files are not required by the primary pool runtime, but they remain useful for auditing or future development.

| Path | Recommendation |
| --- | --- |
| `ARCHITECTURE.md` | Keep; broad product architecture and design intent |
| `meta/DATA_POINTS.md` | Keep as a human-readable tournament audit sheet |
| `meta/index.html` | Optional; hidden reference interface, not part of primary navigation |
| `data/teams.csv` | Optional audit/export copy; runtime uses `world-cup-2026.js` |
| `data/fixtures.csv` | Optional audit/export copy; runtime uses `world-cup-2026.js` |
| `data/group-fixtures.csv` | Optional audit/export copy |
| `data/knockout-fixtures.csv` | Optional audit/export copy |
| `data/venues.csv` | Optional audit/export copy |
| `data/supabase-config.example.js` | Keep as a safe setup template |
| `data/supabase-admin-config.example.js` | Obsolete under the current `.env` admin design; archive or update |

The CSV files are useful only if they are intentionally regenerated from the canonical JS data. Otherwise, duplicated tournament data can drift and become misleading.

## Conditional Cleanup

These directories are candidates for removal, but some require preparation.

### `archive/`

Most of this directory contains obsolete prototypes and experiments.

Keep temporarily:

- `archive/world-cup-1/bracket_lookup.js`

Recommended preparation:

1. Move `bracket_lookup.js` to `data/bracket-lookup.js` or `shared/bracket-lookup.js`.
2. Update imports in `pool/index.html`, `scoreboard/index.html`, and `simulation/index.html`.
3. Test group picks, third-place advancement, and Round of 32 generation.
4. Move the remaining archive outside the deployed site or delete it from the active repository.

### `squads/`

This section was intentionally paused and its imported roster dataset was known to be incomplete or inaccurate.

It is not linked from the active homepage and is not required for pool operation. The entire directory can be moved to an external research archive or deleted if no future squad tool is planned.

### `news/`

This is currently a placeholder, but several active pages still link to it.

Do not delete it until the `News` links are removed from:

- `groups/index.html`
- `rankings-odds/index.html`
- `fixtures/index.html`
- `scoreboard/index.html`
- `simulation/index.html`

### `editorial/`

This is a small placeholder and is not referenced by the active navigation. It can be deleted if the editorial concept is no longer planned.

### `meta/`

The page is hidden from navigation but remains a useful audit interface. It can be archived if `fixtures/` and the canonical data module provide all needed reference functionality.

### `history/`

The directory is empty and can be removed.

## Safe Generated-File Cleanup

These files are generated locally and can be removed without affecting the application:

- Every `.DS_Store`
- `admin/__pycache__/`
- Any `.pyc` files

They should also be covered by the repository `.gitignore`.

## Unused Or Obsolete Files

### Safe to remove after one final reference check

- `assets/america-the-beautiful.mp3`
  - The audio feature and FAB were removed.
  - No active page references this file.
- `data/supabase-admin-config.js`
  - The current admin service reads its secret from `admin/.env`.
  - No active code references this legacy browser config.
  - Delete it especially if it ever contained a service-role key.
- `admin/backups/20260611T184117Z/`
  - Empty backup attempt.
- `admin/backups/20260611T184606Z/`
  - Early incomplete backup with only 17 of 98 entries validating.

### Redundant after secure final-backup verification

- `admin/backups/20260611T185024Z/`
  - Valid 99-entry pre-lock snapshot; useful only as historical evidence.
- `admin/backups/20260611T185024Z.zip`
  - Duplicate packaged copy of the same pre-lock snapshot.

The final 102-entry backup should be copied outside the project before older backups are removed.

## Placeholder Pages

The following are not part of the critical pool workflow:

- `news/index.html`
- `editorial/index.html`
- `squads/index.html`
- `archive/index.html`

Deleting a placeholder page without first removing its navigation link creates a broken route. Navigation cleanup should happen in the same change.

## Recommended Active Directory Shape

```text
world-cup/
├── index.html
├── DIRECTORY_REVIEW.md
├── PROJECT_ROADMAP.md
├── ARCHITECTURE.md
├── LIVE_SCORING_RUNBOOK.md
├── LOCK_AND_BACKUP_RUNBOOK.md
├── SUBMISSIONS_ARCHITECTURE.md
├── admin/
│   ├── .env
│   ├── .env.example
│   ├── admin_server.py
│   ├── backup_submissions.py
│   └── index.html
├── assets/
│   └── eagle-world-cup.png
├── data/
│   ├── bracket-lookup.js
│   ├── supabase-config.js
│   ├── supabase-config.example.js
│   ├── w-index-baseline.js
│   └── world-cup-2026.js
├── fixtures/
├── groups/
├── pool/
├── rankings-odds/
├── scoreboard/
├── shared/
├── simulation/
└── supabase/
```

Reference CSVs and old prototypes can live in a separate non-deployed research archive.

## Recommended Cleanup Sequence

1. Copy `admin/backups/20260611T200243Z/` to two secure external locations.
2. Confirm the final manifest still reports 102 valid entries and zero orphan picks.
3. Move `bracket_lookup.js` out of `archive/` and update all three live consumers.
4. Remove Finder and Python cache artifacts.
5. Delete the unused audio file and obsolete admin config.
6. Remove the empty and invalid backup attempts.
7. Decide whether to retain the 99-entry pre-lock backup as historical evidence.
8. Remove or archive `squads/`.
9. Remove placeholder navigation links before deleting placeholder pages.
10. Move all remaining old prototypes outside the deployed site.
11. Run a full mobile and desktop smoke test before pushing cleanup.

## Do Not Delete

Do not remove or modify these during cosmetic cleanup:

- Supabase `pool_entries`
- Supabase `pool_entry_picks`
- Supabase `match_results`
- The final 102-entry backup
- Submission lock SQL
- The scoring engine
- Canonical tournament data
- Public Supabase configuration
- Local admin `.env`

The safest rule is that cleanup should never alter submitted picks, entry identifiers, official results, or scoring behavior.
