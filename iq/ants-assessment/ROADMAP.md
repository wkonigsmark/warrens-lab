# Ants & Assessment — Roadmap

**The vision:** a hub that assesses a kid across every competency the `/iq` suite
teaches, tracks growth over time, and always knows what to recommend next.

## v1 — shipped (the spin-up)
- Topic picker (six math competencies, mirroring the sibling tools)
- 3-rung difficulty ladder per topic, fresh/randomized each run
- Forgiving multiple-choice flow with gentle feedback
- Results report: proficiency band + score bar per topic
- "Practice this next" deep-link to the weakest topic's sibling tool

## Next up
- **Adaptive laddering** — stop climbing a topic once they miss; start the next
  topic at a level matched to recent performance. Fewer questions, sharper signal.
- **More resolution** — more questions per level, or item-response style scoring,
  so bands aren't just 0/⅓/⅔/1.
- **Reading/writing & science** — extend beyond math to the Lexicon / Stencil /
  chemistry / anatomy tools so the check-up covers the whole toolkit.

## Bigger bets
- **Saved profiles + history** — per-kid progress over time, "you leveled up
  Fractions since last week!", a growth chart. (localStorage first, no backend.)
- **Printable progress report** — a parent-facing one-pager (reuse the family's
  worksheet print pipeline).
- **Grade/age presets** — "Check a 7-year-old" pre-tunes which levels count as
  on-track, so bands mean something against expectations.
- **Parent dashboard** — pick goals, see which tools to push this week.

## Open questions
- How honest should bands be? Kids' tools here lean celebration-first
  (easy wins, lots of confetti) — assessment needs *some* truth to be useful.
  Current answer: warm framing, no mid-quiz score, honest end report.
- Single shared question bank vs. importing generators from each sibling tool so
  questions never drift from what each tool actually teaches.
