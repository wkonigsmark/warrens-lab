// app.js — the sing-along game. Loads a song, scrolls a pitch "highway" past a
// now-line, captures the singer's pitch from the mic, and scores how close they
// stay to each note (honest: exact octave, within a generous tolerance). The
// guided range-check (auto-transpose) and curated library come in later milestones.

import { detectPitch, freqToMidi } from './pitch.js';
import {
    DEFAULT_SONG, parseSong, transposeNotes, autoOctave, nameToMidi, midiToName,
    noteAtBeat, inTune, noteHit, hitScore, rangeOf, suggestOctaveShift,
} from './song.js';
import { getStoredRange, setStoredRange } from '../../_shared/range.js';
import { PATH_SONGS, getProgress, isUnlocked, recordResult, firstUnclearedIndex, PASS_PCT } from './library.js';

const els = {
    songTitle: document.getElementById('song-title'),
    transposeReadout: document.getElementById('transpose-readout'),
    octDown: document.getElementById('oct-down'), octUp: document.getElementById('oct-up'),
    semiDown: document.getElementById('semi-down'), semiUp: document.getElementById('semi-up'),
    autoFit: document.getElementById('auto-fit'),
    pasteToggle: document.getElementById('paste-toggle'),
    pasteArea: document.getElementById('paste-area'),
    pasteInput: document.getElementById('paste-input'),
    loadSong: document.getElementById('load-song'),
    pasteStatus: document.getElementById('paste-status'),
    fitReadout: document.getElementById('fit-readout'),
    findRange: document.getElementById('find-range'),
    rangeModal: document.getElementById('range-modal'),
    rangeOverlay: document.getElementById('range-overlay'),
    rangeClose: document.getElementById('range-close'),
    rangeInstr: document.getElementById('range-instr'),
    rangeLiveNote: document.getElementById('range-live-note'),
    rangeCaptured: document.getElementById('range-captured'),
    rangeSuggest: document.getElementById('range-suggest'),
    rangeCapture: document.getElementById('range-capture'),
    rangeConfirm: document.getElementById('range-confirm'),
    rangeRedo: document.getElementById('range-redo'),
    rangeStatus: document.getElementById('range-status'),
    play: document.getElementById('play'),
    hearStart: document.getElementById('hear-start'),
    canvas: document.getElementById('highway'),
    scoreHud: document.getElementById('score-hud'),
    countIn: document.getElementById('count-in'),
    results: document.getElementById('results'),
    resultStars: document.getElementById('result-stars'),
    resultPct: document.getElementById('result-pct'),
    resultMsg: document.getElementById('result-msg'),
    again: document.getElementById('again'),
    nextSong: document.getElementById('next-song'),
    songPath: document.getElementById('song-path'),
};
const g = els.canvas.getContext('2d');

// --- Tunables -------------------------------------------------------------
const COUNTIN_BEATS = 4;
const TOL = 1.5;          // in-tune tolerance in semitones (generous-but-honest)
const PX_PER_BEAT = 80;
const NOW_X = 140;
const PAD_Y = 28;

const NOTE_COLORS = { C: '#e53935', D: '#fb8c00', E: '#fdd835', F: '#43a047', G: '#00acc1', A: '#3949ab', B: '#8e24aa' };
const colorForMidi = (m) => { const n = midiToName(m); return n.includes('#') ? '#3a3f4b' : NOTE_COLORS[n[0]]; };
const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);
// The pitch the singer starts on = the earliest note. This is their anchor.
const startMidiOf = () => {
    if (!playNotes.length) return 60;
    let s = playNotes[0];
    for (const n of playNotes) if (n.start < s.start) s = n;
    return s.midi;
};

// --- State ----------------------------------------------------------------
let song = DEFAULT_SONG;
let transpose = 0;
let playNotes = [];      // [{ start, durBeats, midi, name, hitBeats }]
let loMidi = 48, hiMidi = 84, songEnd = 0;
let singerRange = getStoredRange();  // { lo, hi } MIDI — shared across the Studio tools
let currentPathIndex = -1;           // index into PATH_SONGS, or -1 for a custom/pasted song

let audioCtx = null, analyser = null, stream = null, buf = null;
let rafId = null, playStart = 0, prevBeat = -Infinity, playing = false, lastCountBeep = null;

// --- Song setup -----------------------------------------------------------
// Best transpose for this song: fit to the singer's measured range if we have it,
// else fall back to the generic G4-centred default.
function fitForSinger(notes) {
    return singerRange ? suggestOctaveShift(notes, singerRange.lo, singerRange.hi).shift : autoOctave(notes);
}

