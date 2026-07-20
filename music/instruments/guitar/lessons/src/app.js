// app.js — bootstrap for the Guitar Lessons page. All the page logic lives in the
// shared engine; this just picks the pack and the default instrument.
import { initLessonsPage } from '/music/_shared/lessons/page.js';
import { LESSONS } from '/music/_shared/lessons/packs/starter-guitar.js';

initLessonsPage({ lessons: LESSONS, defaultInstrument: 'guitar' });
