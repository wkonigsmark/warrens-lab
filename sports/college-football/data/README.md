# Offseason Data Sources — Proprietary Index, Phase 1

Import + normalize layer only. **No blending, weighting, or composite scoring
happens here** — normalized files keep every source separate so they can be
reviewed side-by-side in the Data Lab (`data-lab.html`) before any weighting
scheme is decided.

## Pipeline

```
api/imports/run_all_imports.py   # pull all raw sources (refreshes table below)
api/normalize_sources.py         # raw/ → normalized/ with per-source z-scores
```

- `raw/` — data exactly as pulled, one envelope per file:
  `{source, url, pulledAt, season, notes, data: [{team, value, rank, raw}]}`.
  Never overwritten destructively; files are versioned by season.
- `normalized/` — same data keyed to canonical school names (from
  `teams-db.json` aliases + `EXTRA_ALIASES` in `normalize_sources.py`), with
  z-score + percentile computed **within each source independently**, raw
  value preserved alongside. FBS teams only; unmatched names are listed in
  each file's `unmatched` array, never silently dropped.

### Manual overrides
Drop a file in the raw envelope at the `manual-*.json` paths listed in
`normalize_sources.py` (e.g. `raw/sp-plus/manual-2026.json`) and the
normalizer prefers it automatically. This is the intended path for paywalled
sources you copy out by hand.

## Sources

### 247Sports Composite (recruiting)
- **Path**: CFBD `/recruiting/teams` (licensed 247 Composite team points).
- **Not scraped**: 247sports.com directly — ToS-restricted and bot-blocked.
- **Limitation**: the 2026 class is not in CFBD yet; the **2025 class** is
  standing in (flagged in the file). Re-run the importer when CFBD loads 2026,
  or paste the 2026 board into `raw/recruiting-247/manual-2026.json`.

### Transfer portal net
- **Path**: computed from CFBD `/player/portal` (4,400+ player moves, 2026
  cycle): net = Σ ratings gained − Σ ratings lost. Unrated players are
  star-mapped (5→0.98 … 1→0.72), default 0.75.
- **Not scraped**: 247/On3 editorial team portal rankings — ToS-restricted.
  This computed net is an approximation of theirs; paste their board into
  `raw/transfer-portal/manual-2026.json` if the editorial version is wanted.

### NFL draft capital
- **Path**: CFBD `/draft/picks`, trailing 5 drafts (2021–2025).
  capital = Σ (257 − overall pick). Raw pick lists preserved in the file so a
  fancier value curve can be swapped in without re-pulling.
- **Note**: FBS schools with zero picks over the window (18 of them, e.g.
  Akron, Army) are *absent* from this source rather than present-at-zero —
  a real signal, but currently excluded from the source's z-score pool.
  Revisit when designing the blend.
- Lagging validation signal, not a current-season input.

### SP+ ratings & returning production
- **Path**: CFBD `/ratings/sp` and `/player/returning` (Connelly partnership).
- **Not scraped**: the ESPN+ SP+ articles — paywalled.
- **Limitation**: 2026 projections not in CFBD yet; **2025 finals** are
  standing in for SP+, and returning production is the **2025** figure (which
  describes rosters entering 2025, NOT 2026 — plumbing validation only until
  the 2026 numbers publish, usually with the February/August articles).
  Manual overrides: `raw/sp-plus/manual-2026.json`,
  `raw/sp-plus/manual-returning-2026.json`.

### Revenue-share cap
- Single constant from the House v. NCAA settlement: $20.5M year-1 (2025-26)
  aggregate per-school cap, ~4%/yr escalator (2026-27 ≈ $21.3M). Not per-team;
  stored as a potential future normalizing denominator. Copied through to
  `normalized/` untouched.

## Pull status

<!-- PULL-STATUS:START -->

| Raw file | Source | Season | Pulled | Rows |
|---|---|---|---|---|
| `raw/draft-capital/by-school-2021-2025.json` | NFL draft capital by school (via CFBD) | 2025 | 2026-07-07 | 164 |
| `raw/recruiting-247/2025.json` | 247Sports Composite (via CFBD) | 2025 | 2026-07-07 | 232 |
| `raw/revenue-share/2026.json` | House settlement revenue-sharing cap | 2026 | 2026-07-07 | 1 |
| `raw/sp-plus/ratings-2025.json` | SP+ ratings (via CFBD) | 2025 | 2026-07-07 | 136 |
| `raw/sp-plus/returning-2025.json` | SP+ returning production (via CFBD) | 2025 | 2026-07-07 | 134 |
| `raw/transfer-portal/2026.json` | Transfer portal net (computed from CFBD player feed) | 2026 | 2026-07-07 | 409 |

<!-- PULL-STATUS:END -->

## Phase boundaries

Explicitly **not** built yet (by design): composite/blended scores, weighting
schemes, any formula combining sources. Phase 2 decides those after reviewing
this data in the Data Lab.
