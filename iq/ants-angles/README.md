# 🐜 Ants & Angles

An interactive geometry playground for kids — explore shapes, angles, area, and π by
dragging things and watching the math update live. Sibling to **Ants & Axes** (the
coordinate-plotting tool); part of Warren's Lab.

> Drag-to-explore visuals, leveled quizzes, printable worksheets, glossaries, and
> illustrated "stories" — spanning very young to ~12-year-old learners.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:9007  (strict port)
npm run build    # production build
```

The dev port is pinned to **9007** with `strictPort` (vite.config.js + `.claude/launch.json`)
because stale sibling dev servers tend to squat on 9000/9001. If a preview shows the wrong
app, kill stray `vite` processes — don't kill a running Ants & Axes on :9000.

**Stack:** Vite + React 18 + Tailwind + framer-motion. No backend, no data — everything is
client-side and deterministic.

---

## The three modes

Every part of the app lives in one of three modes (top bar):

| Mode | What it is |
|------|------------|
| 🧭 **Explore** | Interactive drag-to-discover playgrounds, one per topic, each with a live readout + a contextual glossary. |
| 📚 **Quiz** | A leveled "Geometry Quiz," grouped by category, with instant ✓/✗ feedback, hints, scoring, and a results review. |
| 🖨 **Worksheets** | Printable practice sheets (Master/Mentor, optional answer key) that **reuse the quiz generators** so problems never drift. |

### Topics

| Topic | Explore | Quiz | Worksheet |
|-------|:-------:|:----:|:---------:|
| 📐 **Angles** | Protractor: drag to measure; complement/supplement, classification | L1–L7 (name, read, complement/supplement, missing-angle, around-a-point, vertical, triangle-sum) | complement/supplement, line, point, vertical, triangle, mixed |
| 🔺 **Triangles** | Drag 3 corners; angles always sum to 180°; classify; **Pythagorean squares** mode | L12–L13 (find hypotenuse, find a leg) | 2 Pythagoras sheets |
| ⬛ **Area & Polygons** | Drag a polygon; **fill with unit squares** to count area; name & regular/irregular | — | — |
| ⭕ **Circles & Pi** | Drag the radius; r/d/C/A live; **unroll** the circumference to reveal π | L8–L11 (radius↔diameter, name the part, circumference, area) | radius/diameter, circumference, area |
| 🔢 **Number Bonds** | — | — | warm-up arithmetic to 9·18·36 and 90·180·360 |

---

## Signature features

- **Live, color-coded readouts** — classification badges, angle-sum chips, area/perimeter,
  the `C ÷ d = π` headline; all recompute on every drag frame.
- **Pythagorean theorem** — toggle "Show squares" on the Triangle Explorer: a real square is
  drawn on each side, and the readout shows `a² + b² = c²` with a ✓/≠ verdict (drag until it's
  a right triangle). Plus quiz levels + worksheets using whole-number Pythagorean triples.
- **Unit-square area** — point-in-polygon fill so kids can literally *count* the area (exact
  for grid-aligned rectangles).
- **Glossary + master search** — every topic has a kid-friendly glossary whose color dots
  match the figures; a search bar spans **all** topics' terms.
- **Illustrated "stories"** — a reusable `StoryModal` powers **"The Story of π"** (Circles) and
  **"Why 360°?"** (Angles), each with custom inline visuals.
- **🔢 Whole-numbers-only rule (default ON)** — universal guarantee that no quiz/worksheet
  answer is ever a fraction or decimal. Hides inherently-decimal content (circle
  circumference & area) and re-rolls anything else to a whole answer. One toggle, shared by
  Quiz + Worksheets.
- **Branding** — full-color hero banner in the app header; black-&-white logo on printed
  worksheets. Landscape print pipeline with `@media print`.

---

## Project structure

```
src/
  App.jsx                       # shell: mode switch, topic tabs, wires every explorer + modal
  lib/                          # pure, framework-free logic (the source of truth)
    angles.js / triangles.js / polygons.js / circles.js
    angleQuiz.js                # LEVELS registry (merges triangle + circle levels) + isCorrect
    triangleQuiz.js / circleQuiz.js
    angleWorksheet.js           # TOPICS + buildProblems (reuses quiz generators)
    glossary.js                 # GLOSSARY + ALL_TERMS (powers master search)
    piHistory.js                # π timeline content
    wholeNumbers.js             # the universal whole-number rule
  components/
    Banner, *Stage, *Readout, *Controls   # one trio per Explore topic
    QuestionFigure.jsx          # maps a question → its figure (color for quiz, b&w for print)
    *Figure.jsx / quiz/Figures.jsx        # the figure components
    Glossary.jsx
    StoryModal.jsx              # generic story modal
    stories/PiStory.jsx, DegreesStory.jsx # story = data + visuals
    quiz/QuizMode.jsx, QuizShell.jsx, WholeNumbersToggle.jsx
    worksheet/WorksheetMode.jsx, Worksheet.jsx
```

**Core design principle:** all problem *content* is pure functions in `lib/`. Quiz and
Worksheet both consume the same generators, and `QuestionFigure` renders the same figure in
color (quiz) or black-&-white (print). Add content once, it shows up correctly everywhere.

---

## How to extend

| Want to add… | Do this |
|---|---|
| **A quiz level** | Add a generator + an entry to the relevant `*_LEVELS` array (`category`, `accent`, `generate`). If it needs a new figure, add a case to `QuestionFigure`. |
| **A worksheet topic** | Add an entry to `TOPICS` in `angleWorksheet.js` (reuse an existing generator). |
| **A glossary term / topic** | Add to `GLOSSARY` (+ a `TOPIC_LABELS` entry); it's auto-searchable. |
| **A "story" modal** | New file in `components/stories/` exporting `{ title, sections, closer, visuals }`; add a button that calls `setStory(...)`. |
| **An Explore topic** | New `*Stage`/`*Readout`/`*Controls` trio + a block in `App.jsx`; flip the topic tab to `ready: true`. |
| **Fraction/decimal content** | Tag the level/topic `decimals: true` so the whole-numbers rule hides it when active. |

---

## Notes & gotchas

- **π for kids:** Explore uses real `Math.PI`; quizzes/worksheets use `PI_KID = 3.14` so a
  child's hand calculation matches the answer key.
- **Whole-number safety:** circle circumference/area are tagged `decimals: true` (they
  *occasionally* land on a whole value, so explicit tagging beats auto-detection).
- **Banner assets** live in `/public` (`banner-ants-angles.png`, `text_banner_ants_angles.png`).

---

## Roadmap

- **Triangles quiz/worksheet** could grow beyond Pythagoras (classify a triangle, find a
  missing angle).
- **Area & Polygons quiz + worksheets** (currently Explore-only).
- **Distance formula** in *Ants & Axes* — the coordinate-plane application of a²+b²=c².
- **More stories:** "Pythagoras & the Theorem" (Triangles), "Naming the Polygons" (Area).
- **Stretch topic:** Volume (extrude 2D shapes into prisms/cylinders).
- **Possible polish:** save/share a worksheet, sound/streak rewards in quizzes, a parent
  "answer key" page, difficulty presets per level.
