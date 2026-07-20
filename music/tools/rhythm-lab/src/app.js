// app.js — bootstrap for the Rhythm Lab page. The rhythm pack is xylophone-first
// but works on any C-centered instrument; pure-rhythm drills show no Sing-Along
// note (Sing-Along scores pitch, not rhythm).
import { initLessonsPage } from '/music/_shared/lessons/page.js';
import { LESSONS } from '/music/_shared/lessons/packs/rhythm-xylophone.js';

initLessonsPage({ lessons: LESSONS, defaultInstrument: 'xylo', noPracticeNote: '' });