function loadSong(s, { autofit = true } = {}) {
    song = s;
    transpose = autofit ? fitForSinger(s.notes) : 0;
    rebuild();
    els.songTitle.textContent = s.title;
}

function rebuild() {
    playNotes = transposeNotes(song.notes, transpose).map((n) => ({
        start: n.start, durBeats: n.durBeats, midi: nameToMidi(n.pitch), name: n.pitch,
        lyric: n.lyric || '', hitBeats: 0,
    }));
    const midis = playNotes.map((n) => n.midi);
    loMidi = Math.min(...midis) - 3;
    hiMidi = Math.max(...midis) + 3;
    songEnd = Math.max(...playNotes.map((n) => n.start + n.durBeats));
    els.transposeReadout.textContent = transpose === 0 ? '0' : `${transpose > 0 ? '+' : ''}${transpose}`;
    els.hearStart.textContent = `🔊 Start note: ${midiToName(startMidiOf())}`;
    updateFitReadout();
    drawFrame(0, null, null, false);   // static preview
}

// Always-visible readout of where the song currently sits, plus the singer's
// measured range once known — so "where is my key" is never a mystery.
function updateFitReadout() {
    const lo = Math.min(...playNotes.map((n) => n.midi));
    const hi = Math.max(...playNotes.map((n) => n.midi));
    const sits = `sits at ${midiToName(lo)}–${midiToName(hi)}`;
    els.fitReadout.textContent = singerRange
        ? `${sits} · your range ${midiToName(singerRange.lo)}–${midiToName(singerRange.hi)}`
        : sits;
}

const yOf = (m) => PAD_Y + (hiMidi - m) / (hiMidi - loMidi) * (els.canvas.height - 2 * PAD_Y);

// --- Scoring (shared by the live loop and tests) --------------------------
function resetScores() { playNotes.forEach((n) => { n.hitBeats = 0; }); }

function scoreStep(songBeat, dBeat, liveMidi) {
    const active = noteAtBeat(playNotes, songBeat);
    let tuned = false;
    if (active && liveMidi != null && inTune(liveMidi, active.midi, TOL)) {
        active.hitBeats = Math.min(active.durBeats, active.hitBeats + Math.max(0, dBeat));
        tuned = true;
    }
    return { active, tuned };
}

// --- Play loop ------------------------------------------------------------
async function start() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch (err) {
        els.pasteStatus.textContent = `Microphone needed to sing: ${err.message}`;
        return;
    }
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // Created after an await → may start suspended; resume so the count-in sounds.
    await audioCtx.resume().catch(() => {});
    const src = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    buf = new Float32Array(analyser.fftSize);
    src.connect(analyser);

    resetScores();
    els.scoreHud.textContent = '0/0';
    els.results.hidden = true;
    playing = true;
    playStart = performance.now();
    prevBeat = -COUNTIN_BEATS;
    lastCountBeep = null;
    els.play.textContent = '■ Stop';
    els.play.classList.add('playing');
    loop();
}

function stop() {
    playing = false;
    if (rafId) cancelAnimationFrame(rafId);
    if (stream) stream.getTracks().forEach((t) => t.stop());
    if (audioCtx) audioCtx.close();
    audioCtx = analyser = stream = null;
    els.play.textContent = '▶ Play';
    els.play.classList.remove('playing');
    els.countIn.hidden = true;
}

function loop() {
    if (!playing) return;
    const bps = song.bpm / 60;
    const songBeat = ((performance.now() - playStart) / 1000) * bps - COUNTIN_BEATS;

    // Detect the singer's pitch EVERY frame — including the count-in — so they can
    // pre-tune to the starting note before the song begins.
    let liveMidi = null;
    if (analyser) {
        analyser.getFloatTimeDomainData(buf);
        const res = detectPitch(buf, audioCtx.sampleRate);
        if (res) liveMidi = freqToMidi(res.freq);
    }

    let active = null, tuned = false;
    if (songBeat < 0) {
        // count-in: show 4..1 and sing the STARTING PITCH each beat. The dot shows
        // live, turning green when you're already sitting on the start note.
        const n = Math.ceil(-songBeat);
        els.countIn.hidden = false;
        els.countIn.textContent = n;
        if (lastCountBeep !== n) { tone(audioCtx, midiToFreq(startMidiOf()), 0.5, 0.32); lastCountBeep = n; }
        tuned = liveMidi != null && inTune(liveMidi, startMidiOf(), TOL);
    } else {
        els.countIn.hidden = true;
        if (lastCountBeep !== 'go') { tone(audioCtx, midiToFreq(startMidiOf()), 0.35, 0.3); lastCountBeep = 'go'; }
        const dBeat = Math.max(0, songBeat - Math.max(0, prevBeat));
        ({ active, tuned } = scoreStep(songBeat, dBeat, liveMidi));
        els.scoreHud.textContent = runningLabel(songBeat);
    }
    prevBeat = songBeat;

    drawFrame(songBeat, liveMidi, active, tuned);

    if (songBeat >= songEnd + 0.6) { endGame(); return; }
    rafId = requestAnimationFrame(loop);
}

