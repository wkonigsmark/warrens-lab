// model.js — the single source of truth for the composer.
// Range, durations, time signature, and the note↔pitch math all live here so
// that expanding the instrument later (more bars, sharps/flats, a wider
// register) is a one-place edit. No DOM, no audio — pure data.

// --- The instrument's register -------------------------------------------
// Each preset is just a low/high natural-note bound. Default is a standard
// 1.5-octave diatonic xylophone (C4..A5, 13 bars). To go higher/lower or
// give the tool a bigger instrument later, add a preset or change the bounds —
// everything downstream (grid rows, staff, audio) derives from buildScale().
export const RANGES = {
    'c4-a5': { label: 'Xylophone · C4–A5 (1.5 octave)', low: 'C4', high: 'A5' },
    'c4-g5': { label: 'Xylophone · C4–G5', low: 'C4', high: 'G5' },
    'c5-a6': { label: 'Glockenspiel · C5–A6', low: 'C5', high: 'A6' },
    'c4-c6': { label: 'Wide · C4–C6 (2 octaves)', low: 'C4', high: 'C6' },
};
export const DEFAULT_RANGE = 'c4-a5';

// Naturals only for now. FUTURE HOOK: a key/accidentals layer would swap
// specific letters (F→F#, B→Bb) by inserting them into this letter cycle.
export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Boomwhacker colour standard — the same map music-school uses, so a note is
// the same colour across the whole domain. Keyed by letter (octave-agnostic).
export const NOTE_COLORS = {
    C: '#e53935', D: '#fb8c00', E: '#fdd835', F: '#43a047',
    G: '#00acc1', A: '#3949ab', B: '#8e24aa',
};

// --- Note ↔ number maths --------------------------------------------------
// Semitone offset of each natural within its octave (C = 0).
const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
// Diatonic index of each natural (C = 0) — used for staff vertical position,
// where every letter is one "step" regardless of the semitone gap.
const DIA = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };

export const letterOf = (note) => note[0];
export const octaveOf = (note) => parseInt(note.slice(1), 10);

// MIDI number: C4 = 60 (middle C).
export function noteToMidi(note) {
    return (octaveOf(note) + 1) * 12 + SEMI[letterOf(note)];
}
// Equal-tempered frequency from MIDI. A4 (69) = 440 Hz.
export const midiToFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
export const freqOf = (note) => midiToFreq(noteToMidi(note));

// Absolute diatonic step (C4 = 0, D4 = 1 ... C5 = 7). Lets us order naturals
// and place them on a staff where each step is half a line-gap.
export function diatonicStep(note) {
    return octaveOf(note) * 7 + DIA[letterOf(note)];
}

// Build the ordered list of natural notes from low..high (inclusive).
export function buildScale(low, high) {
    const lo = diatonicStep(low);
    const hi = diatonicStep(high);
    const out = [];
    for (let s = lo; s <= hi; s++) {
        const letter = LETTERS[((s % 7) + 7) % 7];
        const octave = Math.floor(s / 7);
        out.push(`${letter}${octave}`);
    }
    return out;
}

// --- Rhythm ---------------------------------------------------------------
export const BEATS_PER_BAR = 4; // 4/4 — the natural fit for whole/half/quarter.

export const DURATIONS = [
    { id: 'quarter', beats: 1, label: 'Quarter', glyph: '♩' },
    { id: 'half',    beats: 2, label: 'Half',    glyph: '♩ –' },
    { id: 'whole',   beats: 4, label: 'Whole',   glyph: '○' },
];
export const durationById = (id) => DURATIONS.find((d) => d.id === id);

export const BAR_OPTIONS = [4, 8, 12];

// Shared horizontal scale (px per beat). The grid and the staff both use it so
// a column on the grid lines up under its note on the staff.
export const BEAT_W = 40;
