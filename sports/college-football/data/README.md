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
| `raw/draft-capital/by-school-2021-2025.json` | NFL draft capital by school (via CFBD) | 2025 | 2026-08-14 | 164 |
| `raw/recruiting-247/2025.json` | 247Sports Composite (via CFBD) | 2025 | 2026-07-07 | 232 |
| `raw/recruiting-247/2026.json` | 247Sports Composite (via CFBD) | 2026 | 2026-08-14 | 221 |
| `raw/revenue-share/2026.json` | House settlement revenue-sharing cap | 2026 | 2026-08-14 | 1 |
| `raw/sp-plus/ratings-2025.json` | SP+ ratings (via CFBD) | 2025 | 2026-07-07 | 136 |
| `raw/sp-plus/ratings-2026.json` | SP+ ratings (via CFBD) | 2026 | 2026-08-14 | 138 |
| `raw/sp-plus/returning-2025.json` | SP+ returning production (via CFBD) | 2025 | 2026-07-07 | 134 |
| `raw/sp-plus/returning-2026.json` | SP+ returning production (via CFBD) | 2026 | 2026-08-14 | 136 |
| `raw/transfer-portal/2026.json` | Transfer portal net (computed from CFBD player feed) | 2026 | 2026-08-14 | 417 |

<!-- PULL-STATUS:END -->

## Phase 2 status — v1 composite wired up

`api/build_power_index.py` now blends the normalized sources into the index:

- **Composite** = weighted z per team (SP+ 0.35, returning production 0.20,
  recruiting 0.20, portal net 0.15, draft capital 0.10), weights renormalized
  when a source is missing a team, then **standardized across FBS** (the raw
  weighted average has σ < 1 and would compress the point-spread scale) and
  converted at 9 points per σ.
- **Index v1** = 50% results base (2025 SRS regressed 35% to 2026 conference
  strength) + 50% composite. The ESPN poll blend is retired to display-only;
  `ratingV0` is kept in the output for comparison.
- Data policy: draft-capital zero-pick FBS schools enter at value 0
  (`zeroFillFbs` in `normalize_sources.py`).
- All knobs live in the constants block at the top of `build_power_index.py`.

**Step 5 backtest — done** (`api/backtest_composite.py`, results in
`backtest-2025.json`): July-2025-knowable inputs scored against actual 2025
SRS across 136 teams. Base only r=0.765 / MAE 5.71 · composite only r=0.726 /
6.06 · **v1 50/50 blend r=0.772 / 5.58 — beats both**. The blend sweep is flat
from 20–60% composite (nominal best 30%); 50/50 retained as within one-season
noise. Caveats: SP+ input was the prior-year final (mirroring the current
stand-in config), and this validates team-strength prediction only — playoff
*selection* anomalies (Duke won the 2025 ACC while backtesting #56) are a
different problem.