// Running "notes hit so far / notes finished" for the HUD.
function runningLabel(songBeat) {
    const done = playNotes.filter((n) => songBeat >= n.start + n.durBeats);
    const hits = done.filter(noteHit).length;
    return done.length ? `${hits}/${done.length}` : '0/0';
}

function endGame() {
    const { hits, total, pct: frac } = hitScore(playNotes);
    const pct = Math.round(frac * 100);
    let stars = 0;
    if (pct >= 85) stars = 3; else if (pct >= 65) stars = 2; else if (pct >= 40) stars = 1;
    const msgs = ['Nice try — sing it again and watch your score climb! 🌱', 'Good going! You found lots of the notes. 🎵', 'Great singing! Really close to the tune. 🌟', 'Amazing! You nailed the melody! 🏆'];
    els.resultStars.textContent = '★★★'.slice(0, stars) + '☆☆☆'.slice(0, 3 - stars);
    els.resultPct.textContent = `${pct}%`;

    let msg = `${hits} / ${total} notes hit — ${msgs[stars]}`;
    els.nextSong.hidden = true;

    // Path progression: clear the song (≥ PASS_PCT) and unlock the next.
    if (currentPathIndex >= 0) {
        const passed = pct >= PASS_PCT;
        recordResult(PATH_SONGS[currentPathIndex].id, pct);
        renderPath();
        const hasNext = currentPathIndex < PATH_SONGS.length - 1;
        if (passed) {
            msg = hasNext
                ? `🎉 Cleared with ${pct}%! You unlocked the next song!`
                : `🏆 ${pct}%! You finished the whole path — amazing!`;
            els.nextSong.hidden = !hasNext;
        } else {
            msg = `${pct}% — get to ${PASS_PCT}% to clear it. So close, try again! 💪`;
        }
    }
    els.resultMsg.textContent = msg;
    els.results.hidden = false;
    stop();
}

// --- Song path (curated ladder) -------------------------------------------
function renderPath() {
    const progress = getProgress();
    els.songPath.innerHTML = '';
    PATH_SONGS.forEach((s, i) => {
        const unlocked = isUnlocked(i, progress);
        const cleared = progress.cleared.includes(s.id);
        const best = progress.best[s.id];
        const stop = document.createElement('div');
        stop.className = 'path-stop' + (cleared ? ' cleared' : '') + (i === currentPathIndex ? ' current' : '') + (unlocked ? '' : ' locked');
        const icon = cleared ? '⭐' : (unlocked ? '🎤' : '🔒');
        const state = cleared ? `cleared · ${best}%` : (unlocked ? (best ? `best ${best}%` : 'tap to sing') : 'locked');
        stop.innerHTML = `<div class="stop-icon">${icon}</div><div class="stop-title">${s.title}</div>`
            + `<div class="stop-state${cleared ? ' pass' : ''}">${state}</div>`;
        if (unlocked) stop.addEventListener('click', () => loadPathSong(i));
        els.songPath.appendChild(stop);
    });
}

function loadPathSong(i) {
    if (playing) stop();
    currentPathIndex = i;
    loadSong(PATH_SONGS[i]);
    els.scoreHud.textContent = '—';
    els.results.hidden = true;
    renderPath();
}

