# Ants & Statistics 📊

An AP Stats–adjacent module in the Ants & _ suite. High-school level: more
reading and reasoning, fewer manipulatives than the younger games.

- **Dev:** `npm install && npm run dev` → http://localhost:9025
- **Admin:** append `?admin` (PIN `2019`) — Class View + Skill Diagnostic
- **Stack:** Vite + React + Tailwind + framer-motion (same as ants-algebra-2)

## How it's built
- `src/lib/statsEngine.js` — the tiered ladder + the guesser/careful/mastery
  classifier, extended with the **computation vs interpretation** split.
- `src/lib/topics/` — one file per topic (`describing`, `summaries`,
  `relationships`), each exporting `generate(tier, skill)`; `index.js` holds the
  concept intros, worked examples, and the mixed-review checkpoint.
- `src/components/` — flow screens (`ConceptIntro`, `WorkedExamples`,
  `PracticeSet`, `Assessment`), the `LadderRail`, the `MiniChart` SVG charts,
  `StatsHome`, and `StatsAdminView`.

## Progress tracking
Wired into the shared `iq/_shared/progress` module (local-first → Supabase),
tool_id `ants-stats`. Each completed assessment/checkpoint writes one
`progress_sessions` row; the `payload` carries the full per-skill breakdown
(tier reached, accuracy, band) for both computation and interpretation.

See `ROADMAP.md` for scope and what's next (Topics 4–8, Checkpoints B/C).
