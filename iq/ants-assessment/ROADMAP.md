# Ants & Assessment — Roadmap

**The vision:** a hub that assesses a kid across every competency the `/iq` suite
teaches, tracks growth over time, and always knows what to recommend next.

## v1 — shipped (the spin-up)
- Topic picker (six math competencies, mirroring the sibling tools)
- 3-rung difficulty ladder per topic, fresh/randomized each run
- Forgiving multiple-choice flow with gentle feedback
- Results report: proficiency band + score bar per topic
- "Practice this next" deep-link to the weakest topic's sibling tool

## Adaptive engine — core built (not yet wired to UI)
`src/lib/adaptive.js` — a transparent weighted adaptive staircase on a 1–10
difficulty scale. Correct→step up, wrong→step down; up-steps smaller than down so
it settles where the student wins ~70% (the sweet spot); the step shrinks on each
reversal to converge; response time is a second signal (fast+correct = climb
harder, slow+correct = hold, fast+wrong = drop). Pure & immutable → drops into
React directly. Proven with a simulated-student harness (`adaptive.sim.js`,
`node src/lib/adaptive.sim.js`): across abilities 2.5→9.5 it lands every learner
in a 64–75% win band, and a fast kid gets harder work than a slow kid at the same
raw ability. Reports a sweet-spot `level` + `difficultyTier()` (Easier / Standard
/ Harder / Advanced) that the resource report will map to worksheets.

## Question bank — widened to 1–10 (done)
`src/lib/competencies.js` — every competency now has a 10-level difficulty curve
with a written `rubric` (the contract the engine, report, and worksheet mapping
lean on) and a `generate(difficulty)` that randomizes operands so nothing is
memorizable. Whole-number friendly, multiple-choice throughout. Fuzz-checked by
`competencies.check.js` (`node src/lib/competencies.check.js`): 6 × 10 × 400 draws
all pass invariants (answer always among choices, no degenerate option sets), plus
a one-sample-per-level eyeball table. Levels span e.g. Arithmetic add-within-10 →
2-digit×1-digit; Exponents small squares → negative exponents; Algebra x+a=b →
variable-on-both-sides. (The live run still uses levels 1–3 until the engine is
wired in — no regression.)

## Next up
- **Wire the engine into the run** — replace the fixed 3-rung ladder with the
  adaptive loop (`adaptive.js` serving `generate(nextDifficulty)`); capture answer
  time per question. *Open tuning Q:* depth vs. length — current settings average
  ~9 Qs/topic (×6 topics = long). Likely cap total questions or run fewer topics deep.
- **Resource report** — (competency, tier) → curated worksheet deep-links for
  parents/teachers; needs sibling worksheets to be deep-linkable by difficulty
  (audit pending).
- **Reading/writing & science** — extend beyond math to the Lexicon / Stencil /
  chemistry / anatomy tools so the check-up covers the whole toolkit.

## Bigger bets
- **Saved profiles + history** — per-kid progress over time, "you leveled up
  Fractions since last week!", a growth chart. (localStorage first, no backend.)
- **Printable progress report** — a parent-facing one-pager (reuse the family's
  worksheet print pipeline).
- **Grade/age presets** — "Check a 7-year-old" pre-tunes which levels count as
  on-track, so bands mean something against expectations.
- **Parent dashboard** — pick goals, see which tools to push this week.

## Open questions
- How honest should bands be? Kids' tools here lean celebration-first
  (easy wins, lots of confetti) — assessment needs *some* truth to be useful.
  Current answer: warm framing, no mid-quiz score, honest end report.
- Single shared question bank vs. importing generators from each sibling tool so
  questions never drift from what each tool actually teaches.
