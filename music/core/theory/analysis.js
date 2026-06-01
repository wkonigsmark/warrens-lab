// analysis.js — the recognition engine.
//
// Given a progression (ordered chords from chords.js) and the scale catalog
// (injected, from scales.js), produce a LAYERED, FORGIVING set of suggestions:
//
//   global  : ranked key/modal-center candidates for the whole progression
//   perChord: for each chord, the scale to play and a few color options,
//             annotated by how the chord relates to the global home base.
//
// Philosophy: never a single verdict. Always ranked candidates with a
// confidence band, and graceful output when nothing fits cleanly.
//
// Pure functions, no DOM — runs in the browser and under node tests.

import {
    isSubset, intersectionSize, difference, formatPc, mod12,
} from './pitch-class.js';
import { CHORD_QUALITIES, INTERVAL_WEIGHT } from './chords.js';
import { scalePcs, isHeptatonic } from './scales.js';

// How hard distinct outside notes drag a candidate's score down. Small enough
// that a mostly-fitting scale still ranks well (forgiving), large enough to
// prefer tighter fits.
const OUTSIDE_PENALTY = 0.05;
// Modal cues only break ties between equally-fitting note-collections, so they
// ride on a tiny multiplier and can never outweigh actual note coverage.
const MODAL_EPSILON = 0.001;

// Accumulate weighted chord tones across the whole progression. A pitch class
// gets weight from its role in each chord it appears in (root/3rd/7th matter
// more than color tones); appearing in several chords accumulates.
function weightedChordTones(progression) {
    const weights = new Map();
    for (const chord of progression) {
        const intervals = CHORD_QUALITIES[chord.quality].intervals;
        intervals.forEach((interval, idx) => {
            const pc = mod12(chord.rootPc + interval);
            const w = INTERVAL_WEIGHT[interval] ?? 1;
            weights.set(pc, (weights.get(pc) || 0) + w);
        });
    }
    return weights;
}

// Score one candidate note-collection against the weighted tones.
// coverage = fraction of weighted chord-mass the scale explains; then a small
// penalty per distinct outside note.
function scoreCandidate(candidatePcs, toneWeights) {
    let inside = 0, total = 0;
    const outside = [];
    for (const [pc, w] of toneWeights) {
        total += w;
        if (candidatePcs.has(pc)) inside += w;
        else outside.push(pc);
    }
    const coverage = total === 0 ? 0 : inside / total;
    const score = Math.max(0, coverage - OUTSIDE_PENALTY * outside.length);
    return { score, coverage, outside: outside.sort((a, b) => a - b) };
}

// Default likelihood of each mode as the reading of a note-collection. Ionian
// (major) and Aeolian (natural minor) are what the ear assumes by default; the
// other modes are real but need stronger structural evidence (e.g. the same
// chord opening AND closing the phrase) to be chosen over their parent major.
const MODE_DEFAULT = {
    'major': 1.0,
    'natural-minor': 0.85,
    'dorian': 0.5,
    'mixolydian': 0.5,
    'phrygian': 0.3,
    'lydian': 0.3,
    'locrian': 0.1,
};

// Structural support for a given tonic: the mode-default bias, plus the ear
// hearing the first and last chord as home, plus any chord rooted on the tonic.
// All of this rides under MODAL_EPSILON so it only breaks coverage ties.
function tieBonus(scale, tonicPc, progression) {
    let bonus = MODE_DEFAULT[scale.id] ?? 0.4;
    const first = progression[0];
    const last = progression[progression.length - 1];
    if (first && first.rootPc === tonicPc) bonus += 0.6;
    if (last && last.rootPc === tonicPc) bonus += 0.6;
    bonus += progression.filter((c) => c.rootPc === tonicPc).length * 0.4;
    return bonus;
}

function confidenceBand(coverage) {
    if (coverage >= 0.999) return 'strong';
    if (coverage >= 0.85) return 'likely';
    return 'loose';
}

