// c-major-bright-side.js — Lesson: "C major: the bright side".
// The sunny twin of A minor (they share the exact same notes — C major is Am's
// relative major). An 8-bar I–vi–IV–V in C, one chord per bar strummed as two
// half notes, with a gentle G7 in bar 8 as the dominant pull home.
//
//   | C | Am | F | G | C | Am | F | G7 | (C)
//
// Same five-exercise shape as the A-minor lesson (scale → a second scale flavour →
// walking roots → strum-and-walk), so the pack teaches transfer: everything you
// learned in the minor lives here in the major. On piano it's ALL WHITE KEYS.

import { exercise, lesson, chordsAtBars, strumBar } from './dsl.js';

// Voice-led triads (sounding pitches). The V→I resolution G→C is the smooth one:
// G held, B→C (leading tone), D→E. G7 adds F, which resolves down to E.
const V = {
    'C':  'G3+C4+E4',
    'Am': 'A3+C4+E4',   // shares C,E with C — only G→A moves
    'F':  'A3+C4+F4',   // shares A,C with Am — only E→F moves
    'G':  'G3+B3+D4',
    'G7': 'G3+B3+D4+F4', // add the 7th (F) for the dominant tension
};
const PROG = ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G7'];

export const LESSON = lesson('c-major-bright-side', {
    title: 'C major: the bright side',
    key: 'C',
    home: { tonic: 'C', mode: 'major' }, // drives correct transpose labels
    levelLabel: 'Starter',
    icon: '☀️',
    instruments: ['guitar', 'piano'],
    blurb: 'A minor’s sunny twin — same notes, brighter home. The I–vi–IV–V '
        + 'progression (C · Am · F · G7), a major-scale warm-up, the “no wrong notes” '
        + 'pentatonic, and a walking-bass finale. All white keys on piano; all open chords on guitar.',
}, [
    exercise('progression', {
        icon: '🎸', title: 'The Progression', subtitle: 'Eight bars in C major — two half-note strums per bar',
        story: 'The most famous happy loop there is: <strong>C · Am · F · G</strong>, twice. It uses the very same '
            + 'notes as the A-minor lesson — but starting and ending on <strong>C</strong> makes it sound bright '
            + 'instead of sad. Bar 8 swaps in <strong>G7</strong>: that added note (F) is a tiny bit of tension that '
            + 'makes the final drop home to C feel earned. Strum each chord twice and loop it.',
        tips: {
            guitar: 'These are the four workhorse open chords — C, Am, F, G. F is the tricky one; a small “Fmaj7” (skip the low strings) works fine to start.',
            piano: 'Every chord is three white keys. Right hand plays the triad, left hand taps the root (C, A, F, G).',
        },
        notation: PROG.map((s) => strumBar(V[s])).join(' | '),
        chords: chordsAtBars(PROG),
        practice: null, // strummed chords aren't mic-scorable
    }),

    exercise('warmup-scale', {
        icon: '🔆', title: 'Warm-up — the C major scale', subtitle: 'C major, one octave up and down',
        story: 'The brightest, most basic scale: C D E F G A B C. Walk it up and back in steady quarter notes, '
            + 'saying the letters aloud. Notice it’s the exact same seven notes as A minor — just started from a '
            + 'different home. The last C gets two beats to breathe.',
        tips: {
            guitar: 'Open position: C on the A string (3rd fret) up to C on the B string (1st fret) and beyond.',
            piano: 'The white-key scale — thumb on C, no black keys at all. The classic first scale.',
        },
        notation: 'C4 D4 E4 F4 | G4 A4 B4 C5 | B4 A4 G4 F4 | E4 D4 C4:2',
        chords: null,
        practice: 'melody',
    }),

    exercise('warmup-pentatonic', {
        icon: '⭐', title: 'The “no wrong notes” scale — C major pentatonic', subtitle: 'Drop the two tense notes: C D E G A',
        story: 'Take the major scale and remove the two notes that create tension (F and B), and you get the '
            + '<strong>major pentatonic</strong>: C D E G A. Over a C-major groove, <em>every one of these sounds '
            + 'good</em> — it’s the scale to noodle and improvise with. Run it up and back and hear how sweet and '
            + 'open it is.',
        tips: {
            guitar: 'This is the sound of countless riffs and solos — five notes, no clams.',
            piano: 'Just C D E G A (and up to the next C) — try making up your own little tune with only these.',
        },
        notation: 'C4 D4 E4 G4 | A4 C5 A4 G4 | E4 D4 C4 A3 | G3 A3 C4:2',
        chords: null,
        practice: 'melody',
    }),

    exercise('walking', {
        icon: '🚶', title: 'Walking the roots', subtitle: 'Root on "1", a walking note on "3" that leads to the next chord',
        story: 'One note per half note: beat 1 is the chord’s <strong>root</strong>, beat 3 <em>walks</em> to the next. '
            + 'Two moves to feel: the chromatic <strong>F→F♯→G</strong> approach in bars 3 &amp; 7 (a jazzy step that '
            + 'sneaks up on the G), and the leading tone <strong>B→C</strong> that lands each phrase back home. A '
            + 'whole-note C finishes it off.',
        tips: {
            guitar: 'Your bassline — play it on the low strings under the chords.',
            piano: 'The left-hand line; let each note ring until the next lands.',
        },
        notation: 'C4:2 B3:2 | A3:2 G3:2 | F3:2 F#3:2 | G3:2 B3:2 | C4:2 B3:2 | A3:2 G3:2 | F3:2 F#3:2 | G3:2 B3:2 | C4:4',
        chords: chordsAtBars([...PROG, 'C']),
        practice: 'melody',
    }),

    exercise('final', {
        icon: '🏁', title: 'Final piece — strum & walk', subtitle: 'Chord on beats 1–2, walking note on beats 3–4',
        story: 'Put it together: <strong>strum the chord</strong> on beat 1, then play the <strong>walking note</strong> '
            + 'on beat 3 to hand yourself to the next chord. The chromatic F♯ gives it a wink of swing; bar 8’s G7 and '
            + 'its leading tone B wind the spring, and the closing whole-note C releases it. Keep it slow and let it ring.',
        tips: {
            guitar: 'Strum down on 1, pick the single bass note on 3 — that boom-chuck groove.',
            piano: 'Right hand strums the chord on 1; left hand steps the bass note on 3.',
        },
        notation: PROG
            .map((sym, i) => `${V[sym]}:2 ${['B3', 'G3', 'F#3', 'B3', 'B3', 'G3', 'F#3', 'B3'][i]}:2`)
            .join(' | ') + ' | G3+C4+E4:4',
        chords: chordsAtBars([...PROG, 'C']),
        practice: 'walk', // mic test uses the walking line — chords aren't mic-scorable
    }),
]);
