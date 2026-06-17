// app.js — Milestone 1: prove we can hear a hummed pitch in real time.
// Mic → AnalyserNode → detectPitch() each animation frame → a tuner readout and
// a scrolling piano-roll contour. No note segmentation yet (that's milestone 2);
// this is purely "can we reliably track the pitch of a voice in the browser?".

import {
    detectPitch, freqToMidi, midiToName, centsOff, isSharp, MIN_HZ, MAX_HZ,
} from './pitch.js';
import { segmentNotes, notesToBeats } from './transcribe.js';
import { renderScore } from '../../composer/src/notation.js';
import { openRangeModal, getStoredRange } from '../../_shared/range.js';

const els = {
    listen: document.getElementById('listen'),
    status: document.getElementById('status'),
    noteName: document.getElementById('note-name'),
    freq: document.getElementById('freq'),
    tunerNeedle: document.getElementById('tuner-needle'),
    clarityFill: document.getElementById('clarity-fill'),
    canvas: document.getElementById('contour'),
    paintingPanel: document.getElementById('painting-panel'),
    painting: document.getElementById('painting'),
    paintingSub: document.getElementById('painting-sub'),
    savePainting: document.getElementById('save-painting'),
    printMeta: document.getElementById('print-meta'),
    tempo: document.getElementById('tempo'),
    transcribePanel: document.getElementById('transcribe-panel'),
    transcribeSub: document.getElementById('transcribe-sub'),
    quantizeToggle: document.getElementById('quantize-toggle'),
    score: document.getElementById('score'),
    sendComposer: document.getElementById('send-composer'),
    sendStatus: document.getElementById('send-status'),
    findRange: document.getElementById('find-range'),
    paintingWrap: document.getElementById('painting-wrap'),
    eraseRect: document.getElementById('erase-rect'),
    eraserBtn: document.getElementById('eraser-btn'),
    eraserHint: document.getElementById('eraser-hint'),
    resetEdits: document.getElementById('reset-edits'),
    undoBtn: document.getElementById('undo-btn'),
    redoBtn: document.getElementById('redo-btn'),
    regLo: document.getElementById('reg-lo'),
    regHi: document.getElementById('reg-hi'),
    regLoVal: document.getElementById('reg-lo-val'),
    regHiVal: document.getElementById('reg-hi-val'),
    trimStart: document.getElementById('trim-start'),
    trimEnd: document.getElementById('trim-end'),
    trimStartVal: document.getElementById('trim-start-val'),
    trimEndVal: document.getElementById('trim-end-val'),
};
const ctx2d = els.canvas.getContext('2d');

// Quick frame loudness (RMS) — feeds the transcriber's onset detection.
function frameRms(b) {
    let s = 0;
    for (let i = 0; i < b.length; i++) s += b[i] * b[i];
    return Math.sqrt(s / b.length);
}

// Transcription state: rawNotes (seconds) are computed from the EDITED take; the
// beat-mapped composerNotes are re-derived whenever tempo/quantize change.
let rawNotes = [];
let composerNotes = [];

// Post-capture edit state (layered over the immutable `session`; all reversible).
// editLo/editHi default to the full C2–C7 range; showPainting() re-hugs them to
// the captured melody. (Literals, not MIDI_LO/HI, which are declared further down.)
let editLo = 36, editHi = 96;             // pitch band (MIDI) the painting crops to
let trimStart = 0, trimEnd = Infinity;    // time window (seconds)
let erased = [];                          // [{ t0, t1, m0, m1 }] erased boxes
let captureDur = 0;
let paintLayout = null;                   // last painting geometry (for eraser hit-testing)
let singRange = getStoredRange();         // { lo, hi } MIDI — the shared "sing zone" guide

// Undo/redo: snapshots of the edit state. `committed` is the last recorded move;
// a move = a finished slider drag, an eraser box, or a Reset. Reset (full clear)
// is itself one undoable move; per-move undo lets you fix a single tiny thing.
let undoStack = [], redoStack = [], committed = null;
const snapshot = () => ({ editLo, editHi, trimStart, trimEnd, erased: erased.map((b) => ({ ...b })) });
function restoreSnapshot(s) {
    editLo = s.editLo; editHi = s.editHi; trimStart = s.trimStart; trimEnd = s.trimEnd;
    erased = s.erased.map((b) => ({ ...b }));
}

