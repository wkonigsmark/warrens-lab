// library.js — the curated "song path": a hand-authored ladder of simple songs
// (each note carries a lyric syllable), ordered easiest → hardest. Clear a song
// (score ≥ PASS_PCT) to unlock the next. Progress lives in localStorage. Pure data
// + helpers, no DOM.

// Each note: { start (beats), pitch, durBeats, lyric }. Pitches sit around C5; the
// tool auto-fits/transposes to the singer's range, so absolute octave is flexible.
export const PATH_SONGS = [
    {
        id: 'first-steps', title: 'First Steps', bpm: 88,
        notes: [
            { start: 0, pitch: 'C5', durBeats: 2, lyric: 'Do' },
            { start: 2, pitch: 'C5', durBeats: 2, lyric: 'do' },
            { start: 4, pitch: 'D5', durBeats: 2, lyric: 're' },
            { start: 6, pitch: 'E5', durBeats: 2, lyric: 'mi' },
        ],
    },
    {
        id: 'up-and-down', title: 'Up and Down', bpm: 92,
        notes: [
            { start: 0, pitch: 'C5', durBeats: 1, lyric: 'Up' },
            { start: 1, pitch: 'D5', durBeats: 1, lyric: 'we' },
            { start: 2, pitch: 'E5', durBeats: 2, lyric: 'go' },
            { start: 4, pitch: 'E5', durBeats: 1, lyric: 'then' },
            { start: 5, pitch: 'D5', durBeats: 1, lyric: 'back' },
            { start: 6, pitch: 'C5', durBeats: 2, lyric: 'down' },
        ],
    },
    {
        id: 'hot-cross-buns', title: 'Hot Cross Buns', bpm: 96,
        notes: [
            { start: 0, pitch: 'E5', durBeats: 1, lyric: 'Hot' },
            { start: 1, pitch: 'D5', durBeats: 1, lyric: 'cross' },
            { start: 2, pitch: 'C5', durBeats: 2, lyric: 'buns' },
            { start: 4, pitch: 'E5', durBeats: 1, lyric: 'hot' },
            { start: 5, pitch: 'D5', durBeats: 1, lyric: 'cross' },
            { start: 6, pitch: 'C5', durBeats: 2, lyric: 'buns' },
            { start: 8, pitch: 'C5', durBeats: 0.5, lyric: 'one' },
            { start: 8.5, pitch: 'C5', durBeats: 0.5, lyric: 'a' },
            { start: 9, pitch: 'C5', durBeats: 0.5, lyric: 'pen' },
            { start: 9.5, pitch: 'C5', durBeats: 0.5, lyric: 'ny' },
            { start: 10, pitch: 'D5', durBeats: 0.5, lyric: 'two' },
            { start: 10.5, pitch: 'D5', durBeats: 0.5, lyric: 'a' },
            { start: 11, pitch: 'D5', durBeats: 0.5, lyric: 'pen' },
            { start: 11.5, pitch: 'D5', durBeats: 0.5, lyric: 'ny' },
            { start: 12, pitch: 'E5', durBeats: 1, lyric: 'hot' },
            { start: 13, pitch: 'D5', durBeats: 1, lyric: 'cross' },
            { start: 14, pitch: 'C5', durBeats: 2, lyric: 'buns' },
        ],
    },
    {
        id: 'mary-lamb', title: 'Mary Had a Little Lamb', bpm: 100,
        notes: [
            { start: 0, pitch: 'E5', durBeats: 1, lyric: 'Ma' },
            { start: 1, pitch: 'D5', durBeats: 1, lyric: 'ry' },
            { start: 2, pitch: 'C5', durBeats: 1, lyric: 'had' },
            { start: 3, pitch: 'D5', durBeats: 1, lyric: 'a' },
            { start: 4, pitch: 'E5', durBeats: 1, lyric: 'lit' },
            { start: 5, pitch: 'E5', durBeats: 1, lyric: 'tle' },
            { start: 6, pitch: 'E5', durBeats: 2, lyric: 'lamb' },
            { start: 8, pitch: 'D5', durBeats: 1, lyric: 'lit' },
            { start: 9, pitch: 'D5', durBeats: 1, lyric: 'tle' },
            { start: 10, pitch: 'D5', durBeats: 2, lyric: 'lamb' },
            { start: 12, pitch: 'E5', durBeats: 1, lyric: 'lit' },
            { start: 13, pitch: 'G5', durBeats: 1, lyric: 'tle' },
            { start: 14, pitch: 'G5', durBeats: 2, lyric: 'lamb' },
        ],
    },
    {
        id: 'twinkle', title: 'Twinkle Twinkle', bpm: 96,
        notes: [
            { start: 0, pitch: 'C5', durBeats: 1, lyric: 'Twin' },
            { start: 1, pitch: 'C5', durBeats: 1, lyric: 'kle' },
            { start: 2, pitch: 'G5', durBeats: 1, lyric: 'twin' },
            { start: 3, pitch: 'G5', durBeats: 1, lyric: 'kle' },
            { start: 4, pitch: 'A5', durBeats: 1, lyric: 'lit' },
            { start: 5, pitch: 'A5', durBeats: 1, lyric: 'tle' },
            { start: 6, pitch: 'G5', durBeats: 2, lyric: 'star' },
            { start: 8, pitch: 'F5', durBeats: 1, lyric: 'how' },
            { start: 9, pitch: 'F5', durBeats: 1, lyric: 'I' },
            { start: 10, pitch: 'E5', durBeats: 1, lyric: 'won' },
            { start: 11, pitch: 'E5', durBeats: 1, lyric: 'der' },
            { start: 12, pitch: 'D5', durBeats: 1, lyric: 'what' },
            { start: 13, pitch: 'D5', durBeats: 1, lyric: 'you' },
            { start: 14, pitch: 'C5', durBeats: 2, lyric: 'are' },
        ],
    },
];

// --- Progress (localStorage) ----------------------------------------------
const PKEY = 'singalong.progress.v1';
export const PASS_PCT = 70;   // notes-hit % needed to clear a song

export function getProgress() {
    try {
        const p = JSON.parse(localStorage.getItem(PKEY));
        return (p && Array.isArray(p.cleared) && p.best) ? p : { cleared: [], best: {} };
    } catch (_) { return { cleared: [], best: {} }; }
}
function save(p) { try { localStorage.setItem(PKEY, JSON.stringify(p)); } catch (_) { /* ignore */ } }

// A song is unlocked if it's first, or the previous song has been cleared.
export function isUnlocked(index, progress = getProgress()) {
    if (index <= 0) return true;
    return progress.cleared.includes(PATH_SONGS[index - 1].id);
}

// Record a result; clears the song if pct ≥ PASS_PCT. Returns the updated progress.
export function recordResult(id, pct) {
    const p = getProgress();
    p.best[id] = Math.max(p.best[id] || 0, pct);
    if (pct >= PASS_PCT && !p.cleared.includes(id)) p.cleared.push(id);
    save(p);
    return p;
}

// Index of the first not-yet-cleared unlocked song (where a student should resume).
export function firstUnclearedIndex(progress = getProgress()) {
    for (let i = 0; i < PATH_SONGS.length; i++) {
        if (isUnlocked(i, progress) && !progress.cleared.includes(PATH_SONGS[i].id)) return i;
    }
    return 0;
}
