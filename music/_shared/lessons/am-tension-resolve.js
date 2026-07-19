// am-tension-resolve.js — Lesson: "A minor: tension & resolve".
// Instrument-neutral content (see dsl.js). An 8-bar A-minor progression, one
// chord per bar strummed as two half notes: two matched 4-bar phrases both
// closing on E7, the second swapping in B° (bar 7) — the eerie tension chord —
// before E7 pulls home to Am.
//
//   | Am | F | Dm | E7 | Am | Dm | B° | E7 | (Am)
//
// Voicings are compact voice-led triads (≤2 notes move between chords). The chord
// SYMBOL is what matters; `tips` translate that to each instrument.

import { exercise, lesson, chordsAtBars, strumBar } from './dsl.js';

// Voice-led triads, one per chord symbol (sounding pitches).
const V = {
    'Am': 'A3+C4+E4',
    'F':  'A3+C4+F4',   // F/A — only E→F moves from Am
    'Dm': 'A3+D4+F4',   // Dm/A — only C→D moves from F
    'E7': 'G#3+D4+E4',  // 3rd+7th+root — the leading tone G♯ appears
    'B°': 'B3+D4+F4',   // the pure diminished triad: B–D–F
};
const PROG = ['Am', 'F', 'Dm', 'E7', 'Am', 'Dm', 'B°', 'E7'];

export const LESSON = lesson('am-tension-resolve', {
    title: 'A minor: tension & resolve',
    key: 'Am',
    home: { tonic: 'A', mode: 'minor' }, // drives correct transpose labels
    levelLabel: 'Starter',
    icon: '🌒',
    instruments: ['guitar', 'piano'],
    blurb: 'An 8-bar A-minor progression with an eerie diminished chord, plus the '
        + 'warm-ups and walking-bass moves that make it sing. Ends with a strum-and-walk piece.',
}, [
    exercise('progression', {
        icon: '🎸', title: 'The Progression', subtitle: 'Eight bars in A minor — two half-note strums per bar',
        story: 'This is the whole piece: two matching 4-bar phrases, both ending on E7. '
            + 'Bar 7 is the haunted one — <strong>B diminished</strong> (B–D–F) — and its unease is exactly what makes '
            + 'the E7 → Am landing feel like coming home. Strum each chord twice (count "1-2, 3-4") and loop it: '
            + 'the final E7 pulls you straight back to Am. The written triads are voice-led — barely a note moves '
            + 'between chords.',
        tips: {
            guitar: 'Play any Am / F / Dm / E7 / B° shapes you know — open or barre. The written triads just show the smoothest voicing.',
            piano: 'Left hand holds the root; right hand plays the triad. Keep the shared notes (C and E stay put across Am→F→Dm) under the same fingers.',
        },
        notation: PROG.map((s) => strumBar(V[s])).join(' | '),
        chords: chordsAtBars(PROG),
        practice: null, // strummed chords aren't mic-scorable (pitch detection is one note at a time)
    }),

    exercise('warmup-natural', {
        icon: '🔥', title: 'Warm-up — the A minor scale', subtitle: 'A natural minor, one octave up and down',
        story: 'Every note of the piece lives in this scale: A B C D E F G. Walk it up and back in steady quarter '
            + 'notes, saying the letter names out loud as you go; the last A gets two beats to breathe.',
        tips: {
            guitar: 'Open position: A on the G string (2nd fret) up to A on the high E string (5th fret).',
            piano: 'All white keys — thumb on A, no black notes anywhere in A natural minor.',
        },
        notation: 'A3 B3 C4 D4 | E4 F4 G4 A4 | G4 F4 E4 D4 | C4 B3 A3:2',
        chords: null,
        practice: 'melody',
    }),

    exercise('warmup-harmonic', {
        icon: '🌒', title: 'The eerie twist — A harmonic minor', subtitle: 'Same scale, but G becomes G♯',
        story: 'Raise the 7th note a half step — G → <strong>G♯</strong> — and the scale turns exotic. That G♯ is no '
            + 'decoration: it\'s the note that turns plain Em into <strong>E7</strong>, and it\'s a half step below A, '
            + 'so it <em>leans</em> home. This is where the progression\'s tension chords get their spice. Feel the '
            + 'strange wide stretch between F and G♯ on the way up.',
        tips: {
            guitar: 'That G♯ is one fret above G — same string, just slide up.',
            piano: 'One black key: G♯ sits between G and A. Everything else stays white.',
        },
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
        tips: {
            guitar: 'This is your bassline — play it on the low strings (E/A/D) under the chords.',
            piano: 'This is the left-hand line; let each note ring until the next.',
        },
        notation: 'A3:2 G3:2 | F3:2 E3:2 | D3:2 D#3:2 | E3:2 G#3:2 | A3:2 C4:2 | D4:2 C4:2 | B3:2 F3:2 | E3:2 G#3:2 | A3:4',
        chords: chordsAtBars([...PROG, 'Am']),
        practice: 'melody',
    }),

    exercise('final', {
        icon: '🏁', title: 'Final piece — strum & walk', subtitle: 'Chord on beats 1–2, walking note on beats 3–4',
        story: 'Put it together: <strong>strum the chord</strong> on beat 1, then play the <strong>walking note</strong> '
            + 'from the last exercise on beat 3 — it hands you to the next chord just in time. Bar 7\'s B° strum plus the '
            + 'falling F is peak eeriness; bar 8\'s E7 and G♯ wind the spring, and the closing whole-note Am releases it. '
            + 'Slow is beautiful here — let the half notes ring.',
        tips: {
            guitar: 'Strum down on 1, then pick the single bass note on 3 — a boom-chuck feel.',
            piano: 'Right hand strums the chord on 1; left hand steps the bass note on 3.',
        },
        notation: PROG
            .map((sym, i) => `${V[sym]}:2 ${['G3', 'E3', 'D#3', 'G#3', 'C4', 'C4', 'F3', 'G#3'][i]}:2`)
            .join(' | ') + ' | A3+C4+E4:4',
        chords: chordsAtBars([...PROG, 'Am']),
        practice: 'walk', // mic test uses the walking line — chords aren't mic-scorable
    }),
]);
