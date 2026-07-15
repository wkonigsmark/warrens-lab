// lessons.js — the Guitar Lesson content, all data. Everything on this page is
// generated from these exercises, so tweaking the course = editing this file.
//
// The piece: an 8-bar progression in A minor, one chord per bar, strummed as two
// half notes. Two matched 4-bar phrases, both closing on E7; the second phrase
// swaps in B° (bar 7) — the eerie tension chord — before E7 pulls everything
// home to Am.
//
//   | Am | F | Dm | E7 | Am | Dm | B° | E7 | (Am)
//
// Voicings are compact voice-led triads: between any two chords at most two
// notes move, and never further than a step or two. The chord SYMBOL is what
// matters — on guitar, play any Am/F/Dm/E7/B° shapes you like.
//
// Notation DSL (same family as composer presets): tokens are `pitch:durBeats`
// (durBeats defaults to 1), `|` is a cosmetic barline, `_` a rest, and `+`
// stacks pitches into a chord: `A3+C4+E4:2` = a half-note Am triad.

function parse(notation) {
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
const chordsAtBars = (symbols) => symbols.map((symbol, i) => ({ beat: i * 4, symbol }));

// The voice-led triads, one per chord symbol (sounding pitches, guitar octave).
export const VOICINGS = {
    'Am': 'A3+C4+E4',
    'F':  'A3+C4+F4',   // F/A — only E→F moves from Am
    'Dm': 'A3+D4+F4',   // Dm/A — only C→D moves from F
    'E7': 'G#3+D4+E4',  // 3rd+7th+root — the leading tone G♯ appears
    'B°': 'B3+D4+F4',   // the pure diminished triad: B–D–F
};

export const PROGRESSION_SYMBOLS = ['Am', 'F', 'Dm', 'E7', 'Am', 'Dm', 'B°', 'E7'];

// A bar of a given chord strummed as two half notes.
const strumBar = (sym) => `${VOICINGS[sym]}:2 ${VOICINGS[sym]}:2`;

function exercise(id, def) {
    const { notes, totalBeats } = parse(def.notation);
    return { id, ...def, notes, bars: Math.ceil(totalBeats / 4) };
}

export const EXERCISES = [
    exercise('progression', {
        icon: '🎸', title: 'The Progression', subtitle: 'Eight bars in A minor — two half-note strums per bar',
        story: 'This is the whole piece: two matching 4-bar phrases, both ending on E7. '
            + 'Bar 7 is the haunted one — <strong>B diminished</strong> (B–D–F) — and its unease is exactly what makes '
            + 'the E7 → Am landing feel like coming home. Strum each chord twice (count "1-2, 3-4") and loop it: '
            + 'the final E7 pulls you straight back to Am. The written triads are voice-led — barely a finger moves '
            + 'between chords — but any Am / F / Dm / E7 / B° shapes you know are fair game.',
        notation: PROGRESSION_SYMBOLS.map(strumBar).join(' | '),
        chords: chordsAtBars(PROGRESSION_SYMBOLS),
        practice: null, // strummed chords aren't mic-scorable (pitch detection is one note at a time)
    }),

    exercise('warmup-natural', {
        icon: '🔥', title: 'Warm-up — the A minor scale', subtitle: 'A natural minor, one octave up and down',
        story: 'Every note of the piece lives in this scale: A B C D E F G. Walk it up and back in steady quarter '
            + 'notes — in open position that\'s A on the G string (2nd fret) up to A on the top string (5th fret). '
            + 'Say the letter names out loud as you go; the last A gets two beats to breathe.',
        notation: 'A3 B3 C4 D4 | E4 F4 G4 A4 | G4 F4 E4 D4 | C4 B3 A3:2',
        chords: null,
        practice: 'melody',
    }),

    exercise('warmup-harmonic', {
        icon: '🌒', title: 'The eerie twist — A harmonic minor', subtitle: 'Same scale, but G becomes G♯',
        story: 'Raise the 7th note one fret — G → <strong>G♯</strong> — and the scale turns exotic. That G♯ is no '
            + 'decoration: it\'s the note that turns plain Em into <strong>E7</strong>, and it\'s a half step below A, '
            + 'so it <em>leans</em> home. This is where the progression\'s tension chords get their spice. Feel the '
            + 'strange wide stretch between F and G♯ on the way up.',
        notation: 'A3 B3 C4 D4 | E4 F4 G#4 A4 | G#4 F4 E4 D4 | C4 B3 A3:2',
        chords: null,
        practice: 'melody',
    }),

    exercise('walking', {
        icon: '🚶', title: 'Walking the roots', subtitle: 'Root on "1", a walking note on "3" that leads to the next chord',
        story: 'One note per half note: beat 1 is the chord\'s <strong>root</strong>, beat 3 <em>walks</em> you to the '
            + 'next root. Most walks are neighbours in the scale, plus three special moves: the chromatic creep '
            + '<strong>D→D♯→E</strong> into bar 4, the leading tone <strong>G♯→A</strong> home to Am, and in bar 7 the '
            + 'diminished chord\'s own <strong>B→F tritone drop</strong> — the eeriest interval in music — which melts '
            + 'onto E. A whole-note A finally lands the tension.',
        notation: 'A3:2 G3:2 | F3:2 E3:2 | D3:2 D#3:2 | E3:2 G#3:2 | A3:2 C4:2 | D4:2 C4:2 | B3:2 F3:2 | E3:2 G#3:2 | A3:4',
        chords: chordsAtBars([...PROGRESSION_SYMBOLS, 'Am']),
        practice: 'melody',
    }),

    exercise('final', {
        icon: '🏁', title: 'Final piece — strum & walk', subtitle: 'Chord on beats 1–2, walking note on beats 3–4',
        story: 'Put it together: <strong>strum the chord</strong> on beat 1, then play the <strong>walking note</strong> '
            + 'from the last exercise on beat 3 — it hands you to the next chord just in time. Bar 7\'s B° strum plus the '
            + 'falling F is peak eeriness; bar 8\'s E7 and G♯ wind the spring, and the closing whole-note Am releases it. '
            + 'Slow is beautiful here — let the half notes ring.',
        notation: PROGRESSION_SYMBOLS
            .map((sym, i) => `${VOICINGS[sym]}:2 ${['G3', 'E3', 'D#3', 'G#3', 'C4', 'C4', 'F3', 'G#3'][i]}:2`)
            .join(' | ') + ' | A3+C4+E4:4',
        chords: chordsAtBars([...PROGRESSION_SYMBOLS, 'Am']),
        practice: 'walk', // mic test uses the walking line — chords aren't mic-scorable
    }),
];

export const exerciseById = (id) => EXERCISES.find((e) => e.id === id);
