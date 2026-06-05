# Composer — Roadmap

Beginner melody composer for music students. v1 shipped 2026-06-05
(colored pitch-grid + live treble staff, quarter/half/whole in 4/8/12 bars,
Web Audio playback, config-driven xylophone register C4–A5). Marked **BETA**.

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

## Later / parked
- JSON export/import of a piece ("share a melody") — localStorage save is in;
  a downloadable file is the obvious next step.
- Multi-system line wrapping for the printed manuscript (currently one scaled
  line; fine for 4 bars, gets small at 12).
- Theory guidance — e.g. as a melody wanders, suggest resolving to the tonic.
  Data model (`{start, pitch, durBeats}` over a known scale) already supports a
  future analyzer. (Warren's original "heroic" idea.)
- More instruments; accidentals / key swaps (F→F♯, B→B♭) — already a marked
  FUTURE HOOK in `model.js`.
- Eighth notes; harder-mode constraints.
