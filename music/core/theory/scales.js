// scales.js — scale catalog access and pitch-class transforms.
//
// The catalog data lives in ./scales.json (canonical, instrument-agnostic).
// Split into two layers:
//   - parseScales()/scalePcs(): PURE, run anywhere (browser + node tests).
//   - loadScales(): browser fetch, resolved relative to THIS module's URL so
//     any tool importing it works regardless of its own directory depth.

import { pcSet } from './pitch-class.js';

// kebab-case slug for a stable id independent of display name punctuation.
function slug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Normalize the raw JSON into a lean, predictable shape the engine consumes.
// Tolerant of missing optional fields (catalog grows over time).
export function parseScales(raw) {
    return raw.map((s) => ({
        id: slug(s.name),
        name: s.name,
        aliases: s.aliases || [],
        intervals: s.intervals,                 // semitone offsets from tonic
        degrees: s.degrees || [],
        category: s.category || {},
        culturalTags: s.cultural_tags || [],
        moodTags: s.mood_tags || [],
        commonChords: s.common_chords || [],
    }));
}

// Pitch classes of a scale instantiated at a given tonic (0–11).
export function scalePcs(scale, tonicPc) {
    return pcSet(tonicPc, scale.intervals);
}

// Heptatonic (7-note) scales — the useful set for key/mode detection. Pentatonic
// and symmetric scales are great for the per-chord color layer but make for
// noisy "key" candidates, so the engine filters with this.
export function isHeptatonic(scale) {
    return scale.intervals.length === 7;
}

// Browser-only loader. Cached after first call.
let _cache = null;
export async function loadScales() {
    if (_cache) return _cache;
    const url = new URL('./scales.json', import.meta.url);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load scales.json: ${res.status}`);
    _cache = parseScales(await res.json());
    return _cache;
}
