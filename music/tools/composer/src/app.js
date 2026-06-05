// app.js — owns the score state and wires the controls, grid, staff and audio
// together. Keep state minimal; re-render from it after every change.

import {
    RANGES, DEFAULT_RANGE, buildScale, DURATIONS, durationById,
    BAR_OPTIONS, BEATS_PER_BAR, CLEFS, DEFAULT_CLEF, SHIFT_MIN, SHIFT_MAX,
} from './model.js';
import { renderGrid } from './grid.js';
import { renderScore } from './notation.js';
import { playNote, playScore } from './audio.js';
import {
    loadLibrary, saveLibrary, genId, upsertPiece, deletePiece,
    downloadJSON, parseImport, slug,
} from './library.js';
import { PRESETS } from './presets.js';

const els = {
    rangeSelect: document.getElementById('range-select'),
    barsGroup: document.getElementById('bars-group'),
    durationGroup: document.getElementById('duration-group'),
    tempo: document.getElementById('tempo'),
    tempoReadout: document.getElementById('tempo-readout'),
    clefGroup: document.getElementById('clef-group'),
    shiftReadout: document.getElementById('shift-readout'),
    shiftDown: document.getElementById('shift-down'),
    shiftUp: document.getElementById('shift-up'),
    lettersToggle: document.getElementById('letters-toggle'),
    play: document.getElementById('play'),
    save: document.getElementById('save'),
    print: document.getElementById('print'),
    clear: document.getElementById('clear'),
    title: document.getElementById('piece-title'),
    composer: document.getElementById('piece-composer'),
    grid: document.getElementById('grid'),
    staff: document.getElementById('staff'),
    manuscript: document.getElementById('manuscript'),
    libList: document.getElementById('lib-list'),
    libEmpty: document.getElementById('lib-empty'),
    libCount: document.getElementById('lib-count'),
    libNew: document.getElementById('lib-new'),
    libExportAll: document.getElementById('lib-export-all'),
    libImport: document.getElementById('lib-import'),
    libFile: document.getElementById('lib-file'),
    starterList: document.getElementById('starter-list'),
};

let library = [];        // saved compositions (mirrors localStorage)

const STORE_KEY = 'composer.piece.v1';

const state = {
    rangeId: DEFAULT_RANGE,
    bars: 4,
    durationId: 'quarter',
    tempo: 96,
    clef: DEFAULT_CLEF,
    staffShift: RANGES[DEFAULT_RANGE].staffShift || 0, // octaves notation moves from sounding
    showLetters: false,
    title: '',
    composer: '',
    currentId: null,    // id of the library song being edited (null = unsaved)
    notes: [],          // { start (beats from 0), pitch, durBeats }
    playing: false,
};

const scaleOf = () => buildScale(RANGES[state.rangeId].low, RANGES[state.rangeId].high);

// --- Placement rules ------------------------------------------------------
// A note must fit before the end and must not cross a barline (keeps the
// notation honest — no ties needed in v1).
function fits(beat, durBeats) {
    const totalBeats = state.bars * BEATS_PER_BAR;
    if (beat < 0 || beat + durBeats > totalBeats) return false;
    return Math.floor(beat / BEATS_PER_BAR) === Math.floor((beat + durBeats - 1) / BEATS_PER_BAR);
}

function placeNote(pitch, beat) {
    const durBeats = durationById(state.durationId).beats;
    if (!fits(beat, durBeats)) { flashInvalid(); return; }
    // monophonic: clear anything overlapping this note's time span
    const end = beat + durBeats;
    state.notes = state.notes.filter((n) => n.start + n.durBeats <= beat || n.start >= end);
    state.notes.push({ start: beat, pitch, durBeats });
    state.notes.sort((a, b) => a.start - b.start);
    playNote(pitch);
    render();
}

function removeNote(target) {
    state.notes = state.notes.filter((n) => n !== target);
    render();
}

