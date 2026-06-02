// worksheet.js — printable worksheet generator. Reuses the EXACT same question
// objects and SVG renderers as the screen, then lays them out for paper. An
// "answer key" toggle just marks the correct option — same questions, two views.

import { buildWorksheet, PRINTABLE_TOPICS } from './questions.js';
import { renderStaffNote, renderDuration, renderKeyboard } from './notation.js';

const TOPIC_LABELS = {
    'note-name': 'Name the Note',
    'beat-count': 'Count the Beats',
    'longest-note': 'Longest Note',
    'find-key': 'Find the Key',
};
const $ = (id) => document.getElementById(id);

// build topic checkboxes
const checks = $('topic-checks');
Object.entries(TOPIC_LABELS).forEach(([id, label], i) => {
    const l = document.createElement('label');
    l.innerHTML = `<input type="checkbox" value="${id}" ${i < 2 ? 'checked' : ''}> ${label}`;
    checks.appendChild(l);
});

function selectedTopics() {
    return [...checks.querySelectorAll('input:checked')].map((c) => c.value);
}

function figureFor(q) {
    const rd = q.render;
    switch (rd.kind) {
        case 'staffNote': return renderStaffNote(rd.name, { colored: rd.colored });
        case 'duration': return renderDuration(rd.id);
        case 'durationRow': return rd.ids.map((id) => renderDuration(id)).join('');
        case 'keyboard': return renderKeyboard();
        default: return '';
    }
}

function optionMarkup(q, choice) {
    if (q.topic === 'longest-note') return renderDuration(choice, { width: 46, height: 60 });
    return choice;
}

function render() {
    const topics = selectedTopics();
    if (!topics.length) { $('sheet').innerHTML = '<p style="text-align:center">Pick at least one topic.</p>'; return; }
    const level = +$('level').value;
    const count = Math.min(30, Math.max(4, +$('count').value || 12));
    const showKey = $('answers').checked;
    const seed = Math.floor(Math.random() * 1e9);
    const questions = buildWorksheet({ seed, level, topics, count });

    const items = questions.map((q, i) => {
        const opts = q.choices.map((c) => {
            const isKey = showKey && c === q.answer;
            return `<span class="opt${isKey ? ' key' : ''}">${optionMarkup(q, c)}</span>`;
        }).join('');
        return `<div class="q">
            <div class="qprompt"><span class="num">${i + 1}.</span> ${q.prompt}</div>
            <div class="glyphs">${figureFor(q)}</div>
            <div class="opts">${opts}</div>
        </div>`;
    }).join('');

    $('sheet').innerHTML = `
        <h1>🎵 Music School Worksheet</h1>
        <p class="meta">${topics.map((t) => TOPIC_LABELS[t]).join(' · ')} — Level ${level}${showKey ? ' — ANSWER KEY' : ''}</p>
        <div class="namebar"><span>Name:</span><span>Date:</span></div>
        <div class="qgrid">${items}</div>`;
}

$('make').onclick = render;
$('print').onclick = () => window.print();
render(); // initial sheet
