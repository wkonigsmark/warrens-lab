// app.js — Lesson Builder UI. You provide the progression + assumed key; the
// machine builds a printable guitar lesson: home scale, chord-by-chord function
// and scale choices, color options, chord voicings, and a scale-shape appendix.
// All theory lives in /core + ./src — this file is DOM + layout only.

import { loadScales } from '../../core/theory/scales.js';
import { formatPc } from '../../core/theory/pitch-class.js';
import { CHORD_QUALITIES } from '../../core/theory/chords.js';
import { parseProgression } from './src/parse.js';
import { buildLesson } from './src/lesson.js';
import { chooseVoicing } from './src/voicings.js';
import { chordDiagram, scaleMap } from './src/fretboard.js';
import { spellScaleNotes, spellingMap } from './src/spell.js';
import { renderStaff } from './src/notation.js';
import { buildWalk, uniqueMoves } from './src/walk.js';

const $ = (id) => document.getElementById(id);
const PREFER_FLATS = true;
const KEYS = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

const DEFAULT_PROG = `Bbmaj7 - G7 - Cm7 - F7
Bbmaj7 - G7 - Cm7 - F7

Ebmaj7 - Ebdim - Dm7 - G7
Cm7 - F7 - Bbmaj7 - G7
Gm - C7 - F7 - Bb

Em7 - A7 - Dm7 - G7
Cm7 - F7 - Bb - Bb`;

let catalog = null;

const chordTonesStr = (pcs) => [...pcs].sort((a, b) => a - b).map((p) => formatPc(p, { preferFlats: PREFER_FLATS })).join(' ');
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// A scale written on the staff (correct flats/sharps), letters under each note.
function staffFor(rootPc, scaleId) {
    const sc = catalog.find((s) => s.id === scaleId);
    if (!sc) return '';
    const rootName = formatPc(rootPc, { preferFlats: PREFER_FLATS });
    return renderStaff(spellScaleNotes(rootName, sc), { letters: true });
}

// A pc→correct-label namer for a scale, so the fretboard map matches the staff.
function namerFor(rootPc, scaleId) {
    const sc = catalog.find((s) => s.id === scaleId);
    if (!sc) return null;
    const m = spellingMap(formatPc(rootPc, { preferFlats: PREFER_FLATS }), sc);
    return (pc) => m.get(pc) ?? formatPc(pc, { preferFlats: PREFER_FLATS });
}

function generate() {
    const text = $('prog-input').value;
    const tonicPc = Number($('key-tonic').value);
    const scaleId = $('key-quality').value === 'minor' ? 'natural-minor' : 'major';
    const { lines, flat } = parseProgression(text);
    if (!flat.length) { $('lesson').innerHTML = '<p class="empty">Type a chord progression above, then press “Build lesson”.</p>'; return; }

    const lesson = buildLesson(flat, tonicPc, scaleId, catalog, { preferFlats: PREFER_FLATS });
    $('lesson').innerHTML = renderLesson(lesson, lines);
}

