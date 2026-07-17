// voicings.js — movable guitar chord shapes and a chooser that places a chord at
// a comfortable neck position. Shapes are expressed as fret OFFSETS from the root
// fret on a named "root string", so one shape covers all 12 roots by sliding.
// Strings are indexed 0..5 low→high: E A D G B e. Verified by hand (see comments).

// open-string pitch classes, low→high
export const OPEN_PC = [4, 9, 2, 7, 11, 4];   // E A D G B e

// Each shape: { rootString, offs: [[stringIdx, fretOffsetFromRoot], …] }.
// Muted strings are simply absent.
const SHAPES = {
    // root on 5th string (A) — e.g. C at fret 3
    maj7_A: { rootString: 1, offs: [[1, 0], [2, 2], [3, 1], [4, 2], [5, 0]] }, // x3 5 4 5 3
    min7_A: { rootString: 1, offs: [[1, 0], [2, 2], [3, 0], [4, 1], [5, 0]] }, // x3 5 3 4 3
    dom7_A: { rootString: 1, offs: [[1, 0], [2, 2], [3, 0], [4, 2], [5, 0]] }, // x3 5 3 5 3
    maj_A:  { rootString: 1, offs: [[1, 0], [2, 2], [3, 2], [4, 2], [5, 0]] }, // x3 5 5 5 3
    min_A:  { rootString: 1, offs: [[1, 0], [2, 2], [3, 2], [4, 1], [5, 0]] }, // x3 5 5 4 3
    m7b5_A: { rootString: 1, offs: [[1, 0], [2, 1], [3, 0], [4, 1]] },         // x3 4 3 4 x
    // root on 6th string (E) — e.g. G at fret 3
    maj7_E: { rootString: 0, offs: [[0, 0], [1, 2], [2, 1], [3, 1], [4, 0]] }, // 3 5 4 4 3 x
    min7_E: { rootString: 0, offs: [[0, 0], [1, 2], [2, 0], [3, 0], [4, 0], [5, 0]] }, // 3 5 3 3 3 3
    dom7_E: { rootString: 0, offs: [[0, 0], [1, 2], [2, 0], [3, 1], [4, 0], [5, 0]] }, // 3 5 3 4 3 3
    maj_E:  { rootString: 0, offs: [[0, 0], [1, 2], [2, 2], [3, 1], [4, 0], [5, 0]] }, // 3 5 5 4 3 3
    min_E:  { rootString: 0, offs: [[0, 0], [1, 2], [2, 2], [3, 0], [4, 0], [5, 0]] }, // 3 5 5 3 3 3
    // diminished 7 — root on 4th string (D); symmetric so any position works
    dim7_D: { rootString: 2, offs: [[2, 0], [3, 1], [4, 0], [5, 1]] },          // x x r r+1 r r+1
    // augmented — root on 5th string
    aug_A:  { rootString: 1, offs: [[1, 0], [2, 3], [3, 2], [4, 2]] },          // x r+0 +3 +2 +2 x
};

// Which shapes can voice each engine quality (prefer richer 7th shapes).
const QUALITY_SHAPES = {
    maj7: ['maj7_A', 'maj7_E'], maj9: ['maj7_A', 'maj7_E'], maj13: ['maj7_A', 'maj7_E'], maj6: ['maj_A', 'maj_E'],
    min7: ['min7_A', 'min7_E'], min9: ['min7_A', 'min7_E'], min11: ['min7_A', 'min7_E'], min13: ['min7_A', 'min7_E'], min6: ['min_A', 'min_E'],
    dom7: ['dom7_A', 'dom7_E'], dom9: ['dom7_A', 'dom7_E'], dom13: ['dom7_A', 'dom7_E'], '7sus4': ['dom7_A', 'dom7_E'],
    maj: ['maj_A', 'maj_E'], min: ['min_A', 'min_E'],
    m7b5: ['m7b5_A'], dim7: ['dim7_D'], dim: ['dim7_D'], aug: ['aug_A'],
};

// Base fret of a shape for a given root: (rootPc − openPcOfRootString) mod 12.
function baseFret(shape, rootPc) {
    return ((rootPc - OPEN_PC[shape.rootString]) % 12 + 12) % 12;
}

// Choose the nicest voicing for a chord: prefer a base fret in 1–7 (open shapes,
// fret 0, are welcome too), else the lowest available. Returns absolute frets.
export function chooseVoicing(rootPc, quality) {
    const keys = QUALITY_SHAPES[quality] || QUALITY_SHAPES.maj;
    let best = null;
    for (const key of keys) {
        const shape = SHAPES[key];
        const base = baseFret(shape, rootPc);
        const comfy = base === 0 || (base >= 1 && base <= 7);
        const cand = { key, shape, base, comfy };
        if (!best) best = cand;
        else if (cand.comfy && !best.comfy) best = cand;
        else if (cand.comfy === best.comfy && cand.base < best.base) best = cand;
    }
    // Absolute notes: [stringIdx, absFret], plus which string holds the root.
    const notes = best.shape.offs.map(([s, off]) => [s, best.base + off]);
    return { notes, rootString: best.shape.rootString, baseFret: best.base };
}
