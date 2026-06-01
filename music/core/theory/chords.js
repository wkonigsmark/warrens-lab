// chords.js — chord-quality catalog and chord construction.
//
// Lifted from the guitar tool's CHORD_FORMS so the recognition engine and any
// instrument tool share ONE definition of what each chord quality means.
// Intervals are semitone offsets from the chord root.

import { pcSet } from './pitch-class.js';

// key -> { intervals, label, group }
// `group` mirrors the optgroup structure in the guitar UI so the Root+Quality
// selector can render the same familiar grouping.
export const CHORD_QUALITIES = {
    // Major
    maj:      { intervals: [0, 4, 7],            label: 'Major',          group: 'Major' },
    maj7:     { intervals: [0, 4, 7, 11],        label: 'Major 7',        group: 'Major' },
    maj9:     { intervals: [0, 4, 7, 11, 2],     label: 'Major 9',        group: 'Major' },
    maj13:    { intervals: [0, 4, 7, 11, 9],     label: 'Major 13',       group: 'Major' },
    maj6:     { intervals: [0, 4, 7, 9],         label: 'Major 6',        group: 'Major' },
    // Minor
    min:      { intervals: [0, 3, 7],            label: 'Minor',          group: 'Minor' },
    min7:     { intervals: [0, 3, 7, 10],        label: 'Minor 7',        group: 'Minor' },
    min9:     { intervals: [0, 3, 7, 10, 2],     label: 'Minor 9',        group: 'Minor' },
    min11:    { intervals: [0, 3, 7, 10, 5],     label: 'Minor 11',       group: 'Minor' },
    min13:    { intervals: [0, 3, 7, 10, 9],     label: 'Minor 13',       group: 'Minor' },
    min6:     { intervals: [0, 3, 7, 9],         label: 'Minor 6',        group: 'Minor' },
    m7b5:     { intervals: [0, 3, 6, 10],        label: 'm7♭5 (Half-Dim)', group: 'Minor' },
    // Dominant
    dom7:     { intervals: [0, 4, 7, 10],        label: 'Dominant 7',     group: 'Dominant' },
    dom7b9:   { intervals: [0, 4, 7, 10, 1],     label: 'Dominant 7♭9',   group: 'Dominant' },
    dom9:     { intervals: [0, 4, 7, 10, 2],     label: 'Dominant 9',     group: 'Dominant' },
    dom11:    { intervals: [0, 4, 7, 10, 2, 5],  label: 'Dominant 11',    group: 'Dominant' },
    dom13:    { intervals: [0, 4, 7, 10, 9],     label: 'Dominant 13',    group: 'Dominant' },
    dom13_9:  { intervals: [0, 4, 7, 10, 2, 9],  label: 'Dominant 13 (+9)', group: 'Dominant' },
    dom13b9:  { intervals: [0, 4, 7, 10, 1, 9],  label: 'Dominant 13 (♭9)', group: 'Dominant' },
    dom13s11: { intervals: [0, 4, 7, 10, 6, 9],  label: 'Dominant 13 (♯11)', group: 'Dominant' },
    '7sus4':  { intervals: [0, 5, 7, 10],        label: '7sus4',          group: 'Dominant' },
    // Diminished / Augmented
    dim:      { intervals: [0, 3, 6],            label: 'Diminished',     group: 'Diminished / Augmented' },
    dim7:     { intervals: [0, 3, 6, 9],         label: 'Diminished 7',   group: 'Diminished / Augmented' },
    aug:      { intervals: [0, 4, 8],            label: 'Augmented',      group: 'Diminished / Augmented' },
    // Suspended
    sus4:     { intervals: [0, 5, 7],            label: 'Sus4',           group: 'Suspended' },
    sus2:     { intervals: [0, 2, 7],            label: 'Sus2',           group: 'Suspended' },
};

// Ordered group names for building the quality dropdown.
export const QUALITY_GROUPS = ['Major', 'Minor', 'Dominant', 'Diminished / Augmented', 'Suspended'];

// quality key -> intervals only. The guitar tool consumes this shape directly
// (its old CHORD_FORMS), so both tools share one source of chord definitions.
export const CHORD_INTERVALS = Object.fromEntries(
    Object.entries(CHORD_QUALITIES).map(([key, def]) => [key, def.intervals]),
);

// Build a chord object from a root pitch class (0–11) and a quality key.
// Returns { rootPc, quality, pcs }. Throws on an unknown quality so typos in
// calling code surface immediately (the UI only ever passes known keys).
export function buildChord(rootPc, quality) {
    const def = CHORD_QUALITIES[quality];
    if (!def) throw new Error(`Unknown chord quality: ${quality}`);
    return {
        rootPc,
        quality,
        pcs: pcSet(rootPc, def.intervals),
    };
}

// Semantic role of each interval, used by the engine to weight "defining"
// tones (root/3rd/7th identify a chord's function) above color tones.
// Maps semitone-from-root -> weight.
export const INTERVAL_WEIGHT = {
    0: 3,   // root
    3: 3, 4: 3,         // minor / major 3rd
    10: 2, 11: 2,       // b7 / maj7
    6: 2, 7: 1, 8: 1,   // 5th family (b5/5/#5)
    // everything else (2,5,9,1) is color/extension -> default weight 1
};
