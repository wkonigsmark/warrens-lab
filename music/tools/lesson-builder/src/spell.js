// spell.js — correct enharmonic spelling for notation. A pitch class alone can't
// tell you E♭ vs D♯; the right letter comes from the scale degree (or, for loose
// notes, the nearest natural). This gives the notation real theory value: a flat
// key reads with flats. Pure, no DOM.

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
export const ACC_GLYPH = { '-2': '𝄫', '-1': '♭', '0': '', '1': '♯', '2': '𝄪' };

// Parse a root display name like 'B♭', 'F', 'C♯' → { letterIdx, acc, pc }.
export function parseRootName(name) {
    const s = String(name).trim();
    const letterIdx = LETTERS.indexOf(s[0].toUpperCase());
    let acc = 0;
    if (/[♭b]/.test(s.slice(1))) acc = -1;
    else if (/[♯#]/.test(s.slice(1))) acc = 1;
    return { letterIdx, acc, pc: ((LETTER_PC[letterIdx] + acc) % 12 + 12) % 12 };
}

// Accidental (-2..+2) a given letter needs to sound pitch class `pc`.
export function accForLetter(letterIdx, pc) {
    let d = (pc - LETTER_PC[letterIdx]) % 12;
    if (d > 6) d -= 12;
    if (d < -6) d += 12;
    return d;
}

// The most natural letter to spell a pitch class (smallest accidental; ties prefer
// flats in flat keys / sharps in sharp keys).
export function bestLetter(pc, preferFlat = true) {
    let best = null;
    for (let li = 0; li < 7; li++) {
        const acc = accForLetter(li, pc);
        if (Math.abs(acc) > 1) continue;
        if (!best || Math.abs(acc) < Math.abs(best.acc)
            || (Math.abs(acc) === Math.abs(best.acc) && (preferFlat ? acc < best.acc : acc > best.acc))) {
            best = { letterIdx: li, acc };
        }
    }
    return best || { letterIdx: 0, acc: accForLetter(0, pc) };
}

// diatonic staff step (C0 = 0, C4 = 28, E4 = 30…). Higher = higher on the staff.
export const staffStep = (note) => note.octave * 7 + note.letterIdx;
export const noteLabel = (note) => LETTERS[note.letterIdx] + (ACC_GLYPH[String(note.acc)] || '');

// Spell a scale ascending one octave from its root. rootName e.g. 'B♭'.
// Heptatonic scales get one letter per degree (clean, e.g. B♭ major = all flats,
// no repeats). Non-heptatonic (pentatonic/blues/diminished/whole-tone) use
// nearest-natural spelling so symmetric scales don't sprout double-flats.
export function spellScaleNotes(rootName, scale, baseOctave = 4) {
    const root = parseRootName(rootName);
    if (scale.intervals.length === 7) {
        return scale.intervals.map((iv, i) => {
            const degStr = String(scale.degrees?.[i] ?? (i + 1));
            const degNum = parseInt(degStr.replace(/[^\d]/g, ''), 10) || (i + 1);
            const stepsFromRoot = root.letterIdx + (degNum - 1);
            return {
                letterIdx: stepsFromRoot % 7,
                acc: accForLetter(stepsFromRoot % 7, (root.pc + iv) % 12),
                octave: baseOctave + Math.floor(stepsFromRoot / 7),
                pc: (root.pc + iv) % 12,
                degree: degStr,
            };
        });
    }
    const preferFlat = root.acc <= 0;
    let prevStep = -1, octave = baseOctave;
    return scale.intervals.map((iv, i) => {
        const pc = (root.pc + iv) % 12;
        const spell = i === 0 ? { letterIdx: root.letterIdx, acc: root.acc } : bestLetter(pc, preferFlat);
        let step = octave * 7 + spell.letterIdx;
        if (prevStep >= 0 && step <= prevStep) { octave += 1; step = octave * 7 + spell.letterIdx; }
        prevStep = step;
        return { letterIdx: spell.letterIdx, acc: spell.acc, octave, pc, degree: '' };
    });
}

// pitch-class → correct note label for THIS scale (so the fretboard map and the
// note-row read with the same spelling as the staff). e.g. E Dorian → 6:'F♯'.
export function spellingMap(rootName, scale) {
    const m = new Map();
    for (const n of spellScaleNotes(rootName, scale)) if (!m.has(n.pc)) m.set(n.pc, noteLabel(n));
    return m;
}

// Build a spelled note for a pitch class on a chosen letter, in the octave whose
// staff step is closest to `nearStep` (keeps melodic lines smooth, no big leaps).
export function noteNear(pc, letterIdx, nearStep) {
    let best = null;
    for (let oct = 2; oct <= 6; oct++) {
        const step = oct * 7 + letterIdx;
        const d = Math.abs(step - nearStep);
        if (!best || d < best.d) best = { d, note: { letterIdx, acc: accForLetter(letterIdx, pc), octave: oct, pc } };
    }
    return best.note;
}
