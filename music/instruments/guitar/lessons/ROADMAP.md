# Guitar Lessons — starter pack roadmap

A growing pack of self-contained guitar lessons. Each lesson lives as one entry in
`src/lessons.js` (`LESSONS[]`); the page renders a picker over them automatically,
so **adding a lesson is pure data — no UI work**.

## How a lesson is structured
```js
lesson('lesson-id', {
  title: 'Human title',
  key: 'Am',              // written home key (label only)
  level: 1,               // ordering / difficulty
  levelLabel: 'Starter',  // badge text
  icon: '🌒',
  blurb: 'One-line description shown under the picker.',
}, [
  exercise('id', { icon, title, subtitle, story, notation, chords, practice }),
  // ...
])
```
- **notation DSL**: `pitch:durBeats` tokens; `|` cosmetic barline; `_` rest; `+`
  stacks a chord (`A3+C4+E4:2`).
- **chords**: `[{ beat, symbol }]` chord symbols drawn above the staff (or `null`).
- **practice**: `'melody'` (mic-scorable line → Sing-Along), `'walk'` (hand the
  lesson's walking line to Sing-Along), or `null` (strummed chords — not scorable).

## Shipped
- **Lesson 1 — A minor: tension & resolve.** 8-bar Am progression (`Am F Dm E7 |
  Am Dm B° E7`) with a diminished tension chord; warm-ups (natural + harmonic
  minor), walking roots, and a strum-&-walk final piece.

## Backlog (candidate next lessons)
1. **Open-chord basics (key of G).** G · C · D · Em — the first-position workhorses;
   warm-up on the G major scale, simple down-strum quarter notes, then add the walk.
2. **The Andalusian cadence (Am G F E7).** The other classic minor descent — pairs
   naturally with Lesson 1; introduces the ♭VII→♭VI→V bassline.
3. **A minor pentatonic + the blues note.** Box-1 pentatonic warm-up, a 12-bar shuffle
   feel, bends framed as "lean toward the next note."
4. **Major-key sing-song (key of C).** C · Am · F · G (the "50s" progression); teaches
   relative major/minor against Lesson 1's Am.
5. **Fingerpicking primer.** Same Am progression, but arpeggiated — one string at a time,
   which *is* mic-scorable (each note lands alone), so Sing-Along can test the whole thing.

## Structural upgrades to consider as the pack grows
- **Progress marks** — remember which lessons a student has played (localStorage), show a
  ✓ on the picker (mirrors Sing-Along's Song Path).
- **Per-lesson tempo/key defaults** in the lesson meta (right now defaults are global).
- **Key control that's lesson-aware** — the transpose labels currently assume a minor
  home; a major-key lesson wants major-key labels. Derive from `lesson.key`.
- **Author-from-Lesson-Builder** — let `tools/lesson-builder` export a lesson entry
  (progression + key + generated exercises) straight into this pack.
- **Chord diagrams** — optional fret-dot boxes above each bar for the strummed lessons.
