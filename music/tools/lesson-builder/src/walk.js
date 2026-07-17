// walk.js — generate a short "walking" connecting line between two chords, the
// way a bassist links changes: root → 3rd → 5th → a chromatic approach note that
// leans into the next chord's root. Rendered in notation, this teaches voice
// leading AND sight reading at once. Pure.

import { CHORD_QUALITIES } from '../../../core/theory/chords.js';
import { parseRootName, bestLetter, noteNear, staffStep, accForLetter } from './spell.js';

function thirdFifth(quality) {
    const iv = CHORD_QUALITIES[quality].intervals;
    return {
        third: iv.find((x) => x === 3 || x === 4) ?? 4,
        fifth: iv.find((x) => x === 6 || x === 7 || x === 8) ?? 7,
    };
}

// A chord tone `stepsUp` diatonic steps above the root. Uses the stacked-thirds
// letter, but falls back to the nearest natural if that would need a double-flat
// (e.g. a diminished 5th spelled as B𝄫 → cleaner as A).
function chordTone(root, stepsUp, pc, nearStep, preferFlat) {
    let letterIdx = (root.letterIdx + stepsUp) % 7;
    if (Math.abs(accForLetter(letterIdx, pc)) > 1) letterIdx = bestLetter(pc, preferFlat).letterIdx;
    return noteNear(pc, letterIdx, nearStep);
}

// a = { symbol, rootName, rootPc, quality }, b = same for the next chord.
// Returns { notes:[…5 spelled notes], marks:[{i,text}] }: A's root/3rd/5th, a
// leading tone, then B's root (the resolution).
export function buildWalk(a, b, { preferFlat = true } = {}) {
    const ap = parseRootName(a.rootName), bp = parseRootName(b.rootName);
    const { third, fifth } = thirdFifth(a.quality);

    const n1 = noteNear(ap.pc, ap.letterIdx, 31);                                  // A root ~E4
    const n2 = chordTone(ap, 2, (ap.pc + third) % 12, staffStep(n1), preferFlat);  // A 3rd
    const n3 = chordTone(ap, 4, (ap.pc + fifth) % 12, staffStep(n2), preferFlat);  // A 5th
    const apPc = (bp.pc + 11) % 12;                                                // half-step below B root
    const apLetter = bestLetter(apPc, preferFlat).letterIdx;
    const n4 = noteNear(apPc, apLetter, staffStep(n3));                            // leading tone
    const target = noteNear(bp.pc, bp.letterIdx, staffStep(n4));                   // land on B

    return {
        notes: [n1, n2, n3, n4, target],
        marks: [{ i: 0, text: a.symbol }, { i: 4, text: b.symbol }],
    };
}

// Unique adjacent chord moves in the progression (A→B, deduped, skipping repeats).
export function uniqueMoves(flat) {
    const seen = new Set();
    const moves = [];
    for (let i = 0; i < flat.length - 1; i++) {
        const a = flat[i], b = flat[i + 1];
        if (a.symbol === b.symbol) continue;
        const key = `${a.symbol}>${b.symbol}`;
        if (seen.has(key)) continue;
        seen.add(key);
        moves.push([a, b]);
    }
    return moves;
}