// Ordered pitch classes of a collection starting from a tonic (for degree math).
function orderedFromTonic(pcsSet, tonicPc) {
    return [...pcsSet].sort((a, b) => mod12(a - tonicPc) - mod12(b - tonicPc));
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
function romanFor(degreeIndex, quality) {
    let r = ROMAN[degreeIndex] || '?';
    const def = CHORD_QUALITIES[quality];
    const isMinorish = def && (def.intervals.includes(3)); // has a minor 3rd
    const isDim = def && def.intervals.includes(6) && def.intervals.includes(3);
    if (isMinorish) r = r.toLowerCase();
    if (isDim) r += '°';
    return r;
}

// --- Global key / modal-center detection -----------------------------------

// Build every (heptatonic scale × 12 tonics) candidate and rank them. Modes of
// the same note-collection tie on coverage and are separated by modal cues, so
// the strongest modal center floats to the top while its sibling modes follow.
export function detectGlobal(progression, catalog, { limit = 6, preferFlats = false } = {}) {
    if (progression.length === 0) return [];
    const fmt = (pc) => formatPc(pc, { preferFlats });
    const toneWeights = weightedChordTones(progression);
    const candidates = [];

    for (const scale of catalog.filter(isHeptatonic)) {
        for (let tonicPc = 0; tonicPc < 12; tonicPc++) {
            const pcs = scalePcs(scale, tonicPc);
            const { score, coverage, outside } = scoreCandidate(pcs, toneWeights);
            if (coverage === 0) continue;
            const ranked = score + MODAL_EPSILON * tieBonus(scale, tonicPc, progression);
            candidates.push({
                scaleId: scale.id,
                name: `${fmt(tonicPc)} ${scale.name}`,
                tonicPc,
                pcs,
                score: ranked,
                coverage,
                confidence: confidenceBand(coverage),
                outsideNotes: outside.map(fmt),
            });
        }
    }

    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, limit);
}

// --- Per-chord local layer --------------------------------------------------

// For each chord: is it diatonic to the global home? what's its scale degree?
// which mode should you play over it, and what color options exist?
export function perChordSuggestions(progression, catalog, globalTop, { preferFlats = false } = {}) {
    if (!globalTop) return [];
    const fmt = (pc) => formatPc(pc, { preferFlats });
    const homePcs = globalTop.pcs;
    const homeOrder = orderedFromTonic(homePcs, globalTop.tonicPc);

    return progression.map((chord) => {
        const diatonic = isSubset(chord.pcs, homePcs);

        // Scale degree of this chord's root within the home collection.
        const degIdx = homeOrder.indexOf(chord.rootPc);
        const degree = degIdx >= 0 ? degIdx + 1 : null;
        const roman = degIdx >= 0 ? romanFor(degIdx, chord.quality) : null;

        // The mode of the home collection rooted on this chord — the scale you
        // play here while staying in the key. Found by matching note-collections.
        // Scale candidates carry { label, rootPc, scaleId } so the UI can both
        // display them and deep-link them onto an instrument view.
        let primaryMode = null;
        for (const scale of catalog.filter(isHeptatonic)) {
            const pcs = scalePcs(scale, chord.rootPc);
            if (intersectionSize(pcs, homePcs) === homePcs.size && pcs.size === homePcs.size) {
                primaryMode = { label: `${fmt(chord.rootPc)} ${scale.name}`, rootPc: chord.rootPc, scaleId: scale.id };
                break;
            }
        }

        // Color options: other scales rooted on the chord that fully contain it.
        const colorOptions = [];
        for (const scale of catalog) {
            const pcs = scalePcs(scale, chord.rootPc);
            const label = `${fmt(chord.rootPc)} ${scale.name}`;
            if (isSubset(chord.pcs, pcs) && label !== (primaryMode && primaryMode.label)) {
                colorOptions.push({ label, rootPc: chord.rootPc, scaleId: scale.id });
            }
            if (colorOptions.length >= 3) break;
        }

        return {
            chord,
            label: `${fmt(chord.rootPc)} ${CHORD_QUALITIES[chord.quality].label}`,
            degree,
            roman,
            relationToGlobal: diatonic ? 'diatonic' : 'outside',
            primaryMode,
            colorOptions,
        };
    });
}

// --- Top-level entry point --------------------------------------------------

export function analyzeProgression(progression, catalog, { preferFlats = false } = {}) {
    const global = detectGlobal(progression, catalog, { preferFlats });
    const perChord = perChordSuggestions(progression, catalog, global[0], { preferFlats });
    return { global, perChord };
}
