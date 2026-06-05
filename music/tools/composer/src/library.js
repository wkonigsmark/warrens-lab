// library.js — persistence for saved compositions. Pure storage + file helpers,
// no rendering. The in-app library lives in localStorage; export/import move
// pieces to and from .json files so a composition can be kept, backed up, or
// shared without any backend. Separate key from the working-canvas autosave.

const LIB_KEY = 'composer.library.v1';

export function loadLibrary() {
    try {
        const arr = JSON.parse(localStorage.getItem(LIB_KEY));
        return Array.isArray(arr) ? arr : [];
    } catch (_) { return []; }
}

export function saveLibrary(arr) {
    try { localStorage.setItem(LIB_KEY, JSON.stringify(arr)); } catch (_) { /* ignore */ }
}

export function genId() {
    return 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Insert or replace by id; returns a new array (never mutates).
export function upsertPiece(lib, piece) {
    const i = lib.findIndex((p) => p.id === piece.id);
    if (i >= 0) { const next = lib.slice(); next[i] = piece; return next; }
    return [...lib, piece];
}

export function deletePiece(lib, id) {
    return lib.filter((p) => p.id !== id);
}

// Trigger a browser download of `data` as pretty JSON (the user's own export).
export function downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// Parse imported file text into an array of raw piece objects. Accepts a single
// piece, a songbook, a bare array, or the autosave shape — be forgiving.
export function parseImport(text) {
    const data = JSON.parse(text);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.pieces)) return data.pieces;
    if (data && data.piece) return [data.piece];
    if (data && Array.isArray(data.notes)) return [data];
    return [];
}

// Filename-safe slug from a title.
export function slug(s) {
    return ((s || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)) || 'untitled';
}
