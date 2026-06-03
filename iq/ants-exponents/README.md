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

## The three modes

Same shell as the rest of the family (top bar) — **all three are live**:

| Mode | Status | What it is |
|------|--------|------------|
| 📖 **Learn** | ✅ built | A scroll-down lesson: each step reads in very simple words, shows a clear visual, and sometimes asks the child to try something with guided feedback. |
| 🧭 **Play** | ✅ built | A drag-to-explore playground: step the base and exponent and watch the power, the answer, a matching picture (square at ², stacked "layers" cube at ³), the growth staircase, and a "fast multiplying vs. plain multiplying" surprise all update live. |
| 📚 **Quiz** | ✅ built | 15 leveled questions (5 levels × 3) with a progress bar, running score, and guided feedback that shows the worked-out reason on a miss. Fresh questions each run. |

---

## The Learn lesson (current build)

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
12. Celebrate + a peek at what's next

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
  App.jsx                         # shell: 3-mode bar, renders the Lesson
  index.css
  components/
    Banner.jsx                    # CSS hero (PNG banner asset still TODO)
    DotArray.jsx                  # ⭐ reusable rows×cols grid of squares — makes n² literally a square
    PowerLabel.jsx                # big base + raised exponent; optional captions / expand / value
    GrowthChain.jsx               # the doubling staircase (powers grow FAST)
    Scene.jsx                     # scroll-into-view section wrapper
    Lesson.jsx                    # 📖 Learn — composes all the scroll-down scenes
    Playground.jsx                # 🧭 Play — base/exponent steppers + live square/cube/staircase
    Quiz.jsx                      # 📚 Quiz — 5 leveled generators, scoring, guided feedback
    prompts/
      ExpandPrompt.jsx            # build a power by using the base N times
      ReadPowerPrompt.jsx         # count to read a power off a square
```

`DotArray`, `PowerLabel`, and `GrowthChain` are pure/presentational and reused everywhere —
add a scene to `Lesson.jsx` and lean on them.

---

## Roadmap

- **More Learn scenes:** exponent *rules* (multiplying powers adds the exponents), and the
  powers-of-10 ↔ place-value link drawn out.
- **🖨 Worksheets:** printable practice, reusing the Ants & Angles worksheet engine.
- **Quiz extras:** a "negative space" level (what does exponent 1 / a base of 1 do?) and
  optional harder levels (4-digit powers, base 10 up to 10⁹).
- **Banner art:** paint `banner-ants-exponents.png` for `/public` and swap `Banner.jsx`
  to an `<img>` to match the family exactly.
