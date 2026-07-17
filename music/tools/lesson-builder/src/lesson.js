// lesson.js — the "lesson brain". Takes a parsed progression + an assumed key and
// produces a structured, musically-aware lesson: each chord's FUNCTION, the best
// scale to solo with, and mood-framed color options. Sits on top of the core
// recognition engine but adds jazz smarts the raw engine doesn't: secondary
// dominants, ii–V recognition, passing diminished, and dominant chord-scales.
// Pure — no DOM.

import { buildChord, CHORD_QUALITIES } from '../../../core/theory/chords.js';
import { scalePcs } from '../../../core/theory/scales.js';
import { perChordSuggestions } from '../../../core/theory/analysis.js';
import { formatPc, isSubset } from '../../../core/theory/pitch-class.js';
import { spellScaleNotes, noteLabel } from './spell.js';

const byId = (catalog, id) => catalog.find((s) => s.id === id);
const isMinorish = (q) => CHORD_QUALITIES[q]?.intervals.includes(3);
const isDom = (q) => ['dom7', 'dom9', 'dom13', '7sus4', 'dom7b9'].includes(q);

// Correctly-spelled note list of a scale at a root, e.g. "B♭ C D E♭ F G A" (and
// "E F♯ G A B C♯ D" for E Dorian — matches the staff, not raw pitch-class flats).
function spell(catalog, scaleId, rootPc, preferFlats) {
    const sc = byId(catalog, scaleId);
    if (!sc) return '';
    return spellScaleNotes(formatPc(rootPc, { preferFlats }), sc).map(noteLabel).join(' ');
}

function scaleRef(catalog, scaleId, rootPc, why, preferFlats) {
    const sc = byId(catalog, scaleId);
    return {
        scaleId, rootPc, why,
        name: `${formatPc(rootPc, { preferFlats })} ${sc ? sc.name : scaleId}`,
        mood: sc ? (sc.moodTags || []).join(', ') : '',
        notes: spell(catalog, scaleId, rootPc, preferFlats),
    };
}

// The primary scale to play over a chord, given its function in the key.
function primaryFor(chord, roman, diatonic, resolvesToMinor, catalog, preferFlats) {
    const { rootPc, quality } = chord;
    const ref = (id, why) => scaleRef(catalog, id, rootPc, why, preferFlats);

    if (quality === 'dim7' || quality === 'dim') {
        return ref('diminished-whole-half', 'A passing diminished chord — the whole–half diminished scale is built from its own chord tones plus tensions.');
    }
    if (quality === 'm7b5') {
        return ref('locrian', 'The half-diminished sound — Locrian spells this chord exactly.');
    }
    if (isDom(quality)) {
        if (diatonic) return ref('mixolydian', 'This is the home key\'s V7 — Mixolydian is the key\'s own notes starting on the 5th.');
        if (resolvesToMinor) return ref('phrygian-dominant', 'A secondary dominant resolving to a minor chord — Phrygian dominant (5th mode of the target\'s harmonic minor) nails that V→i pull.');
        return ref('mixolydian', 'A secondary dominant — start with Mixolydian for the straight dominant sound (see the color options to add tension).');
    }
    if (isMinorish(quality)) {
        if (roman === 'ii') return ref('dorian', 'The ii chord — Dorian is the brightest minor mode and the default ii sound.');
        if (roman === 'iii') return ref('phrygian', 'The iii chord — Phrygian, the darkest common minor mode.');
        if (roman === 'vi') return ref('natural-minor', 'The vi chord — the relative minor, so natural minor (Aeolian) is home here.');
        return ref('dorian', 'Treat as a ii chord — Dorian is the safe, bright minor choice.');
    }
    // major family
    if (roman === 'IV') return ref('lydian', 'The IV chord loves Lydian — the raised 4th is the one note that separates it from the home major scale.');
    return ref('major', 'The tonic sound — the plain major (Ionian) scale is home.');
}

// A couple of color/variation scales, mood-framed. Pulls the engine's chord-fitting
// options, dedupes the primary, and guarantees dominants get a "tension" option.
function colorsFor(chord, engineColors, primary, catalog, preferFlats) {
    const { rootPc, quality } = chord;
    const out = [];
    // strict=true requires the scale to fully contain the chord (used for the
    // engine's fallback options). Curated theory picks (e.g. altered over a
    // dominant, which deliberately drops the natural 5th) pass strict=false.
    const push = (id, why, strict = false) => {
        if (out.length >= 2) return;
        if (id === primary.scaleId) return;
        if (out.some((o) => o.scaleId === id)) return;
        const sc = byId(catalog, id);
        if (!sc) return;
        if (strict) {
            const chordPcs = buildChord(rootPc, quality).pcs;
            if (!isSubset(chordPcs, scalePcs(sc, rootPc))) return;
        }
        out.push(scaleRef(catalog, id, rootPc, why, preferFlats));
    };

    if (quality === 'dim7' || quality === 'dim') {
        push('diminished-half-whole', 'Its half–whole rotation — hear this passing chord as a rootless dominant ♭9 and the same shape covers both.');
    } else if (isDom(quality)) {
        push('altered', 'Maximum tension: the altered scale (♭9 ♯9 ♯11 ♭13) — resolve it and it sounds "outside then home".');
        push('lydian-dominant', 'Hip and floaty: Lydian dominant (♯11) — great when the dominant isn\'t resolving down a 5th.');
        push('diminished-half-whole', 'Symmetrical bite: half–whole diminished gives ♭9 and ♯9 over the dominant.');
    } else if (isMinorish(quality)) {
        push('minor-pentatonic', 'Can\'t-miss safety net: minor pentatonic always works over a minor chord.');
        push('dorian', 'Brighten it with Dorian (natural 6th) for a jazzier minor color.');
        push('phrygian', 'Darken it with Phrygian (♭2) for a Spanish/Iberian flavor.');
    } else {
        push('lydian', 'Add shimmer with Lydian (♯11).');
        push('major-pentatonic', 'Simplify to major pentatonic for clean, singable lines.');
    }
    // fall back to whatever the engine suggested, mood-framed (must fit the chord)
    for (const ec of engineColors) push(ec.scaleId, 'Also fits the chord tones.', true);
    return out.slice(0, 2);
}

