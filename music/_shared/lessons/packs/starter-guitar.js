// starter-guitar.js — the guitar starter pack. Assembles the lesson modules into
// one ordered list. Array order = display order; reorder to resequence, no lesson
// knows its own number.

import { LESSON as amTensionResolve } from '../am-tension-resolve.js';
import { LESSON as cMajorBrightSide } from '../c-major-bright-side.js';
import { LESSON as aMinorBlues } from '../a-minor-blues.js';
import { LESSON as gMajorFourChords } from '../g-major-four-chords.js';

export const LESSONS = [
    amTensionResolve,
    cMajorBrightSide,
    aMinorBlues,
    gMajorFourChords,
];
