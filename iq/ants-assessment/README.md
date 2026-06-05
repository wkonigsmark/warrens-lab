# Ants & Assessment 🐜📋

The **central check-up** for the `/iq` math family. Instead of teaching one topic,
this tool quizzes a kid across *all* the competencies the sibling tools cover and
shows **where they are** — then points them at the right tool to practice next.

## Run

```bash
npm install
npm run dev        # http://localhost:9011  (strictPort)
```

Vite + React + Tailwind + framer-motion, same stack as the rest of the family.

## How it works (v1)

Three-stage flow:

1. **Pick topics** — all six competencies ticked by default (a full check-up); tap
   any off for a quicker, focused session.
2. **Run the ladder** — for each chosen topic, three questions at climbing
   difficulty (Level 1 → 2 → 3). One topic at a time, fresh questions every run
   (nothing memorizable), multiple-choice for fast taps. Wrong answers are
   forgiving — it shows the right one warmly and moves on, no running score.
3. **Report** — a proficiency band per topic (🐣 Just starting → 🌱 Getting it →
   💪 Solid → 🏆 Mastered) with a score bar, plus a "practice this next" nudge that
   links straight to the matching sibling tool for the weakest area.

## Competencies → sibling tools

| Topic | Practice tool |
|---|---|
| 🍎 Arithmetic | Ants & Apples |
| 🥧 Fractions | Ants & Fractions |
| 💯 Percents & Decimals | 0 → 1 |
| ⬆️ Exponents | Ants & Exponents |
| 📐 Angles & Geometry | Ants & Angles |
| 🧮 Algebra | Ants & Algebra |

The whole bank lives in [`src/lib/competencies.js`](src/lib/competencies.js) — each
competency is a self-contained object with a pure `generate(level)`. Adding a new
subject is one object in that array.

See [`ROADMAP.md`](ROADMAP.md) for where this is headed.