// Boomwhacker colours (same as the Composer) so a pitch reads the same hue here.
const NOTE_COLORS = { C: '#e53935', D: '#fb8c00', E: '#fdd835', F: '#43a047', G: '#00acc1', A: '#3949ab', B: '#8e24aa' };
const BLACK_KEY = '#3a3f4b';
const colorForMidi = (midi) => {
    if (isSharp(midi)) return BLACK_KEY;
    const letter = midiToName(midi)[0];
    return NOTE_COLORS[letter] || '#888';
};

// Contour vertical range (what pitches the canvas shows): C2 … C7 — wide enough
// that low humming and high singing/whistling don't clip at the edges.
const MIDI_LO = 36;   // C2
const MIDI_HI = 96;   // C7
const GUTTER = 44;    // left label column (canvas px)
const PAD_Y = 16;

// --- Audio state ----------------------------------------------------------
let audioCtx = null;
let analyser = null;
let stream = null;
let rafId = null;
let buf = null;
let listening = false;

// Ring of recent detections for the scrolling trace. Each = {midi, clarity} | null.
const HISTORY_LEN = 700;
const history = new Array(HISTORY_LEN).fill(null);

// Full-take recording for the printable "painting".
const MAX_CAPTURE_SEC = 600;   // 10-minute cap
const SESSION_HZ = 25;         // samples/sec stored (downsampled from ~60fps)
let session = [];              // [{ t: seconds, midi|null, clarity }]
let captureStart = 0;          // performance.now() at record start
let lastPush = 0;              // last session-sample timestamp (ms)
let lastTick = -1;             // last whole-second shown in the live timer

async function start() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch (err) {
        setStatus(`Microphone blocked: ${err.message}. Allow mic access and try again.`, 'error');
        return;
    }
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    buf = new Float32Array(analyser.fftSize);
    source.connect(analyser);

    listening = true;
    els.listen.textContent = '⏹ Stop';
    els.listen.classList.add('listening');
    history.fill(null);
    session = [];
    captureStart = performance.now();
    lastPush = 0;
    lastTick = -1;
    els.paintingPanel.hidden = true;     // fresh take
    els.transcribePanel.hidden = true;
    setStatus('● Listening 0:00 — hum or sing a tune! 🎵', 'live');
    loop();
}

function stop() {
    listening = false;
    if (rafId) cancelAnimationFrame(rafId);
    if (stream) stream.getTracks().forEach((t) => t.stop());
    if (audioCtx) audioCtx.close();
    audioCtx = analyser = stream = null;
    els.listen.textContent = '🎤 Start Listening';
    els.listen.classList.remove('listening');
    resetReadout();
    // If we captured anything pitched, reveal the painting + the transcription.
    if (session.some((p) => p && p.midi != null)) {
        showPainting();   // sets up the edit state, then renders painting + notes
        setStatus('Done! 🎨 Tidy the painting below (register · trim · 🧽), then send the notes.', '');
    } else {
        setStatus('Stopped. Click Start Listening to go again.', '');
    }
}

function loop() {
    if (!listening) return;
    const now = performance.now();
    const elapsed = (now - captureStart) / 1000;

    // 10-minute cap — stop and hand back the painting.
    if (elapsed >= MAX_CAPTURE_SEC) {
        stop();
        setStatus('Reached the 10:00 limit — here’s your painting! 🎨', '');
        return;
    }

    analyser.getFloatTimeDomainData(buf);
    const result = detectPitch(buf, audioCtx.sampleRate);

    let sample = null;
    if (result) {
        const midi = freqToMidi(result.freq);
        const cents = centsOff(result.freq, midi);
        updateReadout(midi, result.freq, cents, result.clarity);
        sample = { midi: midi + cents / 100, clarity: result.clarity };
    } else {
        fadeReadout();
    }
    history.push(sample);
    history.shift();

    // Record the full take (downsampled) for the painting + transcription.
    // RMS (loudness) rides along so segmentation can split re-articulated repeats.
    if (now - lastPush >= 1000 / SESSION_HZ) {
        const rms = frameRms(buf);
        session.push(sample ? { t: elapsed, midi: sample.midi, clarity: sample.clarity, rms }
                            : { t: elapsed, midi: null, clarity: 0, rms });
        lastPush = now;
    }

    // Live recording timer in the status line (update once per second).
    const sec = Math.floor(elapsed);
    if (sec !== lastTick) {
        lastTick = sec;
        setStatus(`● Listening ${fmtDur(elapsed)} — hum or sing a tune! 🎵`, 'live');
    }

    drawContour();
    rafId = requestAnimationFrame(loop);
}