// A warm, voice/organ-like reference tone (count-in pitch + start-note preview).
// A pure sine is the hardest thing to pitch-match — so this stacks a few harmonic
// partials, adds gentle vibrato + a lowpass, and a soft attack/long sustain, which
// gives the ear a clear, singable pitch instead of a thin digital beep.
function tone(ctx, freq, dur = 0.5, vol = 0.3) {
    if (!ctx) return;
    const now = ctx.currentTime;
    const attack = Math.min(0.04, dur * 0.25);
    const release = Math.min(0.18, dur * 0.45);
    const susEnd = Math.max(now + attack + 0.01, now + dur - release);

    const master = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = Math.min(8000, freq * 6 + 800);   // warm, not buzzy
    lp.connect(master); master.connect(ctx.destination);

    // soft attack → sustain → gentle release (so there's something to hold onto)
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(vol, now + attack);
    master.gain.setValueAtTime(vol, susEnd);
    master.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    // gentle vibrato (±~12 cents) → vocal feel, easier to sing toward
    const lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
    lfo.type = 'sine'; lfo.frequency.value = 5.2; lfoGain.gain.value = 12;
    lfo.connect(lfoGain);

    // harmonic partials (fundamental + overtones), normalized so they don't clip
    const partials = [[1, 0.5], [2, 0.26], [3, 0.14], [4, 0.07], [5, 0.03]];
    const oscs = [lfo];
    for (const [mult, gain] of partials) {
        const o = ctx.createOscillator(), pg = ctx.createGain();
        o.type = 'sine'; o.frequency.value = freq * mult;
        lfoGain.connect(o.detune);                  // cents → keeps harmonics aligned
        pg.gain.value = gain; o.connect(pg).connect(lp);
        oscs.push(o);
    }
    const stopAt = now + dur + 0.05;
    oscs.forEach((o) => { o.start(now); o.stop(stopAt); });
}

// Preview the starting pitch any time (spins up a short-lived AudioContext).
function previewStartNote() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const play = () => { tone(ctx, midiToFreq(startMidiOf()), 1.3, 0.32); setTimeout(() => ctx.close(), 1700); };
    ctx.resume().then(play).catch(play);   // resume first — contexts can start suspended
}

