# Composer — Roadmap

Beginner melody composer for music students. v1 shipped 2026-06-05
(colored pitch-grid + live treble staff, quarter/half/whole in 4/8/12 bars,
Web Audio playback, config-driven instrument register). Marked **BETA**.

**Default instrument: real xylophone C5–A6.** It's a transposing instrument —
sounds an octave above what's written — so the grid + audio use the true C5–A6
pitches, but the staff is notated an octave down (C4–A5, the friendly main
treble range) with an "8" over the clef. Set per range via `staffShift` in
`model.js` (`-1` = octave down). Other presets (`c4-a5`, `c4-g5`, `c4-c6`) have
`staffShift: 0` for write-as-sounds.

## Done — 2026-06-05 (second build)

### 1. Name the piece + print/save a manuscript ✅
- Editable **title** + **composer** inputs in the board header (default
  "Untitled Melody"). Date auto-stamps the by-line.
- **🖨 Print** button → `window.print()`. A `@media print` stylesheet hides
  the topbar/controls/grid and reveals a clean **black-and-white manuscript**
  (`#manuscript`: title, "Composed by … · date", B&W staff via
  `renderScore(..., { colored:false })`, SVG scaled to page width).
- **Auto-save to `localStorage`** (`composer.piece.v1`): whole piece — title,
  composer, notes, range, bars, tempo, mentor toggle — survives reload.

### 2. Mentor learning mode (note letters) ✅
- **🔤 Letters** toggle draws each note's letter name **centred in the
  notehead** (white on filled quarter heads, the note's colour on hollow
  half/whole heads). Shows on both the screen staff and the printed manuscript.
- Implemented in `notation.js` `renderNote()` via `showLetters`.

### Bonus fix
- Open noteheads (half/whole) are now **hollow in colour mode too** — previously
  filled solid, which made a half note look identical to a quarter on the
  coloured staff. Quarter/half/whole are now always visually distinct.

### 3. Staff manipulation: clef + octave (shipped 2026-06-05) ✅
- **Clef** selector (Treble / Bass) and an **Octave** stepper (−2…+2) — two
  independent knobs over where the melody lands on the staff. Grid + audio always
  use the true sounding pitches; these only move the *notation*.
- `notation.js` is now clef-agnostic: `CLEFS` in `model.js` defines each clef's
  top-line step + glyph; `renderScore({ clef, staffShift })` positions notes
  relative to that. Octave mark auto-picks **8** (one octave) or **15** (two),
  above the clef for "sounds higher" (negative shift), below for positive.
- Default xylophone = Treble −1 oct ("8"). Switching instrument resets the shift
  to that range's natural `staffShift`; clef persists. Both saved to localStorage.

### 4. Song library + file export/import (shipped 2026-06-05) ✅
- **📚 My Songs** library: 💾 Save the current canvas into a named collection
  (`localStorage` key `composer.library.v1`, separate from the working-canvas
  autosave). Each row loads / exports / deletes; the loaded song is highlighted
  and re-saving **updates in place** (tracked by `state.currentId`). **＋ New**
  starts a blank unsaved piece.
- **File export/import** (no backend): ⬇ per-song `.composer.json`, ⬇ **Export
  all** as a `composer-songbook-<date>.json`, ⬆ **Import** (accepts a single
  piece, a songbook, a bare array, or the autosave shape — forgiving parser).
- One shared library (composer name is just a per-piece field, shown in the
  row meta). Storage/file helpers live in `src/library.js`; the shared
  `currentPiece()` / `applyPiece()` keep autosave, library, and files in lockstep.
- Decision recorded: stayed fully client-side (no Supabase) — right call for one
  family/device; cloud sync only earns its keep for cross-device or public sharing.

### 5. Starter Songs shelf (shipped 2026-06-05) ✅
- A built-in, read-only **🎵 Starter Songs** section above My Songs, with a
  handful of **public-domain** tunes (verified pre-1923 traditional / Beethoven /
  Pierpont — traditional melodies, not modern arrangements): Twinkle Twinkle
  (12 bars), Mary Had a Little Lamb (8), Hot Cross Buns (4), Ode to Joy (8),
  Jingle Bells chorus (4). All single-octave-ish, natural notes, quarter/half/
  whole, on the default C5–A6 xylophone.
- Expanded 2026-06-05 with four more (web-search-confirmed standard
  beginner-xylophone repertoire, all public domain): Three Blind Mice (4),
  Old MacDonald Had a Farm (8), London Bridge Is Falling Down (8), Au Clair de
  la Lune (8). Total 9. All melodies kept ≥ C5 (xylophone has no notes below C5).
- Defined in `src/presets.js` via a compact beat-token DSL ("C5", "C5:2" half,
  "C5:4" whole, "_" rest, "|" decorative). Loading a starter drops it on the
  canvas as a **fresh unsaved piece** (`currentId = null`) so Save makes the
  child's own copy in My Songs; the starter itself is never modified. Each row
  also exports to a file.
- To add more songs: append a `song(...)` to `PRESETS` (must total 16/32/48
  beats = 4/8/12 bars; no barline-crossing notes).

## Later / parked
- **Cloud sync (Supabase-class)** — only if cross-device access or shareable
  links/gallery become wanted. Adds auth + hosted DB + maintenance to the
  otherwise-static site.
- Per-composer grouping/filter within the library (currently one shared list).

### 6. Manuscript line-wrapping (shipped 2026-06-05) ✅
- `notation.js` rebuilt around stacked **systems**: `renderScore(..., { barsPerSystem })`
  wraps a long piece onto multiple staff rows. Each system repeats the clef +
  octave mark; the time signature shows only on the first; the final thick
  barline lands at the true end.
- **Print manuscript wraps at 4 bars/system** (so 12-bar songs print as 3 tidy
  rows instead of running off the page). The **on-screen staff stays a single
  scrolling line** (`barsPerSystem` omitted) so it keeps aligning with the grid
  above it and the playhead sweep still works.
- Theory guidance — e.g. as a melody wanders, suggest resolving to the tonic.
  Data model (`{start, pitch, durBeats}` over a known scale) already supports a
  future analyzer. (Warren's original "heroic" idea.)
- More instruments; accidentals / key swaps (F→F♯, B→B♭) — already a marked
  FUTURE HOOK in `model.js`.
- Eighth notes; harder-mode constraints.
