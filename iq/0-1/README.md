# 0 → 1

A dead-simple first taste of **percents and decimals** for young kids — a sibling
to Ants & Fractions, living on the 0→1 number line. The whole idea: percent is
just *"out of 100,"* shown on a grid of 100 squares, and tied straight back to the
fractions they already know.

**Stack:** Vite + React + Tailwind + framer-motion (same as the rest of the family).
**Dev:** `npm install && npm run dev` → http://localhost:9010 (strict port).

## Scope (percents first; decimals come later)

The full Ants-family five-mode shell, all on the 100-square grid:

- **Learn** (basic percentages, complete)
  - Lesson 1 · *What is a percent?* — out of 100; 0% / 100% / 50%; then a live grid to poke at.
  - Lesson 2 · *Percents & fractions* — ¼=25%, ½=50%, ¾=75%, whole=100%.
  - Lesson 3 · *Percent of a number* — 50% of 10 = 5; split a group into equal parts
    and take some (dots model), with a "tap a percent of 20" toy.
- **Play**
  - 🔲 **Percent Grid** — drag / slide / tap presets to fill 0–100; big readout,
    "X out of 100," and the friendly fraction lights up at ¼·½·¾·whole.
- **Challenge** — a short **10-question round** of easy-win mini-games on the same
  grid mechanic, then a "You did it!" finish screen (Play again / Learn / Free Play):
  - *Make it!* — drag/slide to hit a target (e.g. "Make it 50%!" / "Make one half!");
    snaps into place + celebrates when within ~2 squares.
  - *How much?* — read a filled grid, tap the right percent from 3 choices; a wrong
    tap just shakes (no penalty).
  - Progress shows "Question X of 10" + a row of star pips; confetti on every win,
    a 🏆 cheer at the halfway mark.
- **Quiz** — pick-a-level, 5 fresh questions, instant feedback + scored results.
  Levels: Read the Grid · Type the Percent · Percents & Fractions · Which is More? ·
  Percent of a Number. (Generators in `src/lib/percentQuiz.js`.)
- **Worksheets** — printable B&W sheets (Practice / With-a-Reminder), New Sheet +
  Answer Key toggle + Print. Topics: Name · Color · Percents & Fractions · Compare ·
  Percent of a Number · Mixed Review. (Generators in `src/lib/percentWorksheet.js`.)

## Components

- `PercentGrid` — pure 10×10 visual; `value` squares filled, optional `onSet` to drag-fill.
- `PercentLab` — the stateful grid toy (grid + slider + presets); `compact` form embeds in lessons.
- `Scene` / `Words` — the scroll-down lesson primitives shared with the family.

See `ROADMAP.md` for what's next.