// --- Rendering ------------------------------------------------------------
function drawFrame(songBeat, liveMidi, active, tuned) {
    const W = els.canvas.width, H = els.canvas.height;
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#fbfcff'; g.fillRect(0, 0, W, H);

    // pitch lanes for each note name present + C labels
    g.textBaseline = 'middle';
    for (let m = Math.ceil(loMidi); m <= Math.floor(hiMidi); m++) {
        const y = yOf(m); const isC = m % 12 === 0;
        g.strokeStyle = isC ? '#e2e7f3' : '#f2f4fb'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
        if (isC) { g.fillStyle = '#aab2c4'; g.font = '10px Outfit, sans-serif'; g.fillText(midiToName(m), 6, y); }
    }

    // starting-pitch guide — a gold dashed line at the note you come in on
    const sm = startMidiOf(), sy = yOf(sm);
    g.strokeStyle = '#f5b301'; g.setLineDash([6, 4]); g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(0, sy); g.lineTo(W, sy); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#b88600'; g.font = 'bold 10px Outfit, sans-serif';
    g.fillText(`start · ${midiToName(sm)}`, W - 92, sy - 8);

    // upcoming + current notes (scroll: x = nowX + (start - songBeat)*pxPerBeat)
    const laneH = Math.max(10, (els.canvas.height - 2 * PAD_Y) / (hiMidi - loMidi) * 1.6);
    for (const n of playNotes) {
        const x = NOW_X + (n.start - songBeat) * PX_PER_BEAT;
        const w = n.durBeats * PX_PER_BEAT;
        if (x + w < 0 || x > W) continue;
        const y = yOf(n.midi) - laneH / 2;
        const col = colorForMidi(n.midi);
        g.globalAlpha = 0.85;
        roundRect(x, y, w, laneH, 6); g.fillStyle = col; g.fill();
        // fill proportion already sung in tune
        if (n.hitBeats > 0) {
            g.globalAlpha = 1; g.fillStyle = '#2e9e5b';
            roundRect(x, y, w * Math.min(1, n.hitBeats / n.durBeats), laneH, 6); g.fill();
        }
        g.globalAlpha = 1;
        if (n === active) { g.strokeStyle = '#1f2430'; g.lineWidth = 2; roundRect(x, y, w, laneH, 6); g.stroke(); }
        // lyric syllable above the bar (white halo so it reads over guide lines)
        if (n.lyric) {
            const lx = x + w / 2, ly = y - 7;
            g.font = `bold ${n === active ? 16 : 13}px Outfit, sans-serif`;
            g.textAlign = 'center'; g.textBaseline = 'alphabetic';
            g.lineWidth = 3; g.strokeStyle = '#fff'; g.strokeText(n.lyric, lx, ly);
            g.fillStyle = n === active ? '#ff8a3d' : '#1f2430'; g.fillText(n.lyric, lx, ly);
            g.textAlign = 'left';
        }
    }

    // now-line
    g.strokeStyle = '#ff8a3d'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(NOW_X, 0); g.lineTo(NOW_X, H); g.stroke();

    // live pitch dot
    if (liveMidi != null && liveMidi >= loMidi && liveMidi <= hiMidi) {
        g.fillStyle = tuned ? '#2e9e5b' : '#5b8cff';
        g.beginPath(); g.arc(NOW_X, yOf(liveMidi), tuned ? 11 : 8, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
    }
}
function roundRect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

// --- Controls -------------------------------------------------------------
const setTranspose = (delta) => { transpose += delta; rebuild(); };
els.octDown.addEventListener('click', () => setTranspose(-12));
els.octUp.addEventListener('click', () => setTranspose(12));
els.semiDown.addEventListener('click', () => setTranspose(-1));
els.semiUp.addEventListener('click', () => setTranspose(1));
els.autoFit.addEventListener('click', () => { transpose = fitForSinger(song.notes); rebuild(); });

// --- Guided range check ---------------------------------------------------
// Sing lowest + highest, then suggest a whole-octave shift to fit each song to
// the singer's range. Stored so future songs auto-fit to the same voice.
let rmCtx = null, rmAnalyser = null, rmStream = null, rmBuf = null, rmRaf = null;
let rmRecent = [], rangeStep = 'low', capLow = null, capHigh = null, suggestedShift = 0;

async function openRange() {
    els.rangeModal.hidden = false;
    setRangeStep('low');
    els.rangeStatus.textContent = 'Allow the microphone, then sing.';
    els.rangeStatus.classList.remove('error');
    try {
        rmStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch (e) {
        els.rangeStatus.textContent = `Microphone needed: ${e.message}`;
        els.rangeStatus.classList.add('error');
        return;
    }
    rmCtx = new (window.AudioContext || window.webkitAudioContext)();
    const src = rmCtx.createMediaStreamSource(rmStream);
    rmAnalyser = rmCtx.createAnalyser(); rmAnalyser.fftSize = 2048;
    rmBuf = new Float32Array(rmAnalyser.fftSize); src.connect(rmAnalyser);
    rmRecent = [];
    els.rangeStatus.textContent = 'Sing a note and hold it…';
    rmLoop();
}

function rmLoop() {
    if (els.rangeModal.hidden) return;
    if (rmAnalyser) {
        rmAnalyser.getFloatTimeDomainData(rmBuf);
        const res = detectPitch(rmBuf, rmCtx.sampleRate);
        if (res) {
            const midi = freqToMidi(res.freq);
            rmRecent.push(midi); if (rmRecent.length > 20) rmRecent.shift();
            els.rangeLiveNote.textContent = midiToName(midi);
        }
    }
    rmRaf = requestAnimationFrame(rmLoop);
}

function stopRangeMic() {
    if (rmRaf) cancelAnimationFrame(rmRaf);
    if (rmStream) rmStream.getTracks().forEach((t) => t.stop());
    if (rmCtx) rmCtx.close();
    rmCtx = rmAnalyser = rmStream = null;
}

function setRangeStep(step) {
    rangeStep = step;
    if (step === 'low') {
        els.rangeInstr.innerHTML = 'Sing your <strong>lowest</strong> comfortable note and hold it…';
        els.rangeCapture.textContent = 'Set my lowest ✓'; els.rangeCapture.hidden = false;
        els.rangeConfirm.hidden = true; els.rangeRedo.hidden = true; els.rangeSuggest.hidden = true;
        els.rangeCaptured.textContent = ''; els.rangeLiveNote.textContent = '—';
        capLow = capHigh = null; rmRecent = [];
    } else if (step === 'high') {
        els.rangeInstr.innerHTML = 'Great! Now sing your <strong>highest</strong> comfortable note…';
        els.rangeCapture.textContent = 'Set my highest ✓';
        rmRecent = []; els.rangeLiveNote.textContent = '—';
    } else if (step === 'result') {
        els.rangeInstr.innerHTML = 'Here’s a comfy fit for your voice 🎶';
        els.rangeLiveNote.textContent = '—';
        els.rangeCapture.hidden = true; els.rangeConfirm.hidden = false; els.rangeRedo.hidden = false;
        els.rangeSuggest.hidden = false;
    }
}

// Record one captured note (median of recent mic readings). Pure-ish so it's testable.
function captureNote(midi) {
    if (midi == null) { els.rangeStatus.textContent = 'Hmm, I didn’t catch that — sing a little louder.'; return; }
    els.rangeStatus.textContent = '';
    if (rangeStep === 'low') {
        capLow = midi;
        els.rangeCaptured.textContent = `Lowest: ${midiToName(midi)}`;
        setRangeStep('high');
    } else if (rangeStep === 'high') {
        capHigh = midi;
        if (capHigh < capLow) { const t = capLow; capLow = capHigh; capHigh = t; } // swap if reversed
        els.rangeCaptured.textContent = `Your range: ${midiToName(capLow)} – ${midiToName(capHigh)}`;
        const { shift, fits } = suggestOctaveShift(song.notes, capLow, capHigh);
        suggestedShift = shift;
        const sr = rangeOf(song.notes);
        const fLo = sr.lo + shift, fHi = sr.hi + shift;
        const oct = Math.abs(shift) / 12;
        const dir = shift === 0 ? 'right where it is' : `${shift > 0 ? 'up' : 'down'} ${oct} octave${oct > 1 ? 's' : ''}`;
        els.rangeSuggest.innerHTML =
            `We’ll put <strong>${song.title}</strong> ${dir} so it sits at <strong>${midiToName(fLo)}–${midiToName(fHi)}</strong>`
            + (fits ? '.' : ' — a little wide for your range, but as close as octaves allow.');
        setRangeStep('result');
    }
}

const medianMidi = () => {
    const a = rmRecent.slice().sort((x, y) => x - y);
    return a.length ? a[Math.floor(a.length / 2)] : null;
};

function confirmRange() {
    singerRange = { lo: capLow, hi: capHigh };
    setStoredRange(singerRange);   // share it with Composer + Composer-Live
    transpose = suggestedShift;
    rebuild();
    closeRange();
}
function closeRange() { stopRangeMic(); els.rangeModal.hidden = true; }

els.findRange.addEventListener('click', openRange);
els.rangeClose.addEventListener('click', closeRange);
els.rangeOverlay.addEventListener('click', closeRange);
els.rangeCapture.addEventListener('click', () => captureNote(medianMidi()));
els.rangeConfirm.addEventListener('click', confirmRange);
els.rangeRedo.addEventListener('click', () => { setRangeStep('low'); els.rangeStatus.textContent = 'Sing a note and hold it…'; });

els.pasteToggle.addEventListener('click', () => { els.pasteArea.hidden = !els.pasteArea.hidden; });
els.loadSong.addEventListener('click', () => {
    const parsed = parseSong(els.pasteInput.value, 'Pasted song');
    if (!parsed) { els.pasteStatus.textContent = '❌ Could not read that JSON (HookTheory or Composer format).'; return; }
    els.pasteStatus.textContent = `✓ Loaded "${parsed.title}" — ${parsed.notes.length} notes.`;
    els.pasteArea.hidden = true;
    currentPathIndex = -1;     // a custom song isn't part of the path
    loadSong(parsed);
    renderPath();
});

els.play.addEventListener('click', () => (playing ? stop() : start()));
els.hearStart.addEventListener('click', previewStartNote);
els.again.addEventListener('click', () => { els.results.hidden = true; start(); });
els.nextSong.addEventListener('click', () => {
    if (currentPathIndex >= 0 && currentPathIndex < PATH_SONGS.length - 1) loadPathSong(currentPathIndex + 1);
});

// A melody handed over from Composer ("Practice in Sing-Along") lands in shared
// localStorage; pick it up once, then fall back to the default song.
function loadIncomingOrDefault() {
    try {
        const raw = localStorage.getItem('studio.singalong.incoming.v1');
        if (raw) {
            localStorage.removeItem('studio.singalong.incoming.v1');
            const s = JSON.parse(raw);
            if (s && Array.isArray(s.notes) && s.notes.length) {
                currentPathIndex = -1;
                loadSong({ title: s.title || 'My melody', bpm: s.bpm || 96, notes: s.notes });
                els.pasteStatus.textContent = `✓ Loaded "${s.title || 'My melody'}" from Composer.`;
                return;
            }
        }
    } catch (_) { /* ignore */ }
    // No handoff → start the student where they left off on the path.
    loadPathSong(firstUnclearedIndex());
}

// init
loadIncomingOrDefault();
renderPath();
