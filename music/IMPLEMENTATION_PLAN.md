# Implementation Plan: Chord → Scale/Mode/Key Recognition Engine

## Guiding philosophy
**Generous, forgiving, suggestive — never definitive.** The engine always returns a
*ranked* set of candidates with confidence bands, never a single verdict. When chords
don't sit cleanly in one key, it degrades gracefully ("these don't share one home key —
here are the closest fits, or try analyzing in sections") rather than failing. We optimize
for "helpful nudge," accepting that edge cases are myriad and that's fine.

## Resolved decisions
1. **Standalone, spartan tool.** The UI lives outside the guitar home, under a new
   `/music/tools/` category (sibling to `/instruments`). Functionality-first; wire into
   individual instrument interfaces later, where it'll be most useful.
2. **Clean ES-module core.** Guitar will be refactored to import shared theory from
   `/core/theory`. Sequencing: build and prove the core engine FIRST (all-new, zero-risk
   files), do the guitar refactor LAST so the working guitar tool stays stable until core
   is battle-tested.

## What the structured input buys us
Input is **two controlled selects per chord — Root + Quality — added N times**, reusing the
guitar's existing vocabulary. Therefore: no chord-symbol parser, no alias table, no typo
handling. Every chord maps directly to a known chord-quality key. A progression is just an
ordered list of `(rootPc, qualityKey)` pairs; order is preserved (first/last chord and
emphasis are modal cues).

## Module layout (all in `/core/theory`, dependency-free ES modules, no DOM)
```
/core/theory/
  pitch-class.js   → set primitives: mod12, transpose, pcSet, isSubset, intersection, format
  chords.js        → CHORD_QUALITIES + buildChord(), lifted from guitar/script.js
  scales.js        → portable scales.json loader + pure pcs transforms (dependency-injectable)
  analysis.js      → the engine: analyzeProgression() → layered { global, perChord }
  corpus.test.mjs  → hand-written canonical progressions + expected results
```
**Portability:** browser code loads `scales.json` relative to the module's own URL
(`import.meta.url`); the engine functions take the scale catalog as a parameter
(dependency injection) so they run headless under node for tests.

## Data model
- **Chord:** `{ rootPc: 0–11, quality: 'maj7', pcs: Set<int> }`
- **Progression:** ordered `Chord[]`
- **Analysis result:**
  ```
  {
    global:  [ { scaleId, tonicPc, name, score, confidence, coverage, outsideNotes }, ... ],
    perChord:[ { chord, fits: [ { scaleId, tonicPc, name, relationToGlobal } ] }, ... ]
  }
  ```

## Engine, built in tiers (each verified against the corpus before the next)
1. **Tier 1 — Diatonic containment.** Union all chord pitch-classes; for each key × mode,
   test subset; rank survivors.
2. **Tier 2 — Weighted scoring (forgiving core).** Score = weighted coverage of chord tones
   (roots/3rds/7ths weighted higher) − penalty for out-of-scale notes. Never requires a
   perfect subset; yields ranked list with confidence band (strong / likely / loose).
3. **Tier 3 — Modal disambiguation.** Same-notes-different-center cases via first/last chord,
   emphasis, pedal tones. Surfaces modal interpretations as a teaching feature.
4. **Local layer.** Per chord, the fitting scales, annotated by relation to the top global
   candidate ("D Dorian — the ii of your C-major home base" vs. "outside color").
5. *(Deferred)* **Tier 4 — Functional/Roman-numeral analysis.** Cadences, secondary dominants.

## Build sequence (phases / task list)
- **Phase 1** — `pitch-class.js` + tests.
- **Phase 2** — `chords.js` + `scales.js` + tests.
- **Phase 3** — `analysis.js` Tiers 1→2→3 + local layer, gated on the corpus.
- **Phase 4** — standalone Key Finder UI under `/music/tools/key-finder/`.
- **Phase 5** — refactor guitar to import core; delete duplicated constants; verify guitar.
