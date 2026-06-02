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
| 📖 **Learn** | ✅ built | A scroll-down lesson: each step reads in very simple words, shows a clear pie/bar visual, and sometimes asks the child to try something with guided feedback. |
| 🧭 **Play** | roadmap | A drag-to-explore playground: cut a pie into any number of slices and shade them. |
| 📚 **Quiz** | roadmap | Leveled questions with instant feedback (mirrors the Ants & Angles quiz engine). |

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

## Project structure

```
src/
  App.jsx                         # shell: 3-mode bar, renders the Lesson
  index.css
  components/
    Banner.jsx                    # CSS hero (PNG banner asset still TODO)
    Pie.jsx                       # ⭐ reusable equal-slice pie (the workhorse visual)
    Bar.jsx                       # reusable equal-part bar (a second "whole" shape)
    FractionLabel.jsx             # big stacked n/d, optional kid-word captions
    Scene.jsx                     # scroll-into-view section wrapper
    Lesson.jsx                    # composes all the scenes (the lesson content lives here)
    prompts/
      ShadePrompt.jsx             # tap slices to match a target fraction
      BuildFractionPrompt.jsx     # count to read a fraction off a picture
```

`Pie`, `Bar`, and `FractionLabel` are pure/presentational and reused everywhere —
add a scene to `Lesson.jsx` and lean on them.

---

## Roadmap

- **More Learn scenes:** comparing fractions (which is bigger?), **equivalent fractions**
  (2/4 = 1/2, shown by overlaying cuts), and adding fractions with the same bottom number.
- **🧭 Play mode:** a slider for "how many cuts" + tap-to-shade, with the fraction reading
  out live (the drag-to-explore pattern from the siblings).
- **📚 Quiz mode + printable worksheets:** reuse the Ants & Angles quiz/worksheet engine.
- **Number line** representation alongside pies/bars.
- **Banner art:** paint `banner-ants-fractions.png` for `/public` and swap `Banner.jsx`
  to an `<img>` to match the family exactly.
