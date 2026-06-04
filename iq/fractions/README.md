# 🥧 Ants & Fractions

**Live:** https://ants-fractions.vercel.app/ (deployed on Vercel from `iq/fractions`, like `ants-axes`).

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
| 📖 **Learn** | ✅ built | Scroll-down lessons (currently **four**): each step reads in very simple words, shows a clear pie/bar/group visual, and sometimes asks the child to try something with guided feedback. |
| 🧭 **Play** | ✅ built | A drag-to-explore playground with four tools: **One Pie** (pie/bar, tap-to-shade, live simplest form), **Compare** (two pies side-by-side with a live `< = >` verdict), **Number Line** (a point on 0–1 with a matching pie), **Fraction of a Group** (split cookies into equal groups and take some). |
| 📚 **Quiz** | ✅ built | 8 leveled question types with instant feedback. **Regenerates every visit** — nothing to memorize. |
| 🖨 **Worksheets** | ✅ built | 8 printable topics, also freshly randomized every time. Practice or "with a reminder", optional answer key. Branded with the B&W `Fractions` logo. |

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

### The lessons
1. **What is a fraction?** — whole pie → cut into 4 → 1/4 → **two ways to write it (stacked ↔ slash)** + quick reps → counting up → bigger bottom = smaller piece → read a fraction → not-just-pies (bar)
2. **Equal fractions & adding** — equivalent fractions (1/2 = 2/4 = 4/8) → add & subtract with the same bottom number
3. **Adding different bottoms** — make the pieces match using equal fractions, then add the tops (1/2 + 1/3 → 3/6 + 2/6 = 5/6); intuition-first, no formal LCD drilling
4. **Fraction of a number** — split a group of things into equal groups (bottom number) and take some (top number): 1/3 of 12 = 4, 2/3 of 12 = 8
5. **Improper & mixed numbers** — fractions past one whole; 5/4 fills a pie and spills into the next = 1¼; convert both directions
6. **Multiplying fractions** — × means "of"; the **area model** shows the overlap; rule falls out (multiply tops, multiply bottoms), then simplify

Every lesson ends with a **"What next?"** footer — continue to the next lesson, or jump to Play / Quiz / Worksheets.

### Quiz levels (all regenerate every play)
1. **Name the Fraction** — read a shaded pie, pick the fraction (multiple choice)
2. **Build the Fraction** — type the top & bottom numbers yourself
3. **Which is Bigger?** — compare two pies (same-bottom, and unit fractions)
4. **Fill the Whole** — how many more pieces make one whole?
5. **Add Fractions** — same bottom number; add the tops
6. **Equivalent Fractions** — spot the fraction showing the same amount
7. **Subtract Fractions** — same bottom number; subtract the tops
8. **Fraction of a Number** — split a group of objects and take some (1/3 of 12)
9. **Improper & Mixed Numbers** — swap between improper fractions and mixed numbers (both directions)

### Worksheet topics (all regenerate every print)
Name the Fraction · Color the Fraction (blank pies to shade) · Fill the Whole ·
Add Fractions · Subtract Fractions · Equivalent Fractions · Fraction of a Number ·
Improper & Mixed Numbers · Mixed Review. Each prints from one randomized build;
"↻ New Sheet" rerolls, and an optional answer key is one checkbox.

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
    Banner.jsx                    # full-color hero <img> (public/banner-fractions.png)
    Pie.jsx                       # ⭐ reusable equal-slice pie; `bw` for print
    Bar.jsx                       # reusable equal-part bar; `bw` for print
    GroupSet.jsx                  # ⭐ N objects split into equal groups; `bw` for print
    FractionLabel.jsx             # big stacked n/d, optional kid-word captions
    FractionFigure.jsx            # renders a question's picture (pie/pieBlank/compare/add±/group), color or bw
    NumberLine.jsx                # reusable 0–1 number line; `bw` for print
    Scene.jsx                     # scroll-into-view section wrapper
    Lesson.jsx … Lesson4.jsx      # the four scroll-down lessons
    prompts/
      ShadePrompt.jsx             # tap slices to match a target fraction
      BuildFractionPrompt.jsx     # count to read a fraction off a picture
      AddPrompt.jsx               # guided add/subtract of same-bottom fractions
      GroupPrompt.jsx             # guided "fraction of a number"
    play/PlayMode.jsx             # toolbar that routes between the four Play tools
    play/ExploreTool.jsx          # One Pie — pie/bar, tap-to-shade, live simplest form
    play/CompareTool.jsx          # Compare — two pies, live < = > verdict
    play/NumberLineTool.jsx       # Number Line — a point on 0–1 + matching pie
    play/GroupTool.jsx            # Fraction of a Group — split & take, live count
    quiz/QuizMode.jsx, QuizShell.jsx
    worksheet/WorksheetMode.jsx, Worksheet.jsx  # header branded with text_banner_fractions.png
```

**Banner assets** live in `/public`: `banner-fractions.png` (full-color hero) and
`text_banner_fractions.png` (B&W logo for printed worksheet headers).

`Pie`, `Bar`, `FractionLabel`, and `FractionFigure` are pure/presentational and reused
across lessons, quiz, and worksheets.

---

## Roadmap

See **[ROADMAP.md](ROADMAP.md)** for the full concept roadmap (what's built + what's next,
phased and mapped to lessons / play tools / quiz / worksheet). Headline next steps:

- **Phase 1:** fractions of a number (1/3 of 12), simplifying as a taught skill,
  equivalent-fraction *entry*, comparing unlike bottoms.
- **Phase 2:** improper fractions & mixed numbers, ordering several fractions.
- **Phase 3:** multiplying (area model), fractions ↔ decimals ↔ percentages.
- **Polish:** banner art, an illustrated "where fractions come from" story, word problems,
  difficulty/age presets.
