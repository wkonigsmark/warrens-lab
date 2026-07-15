// app.js — the Guitar Lesson page. Renders the exercises from lessons.js onto
// staves (reusing the composer's model/notation/audio modules), plays them back
// with a light strum, transposes to other keys/instruments, prints a worksheet,
// and hands melodic exercises to Sing-Along for mic-scored practice.

import { noteToMidi, midiToNoteName, accidentalOf } from '../../src/model.js';
import { renderScore } from '../../src/notation.js';
import {
    playScore, silencePlayback, startMetronome, stopMetronome,
    setMetronomeTempo, isMetronomeOn, isPlaybackSupported,
} from '../../src/audio.js';
import { EXERCISES, exerciseById } from './lessons.js';

// --- Transposition targets --------------------------------------------------
// Key = a semitone shift from A minor, labelled by the minor key it lands on
// (sharp spellings, since the note model spells black keys as sharps).
export const KEYS = [
    { semis: -5, label: 'E minor' },
    { semis: -4, label: 'F minor' },
    { semis: -3, label: 'F♯ minor' },
    { semis: -2, label: 'G minor' },
    { semis: -1, label: 'G♯ minor' },
    { semis: 0,  label: 'A minor' },
    { semis: 1,  label: 'A♯ minor' },
    { semis: 2,  label: 'B minor' },
    { semis: 3,  label: 'C minor' },
    { semis: 4,  label: 'C♯ minor' },
    { semis: 5,  label: 'D minor' },
    { semis: 6,  label: 'D♯ minor' },
];

// Instrument presets: `octave` shifts the SOUNDING pitch; `staffShift` + `clef`
// control how it's written. Guitar is a transposing instrument — written an
// octave above where it sounds — hence staffShift +1 (the little "8" under the clef).
export const INSTRUMENTS = {
    guitar:  { label: 'Guitar',                     octave: 0,  staffShift: 1,  clef: 'treble' },
    concert: { label: 'Concert pitch (piano·voice)', octave: 0,  staffShift: 0,  clef: 'treble' },
    xylo:    { label: 'Xylophone (kids’ C5–A6)', octave: 2,  staffShift: -1, clef: 'treble' },
    bass:    { label: 'Bass clef (low instruments)', octave: -1, staffShift: 0,  clef: 'bass' },
};

const state = {
    keySemis: 0,
    instrument: 'guitar',
    tempo: 80,
    letters: false,
    chordNames: true,
    colorPrint: false,
    printInclude: Object.fromEntries(EXERCISES.map((e) => [e.id, true])),
};

const els = {
    sections: document.getElementById('lesson-sections'),
    key: document.getElementById('key-select'),
    instrument: document.getElementById('instrument-select'),
    tempo: document.getElementById('tempo'),
    tempoReadout: document.getElementById('tempo-readout'),
    metronome: document.getElementById('metronome-toggle'),
    letters: document.getElementById('letters-toggle'),
    chordNames: document.getElementById('chords-toggle'),
    printChecks: document.getElementById('print-checks'),
    printColor: document.getElementById('print-color'),
    printBtn: document.getElementById('print'),
    manuscript: document.getElementById('manuscript'),
};

// --- Transposition -----------------------------------------------------------
const totalSemis = () => state.keySemis + INSTRUMENTS[state.instrument].octave * 12;
const transposePitch = (pitch, semis) => midiToNoteName(noteToMidi(pitch) + semis);
const transposeNotes = (notes, semis) =>
    semis === 0 ? notes : notes.map((n) => ({ ...n, pitch: transposePitch(n.pitch, semis) }));

