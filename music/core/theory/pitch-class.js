// pitch-class.js — integer pitch-class primitives.
//
// The whole recognition engine works in pitch classes: integers 0–11, where
// 0 = C, 1 = C#/Db, ... 11 = B. Octave and enharmonic spelling are display
// concerns handled at the very edge; everything internal is just integers.
// No DOM, no I/O — pure functions so this runs in the browser and under node.

export const PITCH_CLASS_COUNT = 12;

// Display spellings. Sharp vs flat is a presentation choice; the engine never
// branches on it. Index === pitch class.
export const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_NAMES  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Combined enharmonic labels, e.g. 'C#/Db'. The guitar tool uses these strings
// both for display AND as note-identity keys on the fretboard, so they live
// here as the one canonical chromatic naming any instrument can share.
export const CHROMATIC_NAMES = [
    'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B',
];

// Normalize any integer into 0–11 (handles negatives, e.g. transposing down).
export function mod12(n) {
    return ((n % PITCH_CLASS_COUNT) + PITCH_CLASS_COUNT) % PITCH_CLASS_COUNT;
}

// Shift a pitch class by a signed number of semitones.
export function transpose(pc, semitones) {
    return mod12(pc + semitones);
}

// Build a Set of pitch classes from a root and a list of semitone intervals.
// e.g. pcSet(0, [0, 4, 7]) -> Set {0, 4, 7}  (C major triad)
export function pcSet(root, intervals) {
    return new Set(intervals.map((i) => transpose(root, i)));
}

// Is every member of `sub` also in `sup`? (chord ⊆ scale check)
export function isSubset(sub, sup) {
    for (const pc of sub) {
        if (!sup.has(pc)) return false;
    }
    return true;
}

// Count of shared pitch classes between two sets.
export function intersectionSize(a, b) {
    let n = 0;
    for (const pc of a) {
        if (b.has(pc)) n++;
    }
    return n;
}

// Members of `a` that are NOT in `b` — the "outside notes". Returned as a
// sorted array for stable display/scoring.
export function difference(a, b) {
    const out = [];
    for (const pc of a) {
        if (!b.has(pc)) out.push(pc);
    }
    return out.sort((x, y) => x - y);
}

// Union of any number of sets into one new Set.
export function union(...sets) {
    const out = new Set();
    for (const s of sets) {
        for (const pc of s) out.add(pc);
    }
    return out;
}

// Format a pitch class for display. Prefer flats when asked (flat keys read
// more naturally with flats); otherwise sharps. Unicode-prettify the accidental.
export function formatPc(pc, { preferFlats = false } = {}) {
    const name = (preferFlats ? FLAT_NAMES : SHARP_NAMES)[mod12(pc)];
    return name.replace('#', '♯').replace('b', '♭');
}
