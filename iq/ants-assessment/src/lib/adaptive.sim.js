// Simulated-student harness for the adaptive engine.
//
//   node src/lib/adaptive.sim.js
//
// We invent virtual kids with a *known* true ability on the 1–10 scale, let the
// engine quiz them, and check two things:
//   1. The estimate lands near their true ability (correctness signal works).
//   2. At the difficulty it settles on, they're winning ~70% — the sweet spot
//      (so it's challenging-but-not-frustrating, exactly the goal).
// We also sanity-check the response-time logic with a "fast & accurate" kid who
// should get pushed upward harder than a slow-but-correct kid.

import { createLearner, nextDifficulty, record, ability, difficultyTier } from './adaptive.js'

// A virtual student. `trueAbility` ~ the difficulty at which they're 50/50.
// `spread` = how sharply success falls off as questions get harder.
function makeStudent(trueAbility, { spread = 1.0, speed = 1.0 } = {}) {
  return {
    // Probability of answering a difficulty-d question correctly (logistic).
    pCorrect: (d) => 1 / (1 + Math.exp((d - trueAbility) / spread)),
    // Plausible response time: quick when easy, laboured near their limit,
    // quick-but-wrong when way over their head (a guess).
    timeMs: (d) => {
      const gap = d - trueAbility
      const bell = Math.exp(-(gap * gap) / 4) // peaks (slowest) right at their edge
      const base = gap > 1.5 ? 2800 : 2200 + 7000 * bell
      return Math.round((base + (Math.random() * 1200 - 600)) / speed)
    },
  }
}

function runOne(student) {
  let state = createLearner()
  while (!state.done) {
    const d = nextDifficulty(state)
    const correct = Math.random() < student.pCorrect(d)
    const timeMs = student.timeMs(d)
    state = record(state, { difficulty: d, correct, timeMs })
  }
  return state
}

// Average over many runs to see where the engine lands on average.
function profile(label, trueAbility, opts = {}, runs = 2000) {
  const student = makeStudent(trueAbility, opts)
  let sumLevel = 0
  let sumQ = 0
  for (let i = 0; i < runs; i++) {
    const state = runOne(student)
    sumLevel += ability(state).level
    sumQ += state.history.length
  }
  const estLevel = sumLevel / runs
  const avgQ = sumQ / runs
  // What's their success rate AT the level we'd recommend? (the sweet-spot check)
  const pAtEst = student.pCorrect(estLevel)
  const tier = difficultyTier(estLevel)
  console.log(
    `${label.padEnd(26)} true=${trueAbility.toFixed(1)}  ` +
      `est=${estLevel.toFixed(2)}  (${tier.emoji} ${tier.label})  ` +
      `win@est=${(pAtEst * 100).toFixed(0)}%  ` +
      `avgQs=${avgQ.toFixed(1)}`
  )
}

console.log('\nAdaptive engine — simulated students (2000 runs each)\n')
console.log('Goal: est ≈ true, and win@est ≈ 65–75% (challenged but winning)\n')

profile('Struggling learner', 2.5)
profile('Below grade', 4.0)
profile('On grade', 6.0)
profile('Strong learner', 8.0)
profile('Near ceiling', 9.5)

console.log('\nResponse-time signal (same true ability = 6.0):')
profile('  fast & accurate', 6.0, { speed: 2.2 })   // answers quickly
profile('  slow & laboured', 6.0, { speed: 0.5 })   // answers slowly
console.log(
  '\n(Fast+correct should read a touch higher — the engine infers headroom.)\n'
)
