// rhythm-xylophone.js — a rhythm-first starter pack. Everything is in C major and
// sits in a comfortable one-octave reading range (C4–C5) so the focus stays on
// READING RHYTHM, not chasing pitches. Built for the xylophone but works on any
// C-centered instrument (switch the Instrument control). The ladder teaches one
// note value per lesson — whole → half → quarter → eighth → sixteenth — then a
// capstone mixes them, with Ode to Joy anchoring the melodic moments.
//
// Rhythm drills sit on a single clear note (C5) so the eye reads DURATION, not
// pitch; the "slight melody" exercises add a little C-major stepwise motion.

import { exercise, lesson } from '../dsl.js';

// A pure-rhythm drill note and shorthand repeaters keep the notation readable.
const rep = (pitch, dur, n) => Array(n).fill(`${pitch}:${dur}`).join(' ');

export const LESSONS = [
    lesson('whole-notes', {
        title: 'Whole notes — the long note', key: 'C', home: { tonic: 'C', mode: 'major' },
        levelLabel: 'Whole notes', icon: '⭕',
        blurb: 'The longest note: a hollow oval with no stem that lasts a whole bar — four counts. '
            + 'One strike, then let it ring while you count 1-2-3-4.',
    }, [
        exercise('meet', {
            icon: '⭕', title: 'Meet the whole note', subtitle: 'One note, held for four counts',
            story: 'A <strong>whole note</strong> fills a whole bar of 4/4 — count <strong>“1-2-3-4”</strong> out loud '
                + 'and hold it the entire time. Strike once at the start of each bar and let the bar breathe.',
            tips: { xylo: 'One mallet strike per bar — then hands still, just count. Hear how long the bar really is.',
                    piano: 'Press once and hold; count four slow beats before the next note.' },
            notation: 'C5:4 | C5:4 | C5:4 | C5:4', chords: null, practice: null,
        }),
        exercise('steps', {
            icon: '🎵', title: 'Whole notes that move', subtitle: 'Same long note, a few steps apart',
            story: 'Now the whole note changes pitch each bar — but the rhythm is identical: four counts each. '
                + 'Your job is still just to feel the length; the little steps up and down are the “slight melody.”',
            tips: { xylo: 'Move your mallet to the next bar between strikes — no rush, you have four counts.',
                    piano: 'Walk one finger to the next key; hold each for four counts.' },
            notation: 'C5:4 | D5:4 | E5:4 | C5:4', chords: null, practice: 'melody',
        }),
    ]),

    lesson('half-notes', {
        title: 'Half notes — two to a bar', key: 'C', home: { tonic: 'C', mode: 'major' },
        levelLabel: 'Half notes', icon: '🌗',
        blurb: 'A hollow oval WITH a stem, lasting two counts — so two of them fill a bar. '
            + 'Twice as many notes as a whole note; half as long each.',
    }, [
        exercise('meet', {
            icon: '🌗', title: 'Meet the half note', subtitle: 'Two counts each — two per bar',
            story: 'A <strong>half note</strong> lasts <strong>two</strong> counts. Count “1-2, 3-4” and strike on '
                + '<strong>1</strong> and <strong>3</strong>. Two even notes per bar.',
            tips: { xylo: 'Strike on beats 1 and 3; let each ring for two counts.',
                    piano: 'Two presses per bar, holding each for a slow “1-2.”' },
            notation: 'C5:2 C5:2 | C5:2 C5:2 | C5:2 C5:2 | C5:2 C5:2', chords: null, practice: null,
        }),
        exercise('vs-whole', {
            icon: '⚖️', title: 'Whole vs. half', subtitle: 'Feel the difference — one long, then two',
            story: 'Alternate a bar of one <strong>whole note</strong> with a bar of two <strong>half notes</strong>. '
                + 'Same four counts per bar, but one bar has a single note and the next has two. Hear the contrast.',
            tips: { xylo: 'Count steadily and don’t speed up on the half-note bars — the beat stays the same.',
                    piano: 'Keep the counting even; only the number of notes changes.' },
            notation: 'C5:4 | C5:2 C5:2 | C5:4 | C5:2 C5:2', chords: null, practice: null,
        }),
        exercise('tune', {
            icon: '🎵', title: 'A half-note tune', subtitle: 'A little C-major melody in half notes',
            story: 'A gentle melody where every note is a half note. Two counts each, stepping through C major and '
                + 'landing home on a whole note.',
            tips: { xylo: 'Say the letter names as you strike: C, E, D, B…',
                    piano: 'Right hand walks the melody; count “1-2” on each note.' },
            notation: 'C5:2 E5:2 | D5:2 B4:2 | C5:2 D5:2 | C5:4', chords: null, practice: 'melody',
        }),
    ]),

    lesson('quarter-notes', {
        title: 'Quarter notes — the steady beat', key: 'C', home: { tonic: 'C', mode: 'major' },
        levelLabel: 'Quarter notes', icon: '⚫',
        blurb: 'A filled note head with a stem, lasting ONE count — the walking pulse of the music. '
            + 'Four to a bar: the beat you tap your foot to.',
    }, [
        exercise('meet', {
            icon: '⚫', title: 'Meet the quarter note — the beat', subtitle: 'One count each — four per bar',
            story: 'The <strong>quarter note</strong> is the <strong>beat</strong> itself: count '
                + '<strong>“1-2-3-4”</strong> and play one note on every number. This steady pulse is the heartbeat '
                + 'under every other rhythm.',
            tips: { xylo: 'Tap your foot on each strike — foot and mallet together, nice and even.',
                    piano: 'One note per beat, like a steady walk. Don’t rush.' },
            notation: `${rep('C5', 1, 4)} | ${rep('C5', 1, 4)} | ${rep('C5', 1, 4)} | ${rep('C5', 1, 4)}`,
            chords: null, practice: null,
        }),
        exercise('vs-half', {
            icon: '⚖️', title: 'Quarters and halves together', subtitle: 'Short-short-long',
            story: 'Mix the beat you just learned with half notes: two quick <strong>quarters</strong> then a longer '
                + '<strong>half</strong>. “1, 2, 3-hold.” Feel how the half note is worth exactly two quarters.',
            tips: { xylo: 'Count every beat even when a note is held — the held note covers two of them.',
                    piano: 'Keep the pulse steady; the half note simply lasts through two beats.' },
            notation: 'C5 C5 C5:2 | C5 C5 C5:2 | C5:2 C5 C5 | C5:4', chords: null, practice: null,
        }),
        exercise('ode', {
            icon: '🎶', title: 'Ode to Joy (in quarter notes)', subtitle: 'Beethoven’s tune — almost all quarters',
            story: 'Here’s the payoff: <strong>Ode to Joy</strong> is built almost entirely from quarter notes. '
                + 'Read it one beat at a time — steady quarters, then a half note to end the phrase. You already have '
                + 'every rhythm you need to play a famous melody.',
            tips: { xylo: 'Say the letters (E E F G…) and keep the beat steady — this is a real song now.',
                    piano: 'Right hand plays the tune; keep every quarter even and the phrase will sing.' },
            notation: 'E4 E4 F4 G4 | G4 F4 E4 D4 | C4 C4 D4 E4 | E4 D4 D4:2', chords: null, practice: 'melody',
        }),
    ]),

    lesson('eighth-notes', {
        title: 'Eighth notes — twice as fast', key: 'C', home: { tonic: 'C', mode: 'major' },
        levelLabel: 'Eighth notes', icon: '🎶',
        blurb: 'A filled note with a FLAG (or beam), lasting half a count — so two fit on every beat. '
            + 'Count “1-and-2-and” and split each beat in two.',
    }, [
        exercise('meet', {
            icon: '🎶', title: 'Meet the eighth note', subtitle: 'A pair of eighths, with a quarter to land on',
            story: 'An <strong>eighth note</strong> is half a beat, so <strong>two</strong> share one count. We ease in '
                + 'gently: land on a <strong>quarter</strong>, then play a quick <strong>pair of eighths</strong> — '
                + '“1, <em>2-and</em>, 3, <em>4-and</em>.” The quarters are your resting spots between the quick pairs, '
                + 'so you’re never hammering the bar over and over.',
            tips: { xylo: 'Two soft taps for the pair (try left-right), then rest on the quarter. Never a long fast run.',
                    piano: 'Say “1, 2-and” — one note, then a quick two. The quarter gives your hand a beat to reset.' },
            notation: 'C5 C5:0.5 C5:0.5 C5 C5:0.5 C5:0.5 | C5 C5:0.5 C5:0.5 C5 C5:0.5 C5:0.5 '
                + '| C5:0.5 C5:0.5 C5 C5:0.5 C5:0.5 C5 | C5:4',
            chords: null, practice: null,
        }),
        exercise('mix', {
            icon: '⚖️', title: 'Quarters and eighths', subtitle: 'Mixing the beat with its halves',
            story: 'Now blend them: some beats get one <strong>quarter</strong>, some get a <strong>pair of eighths</strong>. '
                + 'The “and” is where the extra note sneaks in. Never more than two fast notes in a row — a quarter is '
                + 'always close by to land on.',
            tips: { xylo: 'Keep tapping the beat with your foot; the eighths fill the gaps between taps.',
                    piano: 'Count “1-and-2-and” under everything, even the quarter-note beats.' },
            notation: 'C5 C5:0.5 C5:0.5 C5 C5 | C5 C5 C5:0.5 C5:0.5 C5 | C5:0.5 C5:0.5 C5 C5:0.5 C5:0.5 C5 | C5:4',
            chords: null, practice: null,
        }),
        exercise('run', {
            icon: '🎵', title: 'An eighth-note run', subtitle: 'A flowing C-major line',
            story: 'A little melody that flows in eighth notes — up and down the C-major scale — then lands on a longer '
                + 'note to breathe. Light and even.',
            tips: { xylo: 'Alternate mallets and let it flow like running water.',
                    piano: 'Keep the fingers light and the eighths smooth and connected.' },
            notation: 'C4:0.5 D4:0.5 E4:0.5 F4:0.5 G4:0.5 F4:0.5 E4:0.5 D4:0.5 | C4:0.5 E4:0.5 G4:0.5 E4:0.5 C4:2',
            chords: null, practice: 'melody',
        }),
    ]),

    lesson('sixteenth-notes', {
        title: 'Sixteenth notes — four to a beat', key: 'C', home: { tonic: 'C', mode: 'major' },
        levelLabel: 'Sixteenth notes', icon: '⚡',
        blurb: 'A filled note with TWO flags, lasting a quarter of a count — four on every beat. '
            + 'The fastest value here: count “1-e-and-a.”',
    }, [
        exercise('meet', {
            icon: '⚡', title: 'Meet the sixteenth note', subtitle: 'Just two at a time, tucked after an eighth',
            story: 'A <strong>sixteenth note</strong> is a quarter of a beat — four <em>could</em> fit on one count, but '
                + 'we won’t hit sixteen in a row (way too much!). We ease in: an <strong>eighth</strong>, then just '
                + '<strong>two</strong> quick sixteenths, with a <strong>quarter</strong> to land on. The last busy bar '
                + 'tries one group of four — still with quarters on either side. Notice the <strong>two flags</strong>: '
                + 'that’s how you spot a sixteenth. Small bites, always a resting note nearby.',
            tips: { xylo: 'Alternate hands for the two quick ones, then breathe on the quarter. Slow and even beats fast and messy.',
                    piano: 'Say “1, 2-e-and” — the two sixteenths are the “e-and.” The quarter lets your hand reset.' },
            notation: 'C5:0.5 C5:0.25 C5:0.25 C5 C5:0.5 C5:0.25 C5:0.25 C5 '
                + '| C5:0.5 C5:0.25 C5:0.25 C5 C5:0.5 C5:0.25 C5:0.25 C5 '
                + '| C5 C5:0.25 C5:0.25 C5:0.25 C5:0.25 C5 C5 | C5:4',
            chords: null, practice: null,
        }),
        exercise('mix', {
            icon: '⚖️', title: 'Eighths and sixteenths', subtitle: 'The classic pair patterns — ♪♬ and ♬♪',
            story: 'The two patterns you’ll meet everywhere: an <strong>eighth then two sixteenths</strong> (♪♬), and '
                + '<strong>two sixteenths then an eighth</strong> (♬♪). Only two fast notes at a time, with '
                + '<strong>quarters</strong> to rest on. Feel how each beat still adds up to one count.',
            tips: { xylo: 'Keep the beat slow and steady — let the two fast notes be crisp, then land on the quarter.',
                    piano: 'Count “1-e-and-a” under every beat so the groupings line up.' },
            notation: 'C5:0.5 C5:0.25 C5:0.25 C5:0.25 C5:0.25 C5:0.5 C5 C5 '
                + '| C5 C5:0.5 C5:0.25 C5:0.25 C5:0.25 C5:0.25 C5:0.5 C5 | C5:4',
            chords: null, practice: null,
        }),
        exercise('run', {
            icon: '🎵', title: 'A sixteenth-note run', subtitle: 'A quick C-major scale, up and down',
            story: 'A full C-major scale in sixteenth notes — up and back down in a single bar — then a whole note to '
                + 'rest. Take it slowly at first and speed up only when it’s even.',
            tips: { xylo: 'Alternate mallets the whole way; keep them close to the bars for speed.',
                    piano: 'Standard C-scale fingering; let the run be smooth before it’s fast.' },
            notation: 'C4:0.25 D4:0.25 E4:0.25 F4:0.25 G4:0.25 A4:0.25 B4:0.25 C5:0.25 '
                + 'B4:0.25 A4:0.25 G4:0.25 F4:0.25 E4:0.25 D4:0.25 C4:0.25 C4:0.25 | C4:4',
            chords: null, practice: 'melody',
        }),
    ]),

    lesson('all-together', {
        title: 'Everything together', key: 'C', home: { tonic: 'C', mode: 'major' },
        levelLabel: 'Capstone', icon: '🎼',
        blurb: 'All five note values side by side, and a full straight-rhythm Ode to Joy to put your reading to work.',
    }, [
        exercise('ladder', {
            icon: '🪜', title: 'The rhythm ladder', subtitle: 'One bar each: whole → half → quarter → eighth → sixteenth',
            story: 'Every value in a row, each bar twice as fast as the one before: one <strong>whole</strong>, two '
                + '<strong>halves</strong>, four <strong>quarters</strong>, eight <strong>eighths</strong>, sixteen '
                + '<strong>sixteenths</strong>. Play it slowly and hear the notes double in speed each bar — the whole '
                + 'system on one line.',
            tips: { xylo: 'Keep the beat identical the whole way; only the number of notes per beat changes.',
                    piano: 'Tap a steady pulse; each bar simply subdivides that pulse more finely.' },
            notation: `C5:4 | C5:2 C5:2 | ${rep('C5', 1, 4)} | ${rep('C5', 0.5, 8)} | ${rep('C5', 0.25, 16)}`,
            chords: null, practice: null,
        }),
        exercise('ode', {
            icon: '🎉', title: 'Ode to Joy — the whole phrase', subtitle: 'Beethoven’s theme in straight rhythm',
            story: 'The full eight-bar <strong>Ode to Joy</strong> theme, written in the note values you now know — '
                + 'mostly quarters, with half notes to close each phrase. Read it, play it, sing it. From counting '
                + '“1-2-3-4” to a real Beethoven melody: that’s the whole journey.',
            tips: { xylo: 'Steady quarters, and let the half notes ring. Say the letters if it helps.',
                    piano: 'Keep the pulse even and the phrases will shape themselves. Sing along to lock it in.' },
            notation: 'E4 E4 F4 G4 | G4 F4 E4 D4 | C4 C4 D4 E4 | E4 D4 D4:2 '
                + '| E4 E4 F4 G4 | G4 F4 E4 D4 | C4 C4 D4 E4 | D4 C4 C4:2',
            chords: null, practice: 'melody',
        }),
    ]),
];
