# 🗺️ Ants & Exponents — Roadmap

Where we are and what's next. v1 is **feature-complete**: all four modes
(📖 Learn · 🧭 Play · 📚 Quiz · 🖨 Worksheets) are built, verified, and branded
with both banner images. This file tracks what comes after.

_Last updated: 2026-06-03_

---

## ✅ Done

- **Learn** — 20-scene scroll-down lesson: "fast multiplying" framing → base/exponent
  notation → squared (the literal square grid) → square numbers → doubling grows fast →
  powers of 10 → **product rule** (add exponents) + "one catch" → **quotient rule**
  (subtract exponents, shown by canceling) → **the exponent-0 mystery** (count down to 1).
- **Play** — base/exponent steppers with a live power, spoken reading, a matching picture
  (row → square → stacked-layers cube → "too big to draw"), growth staircase, and a
  "fast multiplying vs. plain multiplying" card.
- **Quiz** — 14 questions across **7 levels** (Squares, Small powers, Write-as-a-power,
  Powers of 10, Which-is-bigger, Multiply powers, Divide powers), guided feedback, score, regen.
- **Worksheets** — **8 topics** × Easier/Standard/Harder, printable + branded, answer key.
- **Branding** — full-color hero banner + b&w worksheet wordmark wired in.
- Print fix: nav + toolbar correctly hidden when printing.
- Guided prompts: `ExpandPrompt`, `ReadPowerPrompt`, `ProductRulePrompt`, `QuotientRulePrompt`.

---

## 🎯 Next up (high priority)

### 1. Print QA pass on the hardest sheets
On **Harder**, answers get big (9⁵ = 59,049) and *Expand & Solve* answer-key lines get long.
- Verify a Harder *Expand & Solve* sheet **with the answer key on** still fits one portrait page.
- If tight: shrink the key font, drop that combo to 10 problems, or wrap the key to two lines.

### 2. Negative exponents (the next real concept)
- Continue the exponent-0 staircase one step further: 2⁰ = 1, 2⁻¹ = ½, 2⁻² = ¼ …
- A Learn scene + a Play toggle that allows negative exponents (show the fraction result).
- Keep it gated/optional so v1's whole-number world stays clean for the youngest pass.

### 3. Reinforce the new rules elsewhere
- **Quiz:** consider a combined "mixed rules" level once there are enough rule levels.
- **Worksheets:** a **Mixed Rules** sheet (multiply + divide together), and add multiply/
  divide into the existing **Mixed Review** pool (currently only the basics).

---

## 💡 Later / nice-to-have

- **Play: a "cube" upgrade** — a real isometric 3-D cube for exponent 3 (currently shown as
  stacked square layers, which works well but isn't 3-D).
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