function renderLesson(lesson, lines) {
    const L = lesson.chordLessons;
    const flat = lines.flat();

    // 1) Overview + the changes with function labels under each chord.
    const changes = lines.map((line) => `
        <div class="changes-line">
            ${line.map((c) => {
                const cl = L.get(c.symbol);
                return `<div class="chg"><span class="chg-sym">${esc(c.symbol)}</span><span class="chg-fn">${esc(cl.fn.label)}</span></div>`;
            }).join('')}
        </div>`).join('');

    // 2) Home base scale map.
    const homeSection = `
        <section class="lz home">
            <h2>Home base · ${esc(lesson.home.name)}</h2>
            <p class="notes-row">${esc(lesson.home.notes)}</p>
            <p class="say">This is the key. When in doubt, everything below is a flavor of these seven notes — land on them and you’re home. Read it, then find it.</p>
            <div class="staff-wrap">${staffFor(lesson.home.tonicPc, lesson.home.scaleId)}</div>
            <div class="map">${scaleMap(lesson.home.tonicPc, catalog.find((s) => s.id === lesson.home.scaleId).intervals, { preferFlats: PREFER_FLATS, nameFor: namerFor(lesson.home.tonicPc, lesson.home.scaleId) })}</div>
        </section>`;

    // 3) Chord-by-chord cards.
    const cards = lesson.order.map((sym) => {
        const c = L.get(sym);
        const voicing = chooseVoicing(c.rootPc, c.quality);
        const relTag = c.diatonic ? '<span class="tag in">in key</span>' : '<span class="tag out">borrowed</span>';
        const colorRows = c.colors.map((col) => `
            <div class="opt">
                <span class="opt-name">${esc(col.name)}</span>
                ${col.mood ? `<span class="opt-mood">${esc(col.mood)}</span>` : ''}
                <span class="opt-notes">${esc(col.notes)}</span>
                <span class="opt-why">${esc(col.why)}</span>
            </div>`).join('');
        return `
            <div class="card">
                <div class="card-dia">
                    ${chordDiagram(voicing, c.rootPc, { preferFlats: PREFER_FLATS })}
                    <div class="card-tones">${chordTonesStr(c.chordTones)}</div>
                </div>
                <div class="card-body">
                    <div class="card-head"><span class="card-sym">${esc(c.symbol)}</span><span class="card-fn">${esc(c.fn.label)}</span>${relTag}</div>
                    <div class="primary">
                        <span class="p-lead">Play</span>
                        <span class="p-name">${esc(c.primary.name)}</span>
                        <span class="p-notes">${esc(c.primary.notes)}</span>
                        <p class="p-why">${esc(c.primary.why)}</p>
                    </div>
                    ${colorRows ? `<div class="colors"><span class="c-lead">Color it</span>${colorRows}</div>` : ''}
                </div>
            </div>`;
    }).join('');

    // 4) Scale-shape appendix — one full-neck map per DISTINCT primary scale.
    const seen = new Set();
    const shapeMaps = [];
    for (const sym of lesson.order) {
        const c = L.get(sym);
        const key = `${c.primary.scaleId}@${c.primary.rootPc}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const sc = catalog.find((s) => s.id === c.primary.scaleId);
        if (!sc) continue;
        shapeMaps.push(`
            <div class="shape">
                <h3>${esc(c.primary.name)} <span class="shape-notes">${esc(c.primary.notes)}</span></h3>
                <div class="staff-wrap">${staffFor(c.primary.rootPc, c.primary.scaleId)}</div>
                <div class="map">${scaleMap(c.primary.rootPc, sc.intervals, { preferFlats: PREFER_FLATS, nameFor: namerFor(c.primary.rootPc, c.primary.scaleId) })}</div>
            </div>`);
    }

    // 5) Walking lines — a bar that connects each change (root·3rd·5th → approach → next root).
    const moves = uniqueMoves(flat);
    const walkRows = moves.map(([a, b]) => {
        const mk = (c) => ({ symbol: c.symbol, rootName: formatPc(c.rootPc, { preferFlats: PREFER_FLATS }), rootPc: c.rootPc, quality: c.quality });
        const w = buildWalk(mk(a), mk(b), { preferFlat: PREFER_FLATS });
        return `<div class="walk"><div class="staff-wrap">${renderStaff(w.notes, { letters: true, chordMarks: w.marks })}</div></div>`;
    }).join('');

    return `
        <header class="lesson-head">
            <h1>Guitar Lesson</h1>
            <p class="subtitle">A play-along guide in <strong>${esc(lesson.home.name)}</strong> · red dot = root</p>
        </header>
        <section class="lz changes-box">
            <h2>The changes</h2>
            ${changes}
            <p class="say">Roman numerals show each chord’s job in the key. <strong>V7/x</strong> = a “secondary dominant” borrowed to point at the next chord.</p>
        </section>
        ${homeSection}
        <section class="lz">
            <h2>Chord by chord — what to play</h2>
            <div class="cards">${cards}</div>
        </section>
        <section class="lz">
            <h2>Walking the changes</h2>
            <p class="say">One bar that walks out of each chord and into the next: <strong>root · 3rd · 5th</strong>, then a half-step <strong>approach</strong> note that leans into the next root. Play it, then read it — this is voice-leading and sight-reading at once.</p>
            <div class="walks">${walkRows}</div>
        </section>
        <section class="lz">
            <h2>Scale library — read it &amp; play it</h2>
            <p class="say">Every “Play” scale on the staff (correct spelling for the key) and mapped on the neck. Red = root note.</p>
            <div class="shapes">${shapeMaps.join('')}</div>
        </section>`;
}

async function init() {
    $('key-tonic').innerHTML = KEYS.map((k, pc) => `<option value="${pc}"${pc === 10 ? ' selected' : ''}>${k}</option>`).join('');
    $('prog-input').value = DEFAULT_PROG;
    $('build-btn').addEventListener('click', generate);
    $('print-btn').addEventListener('click', () => window.print());
    try {
        catalog = await loadScales();
    } catch (e) {
        $('lesson').innerHTML = `<p class="empty">Could not load the scale catalog: ${e.message}</p>`;
        return;
    }
    generate();   // build the default lesson right away
}

init();
