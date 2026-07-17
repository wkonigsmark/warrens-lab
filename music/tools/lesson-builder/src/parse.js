// parse.js — turn typed chord symbols into { rootPc, quality, symbol } and keep
// the line/phrase grouping so the lesson can show the changes the way they were
// written. Pure, no DOM.

import { CHORD_QUALITIES } from '../../../core/theory/chords.js';

const ROOT_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

// Suffix → engine quality key. Longest match wins (checked in this order).
// Only the qualities the engine knows; a plain letter is a major triad.
const SUFFIX = [
    ['maj7', 'maj7'], ['maj9', 'maj9'], ['maj13', 'maj13'], ['maj6', 'maj6'], ['6/9', 'maj6'],
    ['M7', 'maj7'], ['Δ7', 'maj7'], ['Δ', 'maj7'], ['maj', 'maj'], ['M', 'maj'],
    ['m7b5', 'm7b5'], ['m7♭5', 'm7b5'], ['ø7', 'm7b5'], ['ø', 'm7b5'],
    ['min7', 'min7'], ['m7', 'min7'], ['-7', 'min7'],
    ['min9', 'min9'], ['m9', 'min9'], ['min11', 'min11'], ['m11', 'min11'],
    ['min6', 'min6'], ['m6', 'min6'],
    ['min', 'min'], ['m', 'min'], ['-', 'min'],
    ['dim7', 'dim7'], ['°7', 'dim7'], ['dim', 'dim7'], ['°', 'dim7'],
    ['aug', 'aug'], ['+', 'aug'],
    ['7sus4', '7sus4'], ['7sus', '7sus4'], ['sus4', 'sus4'], ['sus2', 'sus2'], ['sus', 'sus4'],
    ['13', 'dom13'], ['9', 'dom9'], ['7', 'dom7'],
    ['', 'maj'],   // bare root = major triad
];

// Parse a single symbol like "Bbmaj7", "F#m7", "Ebdim", "A7". Returns null if the
// root can't be read.
export function parseChordSymbol(sym) {
    const s = sym.trim();
    const m = s.match(/^([A-Ga-g])([#♯b♭]?)(.*)$/);
    if (!m) return null;
    let pc = ROOT_PC[m[1].toUpperCase()];
    if (pc == null) return null;
    if (m[2] === '#' || m[2] === '♯') pc = (pc + 1) % 12;
    if (m[2] === 'b' || m[2] === '♭') pc = (pc + 11) % 12;
    const rest = m[3];
    for (const [suffix, quality] of SUFFIX) {
        if (rest === suffix && CHORD_QUALITIES[quality]) {
            return { rootPc: pc, quality, symbol: s };
        }
    }
    // Unknown suffix but a valid root → fall back to the dominant/major guess.
    const fallback = /7/.test(rest) ? 'dom7' : 'maj';
    return { rootPc: pc, quality: fallback, symbol: s };
}

// Parse a whole progression. Splits into lines (phrases); within a line, chords
// are separated by whitespace, '-', '|', or ','. Returns { lines, flat } where
// `lines` is [[chord,…],…] and `flat` is every chord in order.
export function parseProgression(text) {
    const lines = [];
    const flat = [];
    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line) continue;
        const tokens = line.split(/[\s|,]+|(?<=[^-\s])-(?=[A-Ga-g])/).map((t) => t.trim()).filter(Boolean);
        const chords = [];
        for (const tok of tokens) {
            const c = parseChordSymbol(tok);
            if (c) { chords.push(c); flat.push(c); }
        }
        if (chords.length) lines.push(chords);
    }
    return { lines, flat };
}
