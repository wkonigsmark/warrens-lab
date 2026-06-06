// audio.js — Web Audio playback for the composer. Computes frequencies from the
// note name so adding bars never means hand-editing a frequency table. Lazy-inits
// the AudioContext on the first user gesture (browser requirement).
//
// Playback voices route through a master gain so Stop can silence notes that were
// already scheduled ahead of time. The metronome runs on its own steady scheduler
// (independent of playback) and goes straight to the destination.

import { freqOf } from './model.js';

let ctx = null;
const ac = () => (ctx ||= new (window.AudioContext || window.webkitAudioContext)());

let masterGain = null;
const master = () => {
    const c = ac();
    if (!masterGain) { masterGain = c.createGain(); masterGain.connect(c.destination); }
    return masterGain;
};

// One short tone. `dest` lets the caller route through the master (playback) or
// straight to the speakers (metronome / previews).
function tone(freq, start, dur, { type = 'triangle', gain = 0.22, dest } = {}) {
    const c = ac();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(gain, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g).connect(dest || c.destination);
    osc.start(start);
    osc.stop(start + dur + 0.05);
}

// Preview a single pitch when a note is placed — instant feedback is the hook.
export function playNote(note) {
    const c = ac();
    if (c.state === 'suspended') c.resume();
    tone(freqOf(note), c.currentTime, 0.5);
}

// Walk the whole score. `notes` are {start (beats from 0), pitch, durBeats}.
// Voices go through the master gain so silencePlayback() can cut them.
export function playScore(notes, tempo = 96) {
    const c = ac();
    if (c.state === 'suspended') c.resume();
    const m = master();
    m.gain.cancelScheduledValues(c.currentTime);
    m.gain.setValueAtTime(1, c.currentTime); // un-mute from any previous Stop
    const secPerBeat = 60 / tempo;
    const t0 = c.currentTime + 0.05;
    const schedule = notes.map((n) => {
        const at = t0 + n.start * secPerBeat;
        // Sound a touch shorter than the slot so repeated pitches re-articulate.
        tone(freqOf(n.pitch), at, Math.max(0.18, n.durBeats * secPerBeat * 0.9), { dest: m });
        return { note: n, offsetMs: (at - c.currentTime) * 1000 };
    });
    const totalBeats = notes.reduce((mx, n) => Math.max(mx, n.start + n.durBeats), 0);
    return { schedule, totalMs: totalBeats * secPerBeat * 1000, t0 };
}

// Immediately silence playback — mutes the master gain, which also kills any
// notes that were scheduled ahead but haven't sounded yet.
export function silencePlayback() {
    if (!masterGain) return;
    const c = ac();
    const now = c.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0, now + 0.03); // quick fade, no click
}

// --- Standalone metronome -------------------------------------------------
// A steady click using a lookahead scheduler so timing stays rock-solid even if
// the main thread is busy. Toggle on/off; tempo can change while it runs.
let metro = null;

function metroTick(downbeat, when) {
    tone(downbeat ? 1500 : 1100, when, 0.05, { type: 'square', gain: downbeat ? 0.22 : 0.14 });
}

export function startMetronome(tempo = 96, beatsPerBar = 4) {
    const c = ac();
    if (c.state === 'suspended') c.resume();
    stopMetronome();
    const m = { tempo, beatsPerBar, nextTime: c.currentTime + 0.1, beat: 0, timer: null };
    const pump = () => {
        const horizon = c.currentTime + 0.2;
        while (m.nextTime < horizon) {
            metroTick(m.beat % m.beatsPerBar === 0, m.nextTime);
            m.nextTime += 60 / m.tempo;
            m.beat += 1;
        }
    };
    pump();
    m.timer = setInterval(pump, 50);
    metro = m;
}

export function stopMetronome() {
    if (metro) { clearInterval(metro.timer); metro = null; }
}

export function setMetronomeTempo(tempo) {
    if (metro) metro.tempo = tempo;
}

export function isMetronomeOn() {
    return !!metro;
}

export function isPlaybackSupported() {
    return !!(window.AudioContext || window.webkitAudioContext);
}
