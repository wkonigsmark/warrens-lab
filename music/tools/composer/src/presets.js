// presets.js — the built-in "Starter Songs" shelf: well-known PUBLIC-DOMAIN
// melodies. Two tiers: (1) simple traditional tunes (natural notes, ~one octave)
// on the default C5–A6 xylophone for a beginner's first reading; (2) "great
// themes" — short, recognizable classical motifs (Beethoven, Mozart, Bach,
// Tchaikovsky, Brahms) that need accidentals / a wider register, so they load on
// the 88-key PIANO. All melodies, not full arrangements.
//
// Encoding: a compact string of beat tokens. "C5" = quarter, "C5:0.5" = eighth,
// "C5:2" = half, "C5:4" = whole, "_" / "_:0.5" = a rest (advances beats with no
// note). "|" marks a barline and is purely decorative. parse() expands it to
// {start, pitch, durBeats}.

function parse(notation) {
    const tokens = notation.replace(/\|/g, ' ').trim().split(/\s+/).filter(Boolean);
    let beat = 0;
    const notes = [];
    for (const tok of tokens) {
        const [pitch, dur] = tok.split(':');
        const durBeats = dur ? parseFloat(dur) : 1;
        if (pitch !== '_') notes.push({ start: beat, pitch, durBeats });
        beat += durBeats;
    }
    return { notes, beats: beat };
}

// opts: { timeSignature='4/4', rangeId='c5-a6', tempo=96 }. Classical pieces with
// accidentals / a wider range use rangeId 'piano-88' (88-key piano, write-as-sounds);
// the simple traditional tunes stay on the xylophone (c5-a6, written an octave down).
function song(id, title, composer, notation, opts = {}) {
    const { timeSignature = '4/4', rangeId = 'c5-a6', tempo = 96 } = opts;
    const staffShift = opts.staffShift != null ? opts.staffShift : (rangeId === 'c5-a6' ? -1 : 0);
    const { notes, beats } = parse(notation);
    const beatsPerBar = timeSignature === '3/4' ? 3 : 4;
    return {
        id, title, composer,
        rangeId, clef: 'treble', staffShift,
        bars: Math.max(4, Math.ceil(beats / beatsPerBar)),
        timeSignature,
        durationId: 'quarter', tempo, showLetters: false,
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

    // Eighth notes in action — "Sonnez les matines" is a run of eighths. Written
    // a step up (do = G5) so the low "din-dan-don" sol still fits the C5–A6 bars.
    song('preset-frere', 'Frère Jacques', 'Traditional',
        'G5 A5 B5 G5 | G5 A5 B5 G5 | B5 C6 D6:2 | B5 C6 D6:2 | ' +
        'D6:0.5 E6:0.5 D6:0.5 C6:0.5 B5 G5 | D6:0.5 E6:0.5 D6:0.5 C6:0.5 B5 G5 | ' +
        'G5 D5 G5:2 | G5 D5 G5:2'),

    // 3/4 time signatures
    song('preset-happybirthday', 'Happy Birthday', 'Traditional',
        'G5 G5 A5 | G5 C6 B5 | G5 G5 A5 | G5 C6 B5 | G5 G5:2',
        { timeSignature: '3/4' }),

    song('preset-rockabye', 'Rock-a-bye Baby', 'Traditional',
        'C5 D5 E5 | F5 G5:2 | C5 D5 E5 | F5 G5:2 | G5 A5 B5 | C6 A5 G5',
        { timeSignature: '3/4' }),

    // --- Classical "great themes" — short, recognizable motifs of the masters.
    // These use accidentals / a wider register, so they load on the 88-key PIANO
    // (not the xylophone). Public-domain melodies. Accidentals are sharp-spelled to
    // match the piano grid's note rows.
    song('preset-furelise', 'Für Elise (theme)', 'L. van Beethoven',
        'E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 A4 | ' +
        'C4:0.5 E4:0.5 A4:0.5 B4 | E4:0.5 G#4:0.5 B4:0.5 C5',
        { rangeId: 'piano-88', tempo: 80 }),

    song('preset-beethoven5', 'Symphony No. 5 (motif)', 'L. van Beethoven',
        'G4:0.5 G4:0.5 G4:0.5 D#4:2 | F4:0.5 F4:0.5 F4:0.5 D4:2',
        { rangeId: 'piano-88', tempo: 100 }),

    song('preset-nachtmusik', 'Eine kleine Nachtmusik (theme)', 'W. A. Mozart',
        'G5:0.5 D5:0.5 G5:0.5 D5:0.5 G5:0.5 B5:0.5 D6:0.5 G6:0.5 | ' +
        'D5:0.5 A5:0.5 D5:0.5 A5:0.5 D5:0.5 F#5:0.5 A5:0.5 D6:0.5 | ' +
        'G5:0.5 B5:0.5 A5:0.5 C6:0.5 B5:0.5 D6:0.5 C6:0.5 E6:0.5 | D6:2',
        { rangeId: 'piano-88' }),

    song('preset-turkishmarch', 'Rondo alla Turca (theme)', 'W. A. Mozart',
        'B4:0.5 A4:0.5 G#4:0.5 A4:0.5 C5 | B4:0.5 A4:0.5 G#4:0.5 A4:0.5 D5 | ' +
        'C5:0.5 B4:0.5 A4:0.5 B4:0.5 E5 | A5:2',
        { rangeId: 'piano-88', tempo: 108 }),

    song('preset-minuetg', 'Minuet in G (theme)', 'J. S. Bach',
        'D5 | G5:0.5 A5:0.5 B5:0.5 C6:0.5 D6 | G5 G5 | ' +
        'E6:0.5 C6:0.5 D6:0.5 E6:0.5 F#6 | G6 G6',
        { rangeId: 'piano-88', timeSignature: '3/4', tempo: 120 }),

    song('preset-swanlake', 'Swan Lake (theme)', 'P. I. Tchaikovsky',
        'B4:2 C#5:0.5 D5:0.5 E5:0.5 F#5:0.5 | F#5:2 E5:0.5 D5:0.5 C#5:0.5 B4:0.5 | A#4:2 B4:2',
        { rangeId: 'piano-88', tempo: 84 }),

    song('preset-brahmslullaby', 'Lullaby (Wiegenlied)', 'J. Brahms',
        'E5:0.5 E5:0.5 G5:2 | E5:0.5 E5:0.5 G5:2 | ' +
        'E5:0.5 G5:0.5 B5:0.5 A5:0.5 A5:0.5 G5:0.5 | D5 E5 F5',
        { rangeId: 'piano-88', timeSignature: '3/4', tempo: 90 }),
];
