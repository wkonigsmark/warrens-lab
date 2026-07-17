// fretboard.js — pure SVG renderers for the printable lesson:
//   chordDiagram(voicing, rootPc)  → a standard chord box (which frets to press)
//   scaleMap(rootPc, intervals)    → a full-neck map of a scale's notes
// No DOM, no dependencies beyond note names. Strings index 0..5 = low E → high e.

import { OPEN_PC } from './voicings.js';
import { formatPc } from '../../../core/theory/pitch-class.js';

const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'];

// --- Chord box --------------------------------------------------------------
// voicing = { notes: [[stringIdx, absFret], …], rootString, baseFret }.
export function chordDiagram(voicing, rootPc, { preferFlats = true } = {}) {
    const { notes, rootString } = voicing;
    const played = new Map(notes.map(([s, f]) => [s, f]));
    const fretted = notes.map(([, f]) => f).filter((f) => f > 0);
    const hasOpen = notes.some(([, f]) => f === 0);
    const minF = fretted.length ? Math.min(...fretted) : 0;
    const showNut = hasOpen || minF <= 1;
    const start = showNut ? 0 : minF;          // top row fret
    const rows = 5;                            // frets shown

    const padL = 26, padT = 24, colW = 16, rowH = 18;
    const W = padL + 5 * colW + 20, H = padT + rows * rowH + 10;
    const x = (s) => padL + s * colW;          // string x (low E left)
    const y = (fret) => padT + (fret - start) * rowH; // fret line y

    let svg = `<svg class="chord-dia" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    // nut or position label
    if (showNut) svg += `<rect x="${padL}" y="${padT - 4}" width="${5 * colW}" height="4" fill="#222"/>`;
    else svg += `<text x="${padL - 6}" y="${padT + rowH - 4}" font-size="10" text-anchor="end" fill="#444">${start}fr</text>`;
    // fret lines
    for (let r = 0; r <= rows; r++) {
        svg += `<line x1="${padL}" y1="${padT + r * rowH}" x2="${padL + 5 * colW}" y2="${padT + r * rowH}" stroke="#bbb" stroke-width="1"/>`;
    }
    // strings + top markers (o open / x muted) + labels
    for (let s = 0; s < 6; s++) {
        svg += `<line x1="${x(s)}" y1="${padT}" x2="${x(s)}" y2="${padT + rows * rowH}" stroke="#888" stroke-width="1"/>`;
        svg += `<text x="${x(s)}" y="${H - 2}" font-size="8" text-anchor="middle" fill="#999">${STRING_LABELS[s]}</text>`;
        const f = played.get(s);
        if (f === undefined) svg += `<text x="${x(s)}" y="${padT - 8}" font-size="10" text-anchor="middle" fill="#c0392b">×</text>`;
        else if (f === 0) svg += `<circle cx="${x(s)}" cy="${padT - 11}" r="4" fill="none" stroke="#333" stroke-width="1.3"/>`;
    }
    // finger dots
    for (const [s, f] of notes) {
        if (f === 0) continue;
        const cy = y(f) - rowH / 2;
        const isRoot = s === rootString;
        svg += `<circle cx="${x(s)}" cy="${cy}" r="6" fill="${isRoot ? '#c0392b' : '#222'}"/>`;
        if (isRoot) svg += `<text x="${x(s)}" y="${cy + 3}" font-size="8" text-anchor="middle" fill="#fff" font-weight="700">R</text>`;
    }
    svg += `</svg>`;
    return svg;
}

// --- Scale map (full neck) --------------------------------------------------
// `nameFor(pc)` supplies the correct spelling per scale (so dots read F♯ not G♭);
// falls back to plain flats/sharps if not given.
export function scaleMap(rootPc, intervals, { frets = 12, preferFlats = true, nameFor = null } = {}) {
    const labelFor = (pc) => (nameFor ? nameFor(pc) : formatPc(pc, { preferFlats }));
    const inScale = new Set(intervals.map((i) => ((rootPc + i) % 12 + 12) % 12));
    const padL = 30, padT = 14, colW = 34, rowH = 20;
    const W = padL + frets * colW + 14, H = padT + 6 * rowH + 16;
    // low E at the bottom → draw string 0 at the bottom row
    const rowY = (s) => padT + (5 - s) * rowH;
    const INLAY = new Set([3, 5, 7, 9, 15, 17, 19, 21]);

    let svg = `<svg class="scale-map" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    // nut
    svg += `<rect x="${padL - 3}" y="${padT}" width="3" height="${5 * rowH}" fill="#222"/>`;
    // inlay dots
    for (let f = 1; f <= frets; f++) {
        const cx = padL + (f - 0.5) * colW;
        if (f === 12) { svg += `<circle cx="${cx}" cy="${padT + 1.5 * rowH}" r="3" fill="#e5e8f0"/><circle cx="${cx}" cy="${padT + 3.5 * rowH}" r="3" fill="#e5e8f0"/>`; }
        else if (INLAY.has(f)) svg += `<circle cx="${cx}" cy="${padT + 2.5 * rowH}" r="3" fill="#e5e8f0"/>`;
    }
    // strings + fret grid
    for (let s = 0; s < 6; s++) {
        svg += `<line x1="${padL}" y1="${rowY(s)}" x2="${padL + frets * colW}" y2="${rowY(s)}" stroke="#999" stroke-width="1"/>`;
        svg += `<text x="${padL - 8}" y="${rowY(s) + 3}" font-size="9" text-anchor="end" fill="#888">${STRING_LABELS[s]}</text>`;
    }
    for (let f = 1; f <= frets; f++) {
        svg += `<line x1="${padL + f * colW}" y1="${padT}" x2="${padL + f * colW}" y2="${padT + 5 * rowH}" stroke="#ddd" stroke-width="1"/>`;
        svg += `<text x="${padL + (f - 0.5) * colW}" y="${H - 4}" font-size="8" text-anchor="middle" fill="#aaa">${f}</text>`;
    }
    // note dots
    for (let s = 0; s < 6; s++) {
        for (let f = 0; f <= frets; f++) {
            const pc = (OPEN_PC[s] + f) % 12;
            if (!inScale.has(pc)) continue;
            const cx = f === 0 ? padL - 14 : padL + (f - 0.5) * colW;
            const cy = rowY(s);
            const isRoot = pc === ((rootPc % 12) + 12) % 12;
            svg += `<circle cx="${cx}" cy="${cy}" r="7.5" fill="${isRoot ? '#c0392b' : '#fff'}" stroke="${isRoot ? '#c0392b' : '#5b8cff'}" stroke-width="1.4"/>`;
            svg += `<text x="${cx}" y="${cy + 3}" font-size="8" text-anchor="middle" fill="${isRoot ? '#fff' : '#33415c'}" font-weight="${isRoot ? '700' : '500'}">${labelFor(pc)}</text>`;
        }
    }
    svg += `</svg>`;
    return svg;
}