// Chord symbols move with the KEY only (octave shifts don't rename a chord).
const SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const ROOT_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function transposeSymbol(symbol, semis) {
    const m = symbol.match(/^([A-G])(♯|#)?(.*)$/);
    if (!m) return symbol;
    const pc = (ROOT_PC[m[1]] + (m[2] ? 1 : 0) + semis + 120) % 12;
    return SHARP_NAMES[pc] + m[3];
}
const transposeChords = (chords, semis) =>
    chords && chords.map((c) => ({ ...c, symbol: transposeSymbol(c.symbol, semis) }));

// --- Rendering ---------------------------------------------------------------
function scoreFor(ex, { forPrint = false } = {}) {
    const inst = INSTRUMENTS[state.instrument];
    return renderScore(
        { bars: ex.bars, notes: transposeNotes(ex.notes, totalSemis()) },
        {
            colored: forPrint ? state.colorPrint : true,
            showLetters: state.letters,
            staffShift: inst.staffShift,
            clef: inst.clef,
            barsPerSystem: 4,
            chords: state.chordNames ? transposeChords(ex.chords, state.keySemis) : null,
        },
    );
}

function renderSections() {
    els.sections.innerHTML = EXERCISES.map((ex, i) => {
        const practiceBtn = ex.practice
            ? `<button class="btn btn-ghost" data-action="practice" data-ex="${ex.id}"
                 title="Send this line to Sing-Along and get scored as you play it">🎤 Test me in Sing-Along</button>`
            : `<span class="gl-note">Strummed chords can’t be mic-scored — the pitch tester hears one note at a time.</span>`;
        return `
        <section class="library gl-section" aria-label="${ex.title}">
          <div class="library-head">
            <h2 class="library-title">${ex.icon} ${i === 0 ? '' : `${i}. `}${ex.title}</h2>
            <p class="library-sub">${ex.subtitle}</p>
          </div>
          <p class="gl-story">${ex.story}</p>
          <div class="score-scroll">${scoreFor(ex)}</div>
          <div class="gl-actions">
            <button class="btn btn-play" data-action="play" data-ex="${ex.id}">▶ Play</button>
            ${practiceBtn}
          </div>
        </section>`;
    }).join('');
    updatePlayButtons();
}

// --- Playback ----------------------------------------------------------------
let playing = null; // { id, timer }

// Notes sharing a start become a quick low→high strum instead of a block hit.
function strummed(notes) {
    const byStart = new Map();
    for (const n of notes) {
        if (!byStart.has(n.start)) byStart.set(n.start, []);
        byStart.get(n.start).push(n);
    }
    const out = [];
    for (const group of byStart.values()) {
        group.sort((a, b) => noteToMidi(a.pitch) - noteToMidi(b.pitch));
        group.forEach((n, i) => out.push({ ...n, start: n.start + i * 0.045 }));
    }
    return out;
}

function stopPlayback() {
    if (playing) { clearTimeout(playing.timer); playing = null; }
    silencePlayback();
    updatePlayButtons();
}

function togglePlay(id) {
    if (playing && playing.id === id) { stopPlayback(); return; }
    stopPlayback();
    const ex = exerciseById(id);
    if (!ex || !isPlaybackSupported()) return;
    const { totalMs } = playScore(strummed(transposeNotes(ex.notes, totalSemis())), state.tempo);
    playing = { id, timer: setTimeout(stopPlayback, totalMs + 200) };
    updatePlayButtons();
}

function updatePlayButtons() {
    for (const btn of els.sections.querySelectorAll('[data-action="play"]')) {
        const isOn = playing && playing.id === btn.dataset.ex;
        btn.textContent = isOn ? '■ Stop' : '▶ Play';
        btn.classList.toggle('playing', !!isOn);
    }
}

// --- Sing-Along handoff --------------------------------------------------------
// Same drop box the Composer uses; Sing-Along picks it up on load. Chords aren't
// scorable, so the final piece hands over its walking line instead.
function practiceInSingAlong(id) {
    const ex = exerciseById(id);
    if (!ex || !ex.practice) return;
    const src = ex.practice === 'walk' ? exerciseById('walking') : ex;
    const semis = totalSemis();
    const notes = src.notes.map((n) => {
        const pitch = transposePitch(n.pitch, semis);
        const letter = pitch.replace(/-?\d+$/, '').replace('#', '♯');
        return { start: n.start, pitch, durBeats: n.durBeats, lyric: letter };
    });
    const payload = { title: `Guitar Lesson — ${src.title}`, bpm: state.tempo, notes };
    try { localStorage.setItem('studio.singalong.incoming.v1', JSON.stringify(payload)); } catch (_) { /* ignore */ }
    window.location.href = '../../sing-along/index.html';
}

// --- Print -------------------------------------------------------------------
function buildManuscript() {
    const keyLabel = KEYS.find((k) => k.semis === state.keySemis)?.label || 'A minor';
    const inst = INSTRUMENTS[state.instrument];
    let n = 0;
    const sections = EXERCISES.filter((ex) => state.printInclude[ex.id]).map((ex) => {
        n += 1;
        return `<div class="ms-exercise">`
            + `<div class="ms-ex-label"><span class="ms-ex-num">${n}</span><strong>${ex.title}</strong> — ${ex.subtitle}</div>`
            + `<div class="ms-score">${scoreFor(ex, { forPrint: true })}</div>`
            + `</div>`;
    });
    return `<h2 class="ms-title">🎸 Guitar Lesson — ${keyLabel}</h2>`
        + `<p class="ms-by">${inst.label} · ♩ = ${state.tempo} · strum on 1 &amp; 3, let the half notes ring</p>`
        + sections.join('');
}

function printWorksheet() {
    els.manuscript.innerHTML = buildManuscript();
    window.print();
}

// --- Controls wiring -----------------------------------------------------------
function fillSelect(select, options) {
    select.innerHTML = options.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
}

fillSelect(els.key, KEYS.map((k) => [k.semis, k.label]));
els.key.value = '0';
fillSelect(els.instrument, Object.entries(INSTRUMENTS).map(([id, i]) => [id, i.label]));
els.instrument.value = state.instrument;

els.printChecks.innerHTML = EXERCISES.map((ex) => `
    <label class="print-check"><input type="checkbox" data-print-ex="${ex.id}" checked> ${ex.icon} ${ex.title}</label>`).join('');

els.key.addEventListener('change', () => { state.keySemis = parseInt(els.key.value, 10) || 0; stopPlayback(); renderSections(); });
els.instrument.addEventListener('change', () => { state.instrument = els.instrument.value; stopPlayback(); renderSections(); });
els.tempo.addEventListener('input', () => {
    state.tempo = parseInt(els.tempo.value, 10);
    els.tempoReadout.textContent = state.tempo;
    setMetronomeTempo(state.tempo);
});
els.metronome.addEventListener('click', () => {
    if (isMetronomeOn()) stopMetronome(); else startMetronome(state.tempo);
    els.metronome.setAttribute('aria-pressed', String(isMetronomeOn()));
    els.metronome.classList.toggle('on', isMetronomeOn());
});
els.letters.addEventListener('click', () => {
    state.letters = !state.letters;
    els.letters.setAttribute('aria-pressed', String(state.letters));
    els.letters.classList.toggle('on', state.letters);
    renderSections();
});
els.chordNames.addEventListener('click', () => {
    state.chordNames = !state.chordNames;
    els.chordNames.setAttribute('aria-pressed', String(state.chordNames));
    els.chordNames.classList.toggle('on', state.chordNames);
    renderSections();
});
els.printColor.addEventListener('change', () => { state.colorPrint = els.printColor.checked; });
els.printChecks.addEventListener('change', (e) => {
    const id = e.target.dataset.printEx;
    if (id) state.printInclude[id] = e.target.checked;
});
els.printBtn.addEventListener('click', printWorksheet);

els.sections.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'play') togglePlay(btn.dataset.ex);
    if (btn.dataset.action === 'practice') practiceInSingAlong(btn.dataset.ex);
});

renderSections();
