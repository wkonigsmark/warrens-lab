// lessons.js — hand-authored guided lessons (Phase 1A). A lesson teaches a tune
// step by step: each step reveals a few more notes as "ghost" targets the student
// taps to fill in, so the melody grows under their hands. Prompts name the
// musical *change* ("leap up to G", "step down"). Same compact DSL as presets.js
// — steps hold the CUMULATIVE phrase-so-far, so the song builds up across steps.

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
    return notes;
}

function lesson(id, title, subtitle, base, steps) {
    return {
        id, title, subtitle, ...base,
        steps: steps.map((s) => ({ prompt: s.prompt, target: parse(s.notes) })),
    };
}

// All current lessons live on the default xylophone, 4 bars, treble −1 octave.
const XYLO = { rangeId: 'c5-a6', clef: 'treble', staffShift: -1, bars: 4, tempo: 90 };

export const LESSONS = [
    lesson('lesson-hotcross', 'Hot Cross Buns', 'Your very first tune — just three notes', XYLO, [
        { prompt: 'Start high and step down: E, D, C 🎵', notes: 'E5 D5 C5:2' },
        { prompt: 'Now say it again — E, D, C', notes: 'E5 D5 C5:2 | E5 D5 C5:2' },
        { prompt: 'Two little C’s, then two D’s', notes: 'E5 D5 C5:2 | E5 D5 C5:2 | C5 C5 D5 D5' },
        { prompt: 'Finish like you started: E, D, C!', notes: 'E5 D5 C5:2 | E5 D5 C5:2 | C5 C5 D5 D5 | E5 D5 C5:2' },
    ]),

    lesson('lesson-twinkle', 'Twinkle Twinkle (Line 1)', 'The most famous melody of all', XYLO, [
        { prompt: 'Twinkle, twinkle — tap C two times', notes: 'C5 C5' },
        { prompt: 'Little star — leap up high to G!', notes: 'C5 C5 G5 G5' },
        { prompt: 'Up to A… then back down to G', notes: 'C5 C5 G5 G5 | A5 A5 G5:2' },
        { prompt: 'How I wonder — step down to F, E', notes: 'C5 C5 G5 G5 | A5 A5 G5:2 | F5 F5 E5 E5' },
        { prompt: 'What you are — D, D, rest on C 🌟', notes: 'C5 C5 G5 G5 | A5 A5 G5:2 | F5 F5 E5 E5 | D5 D5 C5:2' },
    ]),

    lesson('lesson-ode', 'Ode to Joy (Line 1)', 'A famous tune by Beethoven', XYLO, [
        { prompt: 'Start in the middle: E, E, F, G', notes: 'E5 E5 F5 G5' },
        { prompt: 'Now come back down: G, F, E, D', notes: 'E5 E5 F5 G5 | G5 F5 E5 D5' },
        { prompt: 'Down to the bottom: C, C, D, E', notes: 'E5 E5 F5 G5 | G5 F5 E5 D5 | C5 C5 D5 E5' },
        { prompt: 'Almost home — E, then rest on D', notes: 'E5 E5 F5 G5 | G5 F5 E5 D5 | C5 C5 D5 E5 | E5 D5 D5:2' },
    ]),
];

export const lessonById = (id) => LESSONS.find((l) => l.id === id);

// Build a lesson from analyzed phrases (Phase 1B auto-generation).
export function buildLessonFromAnalysis(title, subtitle, analysis, options = {}) {
    const { simplifyRhythm = false, beatsPerBar = 4, clef = 'treble', staffShift = -1 } = options;

    // Build cumulative steps from the analyzed phrases
    let cumulativeNotes = [];
    const steps = [];

    for (let i = 0; i < analysis.phrases.length; i++) {
        const phrase = analysis.phrases[i];
        cumulativeNotes = [...cumulativeNotes, ...phrase.notes];

        // Remap beats to be contiguous from 0
        const firstStart = cumulativeNotes[0]?.start || 0;
        const remappedNotes = cumulativeNotes.map(n => ({
            ...n,
            start: n.start - firstStart,
        }));

        // Optionally simplify rhythm for early steps
        let notesForStep = remappedNotes;
        if (simplifyRhythm && i < Math.ceil(analysis.phrases.length * 0.66)) {
            notesForStep = notesForStep.map(n => ({ ...n, durBeats: 1 }));
        }

        steps.push({
            prompt: `${phrase.label}: ${i + 1}/${analysis.phrases.length}`,
            target: notesForStep,
        });
    }

    // Add a final "put it together" step
    if (analysis.phrases.length > 1) {
        const firstStart = cumulativeNotes[0]?.start || 0;
        const allNotes = cumulativeNotes.map(n => ({
            ...n,
            start: n.start - firstStart,
        }));
        steps.push({
            prompt: "Put it together — the complete piece! 🎵",
            target: allNotes,
        });
    }

    // Calculate bars needed
    const totalBeats = cumulativeNotes.reduce((m, n) => Math.max(m, n.start + n.durBeats), 0);
    const barsNeeded = Math.max(4, Math.ceil(totalBeats / beatsPerBar));

    return {
        id: `generated-${Date.now()}`,
        title,
        subtitle,
        rangeId: 'c5-a6',
        clef,
        staffShift,
        bars: barsNeeded,
        tempo: 96,
        timeSignature: '4/4',
        durationId: 'quarter',
        showLetters: true,
        steps: steps.map((s, idx) => ({
            prompt: s.prompt,
            target: s.target,
        })),
    };
}