function flashInvalid() {
    els.grid.classList.remove('shake');
    void els.grid.offsetWidth; // restart the animation
    els.grid.classList.add('shake');
}

// --- Rendering ------------------------------------------------------------
function render(playheadBeat = null) {
    const scale = scaleOf();
    renderGrid(els.grid, {
        scale, bars: state.bars, notes: state.notes,
        onCellClick: placeNote, onNoteClick: removeNote,
    });
    renderStaff(playheadBeat);
    renderManuscript();
    saveState();
}

function renderStaff(playheadBeat) {
    els.staff.innerHTML = renderScore(
        { bars: state.bars, notes: state.notes },
        { colored: true, playheadBeat, showLetters: state.showLetters, staffShift: state.staffShift, clef: state.clef },
    );
}

// Print-only manuscript: clean black-and-white score with title + by-line.
function renderManuscript() {
    const title = (state.title || '').trim() || 'Untitled Melody';
    const by = (state.composer || '').trim();
    const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const byLine = by ? `Composed by ${escapeHtml(by)} · ${date}` : date;
    const score = renderScore(
        { bars: state.bars, notes: state.notes },
        // wrap onto stacked staves so long pieces fit the printed page
        { colored: false, showLetters: state.showLetters, staffShift: state.staffShift, clef: state.clef, barsPerSystem: 4 },
    );
    els.manuscript.innerHTML =
        `<h2 class="ms-title">${escapeHtml(title)}</h2>` +
        `<p class="ms-by">${byLine}</p>` +
        `<div class="ms-score">${score}</div>`;
}

function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

// --- Playback -------------------------------------------------------------
let playTimers = [];
function stopPlayback() {
    playTimers.forEach(clearTimeout);
    playTimers = [];
    state.playing = false;
    els.play.disabled = false;
    els.play.textContent = '▶ Play';
    renderStaff(null);
}

function play() {
    if (state.playing || state.notes.length === 0) return;
    state.playing = true;
    els.play.disabled = true;
    els.play.textContent = '♪ Playing…';
    const { schedule, totalMs } = playScore(state.notes, state.tempo);
    // Sweep the playhead by lighting up each note as it sounds.
    schedule.forEach(({ note, offsetMs }) => {
        playTimers.push(setTimeout(() => renderStaff(note.start), offsetMs));
    });
    playTimers.push(setTimeout(stopPlayback, totalMs + 250));
}

// --- Controls -------------------------------------------------------------
function buildSegmented(group, items, getActive, onPick) {
    group.innerHTML = '';
    items.forEach(({ value, label }) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'seg' + (getActive() === value ? ' active' : '');
        b.textContent = label;
        b.addEventListener('click', () => onPick(value));
        group.appendChild(b);
    });
}

function refreshControls() {
    buildSegmented(
        els.barsGroup,
        BAR_OPTIONS.map((n) => ({ value: n, label: `${n}` })),
        () => state.bars,
        (n) => {
            state.bars = n;
            const max = n * BEATS_PER_BAR;
            state.notes = state.notes.filter((x) => x.start + x.durBeats <= max);
            refreshControls(); render();
        },
    );
    buildSegmented(
        els.durationGroup,
        DURATIONS.map((d) => ({ value: d.id, label: d.label })),
        () => state.durationId,
        (id) => { state.durationId = id; refreshControls(); },
    );
    buildSegmented(
        els.clefGroup,
        Object.entries(CLEFS).map(([id, c]) => ({ value: id, label: c.label })),
        () => state.clef,
        (id) => { state.clef = id; refreshControls(); render(); },
    );
}

// Octave-shift readout: "0", "−1 oct", "+2 oct". Disable the steppers at bounds.
function updateShiftControls() {
    const s = state.staffShift;
    els.shiftReadout.textContent = s === 0 ? '0' : `${s > 0 ? '+' : '−'}${Math.abs(s)} oct`;
    els.shiftDown.disabled = s <= SHIFT_MIN;
    els.shiftUp.disabled = s >= SHIFT_MAX;
}