// Roman-numeral / functional label for a chord in the key.
function functionLabel(chord, idx, flat, engineRow, catalog, homeTonic, preferFlats) {
    const { rootPc, quality } = chord;
    const next = flat[idx + 1];
    const diatonic = engineRow.relationToGlobal === 'diatonic';

    // Diatonic chords wear the engine's plain roman numeral (ii, IV, V…).
    if (diatonic && engineRow.roman) {
        return { label: engineRow.roman, kind: 'diatonic', resolvesToMinor: false };
    }
    // Secondary dominant: a (borrowed) dominant a 5th above the next chord's root.
    if (isDom(quality) && next && next.rootPc === (rootPc + 5) % 12) {
        const targetRoman = targetRomanOf(next, flat, idx + 1, catalog, homeTonic, preferFlats);
        return { label: `V7/${targetRoman}`, kind: 'secondary-dominant', resolvesToMinor: isMinorish(next.quality) };
    }
    // The "related ii" that sets up a secondary dominant (ii–V into a target).
    if (isMinorish(quality) && next && isDom(next.quality) && next.rootPc === (rootPc + 5) % 12) {
        const tgt = flat[idx + 2];
        const tr = tgt ? targetRomanOf(tgt, flat, idx + 2, catalog, homeTonic, preferFlats) : '';
        return { label: tr ? `ii of ${tr}` : 'related ii', kind: 'secondary-ii', resolvesToMinor: false };
    }
    if (quality === 'dim7' || quality === 'dim') return { label: 'passing dim7', kind: 'passing', resolvesToMinor: false };
    if (engineRow.roman) return { label: engineRow.roman, kind: 'borrowed', resolvesToMinor: false };
    return { label: 'borrowed', kind: 'borrowed', resolvesToMinor: false };
}

// Roman numeral of a (usually diatonic) target chord, for "V7/<x>" labels.
function targetRomanOf(chord, flat, idx, catalog, homeTonic, preferFlats) {
    // crude: degree of the chord root within a major scale from the home tonic
    const deg = ((chord.rootPc - homeTonic) % 12 + 12) % 12;
    const MAJ_DEGREES = { 0: 'I', 2: 'ii', 4: 'iii', 5: 'IV', 7: 'V', 9: 'vi', 11: 'vii°' };
    let r = MAJ_DEGREES[deg];
    if (r) {
        if (isMinorish(chord.quality) && r === r.toUpperCase()) r = r.toLowerCase();
        return r;
    }
    return formatPc(chord.rootPc, { preferFlats });   // non-diatonic target → note name
}

// --- Public: build the whole lesson ----------------------------------------
export function buildLesson(flat, homeTonic, homeScaleId, catalog, { preferFlats = true } = {}) {
    const homeScale = byId(catalog, homeScaleId);
    const home = { tonicPc: homeTonic, pcs: scalePcs(homeScale, homeTonic), scaleId: homeScaleId };

    // Engine gives degree/diatonic/colorOptions per UNIQUE chord; map by symbol.
    const uniq = new Map();
    for (const c of flat) if (!uniq.has(c.symbol)) uniq.set(c.symbol, buildChord(c.rootPc, c.quality));
    const engineRows = perChordSuggestions([...uniq.values()], catalog, home, { preferFlats });
    const engineBySym = new Map([...uniq.keys()].map((sym, i) => [sym, engineRows[i]]));

    // Build a lesson row per UNIQUE chord (the deep content), keyed by symbol.
    const chordLessons = new Map();
    flat.forEach((chord, idx) => {
        if (chordLessons.has(chord.symbol)) return;
        const engineRow = engineBySym.get(chord.symbol);
        const fn = functionLabel(chord, idx, flat, engineRow, catalog, homeTonic, preferFlats);
        const diatonic = engineRow.relationToGlobal === 'diatonic';
        const primary = primaryFor(chord, engineRow.roman, diatonic, fn.resolvesToMinor, catalog, preferFlats);
        const colors = colorsFor(chord, engineRow.colorOptions, primary, catalog, preferFlats);
        chordLessons.set(chord.symbol, {
            symbol: chord.symbol,
            rootPc: chord.rootPc,
            quality: chord.quality,
            qualityLabel: CHORD_QUALITIES[chord.quality].label,
            chordTones: buildChord(chord.rootPc, chord.quality).pcs,
            fn, diatonic, primary, colors,
        });
    });

    return {
        home: {
            tonicPc: homeTonic,
            name: `${formatPc(homeTonic, { preferFlats })} ${homeScale.name}`,
            scaleId: homeScaleId,
            notes: spell(catalog, homeScaleId, homeTonic, preferFlats),
        },
        chordLessons,   // Map symbol -> lesson
        order: [...uniq.keys()],   // unique chords in first-appearance order
    };
}
