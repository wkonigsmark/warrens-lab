// Central calibration knobs — ONE place to tune the whole assessment.
//
// This is the surface Warren adjusts while testing with real students: how long
// each topic runs (attention span), how hard the engine pushes (challenge), and
// what counts as a "fast" vs "laboured" answer (speed/attention). Everything here
// is an override on the adaptive engine's DEFAULT_CONFIG, persisted to
// localStorage so changes survive reloads, and can also be nudged per-visit with
// a `?startTheta=6` style URL param for quick experiments.

import { DEFAULT_CONFIG } from './adaptive.js'

const KEY = 'ants-assessment.config.v1'

// The knobs the Calibrate panel exposes, with metadata for rendering + guidance.
// `fmt` formats the live value; `direction` notes which way is "more".
export const TUNABLES = [
  {
    key: 'startTheta', label: 'Starting difficulty', min: 1, max: 10, step: 0.5,
    fmt: (v) => v.toFixed(1),
    help: 'Where every learner begins (1–10). Lower for younger kids so they open with a win.',
  },
  {
    key: 'minQuestions', label: 'Min questions / topic', min: 2, max: 12, step: 1,
    fmt: (v) => `${v}`,
    help: 'Never end a topic before this many. Lower it for short attention spans.',
  },
  {
    key: 'maxQuestions', label: 'Max questions / topic', min: 3, max: 15, step: 1,
    fmt: (v) => `${v}`,
    help: 'Always end a topic by this many. The main lever on total length.',
  },
  {
    key: 'reversalsToStop', label: 'Reversals to settle', min: 2, max: 8, step: 1,
    fmt: (v) => `${v}`,
    help: 'How many up↔down flips before we call it. Fewer = shorter but noisier estimate.',
  },
  {
    key: 'upDownRatio', label: 'Challenge level', min: 0.3, max: 1.0, step: 0.05,
    fmt: (v) => `${Math.round(100 / (1 + v))}% target wins`,
    help: 'Higher = harder (settles where they win less often); lower = gentler, more wins.',
  },
  {
    key: 'fastMs', label: 'Fast answer under', min: 1000, max: 8000, step: 250,
    fmt: (v) => `${(v / 1000).toFixed(1)}s`,
    help: 'Answered faster than this + correct → engine pushes harder (clearly easy).',
  },
  {
    key: 'slowMs', label: 'Laboured answer over', min: 4000, max: 20000, step: 500,
    fmt: (v) => `${(v / 1000).toFixed(1)}s`,
    help: 'Answered slower than this + correct → engine eases off (at their edge).',
  },
]

const TUNABLE_KEYS = TUNABLES.map((t) => t.key)

function fromUrl() {
  const out = {}
  try {
    const p = new URLSearchParams(window.location.search)
    for (const t of TUNABLES) {
      if (p.has(t.key)) {
        const n = Number(p.get(t.key))
        if (Number.isFinite(n)) out[t.key] = n
      }
    }
  } catch {}
  return out
}

export function loadConfig() {
  let saved = {}
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {} } catch {}
  return { ...DEFAULT_CONFIG, ...saved, ...fromUrl() }
}

// Persist only the deltas from default, so future default changes still flow through.
export function saveConfig(cfg) {
  const overrides = {}
  for (const k of TUNABLE_KEYS) {
    if (cfg[k] !== DEFAULT_CONFIG[k]) overrides[k] = cfg[k]
  }
  try {
    if (Object.keys(overrides).length) localStorage.setItem(KEY, JSON.stringify(overrides))
    else localStorage.removeItem(KEY)
  } catch {}
}

export function resetConfig() {
  try { localStorage.removeItem(KEY) } catch {}
  return { ...DEFAULT_CONFIG }
}

export function isDefault(cfg) {
  return TUNABLE_KEYS.every((k) => cfg[k] === DEFAULT_CONFIG[k])
}

// ── Session history (for reviewing how students did, later) ──────────────────
const SESSIONS_KEY = 'ants-assessment.sessions.v1'
const MAX_SESSIONS = 50

export function saveSession(session) {
  try {
    const all = loadSessions()
    all.unshift(session)
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(all.slice(0, MAX_SESSIONS)))
  } catch {}
}

export function loadSessions() {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY)) || [] } catch { return [] }
}
