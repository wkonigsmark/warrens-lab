// Smoke test for the foundation modules. Run: node core/theory/foundation.test.mjs
// Pure-function verification — no browser needed. scales.json is read via fs and
// passed to the pure parseScales(), mirroring how the engine takes injected data.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
    mod12, transpose, pcSet, isSubset, intersectionSize, difference, union, formatPc,
} from './pitch-class.js';
import { buildChord, CHORD_QUALITIES } from './chords.js';
import { parseScales, scalePcs, isHeptatonic } from './scales.js';

let pass = 0, fail = 0;
const eq = (got, want, msg) => {
    const g = JSON.stringify(got), w = JSON.stringify(want);
    if (g === w) { pass++; }
    else { fail++; console.error(`✗ ${msg}\n    got  ${g}\n    want ${w}`); };
};
const set = (s) => [...s].sort((a, b) => a - b);

// --- pitch-class ---
eq(mod12(-1), 11, 'mod12 wraps negatives');
eq(mod12(13), 1, 'mod12 wraps high');
eq(transpose(10, 4), 2, 'transpose wraps octave');
eq(set(pcSet(0, [0, 4, 7])), [0, 4, 7], 'C major triad pcs');
eq(set(pcSet(7, [0, 4, 7])), [2, 7, 11], 'G major triad pcs');
eq(isSubset(pcSet(0, [0, 4, 7]), pcSet(0, [0, 2, 4, 5, 7, 9, 11])), true, 'C triad ⊆ C major scale');
eq(isSubset(pcSet(6, [0, 4, 7]), pcSet(0, [0, 2, 4, 5, 7, 9, 11])), false, 'F# triad ⊄ C major scale');
eq(intersectionSize(pcSet(0, [0, 4, 7]), pcSet(0, [0, 3, 7])), 2, 'maj/min share root+5th');
eq(difference(pcSet(0, [0, 4, 7]), pcSet(0, [0, 3, 7])), [4], 'maj 3rd is the outside note vs min');
eq(set(union(pcSet(0, [0, 4]), pcSet(0, [7]))), [0, 4, 7], 'union of sets');
eq(formatPc(1), 'C♯', 'formatPc sharp default');
eq(formatPc(1, { preferFlats: true }), 'D♭', 'formatPc flat preference');

// --- chords ---
const cmaj7 = buildChord(0, 'maj7');
eq(set(cmaj7.pcs), [0, 4, 7, 11], 'Cmaj7 pcs');
const g7 = buildChord(7, 'dom7');
eq(set(g7.pcs), [2, 5, 7, 11], 'G7 pcs');
const dm7 = buildChord(2, 'min7');
eq(set(dm7.pcs), [0, 2, 5, 9], 'Dm7 pcs');
eq(Object.keys(CHORD_QUALITIES).length, 26, 'quality count lifted intact');

// --- scales ---
const raw = JSON.parse(await readFile(new URL('./scales.json', import.meta.url)));
const catalog = parseScales(raw);
eq(catalog.length, 28, 'parsed all 28 scales');
const major = catalog.find((s) => s.id === 'major');
eq(set(scalePcs(major, 0)), [0, 2, 4, 5, 7, 9, 11], 'C major scale pcs');
const dorian = catalog.find((s) => s.id === 'dorian');
// D Dorian should be the white notes (same pcs as C major)
eq(set(scalePcs(dorian, 2)), [0, 2, 4, 5, 7, 9, 11], 'D Dorian = C major pcs');
eq(catalog.filter(isHeptatonic).length >= 7, true, 'at least the 7 modes are heptatonic');

// ii-V-I in C: Dm7, G7, Cmaj7 should all sit inside C major
const cMajorPcs = scalePcs(major, 0);
eq([dm7, g7, cmaj7].every((c) => isSubset(c.pcs, cMajorPcs)), true, 'ii-V-I ⊆ C major');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
