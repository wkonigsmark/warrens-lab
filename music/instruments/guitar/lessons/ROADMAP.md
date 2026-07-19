# Lessons — starter pack roadmap

A growing pack of self-contained, **instrument-agnostic** lessons. The content
lives in **`/music/_shared/lessons/`** (NOT in this guitar folder) so a future
piano page can import the exact same pack. The page renders a picker over the
pack automatically, so **adding a lesson is pure data — no UI work**.

## Where things live
```
music/_shared/lessons/
  dsl.js                  parser + builders (parse, exercise, lesson, chordsAtBars, strumBar)
  index.js                the PACK — assembles LESSONS[]; ARRAY ORDER = display order
  am-tension-resolve.js   Lesson content (one file per lesson)
  c-major-bright-side.js
```
- **Resequence**: reorder the array in `index.js`. No lesson knows its own number
  (the page derives "Lesson N" from position); ids are stable.
- **Reuse on another instrument**: a piano page imports `/music/_shared/lessons/`
  and sets its own default instrument — the lessons are just music.

## How a lesson is structured
```js
lesson('lesson-id', {
  title: 'Human title',
  key: 'C',                       // display label
  home: { tonic:'C', mode:'major' }, // drives correct transpose labels
  levelLabel: 'Starter',          // difficulty badge (NOT sequence)
  icon: '☀️',
  instruments: ['guitar','piano'],
  blurb: 'One-line description shown under the picker.',
}, [
  exercise('id', { icon, title, subtitle, story, notation, chords, practice, tips }),
])
```
- **notation DSL**: `pitch:durBeats` tokens; `|` cosmetic barline; `_` rest; `+`
  stacks a chord (`A3+C4+E4:2`). `strumBar(voicing)` = a bar of two half-note strums.
- **chords**: `[{ beat, symbol }]` chord symbols drawn above the staff (or `null`).
- **practice**: `'melody'` (mic-scorable line → Sing-Along), `'walk'` (hand the
  lesson's `walking` exercise to Sing-Along), or `null` (strummed chords — not scorable).
- **story** is instrument-neutral; **tips** `{ guitar, piano }` add per-instrument
  coaching, shown under the story based on the selected instrument.

## Shipped
- **Lesson 1 — A minor: tension & resolve.** 8-bar Am progression (`Am F Dm E7 |
  Am Dm B° E7`) with a diminished tension chord; warm-ups (natural + harmonic
  minor), walking roots, and a strum-&-walk final piece.
- **Lesson 2 — C major: the bright side.** Am's relative major (same notes). 8-bar
  I–vi–IV–V (`C Am F G | C Am F G7`); major-scale warm-up, major-pentatonic
  "no wrong notes" scale, walking roots (chromatic F→F♯→G), strum-&-walk final.

## Backlog (candidate next lessons)
1. **Open-chord basics (key of G).** G · C · D · Em — the first-position workhorses;
   warm-up on the G major scale, simple down-strum quarter notes, then add the walk.
2. **The Andalusian cadence (Am G F E7).** The other classic minor descent — pairs
   naturally with Lesson 1; introduces the ♭VII→♭VI→V bassline.
3. **A minor pentatonic + the blues note.** Box-1 pentatonic warm-up, a 12-bar shuffle
   feel, bends framed as "lean toward the next note."
4. **Fingerpicking primer.** Same Am progression, but arpeggiated — one string at a time,
   which *is* mic-scorable (each note lands alone), so Sing-Along can test the whole thing.
5. **Piano edition.** A `music/instruments/piano/lessons/` page importing the SAME pack,
   defaulting to the piano instrument — proves the content is portable (this is why the
   lessons live in `_shared/`, not the guitar folder).

## Structural upgrades to consider as the pack grows
- **Progress marks** — remember which lessons a student has played (localStorage), show a
  ✓ on the picker (mirrors Sing-Along's Song Path).
- **Per-lesson tempo defaults** in the lesson meta (right now tempo default is global).
- ✅ **Lesson-aware key control** — transpose labels derive from each lesson's
  `home: { tonic, mode }`, so a major lesson reads "C major", a minor one "A minor".
- **Author-from-Lesson-Builder** — let `tools/lesson-builder` export a lesson entry
  (progression + key + generated exercises) straight into this pack.
- **Chord diagrams** — optional fret-dot boxes above each bar for the strummed lessons.
