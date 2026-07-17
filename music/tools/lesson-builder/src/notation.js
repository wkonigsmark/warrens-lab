// notation.js — a small, light-theme treble-clef staff renderer for the lesson.
// Takes SPELLED notes (from spell.js) so accidentals read correctly (flats in a
// flat key). Uniform quarter-note heads (this teaches pitch reading + voice
// leading; rhythm reading comes later). Optional letter labels + chord marks.
// Pure SVG string, no DOM.

import { staffStep, noteLabel, ACC_GLYPH } from './spell.js';

const S = 9;                 // half-a-line-gap in px (one staff step = S)
const BOTTOM_STEP = 30;      // E4 sits on the bottom staff line
const LINE_STEPS = [30, 32, 34, 36, 38];   // E4 G4 B4 D5 F5
const MID_STEP = 34;         // B4 — stem-direction pivot

// notes: [{ letterIdx, acc, octave, pc }]. opts: { letters, chordMarks:[{i,text}] }.
export function renderStaff(notes, { letters = true, chordMarks = [] } = {}) {
    const padL = 40, padR = 16, padT = 30, padB = letters ? 34 : 20;
    const step0X = padL + 14;
    const gap = Math.max(30, Math.min(56, 520 / Math.max(1, notes.length)));
    const width = step0X + (notes.length - 1) * gap + padR + 16;
    const bottomY = padT + (LINE_STEPS.length - 1) * 2 * S;   // y of E4 line
    const yOf = (step) => bottomY - (step - BOTTOM_STEP) * S;
    const xOf = (i) => step0X + i * gap;
    const height = padT + 4 * 2 * S + padB;

    let svg = `<svg class="staff" viewBox="0 0 ${Math.round(width)} ${Math.round(height)}" xmlns="http://www.w3.org/2000/svg">`;
    // five staff lines
    for (const st of LINE_STEPS) svg += `<line x1="${padL - 6}" y1="${yOf(st)}" x2="${width - padR}" y2="${yOf(st)}" stroke="#c7ccda" stroke-width="1"/>`;
    // treble clef
    svg += `<text x="${padL - 32}" y="${yOf(30) + S * 1.4}" font-family="serif" font-size="${S * 5.6}" fill="#33415c">𝄞</text>`;

    notes.forEach((n, i) => {
        const step = staffStep(n);
        const x = xOf(i), y = yOf(step);
        // ledger lines (below E4 or above F5), on even line-steps between note & staff
        if (step < BOTTOM_STEP) {
            for (let ls = BOTTOM_STEP - 2; ls >= step - (step % 2 === 0 ? 0 : 1); ls -= 2) svg += ledger(x, yOf(ls));
        } else if (step > 38) {
            for (let ls = 40; ls <= step + (step % 2 === 0 ? 0 : 1); ls += 2) svg += ledger(x, yOf(ls));
        }
        // accidental
        if (n.acc) svg += `<text x="${x - 13}" y="${y + 4}" font-size="${S * 1.7}" text-anchor="middle" fill="#33415c" font-family="serif">${ACC_GLYPH[String(n.acc)]}</text>`;
        // notehead (filled) + stem
        svg += `<ellipse cx="${x}" cy="${y}" rx="${S * 0.72}" ry="${S * 0.56}" fill="#1f2430" transform="rotate(-18 ${x} ${y})"/>`;
        const up = step < MID_STEP;
        const sx = up ? x + S * 0.7 : x - S * 0.7;
        svg += `<line x1="${sx}" y1="${y}" x2="${sx}" y2="${y + (up ? -S * 5 : S * 5)}" stroke="#1f2430" stroke-width="1.4"/>`;
        // letter under the staff
        if (letters) svg += `<text x="${x}" y="${height - 8}" font-size="10" text-anchor="middle" fill="#5b8cff" font-weight="700">${noteLabel(n)}</text>`;
    });
    // chord marks above the staff
    for (const m of chordMarks) {
        svg += `<text x="${xOf(m.i)}" y="${padT - 12}" font-size="12" text-anchor="middle" fill="#c0392b" font-weight="800">${m.text}</text>`;
    }
    svg += `</svg>`;
    return svg;
}

function ledger(x, y) {
    return `<line x1="${x - 11}" y1="${y}" x2="${x + 11}" y2="${y}" stroke="#c7ccda" stroke-width="1"/>`;
}
