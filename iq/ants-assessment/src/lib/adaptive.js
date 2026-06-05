// The adaptive engine — the "brain" of the assessment.
//
// It knows nothing about math. It tracks one ability estimate (`theta`) per
// competency on a 1–10 difficulty scale and, after each answer, nudges that
// estimate to home in on the student's "sweet spot": the difficulty where they
// succeed often enough to stay confident (~70%) but are still genuinely
// challenged. That sweet-spot difficulty is what we report and what maps to a
// worksheet level at the end.
//
// It's a *weighted adaptive staircase* — deliberately simple and transparent so
// it can be hand-tuned and explained, not a black box:
//
//   • Correct → step difficulty up.   Wrong → step down.
//   • Up-steps are smaller than down-steps. That asymmetry is what makes it
//     settle where the student is right ~70% of the time instead of 50%.
//     (At balance: P(correct) ≈ down / (up + down).)
//   • The step *shrinks every time the direction reverses*, so we take big
//     jumps early to find the rough level, then fine steps to settle on it.
//   • Response time is a second signal: fast+correct = "too easy, climb faster";
//     slow+correct = "right at the edge, barely move" (that's the sweet spot);
//     fast+wrong = "guessing/confused, drop down".
//   • We stop a topic once the estimate has settled (enough reversals) or we hit
//     a question cap — adaptive *and* short.
//
// Pure & immutable: every function returns new state, so it drops straight into
// React (or a Node simulation) without surprises.

export const DIFF_MIN = 1
export const DIFF_MAX = 10

export const DEFAULT_CONFIG = {
  startTheta: 5,        // where a brand-new learner begins (seedable later)
  baseStep: 2.0,        // initial step size (in difficulty units)
  minStep: 0.5,         // steps never shrink below this
  stepDecay: 0.7,       // multiply step by this on each reversal
  upDownRatio: 0.55,    // up-step = ratio × down-step → targets ~65% correct
  fastMs: 3500,         // under this = "answered fast"
  slowMs: 9000,         // over this  = "answered slow / laboured"
  fastBoost: 1.5,       // fast + correct → climb harder (clearly too easy)
  edgeDamp: 0.5,        // slow + correct → barely move (this is the sweet spot)
  fastWrongBoost: 1.2,  // fast + wrong → drop a little more (likely a guess)
  minQuestions: 5,      // never stop a topic before this many
  maxQuestions: 10,     // always stop a topic by this many
  reversalsToStop: 5,   // ...or once the estimate has reversed this often
  settleWindow: 4,      // estimate = mean of the last N estimates (the settle zone)
}

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x))

// Fresh per-competency learner state.
export function createLearner(overrides = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...overrides }
  return {
    cfg,
    theta: cfg.startTheta,
    step: cfg.baseStep,
    lastDir: 0,        // +1 went up last, -1 went down, 0 = start
    reversals: 0,
    history: [],       // [{ difficulty, correct, timeMs, theta, step }]
    done: false,
  }
}

// The difficulty to serve next: the current estimate, rounded & clamped.
export function nextDifficulty(state) {
  return clamp(Math.round(state.theta), DIFF_MIN, DIFF_MAX)
}

// Fold one answer into the estimate. Returns a NEW state.
//   answer: { difficulty, correct, timeMs? }   timeMs optional (no time signal → neutral)
export function record(state, { difficulty, correct, timeMs = null }) {
  const { cfg } = state
  const fast = timeMs != null && timeMs < cfg.fastMs
  const slow = timeMs != null && timeMs > cfg.slowMs

  // Direction of the nudge.
  const dir = correct ? 1 : -1

  // Magnitude, before reversal shrink already baked into state.step.
  let mag
  if (correct) {
    mag = state.step * cfg.upDownRatio
    if (fast) mag *= cfg.fastBoost       // too easy → climb faster
    else if (slow) mag *= cfg.edgeDamp   // at the edge → hold roughly steady
  } else {
    mag = state.step
    if (fast) mag *= cfg.fastWrongBoost  // fast miss → likely a guess, back off more
  }

  // Reversal? Shrink the step so we converge.
  let step = state.step
  let reversals = state.reversals
  if (state.lastDir !== 0 && dir !== state.lastDir) {
    reversals += 1
    step = Math.max(cfg.minStep, state.step * cfg.stepDecay)
  }

  const theta = clamp(state.theta + dir * mag, DIFF_MIN, DIFF_MAX)
  const history = [...state.history, { difficulty, correct, timeMs, theta, step }]

  const n = history.length
  const done = n >= cfg.minQuestions && (n >= cfg.maxQuestions || reversals >= cfg.reversalsToStop)

  return { ...state, theta, step, lastDir: dir, reversals, history, done }
}

// Final read-out for a finished (or in-progress) learner. We average the last
// few estimates — the "settle zone" — so neither the early finding-it steps nor
// a single late wobble swings the result.
export function ability(state) {
  const n = state.history.length
  if (n === 0) return { level: state.theta, settled: false }
  const tail = state.history.slice(-Math.min(state.cfg.settleWindow, n)).map((h) => h.theta)
  const level = tail.reduce((s, x) => s + x, 0) / tail.length
  return { level, settled: state.done }
}

// Map a 1–10 sweet-spot level onto a coarse tier (drives worksheet picks later).
export function difficultyTier(level) {
  if (level >= 8) return { id: 'advanced', label: 'Advanced', emoji: '🚀' }
  if (level >= 6) return { id: 'harder', label: 'Harder', emoji: '💪' }
  if (level >= 3.5) return { id: 'standard', label: 'Standard', emoji: '🌟' }
  return { id: 'easier', label: 'Easier', emoji: '🌱' }
}
