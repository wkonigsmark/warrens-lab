// audio.js — tiny Web Audio synth for note playback and reward sounds.
// Instant audio feedback is the whole magic for young kids: they'll answer
// just to hear the note. Lazy-inits the AudioContext on first user gesture.

const FREQ = { // C4 .. F5, by note name
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0,
    A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
};

let ctx = null;
const ac = () => (ctx ||= new (window.AudioContext || window.webkitAudioContext)());

function tone(freq, start, dur, { type = 'triangle', gain = 0.25 } = {}) {
    const c = ac();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(gain, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g).connect(c.destination);
    osc.start(start);
    osc.stop(start + dur + 0.05);
}

export function playNote(name) {
    const f = FREQ[name] || FREQ[`${name}4`] || FREQ.C4;
    tone(f, ac().currentTime, 0.7);
}

export function playSequence(names, step = 0.6) {
    const t0 = ac().currentTime;
    names.forEach((n, i) => tone(FREQ[n] || FREQ.C4, t0 + i * step, 0.55));
}

// Metronome-style taps for "how many beats?" — half-beats become quick ticks.
export function playTaps(beats) {
    const c = ac();
    const t0 = c.currentTime;
    const n = Math.max(1, Math.round(beats));
    for (let i = 0; i < n; i++) tone(660, t0 + i * 0.42, 0.12, { type: 'square', gain: 0.18 });
}

export function playCorrect() {
    const t0 = ac().currentTime;
    [523.25, 659.25, 783.99].forEach((f, i) => tone(f, t0 + i * 0.11, 0.3, { gain: 0.22 }));
}

export function playWrong() {
    tone(196, ac().currentTime, 0.3, { type: 'sawtooth', gain: 0.15 });
}
