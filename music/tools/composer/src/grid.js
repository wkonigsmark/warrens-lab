// grid.js — the colour pitch-grid editor (the friendly "input" half of the
// hybrid). Rows are the instrument's bars (high pitch on top, like the staff),
// columns are beats. Click an empty cell to drop the selected-duration note;
// click a placed note to remove it. Pure rendering — all state lives in app.js.

import { NOTE_COLORS, letterOf, BEATS_PER_BAR, BEAT_W } from './model.js';

export function renderGrid(container, { scale, bars, notes, onCellClick, onNoteClick }) {
    const totalBeats = bars * BEATS_PER_BAR;
    const rows = scale.slice().reverse(); // high pitch first (top row)

    const grid = document.createElement('div');
    grid.className = 'grid';
    grid.style.setProperty('--beats', totalBeats);
    grid.style.setProperty('--rows', rows.length);

    // label + cell layer
    rows.forEach((pitch, r) => {
        const color = NOTE_COLORS[letterOf(pitch)];
        const label = document.createElement('div');
        label.className = 'row-label';
        label.style.gridRow = r + 1;
        label.innerHTML = `<span class="dot" style="background:${color}"></span>${pitch}`;
        grid.appendChild(label);

        for (let beat = 0; beat < totalBeats; beat++) {
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'cell';
            if (beat % BEATS_PER_BAR === 0 && beat !== 0) cell.classList.add('bar-start');
            if (Math.floor(beat / BEATS_PER_BAR) % 2 === 1) cell.classList.add('bar-alt');
            cell.style.gridRow = r + 1;
            cell.style.gridColumn = beat + 2; // +2: column 1 is the label
            cell.setAttribute('aria-label', `${pitch}, beat ${beat + 1}`);
            cell.addEventListener('click', () => onCellClick(pitch, beat));
            grid.appendChild(cell);
        }
    });

    // note blocks (overlay, placed on the same grid tracks)
    notes.forEach((n) => {
        const r = rows.indexOf(n.pitch);
        if (r < 0) return; // pitch outside current range — skip
        const color = NOTE_COLORS[letterOf(n.pitch)];
        const block = document.createElement('button');
        block.type = 'button';
        block.className = 'note-block';
        block.style.gridRow = r + 1;
        block.style.gridColumn = `${n.start + 2} / span ${n.durBeats}`;
        block.style.background = color;
        block.title = `${n.pitch} — remove`;
        block.addEventListener('click', () => onNoteClick(n));
        grid.appendChild(block);
    });

    container.innerHTML = '';
    container.style.setProperty('--beat-w', `${BEAT_W}px`);
    container.appendChild(grid);
}
