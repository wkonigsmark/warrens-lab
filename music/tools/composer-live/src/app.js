// app.js — Milestone 1: prove we can hear a hummed pitch in real time.
// Mic → AnalyserNode → detectPitch() each animation frame → a tuner readout and
// a scrolling piano-roll contour. No note segmentation yet (that's milestone 2);
// this is purely "can we reliably track the pitch of a voice in the browser?".

import {
    detectPitch, freqToMidi, midiToName, centsOff, isSharp, MIN_HZ, MAX_HZ,
} from './pitch.js';
import { segmentNotes, notesToBeats } from './transcribe.js';
import { renderScore } from '../../composer/src/notation.js';

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
};
const ctx2d = els.canvas.getContext('2d');

// Quick frame loudness (RMS) — feeds the transcriber's onset detection.
function frameRms(b) {
    let s = 0;
    for (let i = 0; i < b.length; i++) s += b[i] * b[i];
    return Math.sqrt(s / b.length);
}

// Transcription state: rawNotes (seconds) are computed once per take; the
// beat-mapped composerNotes are re-derived whenever tempo/quantize change.
let rawNotes = [];
let composerNotes = [];

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
        showPainting();
        showTranscription();
        setStatus('Done! 🎨 Below: your melody painting, and the notes we heard.', '');
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

function showPainting() {
    const duration = session.length ? session[session.length - 1].t : 0;
    const voiced = session.filter((p) => p && p.midi != null).length;
    const when = new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    els.paintingSub.textContent = `${fmtDur(duration)} captured · ${voiced} pitched moments`;
    els.printMeta.textContent = `${when} · ${fmtDur(duration)}`;
    els.paintingPanel.hidden = false;
    renderPainting(session, duration);
    els.paintingPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Render the whole take as a stack of time-rows (like reading lines) — time
// across, pitch up/down, coloured by note. Wrapping keeps a long melody printable.
function renderPainting(data, duration) {
    const ROW_SECS = 20;                 // seconds of melody per row
    const ROW_H = 150, HEAD = 8, GAP = 10;
    const PAD_L = 46, PAD_R = 16, W = 1100;
    const rows = Math.max(1, Math.ceil(duration / ROW_SECS));

    const cv = els.painting;
    cv.width = W;
    cv.height = HEAD + rows * (ROW_H + GAP);
    const g = cv.getContext('2d');
    g.fillStyle = '#fff';
    g.fillRect(0, 0, cv.width, cv.height);
    g.textBaseline = 'middle';

    const plotW = W - PAD_L - PAD_R;
    for (let r = 0; r < rows; r++) {
        const top = HEAD + r * (ROW_H + GAP);
        const plotTop = top + 8, plotBot = top + ROW_H - 18;
        const t0 = r * ROW_SECS, t1 = t0 + ROW_SECS;
        const yOf = (m) => plotTop + (MIDI_HI - m) / (MIDI_HI - MIDI_LO) * (plotBot - plotTop);

        // guide lines + C labels
        for (let m = MIDI_LO; m <= MIDI_HI; m++) {
            const y = yOf(m), isC = m % 12 === 0;
            g.strokeStyle = isC ? '#dfe4f1' : '#f4f6fb';
            g.lineWidth = 1;
            g.beginPath(); g.moveTo(PAD_L, y); g.lineTo(W - PAD_R, y); g.stroke();
            if (isC) { g.fillStyle = '#9aa3b5'; g.font = '10px Outfit, sans-serif'; g.fillText(midiToName(m), 8, y); }
        }
        // row time label (where this line starts)
        g.fillStyle = '#c2c8d6'; g.font = '10px Outfit, sans-serif';
        g.fillText(fmtDur(t0), PAD_L, plotBot + 12);

        // the coloured contour for this time slice
        for (const pt of data) {
            if (!pt || pt.midi == null || pt.t < t0 || pt.t >= t1) continue;
            const x = PAD_L + ((pt.t - t0) / ROW_SECS) * plotW;
            const m = Math.max(MIDI_LO, Math.min(MIDI_HI, pt.midi));
            g.globalAlpha = 0.4 + pt.clarity * 0.6;
            g.fillStyle = colorForMidi(Math.round(m));
            g.beginPath(); g.arc(x, yOf(m), 2 + pt.clarity * 2, 0, Math.PI * 2); g.fill();
        }
        g.globalAlpha = 1;
    }
}

// --- Transcription (notes on a staff) ------------------------------------
function showTranscription() {
    rawNotes = segmentNotes(session, {});
    renderTranscription();
}

// Re-derive beat-notes from the (seconds-based) rawNotes for the current tempo +
// quantize setting, render them on the Composer's staff, and refresh the readout.
function renderTranscription() {
    if (!rawNotes.length) { els.transcribePanel.hidden = true; return; }
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

// Draw the empty staff-grid once on load so the panel isn't blank.
drawContour();