// --- Readout (tuner) ------------------------------------------------------
function updateReadout(midi, freq, cents, clarity) {
    els.noteName.textContent = midiToName(midi);
    els.noteName.classList.add('active');
    els.noteName.style.color = colorForMidi(midi);
    els.freq.textContent = `${freq.toFixed(1)} Hz · ${cents >= 0 ? '+' : ''}${cents}¢`;
    // needle: -50..+50 cents → 0..100%
    const pct = Math.max(0, Math.min(100, 50 + cents));
    els.tunerNeedle.style.left = `${pct}%`;
    els.tunerNeedle.style.opacity = '1';
    els.clarityFill.style.width = `${Math.round(clarity * 100)}%`;
}

function fadeReadout() {
    els.noteName.classList.remove('active');
    els.tunerNeedle.style.opacity = '0';
    els.clarityFill.style.width = '0%';
}

function resetReadout() {
    els.noteName.textContent = '—';
    els.noteName.classList.remove('active');
    els.noteName.style.color = '';
    els.freq.textContent = '— Hz';
    els.tunerNeedle.style.opacity = '0';
    els.clarityFill.style.width = '0%';
}

// --- Contour canvas -------------------------------------------------------
const W = els.canvas.width;
const H = els.canvas.height;
const midiToY = (m) => PAD_Y + (MIDI_HI - m) / (MIDI_HI - MIDI_LO) * (H - 2 * PAD_Y);

function drawContour() {
    ctx2d.clearRect(0, 0, W, H);

    // "sing zone" band — your comfy range, so you can see if your hum sits in it
    if (singRange) {
        const yHi = midiToY(Math.min(MIDI_HI, singRange.hi));
        const yLo = midiToY(Math.max(MIDI_LO, singRange.lo));
        ctx2d.fillStyle = 'rgba(46,158,91,0.10)';
        ctx2d.fillRect(GUTTER, yHi, W - GUTTER, yLo - yHi);
    }

    // horizontal guide lines + note labels (label every C, line every note)
    ctx2d.font = '11px Outfit, sans-serif';
    ctx2d.textBaseline = 'middle';
    for (let m = MIDI_LO; m <= MIDI_HI; m++) {
        const y = midiToY(m);
        const isC = m % 12 === 0;
        ctx2d.strokeStyle = isC ? '#dfe4f1' : '#f1f3fa';
        ctx2d.lineWidth = 1;
        ctx2d.beginPath();
        ctx2d.moveTo(GUTTER, y);
        ctx2d.lineTo(W, y);
        ctx2d.stroke();
        if (isC) {
            ctx2d.fillStyle = '#9aa3b5';
            ctx2d.fillText(midiToName(m), 8, y);
        }
    }

    // the scrolling trace — newest on the right
    const plotW = W - GUTTER;
    for (let i = 0; i < HISTORY_LEN; i++) {
        const pt = history[i];
        if (!pt) continue;
        const x = GUTTER + (i / HISTORY_LEN) * plotW;
        const y = midiToY(Math.max(MIDI_LO, Math.min(MIDI_HI, pt.midi)));
        const r = 1.5 + pt.clarity * 2.5;
        ctx2d.fillStyle = colorForMidi(Math.round(pt.midi));
        ctx2d.globalAlpha = 0.35 + pt.clarity * 0.65;
        ctx2d.beginPath();
        ctx2d.arc(x, y, r, 0, Math.PI * 2);
        ctx2d.fill();
    }
    ctx2d.globalAlpha = 1;
}

