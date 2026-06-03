# 🥧 Ants & Fractions

A gentle, visual introduction to fractions for kids — scroll down and learn what a
fraction *is*, one tiny step at a time, by cutting up pies. Sibling to **Ants & Axes**
and **Ants & Angles**; part of Warren's Lab.

> Read a little → look at a clear picture → try a small thing. Built for a child meeting
> fractions for the very first time.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:9008  (strict port)
npm run build    # production build
```

The dev port is pinned to **9008** with `strictPort` (sibling Ants & Angles owns 9007;
9000/9001 tend to get squatted by other lab dev servers).

**Stack:** Vite + React 18 + Tailwind + framer-motion. No backend — everything is
client-side and deterministic.

---

## The three modes

Same shell as the rest of the family (top bar):

| Mode | Status | What it is |
|------|--------|------------|
| 📖 **Learn** | ✅ built | Scroll-down lessons (currently **three**): each step reads in very simple words, shows a clear pie/bar visual, and sometimes asks the child to try something with guided feedback. |
| 🧭 **Play** | ✅ built | A drag-to-explore playground: pick how many pieces (1–12), tap to shade, watch the fraction + its simplest form update live. |
| 📚 **Quiz** | ✅ built | 7 leveled question types with instant feedback. **Regenerates every visit** — nothing to memorize. |
| 🖨 **Worksheets** | ✅ built | 7 printable topics, also freshly randomized every time. Practice or "with a reminder", optional answer key. |

---

## The Learn lesson (current build)

A vertical sequence of `<Scene>`s that fade in as you scroll. The arc, deliberately slow:

1. What is a fraction? → one whole pie
2. One whole
3. Cut into **4 equal parts** (what *equal* means)
4. One slice = **1/4**, written "1 over 4" — with captions explaining the top & bottom numbers
5. **Try it:** tap to shade 2/4 (guided: "tap one more", "one too many")
6. Counting up 1/4 → 4/4 = one whole
7. Big idea: more cuts = smaller pieces (halves vs quarters vs eighths)
8. **Try it:** read the fraction *off* a shaded pie by counting (two guided steps)
9. Fractions aren't just pies — a chocolate **bar** split into thirds
10. **Try it:** shade 4/6
11. Celebrate + a peek at what's next

### Design principles
- **Picture first, words tiny.** Every concept has a concrete visual before any symbol.
- **Guided, not rote.** Prompts nudge toward the answer ("tap one more", "count the golden
  slices") instead of buzzing right/wrong, so the child reasons it out.
- **One new idea per scene.** Nothing introduces two things at once.

---

### The three lessons
1. **What is a fraction?** — whole pie → cut into 4 → 1/4 → counting up → bigger bottom = smaller piece → read a fraction → not-just-pies (bar)
2. **Equal fractions & adding** — equivalent fractions (1/2 = 2/4 = 4/8) → add & subtract with the same bottom number
3. **Adding different bottoms** — make the pieces match using equal fractions, then add the tops (1/2 + 1/3 → 3/6 + 2/6 = 5/6); intuition-first, no formal LCD drilling

### Quiz levels (all regenerate every play)
1. **Name the Fraction** — read a shaded pie, pick the fraction (multiple choice)
2. **Build the Fraction** — type the top & bottom numbers yourself
3. **Which is Bigger?** — compare two pies (same-bottom, and unit fractions)
4. **Fill the Whole** — how many more pieces make one whole?
5. **Add Fractions** — same bottom number; add the tops
6. **Equivalent Fractions** — spot the fraction showing the same amount
7. **Subtract Fractions** — same bottom number; subtract the tops

### Worksheet topics (all regenerate every print)
Name the Fraction · Color the Fraction (blank pies to shade) · Fill the Whole ·
Add Fractions · Subtract Fractions · Equivalent Fractions · Mixed Review. Each prints
from one randomized build; "↻ New Sheet" rerolls, and an optional answer key is one checkbox.

---

## Project structure

```
src/
  App.jsx                         # shell: mode bar + Lesson 1/2/3 switcher
  index.css                       # + @media print pipeline for worksheets
  lib/
    fractions.js                  # gcd / simplify (pure arithmetic source of truth)
    fractionQuiz.js               # ⭐ pure quiz generators (source of truth) + isCorrect
    fractionWorksheet.js          # printable topics; own randomized generators
  components/
    Banner.jsx                    # CSS hero (PNG banner asset still TODO)
    Pie.jsx                       # ⭐ reusable equal-slice pie; `bw` for print
    Bar.jsx                       # reusable equal-part bar; `bw` for print
    FractionLabel.jsx             # big stacked n/d, optional kid-word captions
    FractionFigure.jsx            # renders a question's picture (pie/pieBlank/compare/add±), color or bw
    Scene.jsx                     # scroll-into-view section wrapper
    Lesson.jsx / Lesson2.jsx / Lesson3.jsx   # the three scroll-down lessons
    prompts/
      ShadePrompt.jsx             # tap slices to match a target fraction
      BuildFractionPrompt.jsx     # count to read a fraction off a picture
      AddPrompt.jsx               # guided add/subtract of same-bottom fractions
    play/PlayMode.jsx             # drag-to-explore playground + live readout
    quiz/QuizMode.jsx, QuizShell.jsx
    worksheet/WorksheetMode.jsx, Worksheet.jsx
```

`Pie`, `Bar`, `FractionLabel`, and `FractionFigure` are pure/presentational and reused
across lessons, quiz, and worksheets.

---

## Roadmap

- **Lesson 4 / more types:** fractions of a number (1/3 of 12), mixed numbers & improper
  fractions, comparing with unlike bottoms.
- **Quiz/worksheet growth:** equivalent-fraction *entry* (type the missing number),
  unlike-denominator addition, "simplify this fraction."
- **Play mode v2:** a second pie to compare side-by-side; snap-to-equivalent overlay.
- **Number line** representation alongside pies/bars.
- **Banner art:** paint `banner-ants-fractions.png` for `/public` and swap `Banner.jsx`
  to an `<img>` to match the family exactly.
