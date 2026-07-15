# Ants & Statistics — Roadmap

AP Stats–adjacent, high-school level. More reading/reasoning than the younger
Ants games, fewer manipulatives. Reuses the shared parent-auth + child-profile
system, the mastery/skill classification model, and the Supabase progress
tables — no parallel systems.

## Core mechanic — gated tier ladders (like the younger Ants games)
Each topic has a **Learn** path (concept intro → worked examples → untracked
practice) and a **gated tier ladder** of 5 difficulty tiers you clear in order:

  🌱 Foundational → 🧱 Building → 🎯 On Level → 💪 Advanced → 🚀 AP-Ready

A tier is a **climb**: answer questions to climb 8 rungs to the summit.
Questions **auto-advance** — answer, get a quick correct/wrong flash, next
question, no button. A correct climbs a rung; a wrong spends a **miss**. Blow
the tier's miss budget (4 → 3 → 2 → 2 → 1 as tiers get harder) and you slide
back and retry. Clearing a tier **unlocks** the next. The top tiers add a
**speed gate**: you must also average under a time limit (Advanced < 30s,
AP-Ready < 22s per question) to earn mastery — "you know it, now build speed."

Every question is tagged **computation** vs **interpretation-in-context**, which
alternate through each climb and are scored separately, so the report and admin
can say "strong on computation, shaky on interpretation" instead of averaging
the two away. Scaffolding hints show on the low tiers and fade out as you climb.

Topic mastery = all 5 tiers cleared. Overall progress = tiers cleared / 15.

## v1 — shipped (this build)
- Full app shell: user picker (live roster), PIN gate, home dashboard, admin.
- **🔤 Stat Words** — a dead-simple vocabulary layer BEFORE Topic 1 ("Start here" on the home). Quiz-immediately, no reading needed: meet a word (big picture + pulsing cue) then drill it with pick-the-word / pick-the-picture / yes-no, forgiving and celebratory, auto-advancing. Teaches 8 core terms by visual association — Data, Distribution, Peak, Mean (balance-beam fulcrum), Median (splitting line), Skew (pulsing tail + arrow), Outlier (lonely ringed dot), Spread (double-arrow). Built for a 4-year-old. (`VocabLab.jsx`, `VocabVisual.jsx`, `lib/vocab.js`.)
- **Topic 1 — Describing Distributions** (dotplots/histograms, shape, center, spread, outliers)
- **Topic 2 — Numerical Summaries** (mean/median, quartiles/IQR, boxplots, resistance, transformations)
- **Topic 3 — Relationships Between Variables** (scatter, correlation r, regression/prediction, residuals, causation)
- **Checkpoint A — Mixed Review** (pulls from Topics 1–3; cumulative retention)
- Inline SVG charts (dotplot, histogram, boxplot, scatter)
- Supabase progress wiring (local-first outbox → `progress_sessions`, tool_id `ants-stats`)
- Gated 5-tier climb per topic, auto-advancing questions, per-tier miss budgets + speed gates on the top tiers
- Admin cockpit: **Class View** (Tier Mastery Grid, topics × tiers) + **Skill Diagnostic** (computation vs interpretation, per unit, with gap flag) + run log

## v2 — next
- **Topic 4 — Producing Data: Sampling**
- **Topic 5 — Producing Data: Experiments**
- **Topic 6 — Probability Foundations**
- **Checkpoint B** (after Topic 6)
- **Topic 7 — Random Variables & Distributions**
- **Topic 8 — Sampling Distributions & CLT**
- **Checkpoint C** (after Topic 8, wraps v1 scope)

## Held for later (v3+)
- Inference unit: Confidence Intervals, Hypothesis Testing, + 2 more inference topics
- Optional worksheet/print export (this audience stays on-screen longer, so lower priority than the younger games)

## Open questions
- Parental-gate checkpoint: kept for v1 (matches suite convention). Revisit if it feels unnecessary for the HS audience.
