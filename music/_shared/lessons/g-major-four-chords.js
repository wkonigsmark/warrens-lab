// g-major-four-chords.js — Lesson: "G major: four chords, countless songs".
// The most practical starter lesson: the four open chords G · D · Em · C and the
// I–V–vi–IV progression that underpins a staggering number of pop and folk songs.
// Its shape is tuned to the real beginner hurdle — CHANGING chords cleanly —
// rather than the strum-&-walk mold, and it ends on a singable melody instead of
// a walking bass. New territory for the pack: the key of G and its one sharp, F♯.
//
//   I–V–vi–IV:  G · D · Em · C   (× 2)

import { exercise, lesson, chordsAtBars, strumBar } from './dsl.js';

// Open-chord triads (sounding pitches), kept in a tight band so the changes read
// clearly on the staff. D brings in F♯ — the single sharp of the key.
const V = {
    'G':  'G3+B3+D4',
    'D':  'A3+D4+F#4',
    'Em': 'G3+B3+E4',
    'C':  'G3+C4+E4',
};
const PROG = ['G', 'D', 'Em', 'C', 'G', 'D', 'Em', 'C'];

export const LESSON = lesson('g-major-four-chords', {
    title: 'G major: four chords, countless songs',
    key: 'G',
    home: { tonic: 'G', mode: 'major' },
    levelLabel: 'Starter',
    icon: '🏕️',
    instruments: ['guitar', 'piano'],
    blurb: 'The four open chords — G, D, Em, C — unlock the most famous loop in pop, '
        + 'the I–V–vi–IV. Learn the shapes, drill clean changes, warm up the G scale '
        + '(and meet its one sharp, F♯), then play a folk melody over the top.',
}, [
    exercise('four-chords', {
        icon: '🎸', title: 'The four chords', subtitle: 'G · D · Em · C — the I–V–vi–IV loop, twice',
        story: 'These four chords, in this order, are the backbone of hundreds of songs across every decade. '
            + 'Strum each one twice and loop it — once your hands know <strong>G · D · Em · C</strong>, you can '
            + 'busk your way through an astonishing amount of music. The only new shape here is <strong>D</strong>; '
            + 'you already met C and Em, and G is the friendliest chord on the instrument.',
        tips: {
            guitar: 'All four are open chords in first position. D uses just the top four strings — keep your strum tight so you don’t catch the low string.',
            piano: 'Right hand plays the triad, left hand taps the root (G, D, E, C). Three keys per chord — no black keys except F♯ in the D chord.',
        },
        notation: PROG.map((s) => strumBar(V[s])).join(' | '),
        chords: chordsAtBars(PROG),
        practice: null, // strummed chords aren't mic-scorable
    }),

    exercise('clean-changes', {
        icon: '🔁', title: 'Clean changes', subtitle: 'One chord per bar — a whole bar to move your fingers',
        story: 'The real beginner skill isn’t holding a chord, it’s <em>switching</em> to the next one in time. '
            + 'Here each chord rings for a <strong>whole bar</strong>, so you have four slow beats to lift and re-plant '
            + 'your fingers. The trick: <strong>name the next chord out loud before you get there</strong>, and move all '
            + 'your fingers as one shape, not one at a time. Speed comes free once the moves are clean.',
        tips: {
            guitar: 'Look for “anchor fingers” that stay put — e.g. G→Em barely moves. Keep those planted.',
            piano: 'Feel the shared notes: G and Em share G and B; C and Em share E and G. Let the common fingers stay.',
        },
        notation: `${V.G}:4 | ${V.Em}:4 | ${V.C}:4 | ${V.D}:4`,
        chords: chordsAtBars(['G', 'Em', 'C', 'D']),
        practice: null,
    }),

    exercise('scale', {
        icon: '🔆', title: 'The G major scale', subtitle: 'G A B C D E F♯ G — one new sharp',
        story: 'G major is the same friendly major sound as C, with exactly one twist: the 7th note is '
            + '<strong>F♯</strong>, not F. That single sharp is what makes it “the key of G.” Walk the scale up and '
            + 'back in steady quarter notes and let your ear lock onto that raised 7th leaning up into G.',
        tips: {
            guitar: 'Open position: low G on the E string (3rd fret) up the scale — F♯ sits at the 2nd fret of the high E.',
            piano: 'All white keys except one — F becomes F♯ (the black key just above F). Thumb on G.',
        },
        notation: 'G3 A3 B3 C4 | D4 E4 F#4 G4 | F#4 E4 D4 C4 | B3 A3 G3:2',
        chords: null,
        practice: 'melody',
    }),

    exercise('folk-melody', {
        icon: '🎶', title: 'A folk melody', subtitle: 'A singable tune over the four chords — play or sing it',
        story: 'Here’s a simple melody that floats over the <strong>G · D · Em · C</strong> loop — the kind of '
            + 'open, hopeful line those four chords were born to carry. Play it (or sing it) slowly against the '
            + 'progression; it outlines each chord and lands home on G. This is the payoff: chords underneath, a tune on top.',
        tips: {
            guitar: 'Pick it out on the top strings, then try humming it while you strum the chords — melody and harmony together.',
            piano: 'Right hand takes the melody, left hand can tap the chord roots. Sing along to lock in the pitches.',
        },
        notation: 'D4 G4 B4 G4 | A4 F#4 D4 F#4 | E4 G4 B4 G4 | E4 C4 E4 D4 '
            + '| D4 G4 B4 D5 | C5 A4 F#4 A4 | G4 B4 E4 D4 | A4 G4 G4:2',
        chords: chordsAtBars(PROG),
        practice: 'melody',
    }),
]);
