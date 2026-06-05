// notation.js — renders the whole score as a real treble staff (SVG string).
// This is the "sight-reading" half of the hybrid editor: whatever the child
// builds on the colour grid shows up here as standard notation, instantly.

import { diatonicStep, letterOf, NOTE_COLORS, BEATS_PER_BAR, BEAT_W } from './model.js';

const GAP = 14;            // px between staff lines
const STAFF_TOP = 40;      // y of the top line (F5)
const STAFF_LEFT = 64;     // x where the staff lines begin (after clef)
const RIGHT_PAD = 24;
const HEIGHT = 150;
const MID_Y = STAFF_TOP + 2 * GAP; // middle line (B4) — stem-direction pivot

// Staff lines, bottom→top: E4 G4 B4 D5 F5 → diatonic steps 30,32,34,36,38.
const STEP_TOP = diatonicStep('F5');     // 38
const STEP_BOTTOM = diatonicStep('E4');  // 30

const yOfStep = (step) => STAFF_TOP + (STEP_TOP - step) * (GAP / 2);
const xOfBeat = (beat) => STAFF_LEFT + beat * BEAT_W;

// Ledger lines needed for a note outside the staff (returns the even steps).
function ledgerSteps(step) {
    const out = [];
    if (step < STEP_BOTTOM) {
        const start = step % 2 === 0 ? step : step + 1; // nearest line at/above note
        for (let s = STEP_BOTTOM - 2; s >= start; s -= 2) out.push(s);
    } else if (step > STEP_TOP) {
        const end = step % 2 === 0 ? step : step - 1;
        for (let s = STEP_TOP + 2; s <= end; s += 2) out.push(s);
    }
    return out;
}

function renderNote(n, { colored, showLetters }) {
    const step = diatonicStep(n.pitch);
    const cx = xOfBeat(n.start) + BEAT_W * 0.5;
    const cy = yOfStep(step);
    const rx = GAP * 0.66, ry = GAP * 0.5;
    const open = n.durBeats >= 2;        // half & whole have open heads
    const hasStem = n.durBeats < 4;      // whole note has no stem
    const fill = colored ? NOTE_COLORS[letterOf(n.pitch)] : '#1f2430';

    let svg = '';
    // ledger lines through/around the head
    for (const s of ledgerSteps(step)) {
        const y = yOfStep(s);
        svg += `<line x1="${cx - rx - 5}" y1="${y}" x2="${cx + rx + 5}" y2="${y}" stroke="#b6bccb" stroke-width="1.4"/>`;
    }
    // head — open (hollow) for half & whole, filled for quarter. Hollow in both
    // colour and B&W modes so quarter vs half is always visually distinct.
    svg += open
        ? `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" stroke="${fill}" stroke-width="2.4"/>`
        : `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
    // stem (up if below middle line, else down)
    if (hasStem) {
        const up = cy >= MID_Y;
        const sx = up ? cx + rx - 0.5 : cx - rx + 0.5;
        const sy2 = up ? cy - GAP * 3 : cy + GAP * 3;
        svg += `<line x1="${sx}" y1="${cy}" x2="${sx}" y2="${sy2}" stroke="${fill}" stroke-width="2.2"/>`;
    }
    // mentor mode: the letter name, centred in the head. White on a filled head,
    // the note's colour on a hollow (open) head — readable either way.
    if (showLetters) {
        const letterColor = open ? fill : '#fff';
        svg += `<text x="${cx}" y="${cy}" font-size="${GAP * 0.82}" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="${letterColor}" font-family="'Outfit', sans-serif" style="pointer-events:none">${letterOf(n.pitch)}</text>`;
    }
    return svg;
}

export function renderScore({ bars, notes }, { colored = false, playheadBeat = null, showLetters = false } = {}) {
    const totalBeats = bars * BEATS_PER_BAR;
    const width = STAFF_LEFT + totalBeats * BEAT_W + RIGHT_PAD;

    // five staff lines
    let lines = '';
    for (let i = 0; i < 5; i++) {
        const y = STAFF_TOP + i * GAP;
        lines += `<line x1="${STAFF_LEFT}" y1="${y}" x2="${width - RIGHT_PAD}" y2="${y}" stroke="#c9cedd" stroke-width="1.4"/>`;
    }
    // barlines every BEATS_PER_BAR beats
    let barlines = '';
    for (let b = 0; b <= totalBeats; b += BEATS_PER_BAR) {
        const x = xOfBeat(b);
        const isEnd = b === 0 || b === totalBeats;
        barlines += `<line x1="${x}" y1="${STAFF_TOP}" x2="${x}" y2="${STAFF_TOP + 4 * GAP}" stroke="${isEnd ? '#1f2430' : '#c9cedd'}" stroke-width="${isEnd ? 2.4 : 1.2}"/>`;
    }
    // treble clef + time signature (unicode glyphs keep it dependency-free)
    const clef = `<text x="22" y="${STAFF_TOP + 3.1 * GAP}" font-size="${GAP * 4.2}" fill="#1f2430" font-family="serif">𝄞</text>`;
    const ts = `<text x="${STAFF_LEFT + 6}" y="${STAFF_TOP + 1.7 * GAP}" font-size="${GAP * 1.5}" font-weight="700" fill="#1f2430" font-family="serif">4</text>`
             + `<text x="${STAFF_LEFT + 6}" y="${STAFF_TOP + 3.5 * GAP}" font-size="${GAP * 1.5}" font-weight="700" fill="#1f2430" font-family="serif">4</text>`;

    const heads = notes.map((n) => renderNote(n, { colored, showLetters })).join('');

    let playhead = '';
    if (playheadBeat != null) {
        const x = xOfBeat(playheadBeat) + BEAT_W * 0.5;
        playhead = `<line x1="${x}" y1="${STAFF_TOP - 14}" x2="${x}" y2="${STAFF_TOP + 4 * GAP + 14}" stroke="#ff8a3d" stroke-width="2.4" opacity="0.85"/>`;
    }

    return `<svg class="score" width="${width}" height="${HEIGHT}" viewBox="0 0 ${width} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">${lines}${barlines}${clef}${ts}${heads}${playhead}</svg>`;
}
