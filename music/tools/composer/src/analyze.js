// analyze.js — intelligent phrase detection and lesson auto-generation (Phase 1B).
// Given a loaded song, detect musical phrases (boundaries, contours, patterns) and
// build cumulative lesson steps that teach the song piece by piece.

import { BEATS_PER_BAR } from './model.js';

// Analyze a note array and return detected phrases + metadata.
// Returns: { phrases: [{notes: [...], label: "..."}], metadata: {...} }
export function analyzeForPhrases(notes, bars, beatsPerBar = 4) {
    if (!notes || notes.length === 0) return { phrases: [], metadata: {} };

    // Detect where phrase boundaries likely fall
    const boundaries = detectPhraseBoundaries(notes, beatsPerBar);

    // Group notes by detected boundaries
    const phrases = groupNotesByPhrase(notes, boundaries);

    // Assign pedagogical labels based on contour and position
    const labeledPhrases = phrases.map((phrase, i) => ({
        notes: phrase,
        index: i,
        label: generatePhraseLabel(phrase, i, phrases.length),
        startBeat: phrase[0]?.start || 0,
        endBeat: phrase[phrase.length - 1] ?
            phrase[phrase.length - 1].start + phrase[phrase.length - 1].durBeats : 0,
    }));

    return {
        phrases: labeledPhrases,
        totalNotes: notes.length,
        totalBeats: notes.reduce((m, n) => Math.max(m, n.start + n.durBeats), 0),
        detectedBoundaries: boundaries,
    };
}

// Detect phrase boundaries by analyzing gaps, rhythm changes, and contour.
function detectPhraseBoundaries(notes, beatsPerBar) {
    if (notes.length < 2) return [];

    const boundaries = [];
    const timingGaps = [];
    const rhythmShifts = [];
    const contourChanges = [];

    // Analyze timing gaps (rests or space between notes)
    for (let i = 0; i < notes.length - 1; i++) {
        const endOfCurrent = notes[i].start + notes[i].durBeats;
        const startOfNext = notes[i + 1].start;
        const gap = startOfNext - endOfCurrent;
        if (gap > 0.1) timingGaps.push({ index: i, gap }); // significant rest
    }

    // Analyze rhythm changes (duration pattern shifts)
    for (let i = 1; i < notes.length - 1; i++) {
        const prevDur = notes[i - 1].durBeats;
        const currDur = notes[i].durBeats;
        const nextDur = notes[i + 1].durBeats;
        // Transition from quarters to eighths or vice versa
        if ((prevDur >= 1 && currDur < 1) || (prevDur < 1 && currDur >= 1)) {
            rhythmShifts.push({ index: i, prevDur, currDur });
        }
    }

    // Analyze contour changes (direction reversals: up-down or down-up)
    const pitchNumbers = notes.map(n => {
        const p = n.pitch;
        const letter = p[0];
        const octave = parseInt(p[1]);
        const letterValues = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
        return octave * 12 + (letterValues[letter] || 0);
    });

    for (let i = 1; i < pitchNumbers.length - 1; i++) {
        const prev = pitchNumbers[i] - pitchNumbers[i - 1];
        const next = pitchNumbers[i + 1] - pitchNumbers[i];
        // Direction reversal (up then down, or down then up)
        if ((prev > 0 && next < 0) || (prev < 0 && next > 0)) {
            contourChanges.push({ index: i });
        }
    }

    // Detect barlines as potential phrase boundaries
    const barlineBoundaries = [];
    for (let i = 0; i < notes.length - 1; i++) {
        const endBeat = notes[i].start + notes[i].durBeats;
        const nextStart = notes[i + 1].start;
        // Check if a bar boundary falls between these notes
        const bpb = beatsPerBar || 4;
        if (Math.floor(endBeat / bpb) < Math.floor(nextStart / bpb)) {
            barlineBoundaries.push({ index: i, type: 'barline' });
        }
    }

    // Weight and merge signals: prioritize timing gaps, then rhythm shifts, then contour
    const candidates = [
        ...timingGaps.map(g => ({ index: g.index, weight: 3, type: 'gap', gap: g.gap })),
        ...rhythmShifts.map(r => ({ index: r.index, weight: 2, type: 'rhythm' })),
        ...contourChanges.map(c => ({ index: c.index, weight: 1, type: 'contour' })),
        ...barlineBoundaries.map(b => ({ index: b.index, weight: 0.5, type: 'barline' })),
    ];

    // Remove duplicates, keep highest weight
    const deduped = {};
    for (const cand of candidates) {
        if (!deduped[cand.index] || cand.weight > deduped[cand.index].weight) {
            deduped[cand.index] = cand;
        }
    }

    // Convert to array, filter low-weight ones, sort by index
    const filtered = Object.values(deduped)
        .filter(c => c.weight >= 1) // barline-only boundaries are weak signals
        .sort((a, b) => a.index - b.index);

    // Extract the boundary indices (where to split)
    return filtered.map(c => c.index);
}