// --- The printable "painting" (full take) --------------------------------
const fmtDur = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// Reveal the captured take: initialise the edit state (auto-hug the register to
// the melody, full time window, no erasures), then render painting + notes.
// Reset the edit state to defaults: register auto-hugged to the melody, full time
// window, no erasures. Used on a fresh take and by the Reset button.
function applyDefaultEdits() {
    const midis = session.filter((s) => s && s.midi != null).map((s) => Math.round(s.midi));
    if (midis.length) {
        editLo = Math.max(MIDI_LO, Math.min(...midis) - 2);
        editHi = Math.min(MIDI_HI, Math.max(...midis) + 2);
        if (editHi - editLo < 7) editHi = Math.min(MIDI_HI, editLo + 7); // keep ≥ an octave
    } else { editLo = MIDI_LO; editHi = MIDI_HI; }
    trimStart = 0; trimEnd = captureDur; erased = [];
}

function showPainting() {
    captureDur = session.length ? session[session.length - 1].t : 0;
    applyDefaultEdits();
    setEraser(false);
    // fresh take → empty history
    undoStack = []; redoStack = []; committed = snapshot();
    updateHistoryButtons();
    syncEditControls();

    const when = new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    els.printMeta.textContent = `${when} · ${fmtDur(captureDur)}`;
    els.paintingPanel.hidden = false;
    applyEdits();
    els.paintingPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Record a completed edit move: the pre-move state goes on the undo stack, the
// redo stack clears, and `committed` advances to the new current state.
function commitMove() {
    undoStack.push(committed);
    if (undoStack.length > 60) undoStack.shift();
    redoStack = [];
    committed = snapshot();
    updateHistoryButtons();
}

function undo() {
    if (!undoStack.length) return;
    redoStack.push(snapshot());
    restoreSnapshot(undoStack.pop());
    committed = snapshot();
    afterHistoryChange();
}
function redo() {
    if (!redoStack.length) return;
    undoStack.push(snapshot());
    restoreSnapshot(redoStack.pop());
    committed = snapshot();
    afterHistoryChange();
}
function afterHistoryChange() {
    setEraser(false);
    syncEditControls();
    applyEdits();
    updateHistoryButtons();
}
function updateHistoryButtons() {
    els.undoBtn.disabled = undoStack.length === 0;
    els.redoBtn.disabled = redoStack.length === 0;
}

// Derive the edited sample stream from the raw take: drop samples outside the
// trim window; null out pitches outside the register band or inside an erase box.
function getEdited() {
    const out = [];
    for (const s of session) {
        if (!s || s.t < trimStart || s.t > trimEnd) continue;
        let midi = s.midi;
        if (midi != null) {
            const mr = Math.round(midi);
            if (mr < editLo || mr > editHi || isErased(s.t, mr)) midi = null;
        }
        out.push({ t: s.t, midi, clarity: s.clarity, rms: s.rms });
    }
    return out;
}
const isErased = (t, m) => erased.some((b) => t >= b.t0 && t <= b.t1 && m >= b.m0 && m <= b.m1);

// Re-render everything that depends on the edited melody.
function applyEdits() {
    const edited = getEdited();
    const voiced = edited.filter((p) => p && p.midi != null).length;
    els.paintingSub.textContent =
        `${fmtDur(Math.max(0, trimEnd - trimStart))} · ${voiced} pitched moments · ${midiToName(editLo)}–${midiToName(editHi)}`;
    renderPainting(edited, editLo, editHi, trimStart, trimEnd);
    rawNotes = segmentNotes(edited, {});
    renderTranscription();
}

// Render the take as a stack of time-rows — time across, pitch up/down, coloured
// by note. Cropped to the [lo,hi] register band and the [tStart,tEnd] window.
function renderPainting(data, lo, hi, tStart, tEnd) {
    const ROW_SECS = 20, ROW_H = 150, HEAD = 8, GAP = 10, PAD_L = 46, PAD_R = 16, W = 1100;
    const duration = Math.max(0.001, tEnd - tStart);
    const rows = Math.max(1, Math.ceil(duration / ROW_SECS));
    const span = Math.max(1, hi - lo);
    const plotW = W - PAD_L - PAD_R;

    const cv = els.painting;
    cv.width = W;
    cv.height = HEAD + rows * (ROW_H + GAP);
    const g = cv.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
    g.textBaseline = 'middle';

    // remember geometry so the eraser can map screen coords → (time, pitch)
    paintLayout = { ROW_SECS, ROW_H, HEAD, GAP, PAD_L, W, lo, hi, tStart, rows, plotW };

    for (let r = 0; r < rows; r++) {
        const top = HEAD + r * (ROW_H + GAP);
        const plotTop = top + 8, plotBot = top + ROW_H - 18;
        const rt0 = tStart + r * ROW_SECS, rt1 = rt0 + ROW_SECS;
        const yOf = (m) => plotTop + (hi - m) / span * (plotBot - plotTop);

        // "sing zone" band for this row
        if (singRange) {
            const bHi = Math.min(hi, singRange.hi), bLo = Math.max(lo, singRange.lo);
            if (bHi >= bLo) {
                g.fillStyle = 'rgba(46,158,91,0.10)';
                g.fillRect(PAD_L, yOf(bHi), W - PAD_L - PAD_R, yOf(bLo) - yOf(bHi));
            }
        }

        for (let m = lo; m <= hi; m++) {
            const y = yOf(m), label = (m % 12 === 0) || m === lo || m === hi;
            g.strokeStyle = (m % 12 === 0) ? '#dfe4f1' : '#f4f6fb';
            g.lineWidth = 1;
            g.beginPath(); g.moveTo(PAD_L, y); g.lineTo(W - PAD_R, y); g.stroke();
            if (label) { g.fillStyle = '#9aa3b5'; g.font = '10px Outfit, sans-serif'; g.fillText(midiToName(m), 8, y); }
        }
        g.fillStyle = '#c2c8d6'; g.font = '10px Outfit, sans-serif';
        g.fillText(fmtDur(rt0), PAD_L, plotBot + 12);

        for (const pt of data) {
            if (!pt || pt.midi == null || pt.t < rt0 || pt.t >= rt1) continue;
            const x = PAD_L + ((pt.t - rt0) / ROW_SECS) * plotW;
            const m = Math.max(lo, Math.min(hi, pt.midi));
            g.globalAlpha = 0.4 + pt.clarity * 0.6;
            g.fillStyle = colorForMidi(Math.round(m));
            g.beginPath(); g.arc(x, yOf(m), 2 + pt.clarity * 2, 0, Math.PI * 2); g.fill();
        }
        g.globalAlpha = 1;
    }
}

// --- Painting edit controls (register / trim / eraser) -------------------
let eraserOn = false;

function syncEditControls() {
    els.regLo.value = editLo; els.regHi.value = editHi;
    els.regLoVal.textContent = midiToName(editLo);
    els.regHiVal.textContent = midiToName(editHi);
    const maxS = Math.max(1, Math.ceil(captureDur));
    els.trimStart.max = maxS; els.trimEnd.max = maxS;
    els.trimStart.value = Math.floor(trimStart);
    els.trimEnd.value = Math.ceil(trimEnd);
    els.trimStartVal.textContent = fmtDur(trimStart);
    els.trimEndVal.textContent = fmtDur(trimEnd);
}

function setEraser(on) {
    eraserOn = on;
    els.eraserBtn.setAttribute('aria-pressed', String(on));
    els.eraserHint.hidden = !on;
    els.paintingWrap.classList.toggle('erasing', on);
}

// Map canvas-internal coords → (time, pitch) using the last painting geometry.
function canvasToTM(cx, cy) {
    const L = paintLayout;
    if (!L) return null;
    let r = Math.floor((cy - L.HEAD) / (L.ROW_H + L.GAP));
    r = Math.max(0, Math.min(L.rows - 1, r));
    const top = L.HEAD + r * (L.ROW_H + L.GAP);
    const plotTop = top + 8, plotBot = top + L.ROW_H - 18;
    const t = L.tStart + r * L.ROW_SECS + ((cx - L.PAD_L) / L.plotW) * L.ROW_SECS;
    const midi = L.hi - ((cy - plotTop) / (plotBot - plotTop)) * Math.max(1, L.hi - L.lo);
    return { t, midi };
}

const clientToCanvas = (e) => {
    const rect = els.painting.getBoundingClientRect();
    return {
        cx: (e.clientX - rect.left) * (els.painting.width / rect.width),
        cy: (e.clientY - rect.top) * (els.painting.height / rect.height),
    };
};

// Re-derive beat-notes from the (seconds-based) rawNotes for the current tempo +
// quantize setting, render them on the Composer's staff, and refresh the readout.
function renderTranscription() {
    // No notes left (e.g. everything trimmed/erased) — clear, don't leave stale notes.
    if (!rawNotes.length) { composerNotes = []; els.transcribePanel.hidden = true; return; }
    const bpm = clampTempo(+els.tempo.value);
    const quant = els.quantizeToggle.checked;
    composerNotes = notesToBeats(rawNotes, bpm, { quantizeSub: quant ? 2 : 0 });

    const beats = composerNotes.reduce((m, n) => Math.max(m, n.start + n.durBeats), 0);
    const bars = Math.max(1, Math.ceil(beats / 4));
    els.score.innerHTML = renderScore(
        { bars, notes: composerNotes },
        { colored: true, showLetters: true, clef: 'treble', staffShift: 0, beatsPerBar: 4, timeSignature: '4/4', barsPerSystem: 4 },
    );
    els.transcribeSub.textContent = `${composerNotes.length} notes · ${bars} bar${bars === 1 ? '' : 's'} · ${bpm} BPM${quant ? ' · quantized' : ' · raw timing'}`;
    els.transcribePanel.hidden = false;
    els.sendStatus.textContent = '';
}

const clampTempo = (v) => Math.min(220, Math.max(40, v || 100));

// Close the loop: hand the captured melody to the main Composer (shared
// localStorage library, same origin). Targets the 88-key piano so nothing clips.
function sendToComposer() {
    if (!composerNotes.length) return;
    const LIB = 'composer.library.v1';
    let lib = [];
    try { lib = JSON.parse(localStorage.getItem(LIB)) || []; } catch (_) { lib = []; }
    const beats = composerNotes.reduce((m, n) => Math.max(m, n.start + n.durBeats), 0);
    const piece = {
        id: 'cl_' + Date.now().toString(36),
        title: 'Hummed melody · ' + new Date().toLocaleDateString(),
        composer: '',
        rangeId: 'piano-88', clef: 'treble', staffShift: 0,
        bars: Math.min(64, Math.max(4, Math.ceil(beats / 4))),
        timeSignature: '4/4', durationId: 'quarter', tempo: clampTempo(+els.tempo.value),
        showLetters: true, notes: composerNotes, savedAt: new Date().toISOString(),
    };
    lib.push(piece);
    try { localStorage.setItem(LIB, JSON.stringify(lib)); } catch (_) {}
    els.sendStatus.innerHTML = '✓ Sent! Open the Composer → it’s in <strong>My Songs</strong>.';
}

function setStatus(msg, cls) {
    els.status.innerHTML = msg;
    els.status.className = 'status' + (cls ? ' ' + cls : '');
}

els.listen.addEventListener('click', () => (listening ? stop() : start()));
els.savePainting.addEventListener('click', () => window.print());
els.tempo.addEventListener('input', () => { if (!els.transcribePanel.hidden) renderTranscription(); });
els.quantizeToggle.addEventListener('change', renderTranscription);
els.sendComposer.addEventListener('click', sendToComposer);

// Register band (keep lo < hi by at least 2 semitones).
els.regLo.addEventListener('input', () => {
    editLo = Math.min(+els.regLo.value, editHi - 2);
    els.regLo.value = editLo; els.regLoVal.textContent = midiToName(editLo);
    applyEdits();
});
els.regHi.addEventListener('input', () => {
    editHi = Math.max(+els.regHi.value, editLo + 2);
    els.regHi.value = editHi; els.regHiVal.textContent = midiToName(editHi);
    applyEdits();
});
// Trim window (keep start < end by at least 0.5s).
els.trimStart.addEventListener('input', () => {
    trimStart = Math.min(+els.trimStart.value, trimEnd - 0.5);
    els.trimStartVal.textContent = fmtDur(trimStart);
    applyEdits();
});
els.trimEnd.addEventListener('input', () => {
    trimEnd = Math.max(+els.trimEnd.value, trimStart + 0.5);
    els.trimEndVal.textContent = fmtDur(trimEnd);
    applyEdits();
});
// Commit one undo step per finished slider drag (on release), not per input tick.
[els.regLo, els.regHi, els.trimStart, els.trimEnd].forEach((sl) => sl.addEventListener('change', commitMove));

// Reset is itself one undoable move (clears register/trim/erasures to defaults).
els.resetEdits.addEventListener('click', () => {
    applyDefaultEdits();
    commitMove();
    setEraser(false);
    syncEditControls();
    applyEdits();
});
els.eraserBtn.addEventListener('click', () => setEraser(!eraserOn));
els.undoBtn.addEventListener('click', undo);
els.redoBtn.addEventListener('click', redo);

// Keyboard: ⌘Z / Ctrl+Z undo, ⇧⌘Z redo (when the painting is open, not typing).
document.addEventListener('keydown', (e) => {
    if (els.paintingPanel.hidden) return;
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
    }
});

