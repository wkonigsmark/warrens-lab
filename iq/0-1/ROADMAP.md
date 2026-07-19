# 0 → 1 · Roadmap

Sequence is fine here — concepts don't have to land together. Lead with percents
(most intuitive whole-number hook), then bring in decimals as "another way to
write the same amount."

## Done (v1) — full five-mode shell
- Learn — Percentages (complete): L1 what is a percent · L2 percents ↔ fractions ·
  L3 percent of a number (dots/groups + toy).
- Learn — Decimals (started): L4 Meet decimals (tenths on the 0→1 line; number line +
  tenths bar + DecimalLab toy) · L5 Three ways ½ = 0.5 = 50% (fraction/decimal/percent
  trio cards). Tenths only — no hundredths yet.
- Play: added 📏 Number Line tool (DecimalLab) beside the Percent Grid.
- Play: Percent Grid toy (drag / slide / presets, fraction link)
- Challenge: easy-win game mode — finite 10-question round → "You did it!" finish
  screen (Play again / Learn / Free Play). "Make it!" (target match) + "How much?"
  (read grid), progress pips, confetti, 🏆 halfway cheer. **This is where the kids buy in.**
- Quiz: pick-a-level (5 levels), 5 fresh questions, feedback + scored results.
  Levels: Read the Grid · Type the Percent · Percents & Fractions · Which is More? ·
  Percent of a Number.
- Worksheets: printable B&W sheets (Practice / Reminder), New Sheet + Answer Key +
  Print. Topics: Name · Color · Percents & Fractions · Compare · Percent of a Number ·
  Mixed Review.

## Progression architecture (started) — `src/lib/percentLevels.js`
The units × tiers level bank, mirroring the rest of the family (built via the
shared `_shared/quizLevels.js` `buildTieredLevels`). **7 units × 4 tiers (Intro /
Practice / Competent / Master) = 28 levels**, ids like `read-grid-intro`. Units:
Read the Grid · Type the Percent · Which is More? · Percents & Fractions · Percent
of a Number · Meet Decimals · Decimals & Percents. Each unit's `generate(tierIndex)`
scales difficulty per tier (e.g. Read-the-Grid pool quarters→tens→fives→any;
Percent-of 50/100→+25/10→+75/20→5/15/30; decimals tenths→quarters→any hundredth).
Decimals reuse the percent-grid figure (decimal out of 1 = percent out of 100), so
no new figure component is needed. Question shape matches the existing
QuizShell/QuizFigure. Validated by `percentLevels.check.js` (`node
src/lib/percentLevels.check.js`): 28 levels × 300 draws all pass invariants.
*This replaces the flat 5-level `percentQuiz.js` as the progression source.*

Next to wire it up (mirrors Fractions):
1. Point QuizMode at `percentLevels.LEVELS` (tiered level picker + pass tracking).
2. Add a **ProgressMode** (topic × tier tracks + "pick up where you left off" CTA)
   and default the app to it — same as Fractions now does.
3. Wire progress tracking (UserPicker + PinGate + sessions → `_shared/progress`),
   register `0-1` / `ants-0-1` in the shared `TOOL_CATALOG`.

## Next up (decimals)
- Extend Quiz + Worksheets to decimals: read-the-line, write the decimal, match the
  trio (½ / 0.5 / 50%), order decimals on the line. (Currently decimals are Learn +
  Play only.)
- Maybe a decimals Challenge question type (drag the dot to a target decimal).
- Later: hundredths (0.25, 0.05) — unlocks ¼ = 0.25 = 25% and the full grid as
  hundredths. Hold until tenths are solid.

## Later (polish)
- A banner PNG (color hero + b&w worksheet logo), like the other Ants tools —
  currently a text wordmark stands in for both.
- Grow Quiz/Worksheet coverage as new Learn concepts (decimals) land.
