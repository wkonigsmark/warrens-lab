// dsl.js — the instrument-neutral toolkit for authoring lesson content. Pure
// data + functions, no DOM and nothing guitar-specific: a lesson written with
// these helpers renders on any instrument page (guitar, piano, …) that knows how
// to draw a staff. Kept separate from any one tool so the whole lesson pack is
// portable and each lesson is just music.
//
// Notation DSL: whitespace-separated tokens `pitch:durBeats` (durBeats defaults
// to 1). `|` is a cosmetic barline, `_` a rest, and `+` stacks pitches into a
// chord — `A3+C4+E4:2` is a half-note A-minor triad.

export function parse(notation) {
    const tokens = notation.replace(/\|/g, ' ').trim().split(/\s+/).filter(Boolean);
    let beat = 0;
    const notes = [];
    for (const tok of tokens) {
        const [pitches, dur] = tok.split(':');
        const durBeats = dur ? parseFloat(dur) : 1;
        if (pitches !== '_') {
            for (const pitch of pitches.split('+')) notes.push({ start: beat, pitch, durBeats });
        }
        beat += durBeats;
    }
    return { notes, totalBeats: beat };
}

// One chord symbol per bar → [{ beat, symbol }] for the staff renderer.
export const chordsAtBars = (symbols) => symbols.map((symbol, i) => ({ beat: i * 4, symbol }));

// A bar of a voicing strummed as two half notes (voicing = a `+`-joined chord).
export const strumBar = (voicing) => `${voicing}:2 ${voicing}:2`;

// Build one exercise: parse its notation into notes + a bar count.
export function exercise(id, def) {
    const { notes, totalBeats } = parse(def.notation);
    return { id, ...def, notes, bars: Math.ceil(totalBeats / 4) };
}

// Bundle exercises into a lesson. `meta` carries title/key/home/blurb/tips etc.
// A lesson has NO fixed position — order is decided by the pack (see index.js) —
// and NO instrument: `home` + notes are just music; instrument is chosen by the
// page that renders it, and `tips` may offer per-instrument coaching.
export function lesson(id, meta, exercises) {
    return { id, ...meta, exercises };
}
