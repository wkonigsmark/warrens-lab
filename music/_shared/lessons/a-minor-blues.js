// a-minor-blues.js — Lesson: "A minor blues".
// Reconnects to Lesson 1's A minor, but opens the door to improvising: the minor
// pentatonic (the soloing scale), the blue note (♭5) that gives the blues its
// ache, and the 12-bar form that carries it all. A lesson doesn't have to follow
// the strum-&-walk shape of the earlier ones — this one has its own set.
//
//   12-bar blues:  i i i i | iv iv i i | V iv i V   (Am7 · Dm7 · E7)
//
// Every single-note exercise is mic-scorable, so a student can play the scale,
// the blue note, and their first lick straight into Sing-Along for a score.

import { exercise, lesson, chordsAtBars, strumBar } from './dsl.js';

// Seventh-chord voicings (sounding pitches) — the "blue" 7ths give the form its
// grit. Symbols are what's taught; grab any Am7 / Dm7 / E7 shapes you like.
const V = {
    'Am7': 'A3+C4+E4+G4',
    'Dm7': 'A3+C4+D4+F4',  // D–F–A–C voiced over A
    'E7':  'G#3+B3+D4+E4',
};
const FORM = ['Am7', 'Am7', 'Am7', 'Am7', 'Dm7', 'Dm7', 'Am7', 'Am7', 'E7', 'Dm7', 'Am7', 'E7'];

export const LESSON = lesson('a-minor-blues', {
    title: 'A minor blues',
    key: 'Am',
    home: { tonic: 'A', mode: 'minor' },
    levelLabel: 'Blues',
    icon: '🎷',
    instruments: ['guitar', 'piano'],
    blurb: 'The same A minor as Lesson 1 — now you get to improvise over it. Learn '
        + 'the 12-bar form on 7th chords, the minor-pentatonic soloing scale, the '
        + 'blue note that makes it ache, and your first blues lick.',
}, [
    exercise('twelve-bar', {
        icon: '🎼', title: 'The 12-bar blues', subtitle: 'The most-played form in music — Am7 · Dm7 · E7',
        story: 'Almost every blues, and a huge slice of rock and jazz, rides this '
            + '<strong>12-bar</strong> pattern: four bars home (Am7), two on the four-chord (Dm7), two home, '
            + 'then the turnaround (E7 · Dm7 · Am7 · E7) that spins you back to the top. The <strong>7th chords</strong> '
            + '(that extra note on top) are what make it sound bluesy instead of plain. Strum each bar twice and loop the whole 12.',
        tips: {
            guitar: 'Am7 and Dm7 are just Am and Dm with a finger lifted; E7 is the easy open shape. Let them ring.',
            piano: 'Left hand walks the roots (A, D, E); right hand holds the four-note 7th chord. Keep it lazy and even.',
        },
        notation: FORM.map((s) => strumBar(V[s])).join(' | '),
        chords: chordsAtBars(FORM),
        practice: null, // strummed chords aren't mic-scorable
    }),

    exercise('pentatonic', {
        icon: '⭐', title: 'A minor pentatonic', subtitle: 'The five-note soloing scale: A C D E G',
        story: 'This is <em>the</em> scale for soloing over the blues — five notes, A C D E G, and every one sounds '
            + 'good over all three chords. Run it up and back until your fingers know it cold; this box is home base '
            + 'for a lifetime of improvising.',
        tips: {
            guitar: 'Box 1 in open position (or up at the 5th fret) — the shape guitarists reach for first.',
            piano: 'Only A C D E G — try noodling little phrases with just these five before moving on.',
        },
        notation: 'A3 C4 D4 E4 | G4 A4 C5 A4 | G4 E4 D4 C4 | A3:4',
        chords: null,
        practice: 'melody',
    }),

    exercise('blue-note', {
        icon: '💙', title: 'The blue note', subtitle: 'Add one note — ♭5 (D♯) — and it turns to the blues',
        story: 'Slip one extra note into the pentatonic — the <strong>♭5</strong>, D♯ (a.k.a. E♭) — and you get the '
            + '<strong>blues scale</strong>: A C D <strong>D♯</strong> E G. That blue note is a passing tone: you '
            + 'don’t sit on it, you <em>slink</em> through it (D → D♯ → E) on the way up, and it drips on the way down. '
            + 'It’s the single note that makes a line sound like the blues.',
        tips: {
            guitar: 'On a string it’s a slide or quick hammer between D and E — brush past it, don’t park there.',
            piano: 'D♯ is the black key just above D. Roll D → D♯ → E with the same finger for that bluesy slur.',
        },
        notation: 'A3 C4 D4 D#4 | E4 G4 A4 G4 | E4 D#4 D4 C4 | A3:4',
        chords: null,
        practice: 'melody',
    }),

    exercise('first-lick', {
        icon: '🎸', title: 'Your first blues lick', subtitle: 'Put the scale to work — a phrase to play over the form',
        story: 'Here’s a real <strong>lick</strong> built from the blues scale — a little four-bar phrase you can '
            + 'play over the 12-bar. It noodles up top, tumbles down through the blue note, and lands home on A. '
            + 'Play it slow, then loop the 12-bar in your head (or hand it to Sing-Along) and drop the lick on top. '
            + 'That’s soloing — you’re making music now.',
        tips: {
            guitar: 'Feel free to bend into the notes — leaning a fret up toward the target is the blues’ whole vocabulary.',
            piano: 'Lean on the off-beats and let notes overlap a hair — a loose, vocal phrasing beats a stiff one.',
        },
        notation: 'A4 G4 E4 G4 | E4 D4 C4 A3 | C4 D#4 E4 D4 | C4 A3 A3:2',
        chords: null,
        practice: 'melody',
    }),
]);
