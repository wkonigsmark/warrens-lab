// presets.js — the built-in "Starter Songs" shelf: a handful of well-known
// PUBLIC-DOMAIN melodies, kept deliberately simple (natural notes only, within
// one octave, quarter/half/whole, 4/4) so they fit the default C5–A6 xylophone
// and a beginner's first reading. Traditional tunes — not modern arrangements.
//
// Encoding: a compact string of beat tokens. "C5" = quarter, "C5:2" = half,
// "C5:4" = whole, "_" / "_:2" = a rest (advances beats with no note). "|" marks
// a barline and is purely decorative. parse() expands it to {start, pitch, durBeats}.

function parse(notation) {
    const tokens = notation.replace(/\|/g, ' ').trim().split(/\s+/).filter(Boolean);
    let beat = 0;
    const notes = [];
    for (const tok of tokens) {
        const [pitch, dur] = tok.split(':');
        const durBeats = dur ? parseInt(dur, 10) : 1;
        if (pitch !== '_') notes.push({ start: beat, pitch, durBeats });
        beat += durBeats;
    }
    return { notes, beats: beat };
}

function song(id, title, composer, notation) {
    const { notes, beats } = parse(notation);
    return {
        id, title, composer,
        rangeId: 'c5-a6', clef: 'treble', staffShift: -1, // default xylophone, written an octave down
        bars: Math.max(4, Math.ceil(beats / 4)),
        durationId: 'quarter', tempo: 96, showLetters: false,
        notes, builtin: true,
    };
}

export const PRESETS = [
    song('preset-twinkle', 'Twinkle Twinkle Little Star', 'Traditional',
        'C5 C5 G5 G5 | A5 A5 G5:2 | F5 F5 E5 E5 | D5 D5 C5:2 | ' +
        'G5 G5 F5 F5 | E5 E5 D5:2 | G5 G5 F5 F5 | E5 E5 D5:2 | ' +
        'C5 C5 G5 G5 | A5 A5 G5:2 | F5 F5 E5 E5 | D5 D5 C5:2'),

    song('preset-mary', 'Mary Had a Little Lamb', 'Traditional',
        'E5 D5 C5 D5 | E5 E5 E5:2 | D5 D5 D5:2 | E5 G5 G5:2 | ' +
        'E5 D5 C5 D5 | E5 E5 E5 E5 | D5 D5 E5 D5 | C5:4'),

    song('preset-hotcross', 'Hot Cross Buns', 'Traditional',
        'E5 D5 C5:2 | E5 D5 C5:2 | C5 C5 D5 D5 | E5 D5 C5:2'),

    song('preset-threemice', 'Three Blind Mice', 'Traditional',
        'E5 D5 C5:2 | E5 D5 C5:2 | G5 F5 F5 E5 | G5 F5 F5 E5'),

    song('preset-oldmac', 'Old MacDonald Had a Farm', 'Traditional',
        'G5 G5 G5 D5 | E5 E5 D5:2 | B5 B5 A5 A5 | G5:4 | ' +
        'G5 G5 G5 D5 | E5 E5 D5:2 | B5 B5 A5 A5 | G5:4'),

    song('preset-london', 'London Bridge Is Falling Down', 'Traditional',
        'G5 A5 G5 F5 | E5 F5 G5:2 | D5 E5 F5:2 | E5 F5 G5:2 | ' +
        'G5 A5 G5 F5 | E5 F5 G5:2 | D5 G5 E5 C5 | C5:4'),

    song('preset-auclair', 'Au Clair de la Lune', 'French folk song',
        'C5 C5 C5 D5 | E5:2 D5:2 | C5 E5 D5 D5 | C5:4 | ' +
        'C5 C5 C5 D5 | E5:2 D5:2 | C5 E5 D5 D5 | C5:4'),

    song('preset-ode', 'Ode to Joy', 'L. van Beethoven',
        'E5 E5 F5 G5 | G5 F5 E5 D5 | C5 C5 D5 E5 | E5 D5 D5:2 | ' +
        'E5 E5 F5 G5 | G5 F5 E5 D5 | C5 C5 D5 E5 | D5 C5 C5:2'),

    song('preset-jingle', 'Jingle Bells (chorus)', 'J. Pierpont',
        'E5 E5 E5:2 | E5 E5 E5:2 | E5 G5 C5 D5 | E5:4'),
];
