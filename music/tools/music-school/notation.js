// notation.js — pure SVG renderers for music symbols. No DOM, no I/O.
// Both the interactive screen and the printable worksheet import these so a
// note looks identical whether it's clicked or printed. Returns SVG strings.

// Boomwhacker colour mapping (a widely-used kid colour standard). Letter →
// colour. We key by letter name (no octave) so C4 and C5 share a colour.
// This is the "second channel" young kids grab before they can read a staff.
export const NOTE_COLORS = {
    C: '#e53935', // red
    D: '#fb8c00', // orange
    E: '#fdd835', // yellow
    F: '#43a047', // green
    G: '#00acc1', // cyan
    A: '#3949ab', // indigo
    B: '#8e24aa', // violet
};

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Note durations, in beats (4/4). The whole catalogue of "how many beats?".
export const DURATIONS = [
    { id: 'whole',   beats: 4, label: 'whole note' },
    { id: 'half',    beats: 2, label: 'half note' },
    { id: 'quarter', beats: 1, label: 'quarter note' },
    { id: 'eighth',  beats: 0.5, label: 'eighth note' },
];

export const durationById = (id) => DURATIONS.find((d) => d.id === id);

// --- Staff geometry -------------------------------------------------------
// Diatonic "staff step": C4 = 0, D4 = 1, ... Each step is half a line-gap.
// Treble bottom line (E4) sits at step 2. We support C4 (middle C, one ledger
// line below) up through C5 — a friendly first-octave range.
const GAP = 12;                 // px between staff lines
const STAFF_TOP = 24;           // y of the top line (F5)
const NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'];

export const isNote = (name) => NOTES.includes(name);
export const letterOf = (name) => name[0];

// step index for a note name within our supported range.
const stepOf = (name) => NOTES.indexOf(name);
// y of the note head centre. Top line F5 is the highest line we draw.
const yOf = (name) => STAFF_TOP + (stepOf('F5') - stepOf(name)) * (GAP / 2);

// Render a single note on a treble staff. `colored` fills the head with its
// Boomwhacker colour (used in the youngest tiers / answer keys).
export function renderStaffNote(name, { colored = false, width = 90, height = 110 } = {}) {
    const cx = width / 2;
    const cy = yOf(name);
    const fill = colored ? NOTE_COLORS[letterOf(name)] : '#1a1a1a';

    // five staff lines
    let lines = '';
    for (let i = 0; i < 5; i++) {
        const y = STAFF_TOP + i * GAP;
        lines += `<line x1="8" y1="${y}" x2="${width - 8}" y2="${y}" stroke="#999" stroke-width="1"/>`;
    }
    // ledger line for middle C (C4) which sits below the staff
    let ledger = '';
    if (name === 'C4') {
        ledger = `<line x1="${cx - 12}" y1="${cy}" x2="${cx + 12}" y2="${cy}" stroke="#999" stroke-width="1"/>`;
    }
    // a simple treble clef glyph (unicode) anchored at left
    const clef = `<text x="6" y="${STAFF_TOP + 3 * GAP + 2}" font-size="58" fill="#1a1a1a" font-family="serif">𝄞</text>`;

    const head = `<ellipse cx="${cx}" cy="${cy}" rx="7.5" ry="5.5" fill="${fill}" transform="rotate(-20 ${cx} ${cy})"/>`;
    const stem = `<line x1="${cx + 7}" y1="${cy}" x2="${cx + 7}" y2="${cy - 34}" stroke="${fill}" stroke-width="2"/>`;

    return svg(width, height, `${lines}${ledger}${clef}${head}${stem}`);
}

// Render a bare duration glyph (no staff) for "how many beats?" questions.
export function renderDuration(id, { width = 70, height = 90 } = {}) {
    const cx = width / 2 - 4;
    const cy = height / 2 + 12;
    const ink = '#1a1a1a';
    const filled = id !== 'whole' && id !== 'half';
    const head = `<ellipse cx="${cx}" cy="${cy}" rx="9" ry="6.5"
        fill="${filled ? ink : 'none'}" stroke="${ink}" stroke-width="2"
        transform="rotate(-20 ${cx} ${cy})"/>`;
    let stem = '';
    let flag = '';
    if (id !== 'whole') {
        const sx = cx + 8.5;
        stem = `<line x1="${sx}" y1="${cy - 2}" x2="${sx}" y2="${cy - 40}" stroke="${ink}" stroke-width="2"/>`;
        if (id === 'eighth') {
            flag = `<path d="M${sx} ${cy - 40} q 14 6 9 24" fill="none" stroke="${ink}" stroke-width="2.5"/>`;
        }
    }
    return svg(width, height, `${head}${stem}${flag}`);
}

// A one-octave piano keyboard (C4–C5) for "click/circle the note" questions.
// `highlight` letter draws a marker; omit for a blank "find it" prompt.
export function renderKeyboard(highlight = null, { width = 224, height = 96 } = {}) {
    const whites = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];
    const w = width / whites.length;
    let keys = '';
    whites.forEach((L, i) => {
        const x = i * w;
        const mark = (L === highlight)
            ? `<circle cx="${x + w / 2}" cy="${height - 16}" r="8" fill="${NOTE_COLORS[L]}"/>`
            : '';
        keys += `<rect x="${x}" y="0" width="${w - 1}" height="${height}" rx="3"
            fill="#fff" stroke="#333" stroke-width="1.5"/>${mark}`;
    });
    // black keys after C,D,F,G,A (indices 0,1,3,4,5)
    const blackAfter = [0, 1, 3, 4, 5];
    blackAfter.forEach((i) => {
        const x = (i + 1) * w - w * 0.3;
        keys += `<rect x="${x}" y="0" width="${w * 0.6}" height="${height * 0.62}"
            rx="2" fill="#1a1a1a"/>`;
    });
    return svg(width, height, keys);
}

function svg(w, h, body) {
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"
        xmlns="http://www.w3.org/2000/svg" role="img">${body}</svg>`;
}
