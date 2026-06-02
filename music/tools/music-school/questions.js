// questions.js — pure question generators. No DOM, no I/O. Every question is
// plain data so the SAME object renders on screen (interactive) and on the
// printed worksheet. This is the shared spine of the whole tool.
//
// A question looks like:
//   { topic, prompt, render: {kind, ...}, choices: [...], answer, audio }
// `render` describes a glyph to draw via notation.js. `audio` (optional) names
// what to play for listening rounds / reward sounds.

import { DURATIONS, LETTERS, durationById } from './notation.js';

// --- tiny seeded RNG so a worksheet can be regenerated identically ----------
export function rng(seed = Date.now()) {
    let s = seed >>> 0 || 1;
    return () => {
        s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
        return ((s >>> 0) % 1_000_000) / 1_000_000;
    };
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const shuffle = (r, arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

// Difficulty tiers map roughly to age. Each topic reads `level` to decide how
// many choices, whether colour hints show, and how wide the note pool is.
// 1 ≈ ages 3–5  |  2 ≈ ages 5–7  |  3 ≈ ages 7–10
export const LEVELS = [1, 2, 3];

const NOTE_POOL = {
    1: ['C4', 'D4', 'E4', 'G4', 'A4'],            // simple, spread out
    2: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'],
    3: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'],
};
const numChoices = (level) => (level === 1 ? 2 : level === 2 ? 3 : 4);

// "What note is this?" — note on a staff, choose the letter.
export function noteNameQuestion(r, level) {
    const name = pick(r, NOTE_POOL[level]);
    const letter = name[0];
    const distractors = shuffle(r, LETTERS.filter((l) => l !== letter)).slice(0, numChoices(level) - 1);
    return {
        topic: 'note-name',
        prompt: 'What note is this?',
        render: { kind: 'staffNote', name, colored: level === 1 },
        choices: shuffle(r, [letter, ...distractors]),
        answer: letter,
        audio: { note: name },
    };
}

// "How many beats?" — a duration glyph, choose the number.
export function beatCountQuestion(r, level) {
    const pool = level === 1
        ? DURATIONS.filter((d) => d.beats >= 2)        // whole & half only
        : DURATIONS;
    const d = pick(r, pool);
    const options = level === 1 ? [1, 2, 4] : [0.5, 1, 2, 4];
    const choices = shuffle(r, dedupeAround(r, d.beats, options, numChoices(level)));
    return {
        topic: 'beat-count',
        prompt: 'How many beats?',
        render: { kind: 'duration', id: d.id },
        choices: choices.map(fmtBeats),
        answer: fmtBeats(d.beats),
        audio: { taps: d.beats },
    };
}

// "Which note lasts the longest?" — a row of glyphs, pick the longest.
export function longestNoteQuestion(r, level) {
    const n = numChoices(level);
    const chosen = shuffle(r, DURATIONS).slice(0, n).sort((a, b) => b.beats - a.beats);
    const longest = chosen[0];
    return {
        topic: 'longest-note',
        prompt: 'Which note lasts the longest?',
        render: { kind: 'durationRow', ids: shuffle(r, chosen).map((d) => d.id) },
        choices: shuffle(r, chosen.map((d) => d.id)),
        answer: longest.id,
        labelFor: (id) => durationById(id).label,
    };
}

// "Find the note on the piano" — keyboard, choose / circle the key.
export function findKeyQuestion(r, level) {
    const letter = pick(r, LETTERS.slice(0, level === 1 ? 5 : 7));
    const distractors = shuffle(r, LETTERS.filter((l) => l !== letter)).slice(0, numChoices(level) - 1);
    return {
        topic: 'find-key',
        prompt: `Find the note: ${letter}`,
        render: { kind: 'keyboard' },
        choices: shuffle(r, [letter, ...distractors]),
        answer: letter,
        audio: { note: `${letter}4` },
    };
}

// "Higher or lower?" — listening only (screen). Plays two notes.
export function higherLowerQuestion(r) {
    const pool = ['C4', 'E4', 'G4', 'C5', 'E5'];
    let a = pick(r, pool); let b = pick(r, pool);
    while (b === a) b = pick(r, pool);
    const idx = (n) => pool.indexOf(n);
    return {
        topic: 'higher-lower',
        prompt: 'Is the second note higher or lower?',
        render: { kind: 'ears' },
        choices: ['higher', 'lower'],
        answer: idx(b) > idx(a) ? 'higher' : 'lower',
        audio: { sequence: [a, b] },
        listenOnly: true,
    };
}

// Registry — topics usable on the printable worksheet (no audio-only ones).
export const PRINTABLE_TOPICS = {
    'note-name': noteNameQuestion,
    'beat-count': beatCountQuestion,
    'longest-note': longestNoteQuestion,
    'find-key': findKeyQuestion,
};
// Everything, including listening rounds, for the interactive screen.
export const SCREEN_TOPICS = {
    ...PRINTABLE_TOPICS,
    'higher-lower': (r) => higherLowerQuestion(r),
};

// Build a worksheet: N questions across the chosen topics at one level.
export function buildWorksheet({ seed, level, topics, count }) {
    const r = rng(seed);
    const gens = topics.map((t) => PRINTABLE_TOPICS[t]);
    const out = [];
    for (let i = 0; i < count; i++) {
        out.push(gens[i % gens.length](r, level));
    }
    return out;
}

// --- helpers ---------------------------------------------------------------
function fmtBeats(b) { return b === 0.5 ? '½' : String(b); }
// ensure the answer is among the choices, then fill to `n` distinct options.
function dedupeAround(r, answer, options, n) {
    const set = new Set([answer]);
    for (const o of shuffle(r, options)) {
        if (set.size >= n) break;
        set.add(o);
    }
    return [...set];
}
