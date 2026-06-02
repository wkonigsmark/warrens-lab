// app.js — interactive quiz. Thin view over questions.js + notation.js + audio.
// All theory/question logic lives in the pure modules; this file only does DOM,
// timing, and reward feedback.

import { SCREEN_TOPICS, rng } from './questions.js';
import { renderStaffNote, renderDuration, renderKeyboard, NOTE_COLORS } from './notation.js';
import * as audio from './audio.js';

const GAMES = [
    { id: 'note-name', label: '🎼 Name the Note' },
    { id: 'beat-count', label: '🥁 Count the Beats' },
    { id: 'longest-note', label: '⏳ Longest Note' },
    { id: 'find-key', label: '🎹 Find the Key' },
    { id: 'higher-lower', label: '👂 Higher or Lower' },
];
const LEVEL_LABELS = { 1: '🐣 Starter', 2: '🐥 Getting it', 3: '🦅 Tricky' };
const ROUND = 8;

const $ = (id) => document.getElementById(id);
const state = { game: 'note-name', level: 1, queue: [], i: 0, score: 0, r: null };

// --- setup screen ----------------------------------------------------------
function renderChips(host, items, current, onPick) {
    host.innerHTML = '';
    items.forEach(({ id, label }) => {
        const b = document.createElement('button');
        b.className = 'chip' + (id === current ? ' sel' : '');
        b.textContent = label;
        b.onclick = () => { onPick(id); };
        host.appendChild(b);
    });
}
function paintSetup() {
    renderChips($('games'), GAMES, state.game, (id) => { state.game = id; paintSetup(); });
    renderChips($('levels'),
        [1, 2, 3].map((l) => ({ id: l, label: LEVEL_LABELS[l] })),
        state.level, (id) => { state.level = id; paintSetup(); });
}

// --- quiz flow -------------------------------------------------------------
function start() {
    state.r = rng();
    const gen = SCREEN_TOPICS[state.game];
    state.queue = Array.from({ length: ROUND }, () => gen(state.r, state.level));
    state.i = 0; state.score = 0;
    show('quiz');
    nextQuestion();
}

function nextQuestion() {
    if (state.i >= state.queue.length) return finish();
    const q = state.queue[state.i];
    $('progress').textContent = `Question ${state.i + 1} / ${state.queue.length}`;
    $('stars').textContent = '⭐'.repeat(state.score);
    $('prompt').textContent = q.prompt;
    $('figure').innerHTML = figureFor(q);
    $('feedback').textContent = '';
    $('feedback').className = 'feedback';

    const listen = $('listen');
    if (q.audio && (q.audio.sequence || q.listenOnly)) {
        listen.classList.remove('hidden');
        listen.onclick = () => playAudio(q);
        playAudio(q);
    } else {
        listen.classList.add('hidden');
    }
    renderChoices(q);
}

function figureFor(q) {
    const rd = q.render;
    switch (rd.kind) {
        case 'staffNote': return renderStaffNote(rd.name, { colored: rd.colored });
        case 'duration': return renderDuration(rd.id);
        case 'durationRow': return rd.ids.map((id) => renderDuration(id)).join('');
        case 'keyboard': return renderKeyboard();
        case 'ears': return '<div class="ears">👂</div>';
        default: return '';
    }
}

// How each choice is shown: letters get a colour dot, durations get a glyph.
function choiceMarkup(q, choice) {
    if (q.topic === 'longest-note') return renderDuration(choice, { width: 56, height: 74 });
    if ((q.topic === 'note-name' || q.topic === 'find-key')) {
        const dot = `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;
            background:${NOTE_COLORS[choice]};margin-right:6px;vertical-align:middle"></span>`;
        return `${dot}${choice}`;
    }
    return choice;
}

function renderChoices(q) {
    const host = $('choices');
    host.innerHTML = '';
    q.choices.forEach((choice) => {
        const b = document.createElement('button');
        b.className = 'choice';
        b.innerHTML = choiceMarkup(q, choice);
        b.onclick = () => answer(q, choice, b);
        host.appendChild(b);
    });
}

function answer(q, choice, btn) {
    if ($('choices').dataset.locked) return;
    $('choices').dataset.locked = '1';
    const correct = choice === q.answer;
    btn.classList.add(correct ? 'right' : 'wrong');
    const fb = $('feedback');
    if (correct) {
        state.score++;
        fb.textContent = '🎉 Yes!';
        fb.className = 'feedback good';
        audio.playCorrect();
        if (q.audio && q.audio.note) setTimeout(() => audio.playNote(q.audio.note), 350);
    } else {
        fb.textContent = `Almost! It's ${labelOfAnswer(q)}`;
        fb.className = 'feedback bad';
        audio.playWrong();
        // highlight the right one
        [...$('choices').children].forEach((c, idx) => {
            if (q.choices[idx] === q.answer) c.classList.add('right');
        });
    }
    setTimeout(() => {
        delete $('choices').dataset.locked;
        state.i++;
        nextQuestion();
    }, correct ? 1100 : 1900);
}

function labelOfAnswer(q) {
    if (q.labelFor) return q.labelFor(q.answer);
    return q.answer;
}

function playAudio(q) {
    const a = q.audio || {};
    if (a.sequence) audio.playSequence(a.sequence);
    else if (a.note) audio.playNote(a.note);
    else if (a.taps) audio.playTaps(a.taps);
}

function finish() {
    show('done');
    const pct = state.score / state.queue.length;
    $('done-title').textContent = pct === 1 ? '🏆 Perfect!' : pct >= 0.6 ? '🌟 Great job!' : '👍 Keep going!';
    $('done-score').textContent = `You got ${state.score} out of ${state.queue.length}.`;
    if (pct >= 0.6) audio.playCorrect();
}

function show(which) {
    ['setup', 'quiz', 'done'].forEach((s) => $(s).classList.toggle('hidden', s !== which));
}

$('start').onclick = start;
$('again').onclick = () => show('setup');
paintSetup();
