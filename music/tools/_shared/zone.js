// zone.js — the single source of truth for the "Composer Studio" trio. The hub
// page and the in-tool nav strip both read from this, so links/names live in one
// place. Paths are relative to any `music/tools/<x>/` directory (tools + the hub
// are all siblings under tools/), so they resolve the same from a tool or the hub.

export const STUDIO = {
    name: 'Composer Studio',
    hub: '../studio/',
};

export const ZONE_TOOLS = [
    {
        id: 'composer', name: 'Composer', short: 'Composer', icon: '🎼',
        path: '../composer/', step: 'Compose',
        tagline: 'Build a melody — click it out, hear it, read it.',
    },
    {
        id: 'composer-live', name: 'Composer Live', short: 'Live', icon: '🎤',
        path: '../composer-live/', step: 'Capture',
        tagline: 'Hum a tune — capture your pitch and turn it into notes.',
    },
    {
        id: 'sing-along', name: 'Sing-Along', short: 'Sing-Along', icon: '🎮',
        path: '../sing-along/', step: 'Sing',
        tagline: 'Follow the notes and sing to score — find the key, stay in tune.',
    },
];

// Which tool is the current page (inferred from the URL path), or null on the hub.
export function currentToolId() {
    const p = location.pathname;
    const t = ZONE_TOOLS.find((tool) => p.includes(`/tools/${tool.id}/`));
    return t ? t.id : null;
}
