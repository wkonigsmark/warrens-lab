// app.js — Milestone 1: prove we can hear a hummed pitch in real time.
// Mic → AnalyserNode → detectPitch() each animation frame → a tuner readout and
// a scrolling piano-roll contour. No note segmentation yet (that's milestone 2);
// this is purely "can we reliably track the pitch of a voice in the browser?".

import {
    detectPitch, freqToMidi, midiToName, centsOff, isSharp, MIN_HZ, MAX_HZ,
} from './pitch.js';

const els = {
    listen: document.getElementById('listen'),
    status: document.getElementById('status'),
    noteName: document.getElementById('note-name'),
    freq: document.getElementById('freq'),
    tunerNeedle: document.getElementById('tuner-needle'),
    clarityFill: document.getElementById('clarity-fill'),
    canvas: document.getElementById('contour'),
};
const ctx2d = els.canvas.getContext('2d');

// Boomwhacker colours (same as the Composer) so a pitch reads the same hue here.
const NOTE_COLORS = { C: '#e53935', D: '#fb8c00', E: '#fdd835', F: '#43a047', G: '#00acc1', A: '#3949ab', B: '#8e24aa' };
const BLACK_KEY = '#3a3f4b';
const colorForMidi = (midi) => {
    if (isSharp(midi)) return BLACK_KEY;
    const letter = midiToName(midi)[0];
    return NOTE_COLORS[letter] || '#888';
};

// Contour vertical range (what pitches the canvas shows): C3 … C6.
const MIDI_LO = 48;   // C3
const MIDI_HI = 84;   // C6
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
    setStatus('Listening… hum or sing a tune! 🎵', 'live');
    history.fill(null);
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
    setStatus('Stopped. Click Start Listening to go again.', '');
    resetReadout();
}

function loop() {
    if (!listening) return;
    analyser.getFloatTimeDomainData(buf);
    const result = detectPitch(buf, audioCtx.sampleRate);

    if (result) {
        const midi = freqToMidi(result.freq);
        const cents = centsOff(result.freq, midi);
        updateReadout(midi, result.freq, cents, result.clarity);
        history.push({ midi: midi + cents / 100, clarity: result.clarity });
    } else {
        fadeReadout();
        history.push(null);
    }
    history.shift();

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

function setStatus(msg, cls) {
    els.status.innerHTML = msg;
    els.status.className = 'status' + (cls ? ' ' + cls : '');
}

els.listen.addEventListener('click', () => (listening ? stop() : start()));

// Draw the empty staff-grid once on load so the panel isn't blank.
drawContour();