function nudgeShift(delta) {
    const next = Math.min(SHIFT_MAX, Math.max(SHIFT_MIN, state.staffShift + delta));
    if (next === state.staffShift) return;
    state.staffShift = next;
    updateShiftControls();
    render();
}

// --- Persistence ----------------------------------------------------------
// A "piece" is the saveable subset of state — used by the autosave, the library,
// and file export alike, so all three stay in lockstep.
function currentPiece() {
    const { rangeId, bars, durationId, tempo, clef, staffShift, showLetters, title, composer, notes } = state;
    return { rangeId, bars, durationId, tempo, clef, staffShift, showLetters, title, composer, notes };
}

// Apply a saved/imported piece onto state, validating each field so a stale or
// hand-edited file can't break the tool. Does not touch currentId.
function applyPiece(p) {
    if (!p || typeof p !== 'object') return;
    state.rangeId = RANGES[p.rangeId] ? p.rangeId : DEFAULT_RANGE;
    state.bars = BAR_OPTIONS.includes(p.bars) ? p.bars : 4;
    state.durationId = durationById(p.durationId) ? p.durationId : 'quarter';
    state.tempo = typeof p.tempo === 'number' ? p.tempo : 96;
    state.clef = CLEFS[p.clef] ? p.clef : DEFAULT_CLEF;
    state.staffShift = typeof p.staffShift === 'number'
        ? Math.min(SHIFT_MAX, Math.max(SHIFT_MIN, Math.round(p.staffShift)))
        : (RANGES[state.rangeId].staffShift || 0);
    state.showLetters = !!p.showLetters;
    state.title = (p.title || '').toString();
    state.composer = (p.composer || '').toString();
    // keep only notes that fit the restored range + bar count
    const valid = new Set(buildScale(RANGES[state.rangeId].low, RANGES[state.rangeId].high));
    const max = state.bars * BEATS_PER_BAR;
    state.notes = Array.isArray(p.notes)
        ? p.notes.filter((n) => valid.has(n.pitch) && n.start + n.durBeats <= max)
        : [];
}

// Auto-save the working canvas so it survives a reload. Best-effort: ignore
// storage errors (private mode, quota) rather than break the tool.
function saveState() {
    try {
        localStorage.setItem(STORE_KEY, JSON.stringify({ ...currentPiece(), currentId: state.currentId }));
    } catch (_) { /* ignore */ }
}

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORE_KEY));
        if (!saved) return;
        applyPiece(saved);
        if (typeof saved.currentId === 'string') state.currentId = saved.currentId;
    } catch (_) { /* ignore */ }
}

function syncControlsToState() {
    els.rangeSelect.value = state.rangeId;
    els.tempo.value = state.tempo;
    els.tempoReadout.textContent = state.tempo;
    els.title.value = state.title;
    els.composer.value = state.composer;
    updateShiftControls();
    updateLettersToggle();
}

function updateLettersToggle() {
    els.lettersToggle.classList.toggle('active', state.showLetters);
    els.lettersToggle.setAttribute('aria-pressed', String(state.showLetters));
}

// --- Library --------------------------------------------------------------
// Briefly flash a confirmation label on a button (no disabling — saving again
// right away is harmless and shouldn't be blocked).
function flashButton(btn, text) {
    const orig = btn.dataset.label || btn.textContent;
    btn.dataset.label = orig;
    btn.classList.add('flashed');
    btn.textContent = text;
    clearTimeout(btn._flashT);
    btn._flashT = setTimeout(() => { btn.textContent = btn.dataset.label; btn.classList.remove('flashed'); }, 1100);
}

