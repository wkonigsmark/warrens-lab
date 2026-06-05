// audio.js — Web Audio playback for the composer. Extends the music-school
// idea (a tiny synth) to the full register by computing frequencies from the
// note name, so adding bars never means hand-editing a frequency table.
// Lazy-inits the AudioContext on the first user gesture (browser requirement).

import { freqOf } from './model.js';

let ctx = null;
const ac = () => (ctx ||= new (window.AudioContext || window.webkitAudioContext)());

// One soft mallet-ish tone. Triangle wave + quick attack and gentle decay
// reads as a xylophone/bell to young ears without a sample library.
function tone(freq, start, dur, { gain = 0.22 } = {}) {
    const c = ac();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(gain, start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g).connect(c.destination);
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
// Returns the total duration (seconds) and the wall-clock start times so the
// UI can sweep a playhead in sync. `opts.metronome` adds a click on every beat
// (a firm tick on beat 1 of each bar, softer elsewhere) — practice scaffolding.
export function playScore(notes, tempo = 96, opts = {}) {
    const c = ac();
    if (c.state === 'suspended') c.resume();
    const secPerBeat = 60 / tempo;
    const t0 = c.currentTime + 0.05;
    const schedule = notes.map((n) => {
        const at = t0 + n.start * secPerBeat;
        // Sound a touch shorter than the slot so repeated pitches re-articulate.
        tone(freqOf(n.pitch), at, Math.max(0.18, n.durBeats * secPerBeat * 0.9));
        return { note: n, offsetMs: (at - c.currentTime) * 1000 };
    });
    const totalBeats = notes.reduce((m, n) => Math.max(m, n.start + n.durBeats), 0);
    if (opts.metronome) {
        const beatsPerBar = opts.beatsPerBar || 4;
        for (let b = 0; b < totalBeats; b++) {
            const downbeat = b % beatsPerBar === 0;
            tone(downbeat ? 1320 : 990, t0 + b * secPerBeat, 0.06,
                { type: 'square', gain: downbeat ? 0.16 : 0.1 });
        }
    }
    return { schedule, totalMs: totalBeats * secPerBeat * 1000, t0 };
}

// A standalone metronome count-in / steady click for a given number of beats.
export function playMetronome(beats, tempo = 96, beatsPerBar = 4) {
    const c = ac();
    if (c.state === 'suspended') c.resume();
    const secPerBeat = 60 / tempo;
    const t0 = c.currentTime + 0.05;
    for (let b = 0; b < beats; b++) {
        const downbeat = b % beatsPerBar === 0;
        tone(downbeat ? 1320 : 990, t0 + b * secPerBeat, 0.06,
            { type: 'square', gain: downbeat ? 0.16 : 0.1 });
    }
    return { totalMs: beats * secPerBeat * 1000 };
}

export function isPlaybackSupported() {
    return !!(window.AudioContext || window.webkitAudioContext);
}
