// index.js — the lesson PACK. Assembles the individual lesson modules into one
// ordered list. This is the ONLY place lesson order lives: reorder the array to
// resequence the pack, or drop a lesson in/out — nothing else changes, and no
// lesson knows its own number (the page derives "Lesson N" from position).
//
// The pack is instrument-agnostic: a guitar page and a future piano page both
// import it and just choose which instrument to render/default to.

import { LESSON as amTensionResolve } from './am-tension-resolve.js';
import { LESSON as cMajorBrightSide } from './c-major-bright-side.js';
import { LESSON as aMinorBlues } from './a-minor-blues.js';
import { LESSON as gMajorFourChords } from './g-major-four-chords.js';

export const LESSONS = [
    amTensionResolve,
    cMajorBrightSide,
    aMinorBlues,
    gMajorFourChords,
    // Append new lessons here — position sets the order (see ROADMAP.md).
];

export const lessonById = (id) => LESSONS.find((l) => l.id === id);
export const firstLessonId = () => LESSONS[0].id;
export const lessonNumber = (id) => LESSONS.findIndex((l) => l.id === id) + 1;

// Find an exercise within a given lesson (the walking-line handoff needs this).
export const exerciseInLesson = (lessonId, exId) =>
    (lessonById(lessonId)?.exercises || []).find((e) => e.id === exId);
