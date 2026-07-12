// Web Audio synth sounds + background music.
// All sounds are synthesized in-browser — no extra audio files except the bg music.
// AudioContext is created lazily on first use (browser requires it after user gesture).

let _ctx = null

function ctx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function note(freq, startDelay, dur, type = 'sine', vol = 0.28) {
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
  note(220, 0,    0.09, 'sawtooth', 0.18)
  note(170, 0.08, 0.22, 'sawtooth', 0.10)
}

// Three-note ascending fanfare: C5 → E5 → G5
export function playLevelUp() {
  note(523, 0,    0.14)
  note(659, 0.13, 0.14)
  note(784, 0.26, 0.32)
}

// ── Background music ───────────────────────────────────────────────────────

let _music = null
let _musicOn = false

export function initMusic() {
  if (_music) return
  _music = new Audio('/audio/hyrule_theme.mp3')
  _music.loop = true
  _music.volume = 0.30
}

export function setMusic(on) {
  if (!_music) initMusic()
  _musicOn = on
  if (on) _music.play().catch(() => {})
  else _music.pause()
}

export function getMusicOn() {
  return _musicOn
}
