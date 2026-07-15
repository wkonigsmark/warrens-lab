// Web Audio synth sounds — no audio files, created lazily on first use.

let _ctx = null

function ctx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function note(freq, startDelay, dur, type = 'sine', vol = 0.24) {
  const c = ctx()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)
  osc.type = type
  osc.frequency.value = freq
  const t = c.currentTime + startDelay
  gain.gain.setValueAtTime(vol, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

// Bright two-note ding: C5 → E5
export function playCorrect() {
  note(523, 0,    0.13)
  note(659, 0.11, 0.20)
}

// Short descending buzz
export function playWrong() {
  note(220, 0,    0.09, 'sawtooth', 0.16)
  note(170, 0.08, 0.22, 'sawtooth', 0.09)
}

// Ascending fanfare (topic cleared)
export function playSummit() {
  note(523, 0,    0.14)
  note(659, 0.13, 0.14)
  note(784, 0.26, 0.32)
}

// Tiny click for a ladder step up
export function playClimb() {
  note(880, 0, 0.08, 'triangle', 0.18)
}