// Save the current canvas into the library (updates the loaded song, or creates
// a new one). An untitled piece gets a default name so it's findable.
function saveToLibrary() {
    if (!(state.title || '').trim()) {
        state.title = 'Untitled Melody';
        els.title.value = state.title;
        renderManuscript();
    }
    const piece = currentPiece();
    piece.id = state.currentId || genId();
    piece.savedAt = new Date().toISOString();
    state.currentId = piece.id;
    library = upsertPiece(library, piece);
    saveLibrary(library);
    saveState();
    renderLibrary();
    flashButton(els.save, '✓ Saved');
}

function loadFromLibrary(id) {
    const p = library.find((x) => x.id === id);
    if (!p) return;
    stopPlayback();
    applyPiece(p);
    state.currentId = id;
    syncControlsToState();
    refreshControls();
    render();
    renderLibrary();
}

function removeFromLibrary(id) {
    const p = library.find((x) => x.id === id);
    if (p && !window.confirm(`Delete “${p.title || 'Untitled Melody'}”? This can’t be undone.`)) return;
    library = deletePiece(library, id);
    if (state.currentId === id) state.currentId = null;
    saveLibrary(library);
    saveState();
    renderLibrary();
}

// Load a built-in starter onto the canvas as a fresh, unsaved piece. Saving it
// then creates the child's own copy in My Songs (the starter stays untouched).
function loadPreset(id) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    stopPlayback();
    applyPiece(p);
    state.currentId = null;
    syncControlsToState();
    refreshControls();
    render();
    renderLibrary();
}

// Start a fresh, blank, unsaved piece — keeps the workspace settings (instrument,
// clef, tempo…) but clears the song itself.
function newPiece() {
    stopPlayback();
    state.notes = [];
    state.title = '';
    state.composer = '';
    state.currentId = null;
    els.title.value = '';
    els.composer.value = '';
    render();
    renderLibrary();
}

function exportOne(id) {
    const p = library.find((x) => x.id === id);
    if (!p) return;
    downloadJSON(`${slug(p.title)}.composer.json`, { format: 'composer-piece', version: 1, piece: p });
}

function exportAll() {
    if (!library.length) return;
    const date = new Date().toISOString().slice(0, 10);
    downloadJSON(`composer-songbook-${date}.json`, { format: 'composer-songbook', version: 1, pieces: library });
}

function importFromText(text) {
    let raw;
    try { raw = parseImport(text); } catch (_) { raw = null; }
    if (!raw || !raw.length) { window.alert('Could not find any songs in that file.'); return; }
    let added = 0;
    for (const p of raw) {
        if (!p || typeof p !== 'object') continue;
        const piece = { ...p };
        if (!piece.id) piece.id = genId();
        piece.title = (piece.title || 'Imported Melody').toString().slice(0, 60);
        piece.composer = (piece.composer || '').toString().slice(0, 40);
        piece.savedAt = piece.savedAt || new Date().toISOString();
        if (!Array.isArray(piece.notes)) piece.notes = [];
        library = upsertPiece(library, piece);
        added++;
    }
    saveLibrary(library);
    renderLibrary();
    flashButton(els.libImport, `✓ Imported ${added}`);
}

// The built-in starter shelf — read-only (load + export, no delete).
function renderStarters() {
    els.starterList.innerHTML = '';
    for (const p of PRESETS) {
        const li = document.createElement('li');
        li.className = 'lib-item';

        const load = document.createElement('button');
        load.type = 'button';
        load.className = 'lib-load';
        load.innerHTML = `<span class="lib-name"></span><span class="lib-meta"></span>`;
        load.querySelector('.lib-name').textContent = p.title;
        load.querySelector('.lib-meta').textContent = `${p.composer} · ${p.bars} bars · ${p.notes.length} notes`;
        load.addEventListener('click', () => loadPreset(p.id));

        const exportBtn = document.createElement('button');
        exportBtn.type = 'button';
        exportBtn.className = 'lib-icon';
        exportBtn.title = 'Export this song to a file';
        exportBtn.textContent = '⬇';
        exportBtn.addEventListener('click', () =>
            downloadJSON(`${slug(p.title)}.composer.json`, { format: 'composer-piece', version: 1, piece: p }));

        li.append(load, exportBtn);
        els.starterList.appendChild(li);
    }
}

