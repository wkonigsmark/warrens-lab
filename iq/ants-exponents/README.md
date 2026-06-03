# ⚡ Ants & Exponents

A gentle, visual introduction to exponents for kids — scroll down and learn what an
exponent *is*, one tiny step at a time, by building powers and squares. Sibling to
**Ants & Axes**, **Ants & Angles**, and **Ants & Fractions**; part of Warren's Lab.

> Read a little → look at a clear picture → try a small thing. Built for a child who
> already knows multiplication and is meeting exponents for the first time.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:9009  (strict port)
npm run build    # production build
```

The dev port is pinned to **9009** with `strictPort` (Ants & Angles owns 9007, Ants &
Fractions owns 9008; 9000/9001 tend to get squatted by other lab dev servers).

**Stack:** Vite + React 18 + Tailwind + framer-motion. No backend — everything is
client-side and deterministic.

---

## The four modes

Same shell as the rest of the family (top bar) — **all four are live**:

| Mode | Status | What it is |
|------|--------|------------|
| 📖 **Learn** | ✅ built | A scroll-down lesson: each step reads in very simple words, shows a clear visual, and sometimes asks the child to try something with guided feedback. |
| 🧭 **Play** | ✅ built | A drag-to-explore playground: step the base and exponent and watch the power, the answer, a matching picture (square at ², stacked "layers" cube at ³), the growth staircase, and a "fast multiplying vs. plain multiplying" surprise all update live. |
| 📚 **Quiz** | ✅ built | 14 leveled questions (7 levels × 2) with a progress bar, running score, and guided feedback that shows the worked-out reason on a miss. Levels: Squares, Small powers, Write-as-a-power, Powers of 10, Which-is-bigger, **Multiply powers**, **Divide powers**. Fresh questions each run. |
| 🖨 **Worksheets** | ✅ built | Printable practice — pick a topic (Squares, Powers, Powers of 10, Write-as-a-Power, Expand & Solve, **Multiply Powers**, **Divide Powers**, Mixed), choose a difficulty (Easier / Standard / Harder), get a single branded page with an optional answer key. "↻ New Sheet" regenerates; the toolbar + nav hide on print. |

---

## The Learn lessons (current build)

Learn now holds **multiple scroll-down lessons**, picked from pills at the top; each one ends
with a **"What next?"** footer (continue to the next lesson, or jump into Play / Quiz /
Worksheets). Same family pattern as Ants & Fractions.

### Lesson 1 · What is an exponent?

A vertical sequence of `<Scene>`s that fade in as you scroll. The arc, deliberately slow,
and leaning on what the child already knows (multiplication):

1. What is an exponent? → it's fast *multiplying*, like × was fast adding
2. The same number again and again (2 × 2 × 2)
3. The notation: **base** (what we multiply) + **exponent** (how many times), with captions
4. Work it out: 2³ = 2 × 2 × 2 = 8
5. **Try it:** build a power by using the base N times (guided: "use it one more", "one too many")
6. Why we say **"squared"** — 3² really *is* a 3-by-3 square
7. The square numbers grow: 1², 2², 3², 4² = 1, 4, 9, 16
8. **Try it:** read a power *off* a square by counting (3 guided steps)
9. The wow: exponents grow **FAST** — the powers-of-2 doubling staircase + paper-folding
10. A neat trick: powers of 10 = count the zeros
11. **Try it:** read a bigger square (5²)
12. **Exponent rule:** multiplying powers — write 2² × 2³ out the long way and watch the 2s join up
13. The rule stated: **same base → add the exponents** (2² × 2³ = 2²⁺³ = 2⁵)
14. **Try it:** discover the rule by counting (`ProductRulePrompt`)
15. **One catch:** the shortcut only works when the bases match
16. **Dividing powers:** write 2⁵ ÷ 2² as a fraction and cancel the matching 2s
17. The rule stated: **same base → subtract the exponents** (2⁵ ÷ 2² = 2⁵⁻² = 2³)
18. **Try it:** discover the quotient rule by canceling (`QuotientRulePrompt`)
19. **The mystery of exponent 0:** count *down* the staircase (÷ base each step) → anything⁰ = 1
20. Celebrate + a peek at what's next

### Lesson 2 · Cubes & 3-D

The gentle next step — exponent 2 made a *square*, so exponent 3 makes a *cube*. Just one more
dimension, still whole numbers, still picture-first (uses the new `Cube3D` isometric visual):

1. From squares to cubes — the flat 3² square gains depth → a 3³ cube
2. Two cubed — 2³ = 2×2×2 = an 8-block cube
3. Why we say **"cubed"** — exponent 3 builds a cube, like exponent 2 builds a square
4. Counting the blocks — 3³ = 3 layers of a 3×3 square = 27
5. **Try it:** read a power off a cube (`ReadCubePrompt`, 3 guided steps)
6. The cube numbers: 1³, 2³, 3³, 4³ = 1, 8, 27, 64
7. Cubes grow faster than squares (4² = 16 vs 4³ = 64)
8. Celebrate — squared = a square (flat), cubed = a cube (solid)

### Lesson 3 · Negative exponents

Picks up where Lesson 1's exponent-0 staircase ended and keeps walking *down* below zero
(genuinely the hardest topic — sequenced last on purpose):

1. Going below zero — recap the descending staircase (each step ÷ base)
2. One step below: 2⁰ = 1 → 2⁻¹ = ½
3. Smaller and smaller: ½, ¼, ⅛ … shrinks toward 0 but never reaches it
4. The rule: a negative exponent means **"1 over"** the power (2⁻³ = 1/2³ = 1/8)
5. **Try it:** flip a negative power into a fraction (`FlipPowerPrompt`, 2 guided steps)
6. Powers of 10 the tiny way: 10⁻¹ = 0.1, 10⁻² = 0.01 … (decimals / place value)
7. **Try it:** a second flip (base 3)
8. Celebrate — the whole staircase: positive = big, 0 = 1, negative = tiny

### Design principles
- **Picture first, words tiny.** Every concept has a concrete visual before any symbol.
- **Build on what they know.** Exponents are framed as "fast multiplying," the way
  multiplication was "fast adding" — no concept arrives from nowhere.
- **Guided, not rote.** Prompts nudge toward the answer ("use it one more time", "count one
  row") instead of buzzing right/wrong, so the child reasons it out.
- **One new idea per scene.** Nothing introduces two things at once.

---

## Project structure

```
src/
  App.jsx                         # shell: 4-mode bar (no-print) + LearnMode (lesson pills + "What next?" footer)
  index.css
  components/
    Banner.jsx                    # full-color <img> hero (no-print)
    Lesson.jsx                    # 📖 Lesson 1 — what is an exponent (+ product/quotient rules, exp 0)
    Lesson2.jsx                   # 📖 Lesson 2 — cubes & 3-D
    Lesson3.jsx                   # 📖 Lesson 3 — negative exponents
    DotArray.jsx                  # ⭐ reusable rows×cols grid of squares — makes n² literally a square
    Cube3D.jsx                    # ⭐ isometric n×n×n cube of blocks — makes n³ literally a cube
    PowerLabel.jsx                # big base + raised exponent; optional captions / expand / value
    GrowthChain.jsx               # the doubling staircase (powers grow FAST)
    Scene.jsx                     # scroll-into-view section wrapper
    Playground.jsx                # 🧭 Play — base/exponent steppers + live square/cube/staircase
    Quiz.jsx                      # 📚 Quiz — 7 leveled generators, scoring, guided feedback
    Worksheets.jsx                # 🖨 Worksheets — topic picker + branded printable sheet
    prompts/
      ExpandPrompt.jsx            # build a power by using the base N times
      ReadPowerPrompt.jsx         # count to read a power off a square
      ProductRulePrompt.jsx       # discover "same base → add exponents" by counting
      QuotientRulePrompt.jsx      # discover "same base → subtract exponents" by canceling
      ReadCubePrompt.jsx          # read a power off a 3-D cube (Lesson 2)
      FlipPowerPrompt.jsx         # discover "negative exponent = 1 over the power" (Lesson 3)
  lib/
    worksheets.js                 # worksheet topic generators (8) + difficulty ranges
public/
  banner-ants-exponents.png       # full-color hero (used by Banner.jsx)
  text_banner_ants_exponents.png  # b&w wordmark (brands the printed worksheets)
```

`DotArray`, `Cube3D`, `PowerLabel`, and `GrowthChain` are pure/presentational and reused everywhere —
add a scene to `Lesson.jsx` and lean on them.

---

## Roadmap

See **[ROADMAP.md](./ROADMAP.md)** for the full plan. Next up: negative exponents (powers
smaller than 1), a real 3-D cube in Play, and a story mode (an ant colony that doubles daily).
