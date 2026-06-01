// app.js — Key Finder UI. A thin view over the core recognition engine.
// Builds a progression from Root + Quality selects and renders the layered
// analysis. All theory lives in /core/theory — this file only does DOM.

import { buildChord, CHORD_QUALITIES, QUALITY_GROUPS } from '../../core/theory/chords.js';
import { loadScales } from '../../core/theory/scales.js';
import { analyzeProgression } from '../../core/theory/analysis.js';
import { formatPc } from '../../core/theory/pitch-class.js';

// Combined enharmonic labels for the root dropdown (value = pitch class).
const ROOT_LABELS = [
    'C', 'C♯ / D♭', 'D', 'D♯ / E♭', 'E', 'F',
    'F♯ / G♭', 'G', 'G♯ / A♭', 'A', 'A♯ / B♭', 'B',
];

const state = {
    progression: [],   // [{ rootPc, quality }]
    preferFlats: false,
    catalog: null,
};

const $ = (id) => document.getElementById(id);

// --- Setup ------------------------------------------------------------------

function populateSelects() {
    const rootSel = $('root-select');
    rootSel.innerHTML = ROOT_LABELS
        .map((label, pc) => `<option value="${pc}">${label}</option>`)
        .join('');

    const qualSel = $('quality-select');
    qualSel.innerHTML = QUALITY_GROUPS.map((group) => {
        const opts = Object.entries(CHORD_QUALITIES)
            .filter(([, def]) => def.group === group)
            .map(([key, def]) => `<option value="${key}">${def.label}</option>`)
            .join('');
        return `<optgroup label="${group.toUpperCase()}">${opts}</optgroup>`;
    }).join('');
    qualSel.value = 'maj7';
}

function wireEvents() {
    $('add-btn').addEventListener('click', () => {
        state.progression.push({
            rootPc: Number($('root-select').value),
            quality: $('quality-select').value,
        });
        render();
    });
    $('clear-btn').addEventListener('click', () => {
        state.progression = [];
        render();
    });
    $('sharp-btn').addEventListener('click', () => setSpelling(false));
    $('flat-btn').addEventListener('click', () => setSpelling(true));
}

function setSpelling(preferFlats) {
    state.preferFlats = preferFlats;
    $('sharp-btn').classList.toggle('active', !preferFlats);
    $('flat-btn').classList.toggle('active', preferFlats);
    render();
}

// --- Render -----------------------------------------------------------------

function render() {
    renderChips();
    renderResults();
}

function renderChips() {
    const list = $('chip-list');
    $('clear-btn').hidden = state.progression.length === 0;

    if (state.progression.length === 0) {
        list.innerHTML = '<span class="chip-hint">No chords yet…</span>';
        return;
    }
    list.innerHTML = state.progression.map((c, i) => {
        const name = formatPc(c.rootPc, { preferFlats: state.preferFlats });
        const label = `${name} ${CHORD_QUALITIES[c.quality].label}`;
        return `<span class="chip">${label}<button class="chip-x" data-i="${i}" aria-label="Remove">×</button></span>`;
    }).join('');

    list.querySelectorAll('.chip-x').forEach((btn) => {
        btn.addEventListener('click', () => {
            state.progression.splice(Number(btn.dataset.i), 1);
            render();
        });
    });
}

function confidenceLabel(c) {
    return { strong: 'Strong match', likely: 'Likely', loose: 'Loose fit' }[c] || c;
}

function renderResults() {
    const el = $('results');
    if (state.progression.length === 0) {
        el.innerHTML = '<div class="empty-state">Add a few chords to find the key.</div>';
        return;
    }

    const chords = state.progression.map((c) => buildChord(c.rootPc, c.quality));
    const { global, perChord } = analyzeProgression(chords, state.catalog, { preferFlats: state.preferFlats });

    const top = global[0];
    const rest = global.slice(1, 5);

    // Modal heads-up: do the top candidates share the same notes?
    const sameNotes = global[1] && setsEqual(top.pcs, global[1].pcs);
    const modalNote = sameNotes
        ? `<p class="modal-note">These top candidates are the <strong>same notes, different center</strong> — pick the tonal home your ear hears as "home".</p>`
        : '';

    el.innerHTML = `
        <div class="home-card conf-${top.confidence}">
            <div class="home-head">
                <span class="home-label">HOME BASE</span>
                <span class="badge">${confidenceLabel(top.confidence)} · ${Math.round(top.coverage * 100)}%</span>
            </div>
            <div class="home-name">${top.name}</div>
            ${top.outsideNotes.length
                ? `<div class="outside">Outside notes: ${top.outsideNotes.join(', ')}</div>`
                : `<div class="outside clean">Every chord tone fits.</div>`}
        </div>
        ${modalNote}
        ${rest.length ? `
        <div class="alt-list">
            <span class="section-label">OTHER CANDIDATES</span>
            ${rest.map((g) => `
                <div class="alt-row">
                    <span class="alt-name">${g.name}</span>
                    <span class="alt-meta">${confidenceLabel(g.confidence)} · ${Math.round(g.coverage * 100)}%</span>
                </div>`).join('')}
        </div>` : ''}

        <div class="perchord">
            <span class="section-label">CHORD BY CHORD</span>
            ${perChord.map(renderChordRow).join('')}
        </div>
    `;
}

function renderChordRow(c) {
    const degree = c.roman ? `<span class="roman">${c.roman}</span>` : '';
    const rel = c.relationToGlobal === 'diatonic'
        ? '<span class="tag in">in key</span>'
        : '<span class="tag out">borrowed</span>';
    const play = c.primaryMode
        ? `<span class="play">play <strong>${c.primaryMode}</strong></span>`
        : '<span class="play muted">no in-key mode — treat as a color chord</span>';
    const colors = c.colorOptions.length
        ? `<div class="colors">${c.colorOptions.map((o) => `<span class="color-chip">${o}</span>`).join('')}</div>`
        : '';
    return `
        <div class="chord-row">
            <div class="chord-head">${degree}<span class="chord-name">${c.label}</span>${rel}</div>
            ${play}
            ${colors}
        </div>`;
}

function setsEqual(a, b) {
    if (a.size !== b.size) return false;
    for (const x of a) if (!b.has(x)) return false;
    return true;
}

// --- Boot -------------------------------------------------------------------

(async function init() {
    populateSelects();
    wireEvents();
    try {
        state.catalog = await loadScales();
    } catch (err) {
        $('results').innerHTML = `<div class="empty-state">Could not load scale catalog: ${err.message}</div>`;
        return;
    }
    render();
})();
