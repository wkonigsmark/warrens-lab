# 🗺️ Ants & Exponents — Roadmap

Where we are and what's next. All four modes (📖 Learn · 🧭 Play · 📚 Quiz · 🖨 Worksheets)
are built, verified, and branded with both banner images. Learn now has **three lessons**
(sequenced easiest → hardest: exponents → cubes → negative). This file tracks what comes after.

_Last updated: 2026-06-03_

---

## ✅ Done

- **Learn** — now **3 lessons** with a pill selector + a "What next?" footer on each
  (ordered easiest → hardest):
  - *Lesson 1 · What is an exponent?* (20 scenes): "fast multiplying" framing → notation →
    squared (literal square grid) → square numbers → doubling grows fast → powers of 10 →
    **product rule** (add) + "one catch" → **quotient rule** (subtract, by canceling) →
    **exponent-0 mystery** (count down to 1).
  - *Lesson 2 · Cubes & 3-D*: squares → cubes (the `Cube3D` isometric visual), 2³ = 8-block
    cube, why "cubed", count blocks (3³=27), `ReadCubePrompt`, cube numbers 1·8·27·64,
    cubes grow faster than squares.
  - *Lesson 3 · Negative exponents* (hardest, sequenced last): continue the staircase below
    zero (2⁻¹=½, ¼, ⅛) → "1 over the power" rule → `FlipPowerPrompt` → powers of 10 (decimals).
- **Play** — base/exponent steppers with a live power, spoken reading, a matching picture
  (row → square → stacked-layers cube → "too big to draw"), growth staircase, and a
  "fast multiplying vs. plain multiplying" card.
- **Quiz** — 14 questions across **7 levels** (Squares, Small powers, Write-as-a-power,
  Powers of 10, Which-is-bigger, Multiply powers, Divide powers), guided feedback, score, regen.
- **Worksheets** — **8 topics** × Easier/Standard/Harder, printable + branded, answer key.
- **Branding** — full-color hero banner + b&w worksheet wordmark wired in.
- Print fix: nav + toolbar correctly hidden when printing.
- Guided prompts: `ExpandPrompt`, `ReadPowerPrompt`, `ProductRulePrompt`, `QuotientRulePrompt`,
  `ReadCubePrompt`, `FlipPowerPrompt`.
- Visuals: `DotArray` (square grid), `Cube3D` (isometric block cube), `PowerLabel`, `GrowthChain`.

---

## 🎯 Next up (high priority)

### 1. Reinforce cubes (Lesson 2 is in; now practice it)
- **Quiz:** a "cubes" level (3³ = ?) — could reuse `Cube3D` as the question figure.
- **Worksheets:** a cubes topic (n³).
- **Play:** show the `Cube3D` for exponent 3 (currently Play uses stacked square layers).

### 2. Reinforce negative exponents (Lesson 3 is in; now practice it)
- **Play:** a toggle to allow negative exponents (show the fraction / decimal result live).
- **Quiz:** a "negative exponents" level (2⁻² = ? → 1/4).
- **Worksheets:** a negative-exponents topic.

### 3. Reinforce the rules elsewhere
- **Worksheets:** a **Mixed Rules** sheet (multiply + divide together), and add multiply/
  divide into the existing **Mixed Review** pool (currently only the basics).
- **Quiz:** a combined "mixed rules" level.

### 4. Print QA pass on the hardest sheets
On **Harder**, answers get big (9⁵ = 59,049) and *Expand & Solve* answer-key lines get long.
- Verify a Harder *Expand & Solve* sheet **with the answer key on** still fits one portrait page.

---

## 💡 Later / nice-to-have

- **More lessons:** *power of a power* ((2³)² = 2⁶, multiply the exponents) and an
  *exponential-growth* story lesson would both slot between cubes and negatives in difficulty.
- **Story mode** — the Ants & Angles family has illustrated stories; an "ant colony doubles
  every day" story would land the exponential-growth idea hard.
- **Power-of-a-power rule** — (2²)³ = 2⁶ (multiply the exponents). The third classic rule;
  hold until the kid is solid on add/subtract so it doesn't blur together.

---

## 🧠 Notes for future me

- **Stack/ports:** Vite + React 18 + Tailwind + framer-motion, dev port **9009** (strictPort).
  Registered in the **root** `~/.claude/launch.json` (not a per-project one) — that's what the
  preview tool reads.
- **node_modules** was copied from the `fractions` sibling (identical deps), not fresh-installed.
- **Prompt gotcha:** prompts live inside `<Scene>` wrappers that use framer-motion
  `whileInView`. They only become interactive once scrolled into view — when testing in the
  browser, `scrollIntoView` the prompt first.
- **Design rule (non-negotiable):** _guided, not rote_. Every prompt nudges toward the answer
  ("use it one more time", "count the 2s") instead of buzzing right/wrong. Keep it that way.
- **Audience:** advanced ~7-year-old who already knows multiplication. Real numbers, no
  dumbing-down, designed to still work at 9–10.
