// grid.js — the colour pitch-grid editor (the friendly "input" half of the
// hybrid). Rows are the instrument's bars (high pitch on top, like the staff),
// columns are *slots* — each beat is split into SLOTS_PER_BEAT (eighth-note
// resolution). Click an empty cell to drop the selected-duration note; click a
// placed note to remove it. Pure rendering — all state lives in app.js.

import { NOTE_COLORS, letterOf, BEATS_PER_BAR, BEAT_W, SLOTS_PER_BEAT } from './model.js';

export function renderGrid(container, { scale, bars, notes, onCellClick, onNoteClick, beatsPerBar = 4 }) {
    const slotsPerBar = beatsPerBar * SLOTS_PER_BEAT;
    const totalSlots = bars * slotsPerBar;
    const rows = scale.slice().reverse(); // high pitch first (top row)

    const grid = document.createElement('div');
    grid.className = 'grid';
    grid.style.setProperty('--slots', totalSlots);
    grid.style.setProperty('--rows', rows.length);

    // label + cell layer
    rows.forEach((pitch, r) => {
        const color = NOTE_COLORS[letterOf(pitch)];
        const label = document.createElement('div');
        label.className = 'row-label';
        label.style.gridRow = r + 1;
        label.innerHTML = `<span class="dot" style="background:${color}"></span>${pitch}`;
        grid.appendChild(label);

        for (let slot = 0; slot < totalSlots; slot++) {
            const beat = slot / SLOTS_PER_BEAT;
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'cell';
            if (slot % slotsPerBar === 0 && slot !== 0) cell.classList.add('bar-start');
            else if (slot % SLOTS_PER_BEAT === 0) cell.classList.add('beat-start'); // on-the-beat
            if (Math.floor(slot / slotsPerBar) % 2 === 1) cell.classList.add('bar-alt');
            cell.style.gridRow = r + 1;
            cell.style.gridColumn = slot + 2; // +2: column 1 is the label
            cell.dataset.pitch = pitch;
            cell.dataset.slot = slot;
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
        const startSlot = Math.round(n.start * SLOTS_PER_BEAT);
        const spanSlots = Math.max(1, Math.round(n.durBeats * SLOTS_PER_BEAT));
        block.style.gridColumn = `${startSlot + 2} / span ${spanSlots}`;
        block.style.background = color;
        block.title = `${n.pitch} — remove`;
        block.addEventListener('click', () => onNoteClick(n));
        grid.appendChild(block);
    });

    container.innerHTML = '';
    container.style.setProperty('--slot-w', `${BEAT_W / SLOTS_PER_BEAT}px`);
    container.appendChild(grid);
}
