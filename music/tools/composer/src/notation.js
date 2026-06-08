// notation.js — renders the score as a real staff (SVG string). This is the
// "sight-reading" half of the hybrid editor. It draws one or more *systems*
// (staff lines): pass `barsPerSystem` to wrap long pieces onto stacked rows
// (used by the printed manuscript); omit it for a single scrolling line (used
// by the on-screen staff, which stays aligned with the grid above it).

import { diatonicStep, letterOf, isSharp, NOTE_COLORS, BLACK_KEY_COLOR, BEATS_PER_BAR, BEAT_W, CLEFS } from './model.js';

const GAP = 14;            // px between staff lines
const STAFF_LEFT = 64;     // x where the staff lines begin (after the clef)
const TS_PAD = 34;         // gap after the staff start, reserved for the time signature
const BEATS_LEFT = STAFF_LEFT + TS_PAD; // x of (local) beat 0 — keeps notes clear of the time sig
const RIGHT_PAD = 24;
const MARGIN = 8;          // outer top/bottom margin
const TOP_PAD = 38;        // room above the top line for ledgers / up-stems
const STAFF_H = 4 * GAP;   // height of the five-line staff (56)
const BOT_PAD = 34;        // room below the bottom line for ledgers / down-stems
const SYSTEM_H = TOP_PAD + STAFF_H + BOT_PAD; // vertical advance between stacked systems

// y of a note's diatonic step within a system, given the clef's top-line step
// and that system's top y. Each step is half a line-gap.
const yOf = (step, topStep, baseTop) => baseTop + (topStep - step) * (GAP / 2);
const xOfBeat = (localBeat) => BEATS_LEFT + localBeat * BEAT_W;

// Ledger lines needed for a note outside the staff (returns the even steps).
function ledgerSteps(step, topStep) {
    const out = [];
    const bottom = topStep - 8;
    if (step < bottom) {
        const start = step % 2 === 0 ? step : step + 1; // nearest line at/above note
        for (let s = bottom - 2; s >= start; s -= 2) out.push(s);
    } else if (step > topStep) {
        const end = step % 2 === 0 ? step : step - 1;
        for (let s = topStep + 2; s <= end; s += 2) out.push(s);
    }
    return out;
}

