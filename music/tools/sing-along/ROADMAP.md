# Sing-Along — Roadmap (3rd Composer-zone tool)

A SingStar-style **sing-the-melody game** for Warren's kids: load a song (from
HookTheory), follow a scrolling pitch "highway", and sing into the mic to score
how closely you match each note. Builds pitch recognition + staying on key.
Combines the two proven halves from the other tools — **live pitch detection**
(composer-live) and **HookTheory→notes** (composer) — into a game loop.

**Stack:** vanilla ES modules, no build step. Standalone; dev config `sing-along`
on **:9014** (also reachable via the `composer` server at `/music/tools/sing-along/`).
Fully client-side, no backend. Pitch DSP is a self-contained copy of composer-live's
`pitch.js` (kept independent of that sandbox).

## Design decisions (Warren, 2026-06-08, via AskUserQuestion)
- **Game format:** sing-along highway (scrolling target notes + live pitch dot).
- **Easiest level:** "forgiving but honest" — generous tolerance + positive framing,
  but the **octave matters** and the score reflects real accuracy (NOT octave-free /
  no-fail). The guided range-check (below) makes requiring the right octave *fair*.
- **Transpose:** guided range check (hum lowest+highest comfy notes → auto-transpose
  each song to fit). M1 ships manual +/- + auto-fit; the range check is M3.
- **Songs:** curated library, kid picks (parent pastes/saves). M1 ships a default
  song + a paste box; the library is M4.

## Milestones
- **M1 · Core sing-along loop (DONE 2026-06-08).** Scrolling pitch highway (canvas;
  notes scroll right→left past an orange now-line, boomwhacker-coloured bars that
  fill green as you stay in tune), 4-beat **count-in** with WebAudio clicks, **live
  mic** pitch dot (reuses NSDF detector), **honest scoring** (`inTune` = within 1.5
  semitones, exact octave; per-note in-tune-beats → accuracy %), running score HUD,
  and an **end screen** with stars (3★ ≥85%, 2★ ≥65%, 1★ ≥40%) + encouraging,
  positive-only messages + "Sing again". Manual **transpose** (±octave, ±semitone,
  Auto-fit) and a **paste box** (HookTheory *or* Composer JSON) with a default
  Twinkle. `src/song.js` (pure: parse/transpose/scoring helpers) + `src/pitch.js`
  (copy) + `src/app.js` (game loop/render/mic). Verified via a sim hook: perfect→100%,
  +1 semitone→100% (generous), +3→0% (honest), octave-off→0%, silent→0%; transpose +
  paste + results screen all work; no console errors. **Live-mic singing test is
  Warren's.** Fixed a CSS gotcha: `.results/.count-in { display:flex }` overrode the
  `[hidden]` attribute → added `[hidden]{display:none!important}`.
- **M2.5 · Starting-pitch reference (DONE 2026-06-08).** Warren couldn't find the
  key from the start and spent each run chasing the melody. Fix: (1) the **count-in
  now sings the starting pitch** — each of the 4 beats plays the first note's tone
  (refactored `beep`→`tone(ctx,freq,dur,vol)`), so you hear exactly where to come in;
  (2) a **🔊 Start note: <name>** button previews that pitch any time (short-lived
  AudioContext); (3) a **gold dashed "start · <name>" guide line** on the highway at
  the entry pitch. All derive from `startMidiOf()` (earliest note) + `midiToFreq`, so
  they track transpose/range edits. Verified: label C4→C5→C4 with octave shifts,
  preview fires, guide line drawn, no errors. (First note = the singer's anchor;
  often the tonic but not always — a true tonic drone could be a later option.)
- **M2.6 · Hit-based scoring + sing-during-count-in + audio fix (DONE 2026-06-08).**
  Three things: (1) **Audio fix** — no sound was playing because the AudioContext
  starts *suspended* (the game's is created right after `await getUserMedia`, which
  leaves it paused); added `audioCtx.resume()` in `start()` and a resume-then-play in
  `previewStartNote()`. (2) **Sing during the count-in** — the loop now detects the
  singer's pitch EVERY frame (not just when scoring starts), so the dot shows during
  the count-in and **turns green when you're already on the start note** → pre-tune
  before beat 1. (3) **Hit-based scoring (Guitar-Hero style)** — replaced held-time
  accuracy with `hitScore`: a note is "hit" if sung in tune for even a brief moment
  (`noteHit` = `hitBeats ≥ min(0.25·dur, 0.2 beats)`), score = **notes hit ÷ total**
  (e.g. 11/14 = 79%). HUD shows the running `hits/done` fraction; results show
  "X / Y notes hit". The old held-time metric is kept as `heldAccuracy` for a future
  **pro/master mode** (the user explicitly wants holding-accuracy as an advanced tier
  later). Verified: brief 0.2-beat touches → 14/14=100% (held-accuracy would be 18%),
  11 hit → 79% → ★★☆, half-note touch counts, 0.05b glance doesn't; no console errors.