// Group notes by detected boundaries into separate phrases.
function groupNotesByPhrase(notes, boundaries) {
    if (boundaries.length === 0) {
        // No boundaries: treat the whole thing as one phrase
        return [notes];
    }

    const phrases = [];
    let start = 0;

    for (const boundary of boundaries) {
        // Include notes from start to boundary (inclusive)
        phrases.push(notes.slice(start, boundary + 1));
        start = boundary + 1;
    }

    // Add remaining notes after the last boundary
    if (start < notes.length) {
        phrases.push(notes.slice(start));
    }

    return phrases.filter(p => p.length > 0);
}

// Generate a pedagogical label for a phrase (e.g., "Opening", "Build", "Climax").
function generatePhraseLabel(phraseNotes, phraseIndex, totalPhrases) {
    const labels = [
        "Opening",
        "Build",
        "Bridge",
        "Climax",
        "Resolution",
        "Outro",
    ];

    // Simple strategy: assign labels based on position in song
    if (phraseIndex < labels.length) {
        return labels[phraseIndex];
    }

    // For longer songs, cycle or number them
    return `Phrase ${phraseIndex + 1}`;
}

// Build cumulative lesson steps from detected phrases.
// Each step includes all notes up to and including that phrase.
export function buildLessonSteps(phrases, options = {}) {
    const { simplifyRhythm = false } = options;
    const steps = [];

    let cumulativeNotes = [];

    for (let i = 0; i < phrases.length; i++) {
        const phrase = phrases[i];

        // Accumulate: add this phrase's notes to all previous ones
        cumulativeNotes = [...cumulativeNotes, ...phrase.notes];

        // For display, re-map beat positions to be contiguous from 0
        const remappedNotes = cumulativeNotes.map((n, idx) => {
            if (idx === 0) return { ...n, start: 0 };
            const prevNote = cumulativeNotes[idx - 1];
            const prevEnd = cumulativeNotes[idx - 1].start + cumulativeNotes[idx - 1].durBeats;
            return { ...n, start: n.start - cumulativeNotes[0].start };
        });

        // Optionally simplify rhythm for early steps
        let notesForStep = remappedNotes;
        if (simplifyRhythm && i < Math.ceil(phrases.length * 0.66)) {
            notesForStep = notesForStep.map(n => ({ ...n, durBeats: 1 }));
        }

        steps.push({
            index: i,
            prompt: phrase.label,
            target: notesForStep,
        });
    }

    // Add a final "Put it together" step if there's more than one phrase
    if (phrases.length > 1) {
        const allNotes = cumulativeNotes.map((n, idx) => ({
            ...n,
            start: n.start - cumulativeNotes[0].start,
        }));
        steps.push({
            index: phrases.length,
            prompt: "Put it together — the whole phrase!",
            target: allNotes,
        });
    }

    return steps;
}

// Simplify rhythm: convert all notes to quarters (useful for early lesson steps).
export function simplifyRhythm(notes) {
    return notes.map(n => ({ ...n, durBeats: 1 }));
}

// Narrow range: restrict notes to only the pitches used in a given phrase.
export function narrowRange(notes, phraseNotes) {
    const usedPitches = new Set(phraseNotes.map(n => n.pitch));
    return notes.filter(n => usedPitches.has(n.pitch));
}
