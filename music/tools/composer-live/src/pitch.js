// pitch.js — monophonic pitch detection from a time-domain audio buffer, using
// the McLeod Pitch Method (NSDF + first-peak picking). Pure DSP, no dependencies.
//
// A pitched sound repeats every 1/f seconds, so the signal lined up against a
// delayed copy of itself peaks at lag = period T (and again at 2T, 3T…). Plain
// autocorrelation picks the tallest peak, which is often a SUBHARMONIC (2T/3T →
// an octave or more too low). McLeod's fix: compute the Normalised Square
// Difference Function (peaks at +1 for a perfect period), then take the FIRST
// peak that clears 90% of the tallest peak — that's the fundamental, not a
// multiple of it. Returns { freq, clarity } or null.

// Plausible fundamental range — wide enough to cover low humming up through high
// singing/whistling without clipping melody lines. ~C2 … ~C7.
export const MIN_HZ = 65;    // ~C2  (65.4 Hz)
export const MAX_HZ = 2100;  // ~C7  (2093 Hz)

const SILENCE_RMS = 0.01;    // below this = silence; report nothing
const MIN_CLARITY = 0.6;     // NSDF peak below this = unvoiced/noisy; reject
const PEAK_RATIO = 0.9;      // accept the first peak ≥ this fraction of the max peak

export function detectPitch(buf, sampleRate) {
    const SIZE = buf.length;

    // Loudness gate — ignore silence.
    let rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / SIZE);
    if (rms < SILENCE_RMS) return null;

    const minLag = Math.max(1, Math.floor(sampleRate / MAX_HZ));
    const maxLag = Math.min(Math.floor(sampleRate / MIN_HZ), SIZE - 1);

    // NSDF over the candidate lags: 2·Σ x[i]x[i+τ] / Σ (x[i]²+x[i+τ]²) ∈ [-1, 1].
    const nsdf = new Float32Array(maxLag + 1);
    for (let lag = minLag; lag <= maxLag; lag++) {
        let ac = 0, energy = 0;
        for (let i = 0; i < SIZE - lag; i++) {
            ac += buf[i] * buf[i + lag];
            energy += buf[i] * buf[i] + buf[i + lag] * buf[i + lag];
        }
        nsdf[lag] = energy > 0 ? (2 * ac) / energy : 0;
    }

    // Collect the local maxima (one per "key" region between positive zero-crossings).
    let globalMax = 0;
    const peaks = [];
    for (let lag = minLag + 1; lag < maxLag; lag++) {
        if (nsdf[lag] > nsdf[lag - 1] && nsdf[lag] >= nsdf[lag + 1] && nsdf[lag] > 0) {
            peaks.push(lag);
            if (nsdf[lag] > globalMax) globalMax = nsdf[lag];
        }
    }
    if (!peaks.length || globalMax < MIN_CLARITY) return null;

    // First peak that clears the ratio threshold = the fundamental period.
    const threshold = PEAK_RATIO * globalMax;
    let chosen = peaks[0];
    for (const lag of peaks) {
        if (nsdf[lag] >= threshold) { chosen = lag; break; }
    }

    // Parabolic interpolation around the chosen NSDF peak → sub-sample precision.
    const x1 = nsdf[chosen - 1], x2 = nsdf[chosen], x3 = nsdf[chosen + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    const lag = a ? chosen - b / (2 * a) : chosen;

    return { freq: sampleRate / lag, clarity: globalMax };
}

// --- Frequency ↔ note helpers --------------------------------------------
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Nearest MIDI note number to a frequency (A4 = 69 = 440Hz).
export const freqToMidi = (freq) => Math.round(12 * Math.log2(freq / 440) + 69);
export const midiToFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
export const midiToName = (midi) => NOTE_NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);

// How far (in cents, ±50) the frequency sits from the nearest tempered note.
export function centsOff(freq, midi) {
    return Math.round(1200 * Math.log2(freq / midiToFreq(midi)));
}

export const isSharp = (midi) => NOTE_NAMES[((midi % 12) + 12) % 12].includes('#');