function renderLibrary() {
    const items = [...library].sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
    els.libCount.textContent = items.length;
    els.libEmpty.style.display = items.length ? 'none' : '';
    els.libList.innerHTML = '';

    for (const p of items) {
        const li = document.createElement('li');
        li.className = 'lib-item' + (p.id === state.currentId ? ' current' : '');

        const load = document.createElement('button');
        load.type = 'button';
        load.className = 'lib-load';
        const noteCount = Array.isArray(p.notes) ? p.notes.length : 0;
        const by = (p.composer || '').trim();
        const when = p.savedAt ? new Date(p.savedAt).toLocaleDateString() : '';
        const meta = [by && `by ${by}`, `${noteCount} note${noteCount === 1 ? '' : 's'}`, when]
            .filter(Boolean).join(' · ');
        load.innerHTML = `<span class="lib-name"></span><span class="lib-meta"></span>`;
        load.querySelector('.lib-name').textContent = p.title || 'Untitled Melody';
        load.querySelector('.lib-meta').textContent = meta;
        load.addEventListener('click', () => loadFromLibrary(p.id));

        const exportBtn = document.createElement('button');
        exportBtn.type = 'button';
        exportBtn.className = 'lib-icon';
        exportBtn.title = 'Export this song to a file';
        exportBtn.textContent = '⬇';
        exportBtn.addEventListener('click', () => exportOne(p.id));

        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'lib-icon lib-del';
        del.title = 'Delete this song';
        del.textContent = '✕';
        del.addEventListener('click', () => removeFromLibrary(p.id));

        li.append(load, exportBtn, del);
        els.libList.appendChild(li);
    }
}

function init() {
    loadState();

    // range options (shows how easily the register expands)
    els.rangeSelect.innerHTML = Object.entries(RANGES)
        .map(([id, r]) => `<option value="${id}">${r.label}</option>`).join('');
    els.rangeSelect.addEventListener('change', () => {
        state.rangeId = els.rangeSelect.value;
        // jump the staff to this instrument's natural transposition so it lands
        // readable; the user can still nudge from there.
        state.staffShift = RANGES[state.rangeId].staffShift || 0;
        updateShiftControls();
        const valid = new Set(scaleOf());
        state.notes = state.notes.filter((n) => valid.has(n.pitch));
        render();
    });

    els.tempo.addEventListener('input', () => {
        state.tempo = +els.tempo.value;
        els.tempoReadout.textContent = state.tempo;
        saveState();
    });

    els.shiftDown.addEventListener('click', () => nudgeShift(-1));
    els.shiftUp.addEventListener('click', () => nudgeShift(1));

    els.lettersToggle.addEventListener('click', () => {
        state.showLetters = !state.showLetters;
        updateLettersToggle();
        render();
    });

    els.title.addEventListener('input', () => { state.title = els.title.value; renderManuscript(); saveState(); });
    els.composer.addEventListener('input', () => { state.composer = els.composer.value; renderManuscript(); saveState(); });

    els.play.addEventListener('click', play);
    els.save.addEventListener('click', saveToLibrary);
    els.print.addEventListener('click', () => { renderManuscript(); window.print(); });
    els.clear.addEventListener('click', () => {
        if (state.notes.length === 0) return;
        stopPlayback();
        state.notes = [];
        render();
    });

    // Library controls
    els.libNew.addEventListener('click', newPiece);
    els.libExportAll.addEventListener('click', exportAll);
    els.libImport.addEventListener('click', () => els.libFile.click());
    els.libFile.addEventListener('change', () => {
        const file = els.libFile.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => importFromText(String(reader.result));
        reader.readAsText(file);
        els.libFile.value = ''; // allow re-importing the same file
    });

    library = loadLibrary();

    syncControlsToState();
    refreshControls();
    renderStarters();
    renderLibrary();
    render();
}

init();
