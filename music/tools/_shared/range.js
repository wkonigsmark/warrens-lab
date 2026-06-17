// range.js (shared) — the "Find my range" guided modal, used by all Composer
// Studio tools. Sing your lowest + highest comfortable note; it stores your range
// in shared localStorage (measure once, known everywhere) and calls back so the
// tool can draw its "sing zone". Self-contained: injects its own DOM + CSS and
// manages its own mic, so a tool just imports openRangeModal / getStoredRange.

import { detectPitch, freqToMidi, midiToName } from './pitch.js';

const KEY = 'studio.singerRange.v1';

export function getStoredRange() {
    try {
        const r = JSON.parse(localStorage.getItem(KEY));
        return (r && typeof r.lo === 'number' && typeof r.hi === 'number') ? r : null;
    } catch (_) { return null; }
}
export function setStoredRange(range) {
    try { localStorage.setItem(KEY, JSON.stringify(range)); } catch (_) { /* ignore */ }
}

const CSS = `
.sr-modal { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 2000; font-family: 'Outfit', system-ui, sans-serif; }
.sr-modal[hidden] { display: none; }
.sr-overlay { position: absolute; inset: 0; background: rgba(31,36,48,0.45); }
.sr-card { position: relative; background: #fff; border-radius: 18px; padding: 28px; width: 90%; max-width: 440px; box-shadow: 0 12px 40px rgba(0,0,0,0.22); text-align: center; }
.sr-close { position: absolute; top: 14px; right: 16px; border: none; background: none; font-size: 20px; color: #999; cursor: pointer; }
.sr-card h2 { margin: 0 0 6px; font-size: 22px; font-weight: 800; color: #1f2430; }
.sr-instr { margin: 0 0 18px; color: #6b7280; font-size: 15px; }
.sr-live { display: flex; flex-direction: column; align-items: center; gap: 2px; margin-bottom: 14px; }
.sr-live-label { font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; color: #6b7280; }
.sr-live-note { font-size: 54px; font-weight: 800; color: #5b8cff; line-height: 1; }
.sr-captured { margin: 0 0 12px; font-size: 14px; color: #1f2430; min-height: 20px; }
.sr-result { margin: 6px 0 16px; padding: 14px; background: #f0f7f0; border: 1px solid #cdebd6; border-radius: 12px; font-size: 16px; color: #1f2430; }
.sr-result strong { color: #2e9e5b; }
.sr-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.sr-btn { font: inherit; font-weight: 700; border: 1px solid #e3e7f1; background: #fff; color: #1f2430; padding: 12px 20px; border-radius: 12px; cursor: pointer; }
.sr-btn.primary { background: #ff8a3d; color: #fff; border-color: #ff8a3d; }
.sr-btn[hidden] { display: none; }
.sr-status { margin: 14px 0 0; font-size: 13px; color: #6b7280; min-height: 18px; }
.sr-status.error { color: #c0392b; }
`;

let built = false, el = {}, onDoneCb = null;
let rmCtx = null, rmAnalyser = null, rmStream = null, rmBuf = null, rmRaf = null;
let rmRecent = [], step = 'low', capLow = null, capHigh = null;

function ensureBuilt() {
    if (built) return;
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const modal = document.createElement('div');
    modal.className = 'sr-modal';
    modal.hidden = true;
    modal.innerHTML =
        `<div class="sr-overlay"></div>`
        + `<div class="sr-card">`
        + `<button class="sr-close" aria-label="Close">✕</button>`
        + `<h2>Find your range 🎤</h2>`
        + `<p class="sr-instr"></p>`
        + `<div class="sr-live"><span class="sr-live-label">hearing</span><span class="sr-live-note">—</span></div>`
        + `<p class="sr-captured"></p>`
        + `<div class="sr-result" hidden></div>`
        + `<div class="sr-actions">`
        + `<button class="sr-btn primary sr-capture"></button>`
        + `<button class="sr-btn primary sr-confirm" hidden>Use this range ✓</button>`
        + `<button class="sr-btn sr-redo" hidden>↺ Start over</button>`
        + `</div>`
        + `<p class="sr-status"></p>`
        + `</div>`;
    document.body.appendChild(modal);

    el = {
        modal, instr: modal.querySelector('.sr-instr'), live: modal.querySelector('.sr-live-note'),
        captured: modal.querySelector('.sr-captured'), result: modal.querySelector('.sr-result'),
        capture: modal.querySelector('.sr-capture'), confirm: modal.querySelector('.sr-confirm'),
        redo: modal.querySelector('.sr-redo'), status: modal.querySelector('.sr-status'),
        close: modal.querySelector('.sr-close'), overlay: modal.querySelector('.sr-overlay'),
    };
    el.close.addEventListener('click', closeModal);
    el.overlay.addEventListener('click', closeModal);
    el.capture.addEventListener('click', () => captureNote(medianMidi()));
    el.confirm.addEventListener('click', confirmRange);
    el.redo.addEventListener('click', () => { setStep('low'); el.status.textContent = 'Sing a note and hold it…'; });
    built = true;
}

