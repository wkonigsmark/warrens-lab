// pitch.js (shared) — monophonic pitch detection (McLeod: NSDF + first-peak),
// the canonical copy used by the shared range modal. Pure DSP, no deps.

export const MIN_HZ = 65;    // ~C2
export const MAX_HZ = 2100;  // ~C7
const SILENCE_RMS = 0.01, MIN_CLARITY = 0.6, PEAK_RATIO = 0.9;

export function detectPitch(buf, sampleRate) {
    const SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
    if (Math.sqrt(rms / SIZE) < SILENCE_RMS) return null;

    const minLag = Math.max(1, Math.floor(sampleRate / MAX_HZ));
    const maxLag = Math.min(Math.floor(sampleRate / MIN_HZ), SIZE - 1);

    const nsdf = new Float32Array(maxLag + 1);
    for (let lag = minLag; lag <= maxLag; lag++) {
        let ac = 0, energy = 0;
        for (let i = 0; i < SIZE - lag; i++) {
            ac += buf[i] * buf[i + lag];
            energy += buf[i] * buf[i] + buf[i + lag] * buf[i + lag];
        }
        nsdf[lag] = energy > 0 ? (2 * ac) / energy : 0;
    }

    let globalMax = 0; const peaks = [];
    for (let lag = minLag + 1; lag < maxLag; lag++) {
        if (nsdf[lag] > nsdf[lag - 1] && nsdf[lag] >= nsdf[lag + 1] && nsdf[lag] > 0) {
            peaks.push(lag);
            if (nsdf[lag] > globalMax) globalMax = nsdf[lag];
        }
    }
    if (!peaks.length || globalMax < MIN_CLARITY) return null;

    const threshold = PEAK_RATIO * globalMax;
    let chosen = peaks[0];
    for (const lag of peaks) { if (nsdf[lag] >= threshold) { chosen = lag; break; } }

    const x1 = nsdf[chosen - 1], x2 = nsdf[chosen], x3 = nsdf[chosen + 1];
    const a = (x1 + x3 - 2 * x2) / 2, b = (x3 - x1) / 2;
    const lag = a ? chosen - b / (2 * a) : chosen;
    return { freq: sampleRate / lag, clarity: globalMax };
}

export const freqToMidi = (freq) => Math.round(12 * Math.log2(freq / 440) + 69);
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const midiToName = (midi) => NOTE_NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);
