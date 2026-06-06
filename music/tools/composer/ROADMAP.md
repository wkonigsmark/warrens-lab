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

---

## Next horizon (planned — set 2026-06-05)

The tool is feature-complete as a *composer*. The next arc turns it into a
*teacher*: guided practice, a cleaner/again-portable surface, richer rhythm, and
more content. Phases below are Warren's; notes + dependencies are mine.

### Phase 1 — Learning layer (the big one)

**1A · Lessons built off library pieces.** _(first pass shipped 2026-06-05)_
**Reframed by Warren → PRINTABLE practice sheets, not a screen game.** The build-up
exercises are supplemental *notation* a student takes to the instrument; the
on-screen part stays minimal (hear it + metronome). Focus is the notes, not UX.
- ✅ `src/lessons.js`: hand-authored lessons as **cumulative steps** (each step =
  the phrase-so-far, with a kid-facing prompt naming the *change* — "leap up to
  G"). Three lessons: Hot Cross Buns, Twinkle Line 1, Ode to Joy Line 1.
- ✅ **🖨 Print → practice sheet**: `buildPracticeSheetHTML()` renders each step
  as a labelled B&W mini-staff (Warm-up 1 → … → "Put it together"), letters in
  the noteheads, stacked, `break-inside: avoid`. Reuses `renderScore`.
  - ✅ **Fits one page**: practice-sheet staves use a fixed compact height
    (`.ms-exercise .ms-score svg { height:116px; width:auto }`) instead of the
    full-page width the single-piece manuscript uses — Twinkle's 5 exercises now
    land on one sheet (~720px tall). Left-aligned, growing in width per phrase.
- ✅ **🎓 Lessons shelf** (read-only): 🖨 prints the sheet; tapping the row loads
  the full phrase on the canvas to hear.
- ✅ **Metronome** — a real **standalone** click (`startMetronome`/`stopMetronome`
  in audio.js, lookahead scheduler for steady timing, firm downbeat + soft
  off-beats). Toggle on/off; the tempo slider adjusts it live (`setMetronomeTempo`).
  Session-only (not persisted; no auto-start on load). Earlier version only
  clicked during playback and the toggle alone did nothing — fixed.

### Playback controls (shipped 2026-06-05)
- **Play ⇄ Stop on one button**: clicking toggles; `togglePlay()`. Stop now
  *actually* silences notes that were scheduled ahead — playback voices route
  through a master gain that `silencePlayback()` mutes. Stop state is red.
- **Spacebar** starts/stops from anywhere, except while typing in a field or with
  a button focused (those handle their own space).
- Next: lessons covering the *whole* piece (not just line 1); count-in before
  playback; per-piece sheets (print a starter song's prep exercises).
- NOT built (deliberately, per Warren): interactive ghost-tap/echo game UI.

**1B · Scalable auto-generation of practice pieces.**
An engine that *simplifies* existing pieces and *generates* graded drills:
strip a tune to all-quarters, narrow its range, isolate one motif, or
procedurally build rhythm patterns (clap-backs, ostinati).
- Pure functions over the note model: `simplifyRhythm()`, `isolatePhrase()`,
  `transpose()`, `generateRhythmDrill(pattern)`, `gradeDifficulty()`. A content
  layer on top of `{start, pitch, durBeats}` — no new rendering needed.
- **This is the engine behind 1A at scale.** Sequence: 1A (hand-authored proof)
  → 1B (automate what worked) → 1A library fills itself out.
- Synergizes with the parked **tonic-resolve / theory analyzer** idea.

### Phase 2 — Surface polish

**2A · UI cleanup / visual declutter.** _(first pass shipped 2026-06-05)_
- ✅ **Sticky note-name labels** — the pitch column (`.row-label`) is now
  `position: sticky; left: 0` so the names stay pinned while the bars scroll
  horizontally (helps desktop AND mobile; was easy to lose your row before).
- ✅ Mobile `@media (max-width:640px)` block: compacted the control card
  (574px → 412px), full-width equal-width action-button row, shorter grid rows
  (`--row-h` → 26px), tighter cards + library, hid the tagline.
- Still open: grouping controls into sections (compose / staff / playback); the
  **tall grid** (13 instrument rows even for low songs — those rows are valid
  pitches so cropping would block input; a vertical-scroll or compact mode is the
  real fix, deferred).

**2B · Mobile optimization.** _(first pass shipped 2026-06-05)_
- ✅ Responsive layout verified at 375px: no horizontal overflow, controls wrap,
  library rows clean, tapping cells to place notes works. Desktop unregressed.
- Still open: **eighth-note cells are ~20px wide** — tappable but tight for
  little fingers. Bumping needs care: the grid shares `BEAT_W` with the staff for
  column alignment, so a mobile zoom / larger-beat mode must scale both together
  (or accept grid↔staff drift). Deferred as a focused follow-up.

### Phase 3 — Richer rhythm & meter

**3 · 3/4 time signature + triplets.**
- 3/4 is a modest change: `BEATS_PER_BAR` becomes configurable (3 vs 4), plus a
  time-sig control; barline/`fits()` logic already keys off it. Unlocks waltzes
  and **Happy Birthday**, Rock-a-bye, etc.
- Triplets are bigger: the grid is currently 2 slots/beat; triplets need 3. Going
  to **6 slots/beat** (LCM) supports both eighths and triplets, but makes the
  grid denser — ties into 2A/2B (touch targets). Notation needs tuplet brackets.
- Recommend shipping **3/4 first** (cheap, high payoff), triplets as a follow-up.

### Phase 4 — Content

**4 · Grow the public-domain library.**
Ongoing. Partly *gated by Phase 3* (3/4 + triplets unlock Happy Birthday, Row
Row Row Your Boat, many folk tunes). Worth adding **difficulty tags / categories**
to the starter shelf as it grows. Keep the "traditional melody, pre-1923 /
verified PD" bar.

### Suggested sequencing (my read)
`2A+2B` (polish + mobile — the tool's earned it and it de-risks everything after)
→ `1A` (hand-authored lessons) → `3` 3/4 (cheap win) → `1B` (automation) →
`4` ongoing + triplets. Phases are independent enough to reorder by appetite.

---

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

### 7. Eighth notes (shipped 2026-06-05) ✅
- Added **Eighth** to the note palette. The grid now runs at eighth-note
  resolution: each beat is `SLOTS_PER_BEAT` (2) cells (`model.js`), so notes can
  sit on the half-beat. Visual hierarchy on the grid: faint line every eighth,
  medium on the beat (`.beat-start`), strong at the bar (`.bar-start`).
- `notation.js`: eighth heads get a **flag** off the stem; note heads now centre
  over their own time span (so they line up with the grid block, and eighths sit
  in their half-slot). `fits()` and overlap checks made fraction-safe.
- Cells expose `data-pitch` / `data-slot` for reliable targeting/testing.
- New eighth-note starter: **Frère Jacques** (written do=G5 so the low
  "din-dan-don" sol = D5 still fits C5–A6). Preset DSL now parses `:0.5` (eighth)
  via `parseFloat`. Total starters: 10.
- Unlocks more repertoire (eighth-note tunes that were skipped before). Still
  parked for lack of support: 3/4 meter (Happy Birthday, Rock-a-bye) and triplet
  feel (Row Row Row Your Boat).

### Dev note
- Local preview now served by `~/.claude/nocache_server.py` (sends
  `Cache-Control: no-store`) instead of `python -m http.server`, because the
  browser was heuristically caching ES modules and serving stale per-file
  mixes during iteration. `.claude/launch.json` "composer" points at it.

### 6. Manuscript line-wrapping (shipped 2026-06-05) ✅
- `notation.js` rebuilt around stacked **systems**: `renderScore(..., { barsPerSystem })`
  wraps a long piece onto multiple staff rows. Each system repeats the clef +
  octave mark; the time signature shows only on the first; the final thick
  barline lands at the true end.
- **Print manuscript wraps at 4 bars/system** (so 12-bar songs print as 3 tidy
  rows instead of running off the page). The **on-screen staff stays a single
  scrolling line** (`barsPerSystem` omitted) so it keeps aligning with the grid
  above it and the playhead sweep still works.

## Later / parked (smaller items)
- **Theory guidance / tonic-resolve analyzer** — as a melody wanders, suggest
  resolving to the tonic. The `{start, pitch, durBeats}`-over-a-known-scale model
  already supports a future analyzer. (Warren's original "heroic" idea; now also
  feeds Phase 1B.)
- **More instruments; accidentals / key swaps** (F→F♯, B→B♭) — already a marked
  FUTURE HOOK in `model.js`.
- **Cloud sync (Supabase-class)** — only if cross-device access or shareable
  links/gallery become wanted. Adds auth + hosted DB + maintenance to the
  otherwise-static site.
- **Per-composer grouping/filter** within the library (currently one shared list).
- **Load-from-file straight to canvas** (bypass the library on import).
