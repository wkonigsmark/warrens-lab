// transcribe.js — turn a captured pitch stream into discrete notes.
//
// The session is ~25 samples/sec of {t, midi (fractional), clarity}. Segmentation
// is the hard part of the whole vision: a continuous, wobbly pitch curve has to
// become "this note, then that note". Strategy:
//   1. round each sample to the nearest semitone (or null if unvoiced/weak),
//   2. median-smooth to kill single-sample octave blips and vibrato flicker,
//   3. walk the stream, grouping equal-pitch runs into notes — tolerating brief
//      detection dropouts (gapTol) so one note doesn't shatter into many,
//   3b. split a same-pitch run when loudness (RMS) dips into a valley and attacks
//       again — that's a re-articulated REPEATED note ("C C"), which pitch alone
//       can't separate,
//   4. drop too-short fragments (glides, breath).
// Output: raw notes in SECONDS — { startSec, durSec, midi }. notesToBeats() then
// turns those into the Composer's beat-based { start, pitch, durBeats }, with an
// optional quantize pass (the "tighten onto the grid" step — kept OPTIONAL).

import { midiToName } from './pitch.js';

export function segmentNotes(session, opts = {}) {
    const {
        minClarity = 0.65, minDurSec = 0.09, medianWin = 5, gapTolSec = 0.09,
        valleyRatio = 0.55, riseRatio = 1.5, minOnsetSec = 0.1,
    } = opts;
    const N = session.length;
    if (!N) return [];

    // 1. nearest-semitone MIDI per sample, or null when unvoiced / too weak.
    const raw = new Array(N);
    for (let i = 0; i < N; i++) {
        const s = session[i];
        raw[i] = (s && s.midi != null && s.clarity >= minClarity) ? Math.round(s.midi) : null;
    }
    // 2. median smooth (keeps nulls as silence, steadies the pitch).
    const pitch = medianSmooth(raw, medianWin);

    const dt = estimateDt(session);

    // 3. group equal-pitch runs into notes; split on silence gaps AND on loudness
    //    valleys (re-articulated repeats). cur tracks loudness peak/valley state.
    const notes = [];
    let cur = null;
    const push = (endT, midi, startT) => notes.push({ startSec: startT, durSec: (endT - startT) + dt, midi });
    const close = () => { if (cur) push(cur.endT, cur.midi, cur.startT); cur = null; };
    const open = (midi, t, rms) => ({ midi, startT: t, endT: t, lastT: t, peak: rms, valley: Infinity, valleyT: t, inValley: false });

    for (let i = 0; i < N; i++) {
        const t = session[i].t;
        const p = pitch[i];
        const rms = (session[i] && session[i].rms) || 0;
        if (p == null) {
            if (cur && (t - cur.lastT) > gapTolSec) close();
            continue;
        }
        if (!cur) { cur = open(p, t, rms); continue; }
        if (p !== cur.midi) { close(); cur = open(p, t, rms); continue; }

        // same pitch — look for a re-articulation onset (loudness valley → attack).
        cur.peak = Math.max(cur.peak, rms);
        if (!cur.inValley) {
            if (rms < valleyRatio * cur.peak) { cur.inValley = true; cur.valley = rms; cur.valleyT = t; }
        } else if (rms < cur.valley) {
            cur.valley = rms; cur.valleyT = t;
        } else if (rms > riseRatio * cur.valley && (cur.valleyT - cur.startT) > minOnsetSec) {
            push(cur.valleyT, cur.midi, cur.startT);   // close the first repeat at the valley
            cur = open(p, cur.valleyT, rms);           // the second repeat starts there
        }
        cur.endT = t; cur.lastT = t;
    }
    close();

    // 4. drop fragments too short to be a real note.
    return notes.filter((n) => n.durSec >= minDurSec);
}

function medianSmooth(arr, win) {
    const half = Math.floor(win / 2);
    const out = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == null) { out[i] = null; continue; }
        const vals = [];
        for (let j = Math.max(0, i - half); j <= Math.min(arr.length - 1, i + half); j++) {
            if (arr[j] != null) vals.push(arr[j]);
        }
        vals.sort((a, b) => a - b);
        out[i] = vals.length ? vals[Math.floor(vals.length / 2)] : arr[i];
    }
    return out;
}

function estimateDt(session) {
    const diffs = [];
    for (let i = 1; i < session.length; i++) {
        const d = session[i].t - session[i - 1].t;
        if (d > 0 && d < 0.5) diffs.push(d);
    }
    if (!diffs.length) return 0.04;
    diffs.sort((a, b) => a - b);
    return diffs[Math.floor(diffs.length / 2)];
}

// Convert seconds-notes → Composer beat-notes { start, pitch, durBeats }.
// quantizeSub: grid divisions per beat (2 = eighths, 4 = sixteenths). 0 = raw timing.
export function notesToBeats(rawNotes, bpm, opts = {}) {
    const { quantizeSub = 2 } = opts;
    if (!rawNotes.length) return [];
    const bps = bpm / 60;
    const t0 = rawNotes[0].startSec;

    let out = rawNotes.map((n) => ({
        start: (n.startSec - t0) * bps,
        durBeats: n.durSec * bps,
        midi: n.midi,
    }));

    if (quantizeSub) {
        const g = 1 / quantizeSub;
        out = out.map((n) => ({
            start: Math.round(n.start / g) * g,
            durBeats: Math.max(g, Math.round(n.durBeats / g) * g),
            midi: n.midi,
        }));
    } else {
        out = out.map((n) => ({ ...n, durBeats: Math.max(0.25, n.durBeats) }));
    }

    // Monophonic cleanup: sort, and trim/shift so notes don't overlap.
    out.sort((a, b) => a.start - b.start);
    const minDur = quantizeSub ? 1 / quantizeSub : 0.25;
    for (let i = 1; i < out.length; i++) {
        const prev = out[i - 1];
        if (out[i].start <= prev.start) out[i].start = prev.start + minDur;     // same onset → next slot
        if (out[i].start < prev.start + prev.durBeats) {
            prev.durBeats = Math.max(minDur, out[i].start - prev.start);        // trim the overlap
        }
    }

    return out.map((n) => ({ start: n.start, pitch: midiToName(n.midi), durBeats: n.durBeats }));
}
