# 🗺️ Ants & Exponents — Roadmap

Where we are and what's next. v1 is **feature-complete**: all four modes
(📖 Learn · 🧭 Play · 📚 Quiz · 🖨 Worksheets) are built, verified, and branded
with both banner images. This file tracks what comes after.

_Last updated: 2026-06-02_

---

## ✅ Done (v1)

- **Learn** — 16-scene scroll-down lesson: "fast multiplying" framing → base/exponent
  notation → squared (the literal square grid) → square numbers → doubling grows fast →
  powers of 10 → **product rule** (same base → add exponents) + "one catch".
- **Play** — base/exponent steppers with a live power, spoken reading, a matching picture
  (row → square → stacked-layers cube → "too big to draw"), growth staircase, and a
  "fast multiplying vs. plain multiplying" card.
- **Quiz** — 15 questions across 5 levels, guided feedback, score, regenerate.
- **Worksheets** — 6 topics × Easier/Standard/Harder, printable + branded, answer key.
- **Branding** — full-color hero banner + b&w worksheet wordmark wired in.
- Print fix: nav + toolbar correctly hidden when printing.

---

## 🎯 Next up (high priority)

### 1. Quiz: a Product-Rule level
The new product rule (added to Learn) isn't reinforced anywhere else. Add a 6th Quiz level:
- "2² × 2³ = 2?" → pick the combined exponent
- distractors should include the classic mistake of **multiplying** the exponents (2×3=6)
  and adding the bases.
- guided explanation: "same base, so add: 2 + 3 = 5."

### 2. Print QA pass on the hardest sheets
On **Harder**, answers get big (9⁵ = 59,049) and *Expand & Solve* answer-key lines get long.
- Verify a Harder *Expand & Solve* sheet **with the answer key on** still fits one portrait page.
- If tight: shrink the key font, drop that combo to 10 problems, or wrap the key to two lines.

### 3. Learn: two more rule scenes
- **Dividing powers** — same base → *subtract* the exponents (2⁵ ÷ 2² = 2³), shown by
  crossing out matched factors. Could add a `QuotientRulePrompt` mirroring `ProductRulePrompt`.
- **The mystery of exponent 0** — why anything⁰ = 1 (count *down* the staircase: ÷ base each
  step, so 2¹=2 → 2⁰=1). A genuinely delightful "whoa" moment for this kid.

---

## 💡 Later / nice-to-have

- **Play: a "cube" upgrade** — a real isometric 3-D cube for exponent 3 (currently shown as
  stacked square layers, which works well but isn't 3-D).
- **Worksheets: a product-rule sheet** and/or a cubes-only sheet.
- **Negative exponents** (½, ¼ …) — probably a separate, later lesson; keep v1 whole-number.
- **Story mode** — the Ants & Angles family has illustrated stories; an "ant colony doubles
  every day" story would land the exponential-growth idea hard.
- **Banner polish** — the color hero is in; if we ever want the CSS-free look gone entirely,
  it already matches the family.

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
