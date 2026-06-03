# 🥧 Ants & Fractions — Concept Roadmap

What's built, and the fraction concepts still ahead — ordered roughly by how a child
learns them, and mapped to where each piece would live in the app
(**Learn** lesson · **Play** tool · **Quiz** level · **Worksheet** topic).

Guiding rules (don't break these):
- **Picture first.** Every new idea gets a concrete pie/bar/number-line visual before any symbol.
- **Guided, not rote.** Prompts nudge toward the answer; quizzes & worksheets **regenerate** every load.
- **One new idea per scene.** Build gradually.

---

## ✅ Built so far

| Concept | Where |
|---|---|
| Fraction = part of a whole; notation (top/bottom) | Lesson 1 |
| Counting up to the whole; denominator = piece size | Lesson 1 |
| A fraction works on any shape (pie + bar) | Lesson 1, Play › One Pie |
| Equivalent fractions (1/2 = 2/4 = 4/8) | Lesson 2, Play (live simplest-form), Quiz 6, Worksheet |
| Add & subtract, same bottom number | Lesson 2, Quiz 5 & 7, Worksheet |
| Add with **different** bottoms (make pieces match) | Lesson 3 |
| Compare fractions (same-bottom, unit, side-by-side) | Quiz 3, Play › Compare |
| Simplest form / reducing | Play (live hint) |
| Number-line representation | Play › Number Line |
| **Fraction of a number / a set** (1/3 of 12 = 4) | **Lesson 4, Play › Fraction of a Group, Quiz 8, Worksheet** |
| **Improper fractions & mixed numbers** (5/4 = 1¼) | **Lesson 5** (PieStack visual + guided convert both ways) |
| Stacked ↔ slash notation (taught explicitly) | Lesson 1 (explainer + NotationPrompt); quiz choices stacked via `Frac` |
| "What next?" navigation at the end of every lesson | `LessonFooter` in `App.jsx` |

---

## 🔜 Phase 1 — finish the core (highest value next)

1. **Simplifying fractions as a taught skill** (not just the Play hint).
   *Visual:* re-grouping slices ("merge 2 quarters into 1 half").
   *Build:* a Lesson 2 add-on or short Lesson · Quiz level ("write 4/8 in simplest form") · Worksheet.

2. **Equivalent-fraction *entry*** — type the missing number: `1/2 = ▢/6`.
   *Build:* Quiz level (reuse the `fraction`/`number` answer types) · already a Worksheet topic; add the quiz twin.

3. **Compare with unlike bottoms** (formal) — `2/3 vs 3/5`.
   *Visual:* the number line (already built) or common-denominator pies.
   *Build:* Quiz level · Worksheet · ties into Play › Compare + Number Line.

---

## 🔜 Phase 2 — beyond one whole

4. **Improper / mixed — Quiz + Worksheet + Play.** Lesson 5 is built (the concept &
   conversions both ways); next is a Quiz level and Worksheet topic that reuse it (a
   `PieStack` figure case in `FractionFigure`), plus a Play tool that shows >1 whole.

5. **Ordering several fractions** — put `1/2, 1/4, 3/4` in order.
   *Visual:* stack them on one number line.
   *Build:* Quiz level (drag/tap to order) · Worksheet.

---

## 🔜 Phase 3 — operations & connections

6. **Multiplying fractions** — "half of a half is a quarter."
   *Visual:* the **area model** (a square shaded one way ×, the other way) — a great new visual component.
   *Build:* Lesson 6 · Play › Area tool · Quiz · Worksheet.

7. **Fractions ↔ decimals ↔ percentages** — `1/2 = 0.5 = 50%`.
   *Why:* connects to money, scores, everyday life.
   *Visual:* a 10- or 100-piece pie/bar; reuse the number line 0–1.
   *Build:* Lesson 7 · Quiz · Worksheet. (Note: this introduces decimals — keep optional / clearly flagged.)

8. **Dividing fractions** — sharing into equal parts.
   *Build:* later; needs multiplication solid first.

---

## 🌟 Cross-cutting polish (any time)

- **Banner art:** paint `public/banner-ants-fractions.png` and swap `Banner.jsx` to an `<img>`
  (matches Ants & Angles/Axes). Add a B&W `text_banner` for worksheet headers.
- **Illustrated "story"** modal (like Ants & Angles' "Story of π"): *"Where do fractions come from?"*
  (sharing bread, ancient Egypt's unit fractions). Reuse a `StoryModal`.
- **Play › Compare v2:** a snap-to-equivalent overlay (drag pie A's cuts onto pie B).
- **Word-problem mode:** pizza/cookie sharing problems with pictures.
- **Sound/streak rewards** in the quiz; a parent answer-key page.
- **Difficulty / age presets** (e.g., cap denominators, addition-only) shared across Quiz + Worksheets —
  the spiritual cousin of Ants & Angles' "whole-numbers-only" toggle.

---

## How to extend (cheat-sheet)

| Want to add… | Do this |
|---|---|
| **A lesson** | New `LessonN.jsx` (compose `<Scene>` + `Pie`/`Bar`/`NumberLine`/`FractionLabel` + a prompt); add to `LESSONS` in `App.jsx`. |
| **A Play tool** | New `play/*Tool.jsx`; add to `TOOLS` in `play/PlayMode.jsx`. |
| **A quiz level** | Add a `generate()` + a `LEVELS` entry in `lib/fractionQuiz.js`; new figure → add a case to `FractionFigure.jsx`. Handle its answer `type` in `QuizShell` + `isCorrect`. |
| **A worksheet topic** | Add a generator + a `TOPICS` entry in `lib/fractionWorksheet.js` (`layout: figcard \| shade \| equation`). |
| **A new visual** | Prefer a small pure SVG component in `components/` with a `bw` prop (for print), like `Pie`/`Bar`/`NumberLine`. |