// One note head, positioned by its beat *within its system* (localBeat).
function renderNote(n, localBeat, { colored, showLetters, staffShift, topStep, baseTop }) {
    // Notation may sit octaves from the sounding pitch (clef + staffShift). The
    // head moves; the letter name is octave-agnostic so mentor mode is unaffected.
    const step = diatonicStep(n.pitch) + staffShift * 7;
    // centre the head over the note's own time span so it lines up with the grid
    // block above (eighth → quarter of a beat in, whole → middle of the bar).
    const cx = xOfBeat(localBeat) + (n.durBeats * BEAT_W) / 2;
    const cy = yOf(step, topStep, baseTop);
    const midY = baseTop + 2 * GAP; // geometric middle line — stem-direction pivot
    const rx = GAP * 0.66, ry = GAP * 0.5;
    const open = n.durBeats >= 2;        // half & whole have open heads
    const hasStem = n.durBeats < 4;      // whole note has no stem
    const hasFlag = n.durBeats < 1;      // eighth note gets a flag
    const sharp = isSharp(n.pitch);
    const fill = colored ? (sharp ? BLACK_KEY_COLOR : NOTE_COLORS[letterOf(n.pitch)]) : '#1f2430';

    let svg = '';
    for (const s of ledgerSteps(step, topStep)) {
        const y = yOf(s, topStep, baseTop);
        svg += `<line x1="${cx - rx - 5}" y1="${y}" x2="${cx + rx + 5}" y2="${y}" stroke="#b6bccb" stroke-width="1.4"/>`;
    }
    // accidental — a ♯ sits just left of the head (black keys are sharp-spelled)
    if (sharp) {
        svg += `<text x="${cx - rx - 7}" y="${cy}" font-size="${GAP * 1.5}" text-anchor="middle" dominant-baseline="central" fill="${fill}" font-family="serif">♯</text>`;
    }
    // head — open (hollow) for half & whole, filled for quarter/eighth. Hollow in
    // both colour and B&W modes so quarter vs half is always visually distinct.
    svg += open
        ? `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" stroke="${fill}" stroke-width="2.4"/>`
        : `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
    if (hasStem) {
        const up = cy >= midY;
        const sx = up ? cx + rx - 0.5 : cx - rx + 0.5;
        const sy2 = up ? cy - GAP * 3 : cy + GAP * 3;
        svg += `<line x1="${sx}" y1="${cy}" x2="${sx}" y2="${sy2}" stroke="${fill}" stroke-width="2.2"/>`;
        if (hasFlag) {
            // a single flag off the stem tip, curving away from the head
            const d = up ? 1 : -1;
            svg += `<path d="M ${sx} ${sy2} q ${GAP * 0.85} ${d * GAP * 0.55} ${GAP * 0.45} ${d * GAP * 1.45}" fill="none" stroke="${fill}" stroke-width="3" stroke-linecap="round"/>`;
        }
    }
    // mentor mode: the letter name, centred in the head.
    if (showLetters) {
        const letterColor = open ? fill : '#fff';
        svg += `<text x="${cx}" y="${cy}" font-size="${GAP * 0.82}" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="${letterColor}" font-family="'Outfit', sans-serif" style="pointer-events:none">${letterOf(n.pitch)}</text>`;
    }
    return svg;
}

// One staff line ("system") covering `barsThis` bars starting at `startBeat`.
function renderSystem(opts) {
    const {
        barsThis, startBeat, baseTop, clefCfg, notes, width,
        colored, showLetters, staffShift, isFirst, isLast, playheadBeat,
        beatsPerBar = 4, timeSignature = '4/4',
    } = opts;
    const topStep = clefCfg.topStep;
    const sysBeats = barsThis * beatsPerBar;

    let svg = '';
    // five staff lines
    for (let i = 0; i < 5; i++) {
        const y = baseTop + i * GAP;
        svg += `<line x1="${STAFF_LEFT}" y1="${y}" x2="${width - RIGHT_PAD}" y2="${y}" stroke="#c9cedd" stroke-width="1.4"/>`;
    }
    // barlines — thick at the very start and very end of the whole piece
    for (let b = 0; b <= sysBeats; b += beatsPerBar) {
        const x = xOfBeat(b);
        const thick = (isFirst && b === 0) || (isLast && b === sysBeats);
        svg += `<line x1="${x}" y1="${baseTop}" x2="${x}" y2="${baseTop + STAFF_H}" stroke="${thick ? '#1f2430' : '#c9cedd'}" stroke-width="${thick ? 2.4 : 1.2}"/>`;
    }
    // clef + octave mark — repeated on every system (helps young readers)
    svg += `<text x="${clefCfg.glyphX}" y="${baseTop + clefCfg.glyphBaseline * GAP}" font-size="${GAP * clefCfg.glyphSize}" fill="#1f2430" font-family="serif">${clefCfg.glyph}</text>`;
    const absShift = Math.abs(staffShift);
    const markText = absShift === 1 ? '8' : absShift === 2 ? '15' : '';
    if (markText) {
        const y = staffShift < 0 ? baseTop - 4 : baseTop + STAFF_H + 16;
        svg += `<text x="${clefCfg.glyphX + 12}" y="${y}" font-size="${GAP}" font-weight="700" text-anchor="middle" fill="#1f2430" font-family="serif">${markText}</text>`;
    }
    // time signature — only on the first system (standard engraving)
    if (isFirst) {
        const [numerator, denominator] = timeSignature.split('/');
        const tsX = STAFF_LEFT + 12;
        svg += `<text x="${tsX}" y="${baseTop + 1.7 * GAP}" font-size="${GAP * 1.5}" font-weight="700" fill="#1f2430" font-family="serif">${numerator}</text>`
             + `<text x="${tsX}" y="${baseTop + 3.5 * GAP}" font-size="${GAP * 1.5}" font-weight="700" fill="#1f2430" font-family="serif">${denominator}</text>`;
    }
    // notes that fall in this system
    for (const n of notes) {
        if (n.start >= startBeat && n.start < startBeat + sysBeats) {
            svg += renderNote(n, n.start - startBeat, { colored, showLetters, staffShift, topStep, baseTop });
        }
    }
    // playhead (single-line / on-screen use)
    if (playheadBeat != null && playheadBeat >= startBeat && playheadBeat < startBeat + sysBeats) {
        const x = xOfBeat(playheadBeat - startBeat) + BEAT_W * 0.5;
        svg += `<line x1="${x}" y1="${baseTop - 14}" x2="${x}" y2="${baseTop + STAFF_H + 14}" stroke="#ff8a3d" stroke-width="2.4" opacity="0.85"/>`;
    }
    return svg;
}

export function renderScore(
    { bars, notes },
    { colored = false, playheadBeat = null, showLetters = false, staffShift = 0, clef = 'treble', barsPerSystem = null, beatsPerBar = 4, timeSignature = '4/4' } = {},
) {
    const clefCfg = CLEFS[clef] || CLEFS.treble;
    const perSys = (barsPerSystem && barsPerSystem > 0) ? Math.min(barsPerSystem, bars) : bars;
    const systemsCount = Math.max(1, Math.ceil(bars / perSys));
    const width = BEATS_LEFT + perSys * beatsPerBar * BEAT_W + RIGHT_PAD;
    const height = MARGIN * 2 + systemsCount * SYSTEM_H;

    let body = '';
    for (let s = 0; s < systemsCount; s++) {
        const startBar = s * perSys;
        const barsThis = Math.min(perSys, bars - startBar);
        body += renderSystem({
            barsThis,
            startBeat: startBar * beatsPerBar,
            baseTop: MARGIN + TOP_PAD + s * SYSTEM_H,
            clefCfg, notes, width, colored, showLetters, staffShift,
            isFirst: s === 0,
            isLast: s === systemsCount - 1,
            playheadBeat,
            beatsPerBar, timeSignature,
        });
    }
    return `<svg class="score" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}
