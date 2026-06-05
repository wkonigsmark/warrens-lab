// app.js — owns the score state and wires the controls, grid, staff and audio
// together. Keep state minimal; re-render from it after every change.

import {
    RANGES, DEFAULT_RANGE, buildScale, DURATIONS, durationById,
    BAR_OPTIONS, BEATS_PER_BAR,
} from './model.js';
import { renderGrid } from './grid.js';
import { renderScore } from './notation.js';
import { playNote, playScore } from './audio.js';

const els = {
    rangeSelect: document.getElementById('range-select'),
    barsGroup: document.getElementById('bars-group'),
    durationGroup: document.getElementById('duration-group'),
    tempo: document.getElementById('tempo'),
    tempoReadout: document.getElementById('tempo-readout'),
    lettersToggle: document.getElementById('letters-toggle'),
    play: document.getElementById('play'),
    print: document.getElementById('print'),
    clear: document.getElementById('clear'),
    title: document.getElementById('piece-title'),
    composer: document.getElementById('piece-composer'),
    grid: document.getElementById('grid'),
    staff: document.getElementById('staff'),
    manuscript: document.getElementById('manuscript'),
};

const STORE_KEY = 'composer.piece.v1';

const state = {
    rangeId: DEFAULT_RANGE,
    bars: 4,
    durationId: 'quarter',
    tempo: 96,
    showLetters: false,
    title: '',
    composer: '',
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
        { colored: true, playheadBeat, showLetters: state.showLetters },
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
        { colored: false, showLetters: state.showLetters },
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
}

// --- Persistence ----------------------------------------------------------
// Auto-save the whole piece so work survives a reload. Best-effort: ignore
// storage errors (private mode, quota) rather than break the tool.
function saveState() {
    try {
        const { rangeId, bars, durationId, tempo, showLetters, title, composer, notes } = state;
        localStorage.setItem(STORE_KEY, JSON.stringify(
            { rangeId, bars, durationId, tempo, showLetters, title, composer, notes },
        ));
    } catch (_) { /* ignore */ }
}

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORE_KEY));
        if (!saved) return;
        if (RANGES[saved.rangeId]) state.rangeId = saved.rangeId;
        if (BAR_OPTIONS.includes(saved.bars)) state.bars = saved.bars;
        if (durationById(saved.durationId)) state.durationId = saved.durationId;
        if (typeof saved.tempo === 'number') state.tempo = saved.tempo;
        state.showLetters = !!saved.showLetters;
        state.title = saved.title || '';
        state.composer = saved.composer || '';
        // keep only notes that fit the restored range + bar count
        const valid = new Set(scaleOf());
        const max = state.bars * BEATS_PER_BAR;
        if (Array.isArray(saved.notes)) {
            state.notes = saved.notes.filter((n) =>
                valid.has(n.pitch) && n.start + n.durBeats <= max);
        }
    } catch (_) { /* ignore */ }
}

function syncControlsToState() {
    els.rangeSelect.value = state.rangeId;
    els.tempo.value = state.tempo;
    els.tempoReadout.textContent = state.tempo;
    els.title.value = state.title;
    els.composer.value = state.composer;
    updateLettersToggle();
}

function updateLettersToggle() {
    els.lettersToggle.classList.toggle('active', state.showLetters);
    els.lettersToggle.setAttribute('aria-pressed', String(state.showLetters));
}

function init() {
    loadState();

    // range options (shows how easily the register expands)
    els.rangeSelect.innerHTML = Object.entries(RANGES)
        .map(([id, r]) => `<option value="${id}">${r.label}</option>`).join('');
    els.rangeSelect.addEventListener('change', () => {
        state.rangeId = els.rangeSelect.value;
        const valid = new Set(scaleOf());
        state.notes = state.notes.filter((n) => valid.has(n.pitch));
        render();
    });

    els.tempo.addEventListener('input', () => {
        state.tempo = +els.tempo.value;
        els.tempoReadout.textContent = state.tempo;
        saveState();
    });

    els.lettersToggle.addEventListener('click', () => {
        state.showLetters = !state.showLetters;
        updateLettersToggle();
        render();
    });

    els.title.addEventListener('input', () => { state.title = els.title.value; renderManuscript(); saveState(); });
    els.composer.addEventListener('input', () => { state.composer = els.composer.value; renderManuscript(); saveState(); });

    els.play.addEventListener('click', play);
    els.print.addEventListener('click', () => { renderManuscript(); window.print(); });
    els.clear.addEventListener('click', () => {
        if (state.notes.length === 0) return;
        stopPlayback();
        state.notes = [];
        render();
    });

    syncControlsToState();
    refreshControls();
    render();
}

init();
