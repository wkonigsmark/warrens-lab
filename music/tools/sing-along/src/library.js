// library.js — the curated "song path": a hand-authored ladder of simple songs
// (each note carries a lyric syllable), ordered easiest → hardest. Clear a song
// (score ≥ PASS_PCT) to unlock the next. Progress lives in localStorage. Pure data
// + helpers, no DOM.
//
// LEVEL 1 CURRICULUM — Kodály developmental sequence (2026-07-10).
// Research on teaching children to sing in tune (Kodály method) says: don't start
// with familiar songs, start with the natural intervals a child's voice already
// finds, and only widen the pitch-set once the earlier one is secure. So the ladder
// climbs through five pitch-sets, easiest → hardest:
//
//   Stage 1  so–mi        just G–E, the descending minor third every kid chants
//                         ("na-na na-na-na"). Two notes, nothing to mis-tune.
//   Stage 2  so–mi–la     add the A above so. Three notes, all easy leaps.
//   Stage 3  mi–re–do     stepwise motion down to do, the "home"/resting tone.
//   Stage 4  pentatonic   do-re-mi-so-la — a full 5-note scale with NO half-steps,
//                         so every note is forgiving to tune (no leading tones).
//   Stage 5  full scale   fa and ti finally appear (the half-steps), plus octave
//                         leaps. This is where real diatonic songs live.
//
// Each note: { start (beats), pitch, durBeats, lyric }. Pitches are written around
// C5 with movable-do (do = C5, so = G5, mi = E5, la = A5); the tool auto-fits /
// transposes every song to the singer's range, so the absolute octave is flexible —
// what matters is the RELATIVE pitch-set of each stage. `stage`/`skill` are metadata
// (used for the path's stage dividers); the player only reads notes/bpm/title/id.
export const PATH_SONGS = [
    // ═══ STAGE 1 · so–mi (G–E) ════════════════════════════════════════════════
    {
        id: 'cuckoo', title: 'Cuckoo', bpm: 84, stage: 1, skill: 'so–mi',
        notes: [
            { start: 0, pitch: 'G5', durBeats: 1, lyric: 'Cuck' },
            { start: 1, pitch: 'E5', durBeats: 1, lyric: 'oo' },
            { start: 2, pitch: 'G5', durBeats: 1, lyric: 'cuck' },
            { start: 3, pitch: 'E5', durBeats: 1, lyric: 'oo' },
            { start: 4, pitch: 'G5', durBeats: 1, lyric: 'where' },
            { start: 5, pitch: 'G5', durBeats: 1, lyric: 'are' },
            { start: 6, pitch: 'E5', durBeats: 2, lyric: 'you' },
        ],
    },
    {
        id: 'see-saw', title: 'See-Saw', bpm: 88, stage: 1, skill: 'so–mi',
        notes: [
            { start: 0, pitch: 'G5', durBeats: 1, lyric: 'See' },
            { start: 1, pitch: 'E5', durBeats: 1, lyric: 'saw' },
            { start: 2, pitch: 'G5', durBeats: 1, lyric: 'up' },
            { start: 3, pitch: 'E5', durBeats: 1, lyric: 'down' },
            { start: 4, pitch: 'G5', durBeats: 1, lyric: 'see' },
            { start: 5, pitch: 'E5', durBeats: 1, lyric: 'saw' },
            { start: 6, pitch: 'G5', durBeats: 1, lyric: 'up' },
            { start: 7, pitch: 'E5', durBeats: 1, lyric: 'down' },
        ],
    },
    {
        id: 'bounce-high', title: 'Bounce High, Bounce Low', bpm: 90, stage: 1, skill: 'so–mi',
        notes: [
            { start: 0, pitch: 'G5', durBeats: 1, lyric: 'Bounce' },
            { start: 1, pitch: 'G5', durBeats: 1, lyric: 'high' },
            { start: 2, pitch: 'E5', durBeats: 1, lyric: 'bounce' },
            { start: 3, pitch: 'E5', durBeats: 1, lyric: 'low' },
            { start: 4, pitch: 'G5', durBeats: 1, lyric: 'bounce' },
            { start: 5, pitch: 'G5', durBeats: 1, lyric: 'the' },
            { start: 6, pitch: 'G5', durBeats: 1, lyric: 'ball' },
            { start: 7, pitch: 'E5', durBeats: 1, lyric: 'to' },
            { start: 8, pitch: 'G5', durBeats: 2, lyric: 'Shi' },
            { start: 10, pitch: 'E5', durBeats: 2, lyric: 'loh' },
        ],
    },

    // ═══ STAGE 2 · so–mi–la (G–E–A) ═══════════════════════════════════════════
    {
        id: 'snail-snail', title: 'Snail, Snail', bpm: 84, stage: 2, skill: 'so–mi–la',
        notes: [
            { start: 0, pitch: 'A5', durBeats: 1, lyric: 'Snail' },
            { start: 1, pitch: 'G5', durBeats: 1, lyric: 'snail' },
            { start: 2, pitch: 'A5', durBeats: 1, lyric: 'snail' },
            { start: 3, pitch: 'G5', durBeats: 1, lyric: 'snail' },
            { start: 4, pitch: 'A5', durBeats: 1, lyric: 'round' },
            { start: 5, pitch: 'G5', durBeats: 1, lyric: 'and' },
            { start: 6, pitch: 'E5', durBeats: 2, lyric: 'round' },
        ],
    },
    {
        id: 'lucy-locket', title: 'Lucy Locket', bpm: 96, stage: 2, skill: 'so–mi–la',
        notes: [
            { start: 0, pitch: 'G5', durBeats: 1, lyric: 'Lu' },
            { start: 1, pitch: 'E5', durBeats: 1, lyric: 'cy' },
            { start: 2, pitch: 'G5', durBeats: 1, lyric: 'Lock' },
            { start: 3, pitch: 'E5', durBeats: 1, lyric: 'et' },
            { start: 4, pitch: 'A5', durBeats: 1, lyric: 'lost' },
            { start: 5, pitch: 'A5', durBeats: 1, lyric: 'her' },
            { start: 6, pitch: 'G5', durBeats: 1, lyric: 'pock' },
            { start: 7, pitch: 'E5', durBeats: 1, lyric: 'et' },
        ],
    },
    {
        id: 'rain-rain', title: 'Rain, Rain, Go Away', bpm: 100, stage: 2, skill: 'so–mi–la',
        notes: [
            { start: 0, pitch: 'G5', durBeats: 1, lyric: 'Rain' },
            { start: 1, pitch: 'A5', durBeats: 1, lyric: 'rain' },
            { start: 2, pitch: 'G5', durBeats: 1, lyric: 'go' },
            { start: 3, pitch: 'E5', durBeats: 1, lyric: 'way' },
            { start: 4, pitch: 'G5', durBeats: 1, lyric: 'come' },
            { start: 5, pitch: 'A5', durBeats: 1, lyric: 'a' },
            { start: 6, pitch: 'G5', durBeats: 1, lyric: 'gain' },
            { start: 7, pitch: 'E5', durBeats: 1, lyric: 'day' },
        ],
    },
    {
        id: 'bee-bee', title: 'Bee, Bee, Bumblebee', bpm: 100, stage: 2, skill: 'so–mi–la',
        notes: [
            { start: 0, pitch: 'A5', durBeats: 1, lyric: 'Bee' },
            { start: 1, pitch: 'G5', durBeats: 1, lyric: 'bee' },
            { start: 2, pitch: 'A5', durBeats: 1, lyric: 'bum' },
            { start: 3, pitch: 'G5', durBeats: 1, lyric: 'ble' },
            { start: 4, pitch: 'A5', durBeats: 1, lyric: 'bee' },
            { start: 5, pitch: 'G5', durBeats: 1, lyric: 'bee' },
            { start: 6, pitch: 'E5', durBeats: 2, lyric: 'bee' },
        ],
    },

    // ═══ STAGE 3 · mi–re–do (E–D–C, stepwise to the resting tone) ═════════════
    {
        id: 'first-steps', title: 'First Steps', bpm: 88, stage: 3, skill: 'do–re–mi',
        notes: [
            { start: 0, pitch: 'C5', durBeats: 2, lyric: 'Do' },
            { start: 2, pitch: 'C5', durBeats: 2, lyric: 'do' },
            { start: 4, pitch: 'D5', durBeats: 2, lyric: 're' },
            { start: 6, pitch: 'E5', durBeats: 2, lyric: 'mi' },
        ],
    },
    {
        id: 'up-and-down', title: 'Up and Down', bpm: 92, stage: 3, skill: 'do–re–mi',
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
        id: 'hot-cross-buns', title: 'Hot Cross Buns', bpm: 96, stage: 3, skill: 'mi–re–do',
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
        id: 'merrily-roll', title: 'Merrily We Roll Along', bpm: 104, stage: 3, skill: 'mi–re–do',
        notes: [
            { start: 0, pitch: 'E5', durBeats: 1, lyric: 'Mer' },
            { start: 1, pitch: 'D5', durBeats: 1, lyric: 'ri' },
            { start: 2, pitch: 'C5', durBeats: 1, lyric: 'ly' },
            { start: 3, pitch: 'D5', durBeats: 1, lyric: 'we' },
            { start: 4, pitch: 'E5', durBeats: 1, lyric: 'roll' },
            { start: 5, pitch: 'E5', durBeats: 1, lyric: 'a' },
            { start: 6, pitch: 'E5', durBeats: 2, lyric: 'long' },
            { start: 8, pitch: 'E5', durBeats: 1, lyric: 'mer' },
            { start: 9, pitch: 'D5', durBeats: 1, lyric: 'ri' },
            { start: 10, pitch: 'C5', durBeats: 1, lyric: 'ly' },
            { start: 11, pitch: 'D5', durBeats: 1, lyric: 'we' },
            { start: 12, pitch: 'E5', durBeats: 1, lyric: 'roll' },
            { start: 13, pitch: 'E5', durBeats: 1, lyric: 'roll' },
            { start: 14, pitch: 'C5', durBeats: 2, lyric: 'long' },
        ],
    },

    // ═══ STAGE 4 · pentatonic (do-re-mi-so-la — no half-steps) ════════════════
    {
        id: 'mary-lamb', title: 'Mary Had a Little Lamb', bpm: 100, stage: 4, skill: 'pentatonic',
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
        id: 'old-macdonald', title: 'Old MacDonald', bpm: 108, stage: 4, skill: 'pentatonic',
        notes: [
            { start: 0, pitch: 'C5', durBeats: 1, lyric: 'Old' },
            { start: 1, pitch: 'C5', durBeats: 1, lyric: 'Mac' },
            { start: 2, pitch: 'C5', durBeats: 1, lyric: 'Don' },
            { start: 3, pitch: 'G4', durBeats: 1, lyric: 'ald' },
            { start: 4, pitch: 'A4', durBeats: 1, lyric: 'had' },
            { start: 5, pitch: 'A4', durBeats: 1, lyric: 'a' },
            { start: 6, pitch: 'G4', durBeats: 2, lyric: 'farm' },
            { start: 8, pitch: 'E5', durBeats: 1, lyric: 'E' },
            { start: 9, pitch: 'E5', durBeats: 1, lyric: 'I' },
            { start: 10, pitch: 'D5', durBeats: 1, lyric: 'E' },
            { start: 11, pitch: 'D5', durBeats: 1, lyric: 'I' },
            { start: 12, pitch: 'C5', durBeats: 4, lyric: 'O' },
        ],
    },
    {
        id: 'ring-rosie', title: 'Ring Around the Rosie', bpm: 100, stage: 4, skill: 'pentatonic',
        notes: [
            { start: 0, pitch: 'G5', durBeats: 1, lyric: 'Ring' },
            { start: 1, pitch: 'G5', durBeats: 1, lyric: 'a' },
            { start: 2, pitch: 'A5', durBeats: 1, lyric: 'round' },
            { start: 3, pitch: 'G5', durBeats: 1, lyric: 'the' },
            { start: 4, pitch: 'E5', durBeats: 1, lyric: 'ro' },
            { start: 5, pitch: 'E5', durBeats: 1, lyric: 'sie' },
            { start: 8, pitch: 'G5', durBeats: 1, lyric: 'pock' },
            { start: 9, pitch: 'G5', durBeats: 1, lyric: 'et' },
            { start: 10, pitch: 'A5', durBeats: 1, lyric: 'full' },
            { start: 11, pitch: 'G5', durBeats: 1, lyric: 'of' },
            { start: 12, pitch: 'E5', durBeats: 1, lyric: 'po' },
            { start: 13, pitch: 'E5', durBeats: 1, lyric: 'sies' },
            { start: 16, pitch: 'A5', durBeats: 1, lyric: 'Ash' },
            { start: 17, pitch: 'A5', durBeats: 1, lyric: 'es' },
            { start: 18, pitch: 'G5', durBeats: 1, lyric: 'ash' },
            { start: 19, pitch: 'G5', durBeats: 1, lyric: 'es' },
            { start: 20, pitch: 'G5', durBeats: 1, lyric: 'we' },
            { start: 21, pitch: 'E5', durBeats: 1, lyric: 'all' },
            { start: 22, pitch: 'D5', durBeats: 1, lyric: 'fall' },
            { start: 23, pitch: 'C5', durBeats: 1, lyric: 'down' },
        ],
    },
    {
        id: 'bell-horses', title: 'Bell Horses', bpm: 92, stage: 4, skill: 'pentatonic',
        notes: [
            { start: 0, pitch: 'G5', durBeats: 1, lyric: 'Bell' },
            { start: 1, pitch: 'E5', durBeats: 1, lyric: 'hors' },
            { start: 2, pitch: 'G5', durBeats: 1, lyric: 'es' },
            { start: 3, pitch: 'E5', durBeats: 1, lyric: 'es' },
            { start: 4, pitch: 'A5', durBeats: 1, lyric: 'what' },
            { start: 5, pitch: 'G5', durBeats: 1, lyric: 'time' },
            { start: 6, pitch: 'E5', durBeats: 1, lyric: 'of' },
            { start: 7, pitch: 'C5', durBeats: 1, lyric: 'day' },
        ],
    },

    // ═══ STAGE 5 · full scale (fa & ti, octave leaps — real diatonic songs) ═══
    {
        id: 'twinkle', title: 'Twinkle Twinkle', bpm: 96, stage: 5, skill: 'full scale',
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
    {
        id: 'frere-jacques', title: 'Frère Jacques', bpm: 92, stage: 5, skill: 'full scale',
        notes: [
            { start: 0, pitch: 'C5', durBeats: 1, lyric: 'Are' },
            { start: 1, pitch: 'D5', durBeats: 1, lyric: 'you' },
            { start: 2, pitch: 'E5', durBeats: 1, lyric: 'sleep' },
            { start: 3, pitch: 'C5', durBeats: 1, lyric: 'ing' },
            { start: 4, pitch: 'C5', durBeats: 1, lyric: 'Are' },
            { start: 5, pitch: 'D5', durBeats: 1, lyric: 'you' },
            { start: 6, pitch: 'E5', durBeats: 1, lyric: 'sleep' },
            { start: 7, pitch: 'C5', durBeats: 1, lyric: 'ing' },
            { start: 8, pitch: 'E5', durBeats: 1, lyric: 'Broth' },
            { start: 9, pitch: 'F5', durBeats: 1, lyric: 'er' },
            { start: 10, pitch: 'G5', durBeats: 2, lyric: 'John' },
            { start: 12, pitch: 'E5', durBeats: 1, lyric: 'Broth' },
            { start: 13, pitch: 'F5', durBeats: 1, lyric: 'er' },
            { start: 14, pitch: 'G5', durBeats: 2, lyric: 'John' },
            { start: 16, pitch: 'G5', durBeats: 0.5, lyric: 'Morn' },
            { start: 16.5, pitch: 'A5', durBeats: 0.5, lyric: 'ing' },
            { start: 17, pitch: 'G5', durBeats: 0.5, lyric: 'bells' },
            { start: 17.5, pitch: 'F5', durBeats: 0.5, lyric: 'are' },
            { start: 18, pitch: 'E5', durBeats: 1, lyric: 'ring' },
            { start: 19, pitch: 'C5', durBeats: 1, lyric: 'ing' },
            { start: 20, pitch: 'G5', durBeats: 0.5, lyric: 'Morn' },
            { start: 20.5, pitch: 'A5', durBeats: 0.5, lyric: 'ing' },
            { start: 21, pitch: 'G5', durBeats: 0.5, lyric: 'bells' },
            { start: 21.5, pitch: 'F5', durBeats: 0.5, lyric: 'are' },
            { start: 22, pitch: 'E5', durBeats: 1, lyric: 'ring' },
            { start: 23, pitch: 'C5', durBeats: 1, lyric: 'ing' },
            { start: 24, pitch: 'C5', durBeats: 1, lyric: 'Ding' },
            { start: 25, pitch: 'G4', durBeats: 1, lyric: 'ding' },
            { start: 26, pitch: 'C5', durBeats: 2, lyric: 'dong' },
            { start: 28, pitch: 'C5', durBeats: 1, lyric: 'Ding' },
            { start: 29, pitch: 'G4', durBeats: 1, lyric: 'ding' },
            { start: 30, pitch: 'C5', durBeats: 2, lyric: 'dong' },
        ],
    },
    {
        id: 'london-bridge', title: 'London Bridge', bpm: 100, stage: 5, skill: 'full scale',
        notes: [
            { start: 0, pitch: 'G5', durBeats: 1, lyric: 'Lon' },
            { start: 1, pitch: 'A5', durBeats: 1, lyric: 'don' },
            { start: 2, pitch: 'G5', durBeats: 1, lyric: 'Bridge' },
            { start: 3, pitch: 'F5', durBeats: 1, lyric: 'is' },
            { start: 4, pitch: 'E5', durBeats: 1, lyric: 'fall' },
            { start: 5, pitch: 'F5', durBeats: 1, lyric: 'ing' },
            { start: 6, pitch: 'G5', durBeats: 2, lyric: 'down' },
            { start: 8, pitch: 'D5', durBeats: 1, lyric: 'fall' },
            { start: 9, pitch: 'E5', durBeats: 1, lyric: 'ing' },
            { start: 10, pitch: 'F5', durBeats: 2, lyric: 'down' },
            { start: 12, pitch: 'E5', durBeats: 1, lyric: 'fall' },
            { start: 13, pitch: 'F5', durBeats: 1, lyric: 'ing' },
            { start: 14, pitch: 'G5', durBeats: 2, lyric: 'down' },
            { start: 16, pitch: 'G5', durBeats: 1, lyric: 'Lon' },
            { start: 17, pitch: 'A5', durBeats: 1, lyric: 'don' },
            { start: 18, pitch: 'G5', durBeats: 1, lyric: 'Bridge' },
            { start: 19, pitch: 'F5', durBeats: 1, lyric: 'is' },
            { start: 20, pitch: 'E5', durBeats: 1, lyric: 'fall' },
            { start: 21, pitch: 'F5', durBeats: 1, lyric: 'ing' },
            { start: 22, pitch: 'G5', durBeats: 2, lyric: 'down' },
            { start: 24, pitch: 'D5', durBeats: 1, lyric: 'My' },
            { start: 25, pitch: 'G5', durBeats: 1, lyric: 'fair' },
            { start: 26, pitch: 'E5', durBeats: 1, lyric: 'la' },
            { start: 27, pitch: 'C5', durBeats: 1, lyric: 'dy' },
        ],
    },
    {
        id: 'row-boat', title: 'Row, Row, Row Your Boat', bpm: 92, stage: 5, skill: 'full scale',
        notes: [
            { start: 0, pitch: 'C5', durBeats: 1, lyric: 'Row' },
            { start: 1, pitch: 'C5', durBeats: 1, lyric: 'row' },
            { start: 2, pitch: 'C5', durBeats: 1, lyric: 'row' },
            { start: 3, pitch: 'D5', durBeats: 1, lyric: 'your' },
            { start: 4, pitch: 'E5', durBeats: 2, lyric: 'boat' },
            { start: 8, pitch: 'E5', durBeats: 1, lyric: 'Gent' },
            { start: 9, pitch: 'D5', durBeats: 1, lyric: 'ly' },
            { start: 10, pitch: 'E5', durBeats: 1, lyric: 'down' },
            { start: 11, pitch: 'F5', durBeats: 1, lyric: 'the' },
            { start: 12, pitch: 'G5', durBeats: 4, lyric: 'stream' },
            { start: 16, pitch: 'C6', durBeats: 0.5, lyric: 'Mer' },
            { start: 16.5, pitch: 'C6', durBeats: 0.5, lyric: 'ri' },
            { start: 17, pitch: 'C6', durBeats: 0.5, lyric: 'ly' },
            { start: 18, pitch: 'G5', durBeats: 0.5, lyric: 'mer' },
            { start: 18.5, pitch: 'G5', durBeats: 0.5, lyric: 'ri' },
            { start: 19, pitch: 'G5', durBeats: 0.5, lyric: 'ly' },
            { start: 20, pitch: 'E5', durBeats: 0.5, lyric: 'mer' },
            { start: 20.5, pitch: 'E5', durBeats: 0.5, lyric: 'ri' },
            { start: 21, pitch: 'E5', durBeats: 0.5, lyric: 'ly' },
            { start: 22, pitch: 'C5', durBeats: 0.5, lyric: 'mer' },
            { start: 22.5, pitch: 'C5', durBeats: 0.5, lyric: 'ri' },
            { start: 23, pitch: 'C5', durBeats: 0.5, lyric: 'ly' },
            { start: 24, pitch: 'G5', durBeats: 1, lyric: 'Life' },
            { start: 25, pitch: 'F5', durBeats: 1, lyric: 'is' },
            { start: 26, pitch: 'E5', durBeats: 1, lyric: 'but' },
            { start: 27, pitch: 'D5', durBeats: 1, lyric: 'a' },
            { start: 28, pitch: 'C5', durBeats: 4, lyric: 'dream' },
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
