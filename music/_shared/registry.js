// registry.js — the single source of truth for every tool in the /music domain
// and how they group into zones. The hub landing, each sub-hub, and the injected
// nav bar all read from here, so adding or moving a tool is a one-line edit in
// ONE place.
//
// Paths are ROOT-ABSOLUTE (/music/…) on purpose: tools live at different folder
// depths (instruments/guitar/, tools/composer/, instruments/guitar/lessons/…),
// and absolute paths resolve identically from any depth — locally (the dev
// server serves from the repo root) and on the deployed site
// (burnmarkproductions.com/music/…). Relative paths would break the shared nav.

export const MUSIC_HOME = { name: 'Music', icon: '🎵', path: '/music/index.html' };

// Zones group related tools. `hub` is the zone's own landing page (null = the
// tools just appear on the main hub, no dedicated sub-hub).
export const ZONES = [
    {
        id: 'guitar', name: 'Guitar', icon: '🎸',
        hub: '/music/instruments/guitar/index.html',
        tagline: 'Fretboard theory, a starter lesson pack, and lesson tools.',
    },
    {
        id: 'studio', name: 'Composer Studio', icon: '🎹',
        hub: '/music/tools/studio/index.html',
        tagline: 'Compose · capture · sing — three tools, one creative loop.',
    },
    {
        id: 'tools', name: 'Tools & Kids', icon: '🧭',
        hub: null,
        tagline: 'Theory helpers and games.',
    },
];

// Every tool. `short` is the pill label; `status` flags a BETA badge.
export const TOOLS = [
    // --- Guitar zone -------------------------------------------------------
    {
        id: 'guitar-theory', zone: 'guitar', name: 'Guitar Theory', short: 'Theory', icon: '🎸',
        path: '/music/instruments/guitar/index.html',
        tagline: 'Scales, chords & modal analysis on an interactive fretboard.',
    },
    {
        id: 'guitar-lessons', zone: 'guitar', name: 'Guitar Lessons', short: 'Lessons', icon: '🎓',
        path: '/music/instruments/guitar/lessons/index.html', status: 'beta',
        tagline: 'A growing starter lesson pack — play, test, transpose & print.',
    },
    {
        id: 'lesson-builder', zone: 'guitar', name: 'Lesson Builder', short: 'Builder', icon: '🛠️',
        path: '/music/tools/lesson-builder/index.html',
        tagline: 'Progression + key → a printable guitar lesson with diagrams.',
    },
    // --- Composer Studio zone ---------------------------------------------
    {
        id: 'composer', zone: 'studio', name: 'Composer', short: 'Composer', icon: '🎼',
        path: '/music/tools/composer/index.html', status: 'beta',
        tagline: 'Build a melody — click it out, hear it, read it.',
    },
    {
        id: 'composer-live', zone: 'studio', name: 'Composer Live', short: 'Live', icon: '🎤',
        path: '/music/tools/composer-live/index.html', status: 'beta',
        tagline: 'Hum a tune — capture your pitch and turn it into notes.',
    },
    {
        id: 'sing-along', zone: 'studio', name: 'Sing-Along', short: 'Sing-Along', icon: '🎮',
        path: '/music/tools/sing-along/index.html', status: 'beta',
        tagline: 'Follow the notes and sing to score — find the key, stay in tune.',
    },
    // --- Tools & Kids zone -------------------------------------------------
    {
        id: 'rhythm-lab', zone: 'tools', name: 'Rhythm Lab', short: 'Rhythm Lab', icon: '🥁',
        path: '/music/tools/rhythm-lab/index.html', status: 'beta',
        tagline: 'Read & play rhythms — whole to sixteenth notes, in C major.',
    },
    {
        id: 'key-finder', zone: 'tools', name: 'Key Finder', short: 'Key Finder', icon: '🧭',
        path: '/music/tools/key-finder/index.html',
        tagline: 'Enter a few chords → scale, mode & key candidates.',
    },
    {
        id: 'music-school', zone: 'tools', name: 'Music School', short: 'Music School', icon: '🎵',
        path: '/music/tools/music-school/index.html',
        tagline: 'Theory games, quizzes & printable worksheets for kids.',
    },
];

export const zoneById = (id) => ZONES.find((z) => z.id === id);
export const toolsInZone = (zoneId) => TOOLS.filter((t) => t.zone === zoneId);
export const toolById = (id) => TOOLS.find((t) => t.id === id);

// The directory a tool "owns" (its path minus the index.html file).
const dirOf = (path) => path.replace(/index\.html$/, '');

// Which tool is the current page, matched by the LONGEST path prefix so that a
// nested tool (…/guitar/lessons/) wins over its parent (…/guitar/).
export function currentTool() {
    const p = location.pathname;
    let best = null, bestLen = -1;
    for (const t of TOOLS) {
        const dir = dirOf(t.path);
        if (p.startsWith(dir) && dir.length > bestLen) { best = t; bestLen = dir.length; }
    }
    return best;
}

// The current zone — from the current tool, or from a zone hub page directly.
export function currentZone() {
    const t = currentTool();
    if (t) return zoneById(t.zone);
    const p = location.pathname;
    return ZONES.find((z) => z.hub && p.startsWith(dirOf(z.hub))) || null;
}
