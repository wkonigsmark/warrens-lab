# Composer Live — Roadmap (v2 sandbox)

A sandbox for the **"hum it and capture it"** vision: a child sings a melody, the
tool hears it, transcribes it to notes, and becomes a starting point for guided
composition. Separate from the stable Composer so we can prototype the audio +
DSP freely; shares the same note model (`{start, pitch, durBeats}`) so anything
that works here can feed back into the main tool.

**Stack:** vanilla ES modules, no build step (same as Composer). Served from repo
root; dev config `composer-live` on **:9013** (also reachable via the `composer`
server at `/music/tools/composer-live/`). Fully client-side — no backend.

## The grand vision (Warren's narrative)
1. Child says "I have an idea for a song" and hums/sings it.
2. Parent sets a tempo/beat.
3. Hit **record** → capture a short audio clip of the melody.
4. Software transcribes it to a MIDI score/manuscript (pitch, timing, cadence).
5. Optional **smart Quantize** — tighten notes onto the grid, nudging slightly-off
   timing/pitch into something orderly. **Optional cleanup, never forced** (the raw
   capture is a *draft* you refine — transcription is never perfect).
6. Layer **harmonic/theory suggestions** on the core melody ("dominant IV into a
   minor vi here"), **mode-aware** ("give it a phrygian feel" re-colours the
   suggestions). Reuse the **Music Recognition Engine** (chord→scale/mode/key) in
   `/music` as the theory brain.
7. Compose around the child's original melody with a simple capture mechanism.

## Feasibility verdict
Reachable, all client-side. Difficulty is uneven: **pitch detection is the solved,
easy part; note segmentation (continuous pitch curve → discrete notes) is the real
engineering and the main source of error** — which is why step 5's "optional
cleanup" is a core design principle, not a nicety.

## Milestones
- **M1 · Mic → live pitch (DONE 2026-06-08).** Prove we can hear a hummed pitch in
  real time. `getUserMedia` → `AnalyserNode` → `detectPitch()` per frame → a
  tuner-style readout (note name, cents, frequency, clarity) + a scrolling
  piano-roll contour (boomwhacker colours, C3–C6). **Pitch engine = in-browser DSP**
  (McLeod Pitch Method: NSDF + first-peak picking, no deps) — chosen over an ML
  model for zero-dependency simplicity; plenty accurate for monophonic voice.
  `src/pitch.js` verified 8/8 on synthetic tones across 3 octaves, octave/
  subharmonic errors eliminated. **Live mic test is Warren's to run** (headless
  preview has no microphone).
  - Decisions locked (2026-06-08): in-browser DSP (not ML); new sandbox tool (not
    in the main composer); de-risk capture first (not theory-first).
- **M1.5 · Wider register + printable painting (DONE 2026-06-08).** Warren saw the
  contour as a "living painting" and wanted to keep it. (a) **Register widened to
  C2–C7** (was C3–C6, which clipped low/high lines) — `MIN_HZ 65 / MAX_HZ 2100` in
  pitch.js, `MIDI_LO 36 / MIDI_HI 96` in app.js, live canvas taller (560px). (b) The
  full take is now recorded (downsampled 25Hz) with a **10-minute cap** (auto-stops
  + live mm:ss timer); on Stop a **"melody painting"** panel renders the whole take
  wrapped into 20-second rows (time across, pitch up/down, boomwhacker colours) on a
  canvas, with a **Save / Print (PDF)** button → `window.print()` + a print
  stylesheet that shows only the painting (print-only header w/ date + duration).
- **M2 · Note segmentation + transcription (DONE 2026-06-08).** Turns the captured
  pitch stream into discrete notes on a staff. `src/transcribe.js` (pure, tested):
  `segmentNotes(session)` rounds each sample to a semitone, **median-smooths**
  (kills octave blips/vibrato), groups equal-pitch runs into notes tolerating brief
  dropouts, and — crucially — **splits re-articulated REPEATED notes via RMS
  onset/valley detection** (pitch alone can't separate "C C"; loudness dips→attacks
  do). `notesToBeats(raw, bpm, {quantizeSub})` maps seconds→beats with an OPTIONAL
  eighth-note quantize (kept toggleable — cleanup, never forced) + monophonic
  overlap cleanup, emitting Composer `{start, pitch, durBeats}`. UI: a **Tempo (BPM)**
  control, and on Stop a **🎼 Transcription** panel renders the notes on the
  Composer's real staff (imported `renderScore` from `../../composer/src/notation.js`
  — colored + letter-named), a **Quantize to grid** toggle, and **🎹 Send to
  Composer** which writes a `piano-88` piece into the shared `composer.library.v1`
  localStorage (same origin) → it appears in the Composer's My Songs, ready to edit.
  Verified end-to-end on synthetic "Twinkle line 1" (C C G G A A G): 7 notes, repeats
  split, renders on staff, loads into the Composer on the 88-key piano. **Live-mic
  test is Warren's.** Known limits (future tuning): onset thresholds vs. breathy/
  legato singing; octave jumps on voice; only eighth-grid quantize for now.
- **M3 · Smart Quantize (optional).** Snap onsets/durations to the grid given the
  tempo; gentle pitch-snap to nearest scale tone. Always toggleable, per-note
  editable — the raw take stays available.
- **M4 · Theory / harmony layer.** Detect key/mode from the captured melody; suggest
  diatonic chord moves that support it; mode override ("phrygian"). Reuse the Music
  Recognition Engine. Suggestions are offered, never auto-applied.
- **M5 · Fold back into Composer.** Once capture feels good, surface it as a Record
  mode in the main tool (shared note model makes this a port, not a rewrite).

## Files
- `index.html` — mic button, tuner readout, contour canvas.
- `style.css` — bright theme (Composer family palette).
- `src/pitch.js` — `detectPitch()` (NSDF/McLeod) + freq↔note helpers. Pure, testable.
- `src/app.js` — mic wiring, rAF detection loop, tuner + contour rendering.
