// hooktheory-converter.js
// Converts HookTheory export format to our composer song format.
// Usage: convertHookTheory(hooktheoryJson, config)

/**
 * Scale degree (1-7) to pitch letter, given a tonic and mode.
 * E.g., in G Mixolydian: 1=G, 2=A, 3=B, 4=C, 5=D, 6=E, 7=F
 */
function sdToPitch(scaleDegree, tonic, mode = 'major') {
    const intervals = {
        major: [0, 2, 4, 5, 7, 9, 11],        // W W H W W W H
        minor: [0, 2, 3, 5, 7, 8, 10],        // W H W W H W W (natural minor)
        mixolydian: [0, 2, 4, 5, 7, 9, 10],   // W W H W W H W (like major but b7)
        dorian: [0, 2, 3, 5, 7, 9, 10],       // W H W W W H W
    };

    // Map tonic letter to semitone offset from C
    const noteValues = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

    // Find tonic index in the chromatic scale
    const tonicSemi = noteValues[tonic];
    const modeIntervals = intervals[mode] || intervals.major;

    // Scale degree 1-indexed, so subtract 1 for array index
    const semitoneOffset = modeIntervals[(scaleDegree - 1) % 7];
    const pitchSemitone = (tonicSemi + semitoneOffset) % 12;

    // Map back to note letter
    for (const [letter, semi] of Object.entries(noteValues)) {
        if (semi === pitchSemitone) {
            return letter;
        }
    }
    return 'C'; // fallback
}

/**
 * Main converter: HookTheory JSON → composer song format
 */
export function convertHookTheory(hookJson, config = {}) {
    const {
        title = 'Untitled',
        composer = '',
        rangeId = 'c5-a6',
        baseOctave = 4, // The octave of scale degree 1 (e.g., octave 0 in HT might be 4 in standard notation)
        timeSignature = '4/4',
        tempo = 96,
    } = config;

    // Extract key information
    const keyInfo = hookJson.keys && hookJson.keys[0];
    const tonic = keyInfo?.tonic || 'C';
    const mode = keyInfo?.scale || 'major';

    // Convert notes
    const notes = (hookJson.notes || []).map(note => {
        if (note.isRest) {
            return null; // Will filter out
        }

        // Convert scale degree + octave to pitch
        const letter = sdToPitch(parseInt(note.sd), tonic, mode);
        const octave = baseOctave + note.octave;
        const pitch = `${letter}${octave}`;

        return {
            start: note.beat - 1, // HookTheory is 1-indexed, we use 0-indexed
            pitch,
            durBeats: note.duration,
        };
    }).filter(Boolean);

    // Calculate total beats
    const totalBeats = notes.reduce((max, n) => Math.max(max, n.start + n.durBeats), 0);
    const beatsPerBar = timeSignature === '3/4' ? 3 : 4;
    const bars = Math.max(4, Math.ceil(totalBeats / beatsPerBar));

    return {
        id: `song-${Date.now()}`,
        title,
        composer,
        rangeId,
        clef: 'treble',
        staffShift: -1, // Xylophone transposition
        bars,
        timeSignature,
        durationId: 'quarter',
        tempo,
        showLetters: true,
        notes,
        builtin: false,
        source: 'hooktheory',
    };
}

/**
 * Helper: convert the compact beat-token notation (for presets)
 * Returns a compact string like "C5 D5 E5:2 F5 ..."
 */
export function toCompactNotation(song) {
    const tokens = [];
    let currentBeat = 0;

    for (const note of song.notes) {
        // Add rests if there's a gap
        if (note.start > currentBeat) {
            const restDur = note.start - currentBeat;
            tokens.push(`_:${restDur}`);
        }

        // Add the note
        const durStr = note.durBeats === 1 ? '' : `:${note.durBeats}`;
        tokens.push(`${note.pitch}${durStr}`);

        currentBeat = note.start + note.durBeats;
    }

    return tokens.join(' ');
}

// Example usage:
// const hookJson = { /* HookTheory export */ };
// const song = convertHookTheory(hookJson, {
//     title: "Shake It Off",
//     composer: "Taylor Swift",
//     baseOctave: 4,
// });
// console.log(song);
// console.log(toCompactNotation(song));