// Open the modal. onDone({lo, hi}) is called after the user confirms.
export async function openRangeModal(onDone) {
    ensureBuilt();
    onDoneCb = onDone || null;
    el.modal.hidden = false;
    setStep('low');
    el.status.textContent = 'Allow the microphone, then sing.';
    el.status.classList.remove('error');
    try {
        rmStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch (e) {
        el.status.textContent = `Microphone needed: ${e.message}`;
        el.status.classList.add('error');
        return;
    }
    rmCtx = new (window.AudioContext || window.webkitAudioContext)();
    await rmCtx.resume().catch(() => {});
    const src = rmCtx.createMediaStreamSource(rmStream);
    rmAnalyser = rmCtx.createAnalyser(); rmAnalyser.fftSize = 2048;
    rmBuf = new Float32Array(rmAnalyser.fftSize); src.connect(rmAnalyser);
    rmRecent = [];
    el.status.textContent = 'Sing a note and hold it…';
    rmLoop();
}

function rmLoop() {
    if (el.modal.hidden) return;
    if (rmAnalyser) {
        rmAnalyser.getFloatTimeDomainData(rmBuf);
        const res = detectPitch(rmBuf, rmCtx.sampleRate);
        if (res) {
            const midi = freqToMidi(res.freq);
            rmRecent.push(midi); if (rmRecent.length > 20) rmRecent.shift();
            el.live.textContent = midiToName(midi);
        }
    }
    rmRaf = requestAnimationFrame(rmLoop);
}

function stopMic() {
    if (rmRaf) cancelAnimationFrame(rmRaf);
    if (rmStream) rmStream.getTracks().forEach((t) => t.stop());
    if (rmCtx) rmCtx.close();
    rmCtx = rmAnalyser = rmStream = null;
}

function setStep(s) {
    step = s;
    if (s === 'low') {
        el.instr.innerHTML = 'Sing your <strong>lowest</strong> comfortable note and hold it…';
        el.capture.textContent = 'Set my lowest ✓'; el.capture.hidden = false;
        el.confirm.hidden = true; el.redo.hidden = true; el.result.hidden = true;
        el.captured.textContent = ''; el.live.textContent = '—';
        capLow = capHigh = null; rmRecent = [];
    } else if (s === 'high') {
        el.instr.innerHTML = 'Great! Now sing your <strong>highest</strong> comfortable note…';
        el.capture.textContent = 'Set my highest ✓';
        rmRecent = []; el.live.textContent = '—';
    } else if (s === 'result') {
        el.instr.innerHTML = 'Here’s your comfy range 🎶';
        el.live.textContent = '—';
        el.capture.hidden = true; el.confirm.hidden = false; el.redo.hidden = false; el.result.hidden = false;
    }
}

// Record a captured note (the median of recent mic readings).
function captureNote(midi) {
    if (midi == null) { el.status.textContent = 'Hmm, I didn’t catch that — sing a little louder.'; return; }
    el.status.textContent = '';
    if (step === 'low') {
        capLow = midi;
        el.captured.textContent = `Lowest: ${midiToName(midi)}`;
        setStep('high');
    } else if (step === 'high') {
        capHigh = midi;
        if (capHigh < capLow) { const t = capLow; capLow = capHigh; capHigh = t; }
        el.captured.textContent = `Your range: ${midiToName(capLow)} – ${midiToName(capHigh)}`;
        el.result.innerHTML = `<strong>${midiToName(capLow)} – ${midiToName(capHigh)}</strong><br>We’ll mark this as your sing zone everywhere.`;
        setStep('result');
    }
}

const medianMidi = () => {
    const a = rmRecent.slice().sort((x, y) => x - y);
    return a.length ? a[Math.floor(a.length / 2)] : null;
};

function confirmRange() {
    const range = { lo: capLow, hi: capHigh };
    setStoredRange(range);
    closeModal();
    if (onDoneCb) onDoneCb(range);
    // let any open tool know (so a second tab/tool could refresh)
    window.dispatchEvent(new CustomEvent('singerrange', { detail: range }));
}
function closeModal() { stopMic(); if (el.modal) el.modal.hidden = true; }
