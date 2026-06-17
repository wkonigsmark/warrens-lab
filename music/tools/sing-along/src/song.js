// song.js — songs for the sing-along game: a default tune, HookTheory import,
// transposition, and the note↔MIDI helpers. Pure data + functions, no DOM.

const SEMI = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// "C5" / "C#5" → MIDI (C4 = 60). Returns null if unparseable.
export function nameToMidi(name) {
    const m = String(name).match(/^([A-G]#?)(-?\d+)$/);
    return m ? (parseInt(m[2], 10) + 1) * 12 + SEMI[m[1]] : null;
}
export const midiToName = (midi) => NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);

// --- Default song: Twinkle Twinkle (line 1) in Composer note format ---------
// notes: { start (beats), pitch, durBeats }. 4/4, quarter = 1 beat.
export const DEFAULT_SONG = {
    title: 'Twinkle Twinkle',
    bpm: 96,
    notes: [
        { start: 0, pitch: 'C5', durBeats: 1 },
        { start: 1, pitch: 'C5', durBeats: 1 },
        { start: 2, pitch: 'G5', durBeats: 1 },
        { start: 3, pitch: 'G5', durBeats: 1 },
        { start: 4, pitch: 'A5', durBeats: 1 },
        { start: 5, pitch: 'A5', durBeats: 1 },
        { start: 6, pitch: 'G5', durBeats: 2 },
        { start: 8, pitch: 'F5', durBeats: 1 },
        { start: 9, pitch: 'F5', durBeats: 1 },
        { start: 10, pitch: 'E5', durBeats: 1 },
        { start: 11, pitch: 'E5', durBeats: 1 },
        { start: 12, pitch: 'D5', durBeats: 1 },
        { start: 13, pitch: 'D5', durBeats: 1 },
        { start: 14, pitch: 'C5', durBeats: 2 },
    ],
};

// --- HookTheory import (scale-degree → MIDI → pitch) ------------------------
const MODE_INTERVALS = {
    major: [0, 2, 4, 5, 7, 9, 11], ionian: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10], aeolian: [0, 2, 3, 5, 7, 8, 10],
    mixolydian: [0, 2, 4, 5, 7, 9, 10], dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10], lydian: [0, 2, 4, 6, 7, 9, 11], locrian: [0, 1, 3, 5, 6, 8, 10],
};
const HT_TONIC_OCTAVE = 4;

// Parse a HookTheory clipboard JSON object into a song, or return null.
export function fromHookTheory(data, title = 'Pasted song') {
    const htNotes = Array.isArray(data && data.notes) ? data.notes : null;
    if (!htNotes || !htNotes.length || htNotes[0].sd === undefined) return null;

    const key = data.keys && data.keys[0];
    const tonic = key?.tonic || 'C';
    const mode = (key?.scale || 'major').toLowerCase();
    const intervals = MODE_INTERVALS[mode] || MODE_INTERVALS.major;

    const notes = htNotes
        .filter((n) => !n.isRest)
        .map((n) => {
            const sd = parseInt(n.sd, 10) || 1;
            const degIdx = ((sd - 1) % 7 + 7) % 7;
            const midi = nameToMidi(`${tonic}${HT_TONIC_OCTAVE + (n.octave || 0)}`) + intervals[degIdx];
            return { start: (n.beat || 1) - 1, pitch: midiToName(midi), durBeats: n.duration || 1 };
        });
    return notes.length ? { title, bpm: 96, notes } : null;
}

// Accept either a HookTheory clipboard object or a Composer-style {notes:[{pitch...}]}.
export function parseSong(text, title) {
    let data;
    try { data = JSON.parse(text); } catch (_) { return null; }
    const ht = fromHookTheory(data, title);
    if (ht) return ht;
    if (Array.isArray(data.notes) && data.notes[0] && data.notes[0].pitch !== undefined) {
        return { title: title || data.title || 'Pasted song', bpm: data.tempo || data.bpm || 96, notes: data.notes };
    }
    return null;
}

// --- Transposition ----------------------------------------------------------
export function transposeNotes(notes, semitones) {
    if (!semitones) return notes.map((n) => ({ ...n }));
    return notes.map((n) => {
        const midi = nameToMidi(n.pitch);
        return { ...n, pitch: midi == null ? n.pitch : midiToName(midi + semitones) };
    });
}

// Centre a song's median pitch on a target MIDI by whole octaves (the generic
// "comfy register" used before the singer's real range is known).
export function autoOctave(notes, targetMidi = 67 /* G4 */) {
    const midis = notes.map((n) => nameToMidi(n.pitch)).filter((m) => m != null).sort((a, b) => a - b);
    if (!midis.length) return 0;
    const median = midis[Math.floor(midis.length / 2)];
    return Math.round((targetMidi - median) / 12) * 12;
}

// Low/high/centre MIDI of a song (or a measured voice).
export function rangeOf(notes) {
    const midis = notes.map((n) => nameToMidi(n.pitch)).filter((m) => m != null);
    if (!midis.length) return null;
    const lo = Math.min(...midis), hi = Math.max(...midis);
    return { lo, hi, center: (lo + hi) / 2 };
}

// Best WHOLE-OCTAVE shift to seat the song inside the singer's comfortable range
// (octaves only → the key/tune is unchanged, just a comfier register). Returns
// { shift, fits } where fits = the shifted song stays within the singer's range.
export function suggestOctaveShift(notes, singerLo, singerHi) {
    const r = rangeOf(notes);
    if (!r) return { shift: 0, fits: true };
    const singerCenter = (singerLo + singerHi) / 2;
    const shift = Math.round((singerCenter - r.center) / 12) * 12;
    const fits = (r.lo + shift) >= singerLo - 1 && (r.hi + shift) <= singerHi + 1;
    return { shift, fits };
}

// --- Scoring helpers (pure) -------------------------------------------------
// Active target note at a given beat (notes assumed sorted, non-overlapping).
export function noteAtBeat(notes, beat) {
    for (const n of notes) if (beat >= n.start && beat < n.start + n.durBeats) return n;
    return null;
}

// "In tune?" — honest (exact octave) within a semitone tolerance.
export const inTune = (liveMidi, targetMidi, tol) => Math.abs(liveMidi - targetMidi) <= tol;

// Final accuracy 0..1 from each note's accumulated in-tune beats.
export function accuracy(playNotes) {
    let hit = 0, total = 0;
    for (const n of playNotes) { hit += Math.min(n.hitBeats, n.durBeats); total += n.durBeats; }
    return total ? hit / total : 0;
}