// Eraser: drag a box on the painting → erase those moments + pitches.
let dragStart = null;
els.painting.addEventListener('pointerdown', (e) => {
    if (!eraserOn) return;
    e.preventDefault();
    try { els.painting.setPointerCapture(e.pointerId); } catch (_) { /* synthetic pointer */ }
    dragStart = e;
    drawEraseRect(e, e);
    els.eraseRect.hidden = false;
});
els.painting.addEventListener('pointermove', (e) => {
    if (dragStart) drawEraseRect(dragStart, e);
});
els.painting.addEventListener('pointerup', (e) => {
    if (!dragStart) return;
    els.eraseRect.hidden = true;
    const a = clientToCanvas(dragStart), b = clientToCanvas(e);
    const p1 = canvasToTM(a.cx, a.cy), p2 = canvasToTM(b.cx, b.cy);
    dragStart = null;
    if (!p1 || !p2) return;
    const box = {
        t0: Math.min(p1.t, p2.t), t1: Math.max(p1.t, p2.t),
        m0: Math.floor(Math.min(p1.midi, p2.midi)), m1: Math.ceil(Math.max(p1.midi, p2.midi)),
    };
    if (box.t1 - box.t0 > 0.04 || box.m1 - box.m0 >= 1) { erased.push(box); commitMove(); applyEdits(); }
});

function drawEraseRect(a, b) {
    const wrap = els.paintingWrap.getBoundingClientRect();
    const x1 = a.clientX - wrap.left, y1 = a.clientY - wrap.top;
    const x2 = b.clientX - wrap.left, y2 = b.clientY - wrap.top;
    els.eraseRect.style.left = Math.min(x1, x2) + 'px';
    els.eraseRect.style.top = Math.min(y1, y2) + 'px';
    els.eraseRect.style.width = Math.abs(x2 - x1) + 'px';
    els.eraseRect.style.height = Math.abs(y2 - y1) + 'px';
}

// Find my range → store the sing zone and show its band on the contour + painting.
function updateFindRangeLabel() {
    els.findRange.textContent = singRange
        ? `🎯 ${midiToName(singRange.lo)}–${midiToName(singRange.hi)}`
        : '🎯 Find my range';
}
els.findRange.addEventListener('click', () => openRangeModal((range) => {
    singRange = range;
    updateFindRangeLabel();
    drawContour();
    if (!els.paintingPanel.hidden) applyEdits();   // re-render the painting band
}));
if (singRange) updateFindRangeLabel();

// Draw the empty staff-grid once on load so the panel isn't blank.
drawContour();
