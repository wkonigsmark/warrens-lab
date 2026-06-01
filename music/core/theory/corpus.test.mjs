// corpus.test.mjs — the engine's gate. Canonical progressions with the answer
// a player would expect. Run: node core/theory/corpus.test.mjs
// No downloads — these are hand-written from theory.

import { readFile } from 'node:fs/promises';
import { buildChord } from './chords.js';
import { parseScales } from './scales.js';
import { analyzeProgression, detectGlobal } from './analysis.js';

const PC = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
const prog = (...pairs) => pairs.map(([r, q]) => buildChord(PC[r], q));

const raw = JSON.parse(await readFile(new URL('./scales.json', import.meta.url)));
const catalog = parseScales(raw);

let pass = 0, fail = 0;
const check = (cond, msg, detail) => {
    if (cond) pass++;
    else { fail++; console.error(`✗ ${msg}${detail ? `\n    ${detail}` : ''}`); }
};
const top = (p) => detectGlobal(p, catalog)[0];

// 1. ii–V–I in C → home is C major.
{
    const t = top(prog(['D', 'min7'], ['G', 'dom7'], ['C', 'maj7']));
    check(t.tonicPc === PC.C && t.scaleId === 'major', 'ii-V-I in C → C major', `got ${t.name} (${t.confidence})`);
    check(t.confidence === 'strong', 'ii-V-I is a strong fit', `got ${t.confidence}`);
}

// 2. I–V–vi–IV in C → C major.
{
    const t = top(prog(['C', 'maj'], ['G', 'maj'], ['A', 'min'], ['F', 'maj']));
    check(t.tonicPc === PC.C && t.scaleId === 'major', 'I-V-vi-IV → C major', `got ${t.name}`);
}

// 3. Dorian vamp Dm7–G7–Dm7 → same notes as C major, but centered on D.
{
    const t = top(prog(['D', 'min7'], ['G', 'dom7'], ['D', 'min7']));
    check(t.tonicPc === PC.D, 'Dm7-G7-Dm7 centers on D (modal)', `got ${t.name}`);
    check(t.scaleId === 'dorian', '...named as D Dorian', `got ${t.scaleId}`);
}

// 4. Mixolydian vamp G7–F–G7 → C-major collection centered on G.
{
    const t = top(prog(['G', 'dom7'], ['F', 'maj'], ['G', 'dom7']));
    check(t.tonicPc === PC.G, 'G7-F-G7 centers on G (modal)', `got ${t.name}`);
    check(t.scaleId === 'mixolydian', '...named as G Mixolydian', `got ${t.scaleId}`);
}

// 5. 12-bar-ish blues A7–D7–A7–E7 → no single major scale fits; stay forgiving.
{
    const p = prog(['A', 'dom7'], ['D', 'dom7'], ['A', 'dom7'], ['E', 'dom7']);
    const t = top(p);
    check(!!t, 'blues still returns a candidate', 'got none');
    check(t.confidence !== 'strong', 'blues is NOT a clean single-scale fit', `got ${t.confidence}`);
}

// 6. Layered output: per-chord relation + degrees for ii–V–I.
{
    const { global, perChord } = analyzeProgression(prog(['D', 'min7'], ['G', 'dom7'], ['C', 'maj7']), catalog);
    check(global.length > 0 && perChord.length === 3, 'analyze returns layered result', `g=${global.length} pc=${perChord.length}`);
    check(perChord.every((c) => c.relationToGlobal === 'diatonic'), 'all ii-V-I chords diatonic to C', '');
    const dm = perChord[0];
    check(dm.roman === 'ii', 'Dm7 is the ii', `got ${dm.roman}`);
    check(dm.primaryMode && dm.primaryMode.label === 'D Dorian' && dm.primaryMode.scaleId === 'dorian' && dm.primaryMode.rootPc === PC.D,
        'play D Dorian (structured) over the ii', `got ${JSON.stringify(dm.primaryMode)}`);
    check(dm.colorOptions.every((o) => o.label && typeof o.rootPc === 'number' && o.scaleId),
        'color options are structured for deep-linking', `got ${JSON.stringify(dm.colorOptions)}`);
}

// 7. Borrowed chord flagged as outside: C–F–G–Ab–C in C (♭VI from parallel minor).
{
    const { global, perChord } = analyzeProgression(
        prog(['C', 'maj'], ['F', 'maj'], ['G', 'maj'], ['Ab', 'maj'], ['C', 'maj']), catalog);
    check(global[0].tonicPc === PC.C, 'C-F-G-Ab-C home is C', `got ${global[0].name}`);
    const ab = perChord.find((c) => c.chord.rootPc === PC.Ab);
    check(!!ab && ab.relationToGlobal === 'outside', 'A♭ major flagged as borrowed/outside', ab ? ab.relationToGlobal : 'not found');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