- **M2 · Levels & juice.** Difficulty tiers (tolerance/tempo; the held-accuracy
  "pro mode" lives here; maybe an octave-free easy tier), combo/streak multiplier,
  hit sparkles, bigger celebration, count-in polish, optional guide-melody toggle.
- **M3 · Guided range check → auto-transpose (DONE 2026-06-08, pulled forward).**
  Warren couldn't tell where "Auto-fit" put his key — because the old `autoOctave`
  is **song-centred, not singer-aware** (just centres the song near G4 by whole
  octaves; never hears the voice). Fixed two ways: (1) an always-visible **fit
  readout** under the song title ("sits at C4–A4 · your range …") so the register
  is never a mystery; (2) a **🎯 Find my range** guided modal — sing your lowest,
  then highest comfortable note (own mic loop, live note display, median of recent
  readings), then it **suggests a whole-octave shift** (`suggestOctaveShift` centres
  the song's range on the voice's centre by octaves only → key unchanged) shown as
  "We'll put X down 2 octaves so it sits at C3–A3" with **Use this ✓ / Start over**.
  The measured range is stored, so every song loaded afterwards auto-fits to that
  voice (`fitForSinger` = singer range if known, else the G4 default). Verified
  (sim hook, no mic): low voice C3–C4 → −24 (down 2 oct) → C3–A3; new song after a
  range set auto-fits; readout + modal states correct; no console errors. **Live-mic
  range capture is Warren's to test.** Future: a tiny "hold to confirm" auto-capture,
  and persist the range across sessions.
- **M4 · Lyrics + curated song path (DONE 2026-06-08).** Gamification: lyrics on the
  notes + a progressive ladder. `src/library.js` = `PATH_SONGS`, a hand-authored,
  difficulty-ordered list of 5 simple songs, each note carrying a `lyric` syllable
  (First Steps "do do re mi" → Up and Down → Hot Cross Buns → Mary Had a Little Lamb
  → Twinkle). **Lyrics on the highway**: `drawFrame` draws each note's syllable above
  its bar (white halo for legibility; the active note's lyric grows + turns orange).
  **Song Path UI**: a row of "stops" with states — 🔒 locked / 🎤 unlocked ("tap to
  sing") / ⭐ cleared ("cleared · N%"); the current one is ring-highlighted; tapping an
  unlocked stop loads it. **Progression** (score-threshold, Warren's pick): clearing a
  song at **≥ PASS_PCT (70%)** via the hit-score marks it cleared and unlocks the next;
  a **"Next song →"** button appears on a win; progress (cleared ids + best %) persists
  in `localStorage 'singalong.progress.v1'`; on load the student resumes at the first
  uncleared song (`firstUnclearedIndex`). Custom/handed-over songs set
  `currentPathIndex=-1` (not part of the path). Verified: lyrics render, fail (50% →
  not cleared, "best 50%") vs pass (100% → cleared + unlock + Next), Next loads the
  next, progress survives reload + resumes; no console errors. **Live singing is
  Warren's to test.**
- **M5 · Polish + path growth.** More curated songs (verse 2s, more tunes); lyric
  authoring from Composer/paste (carry `lyric` through the handoff); a karaoke line
  option; star-based progression variant; mobile/touch; latency calibration. Possible:
  a "held-accuracy pro mode" tier (the parked `heldAccuracy`).

## Files
- `index.html` — song bar (title, transpose, paste), play button, game stage
  (canvas + count-in + results overlays), HUD.
- `style.css` — bright theme; `[hidden]` reset; overlays.
- `src/song.js` — DEFAULT_SONG, HookTheory/Composer parse, transpose, auto-octave,
  and pure scoring helpers (`noteAtBeat`, `inTune`, `accuracy`). Node-testable.
- `src/pitch.js` — NSDF/McLeod detector (self-contained copy).
- `src/app.js` — controls, mic, count-in, the rAF game loop, scoring, canvas highway.

## Future / shared
- The HookTheory converter now lives in 3 places (composer, this `song.js`); worth
  extracting a shared module once it stabilises. Same for `pitch.js` (composer-live +
  here).
