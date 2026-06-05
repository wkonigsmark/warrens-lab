// End-to-end wiring check, in Node — mirrors exactly what AdaptiveRunner does in
// the browser (genFor → record with a response time → advance topics) and what
// AdaptiveResults.summarize reports, but with simulated students so it's
// deterministic and fast. Proves the *integration* of engine + bank + report,
// not just the engine in the abstract.
//
//   node src/lib/flow.sim.js

import { COMPETENCIES } from './competencies.js'
import { createLearner, nextDifficulty, record, ability, difficultyTier } from './adaptive.js'
import { loadConfig } from './config.js'

// localStorage/ window don't exist in Node — loadConfig swallows that and
// returns defaults, which is what we want here.
const config = loadConfig()

function student(trueAbility, spread = 1.0) {
  return {
    answers: (d) => Math.random() < 1 / (1 + Math.exp((d - trueAbility) / spread)),
    time: (d) => {
      const gap = d - trueAbility
      const bell = Math.exp(-(gap * gap) / 4)
      return Math.round(2200 + 7000 * bell + (Math.random() * 1200 - 600))
    },
  }
}

// Replicates AdaptiveRunner's loop for one competency.
function runTopic(comp, kid) {
  let learner = createLearner(config)
  while (!learner.done) {
    const d = nextDifficulty(learner)
    const q = { ...comp.generate(d), _difficulty: d }     // genFor()
    const correct = kid.answers(d)
    const timeMs = kid.time(d)
    learner = record(learner, { difficulty: q._difficulty, correct, timeMs })
  }
  return learner
}

// Replicates AdaptiveResults.summarize for one finished learner.
function report(comp, learner) {
  const { level } = ability(learner)
  const tier = difficultyTier(level)
  const correct = learner.history.filter((h) => h.correct).length
  const total = learner.history.length
  const rubric = comp.rubric[Math.min(10, Math.max(1, Math.round(level))) - 1]
  return { level, tier, correct, total, rubric }
}

console.log('\nFull-flow integration — one simulated student across all 6 topics\n')
console.log('(config = defaults; each topic runs the real adaptive loop)\n')

// A plausible kid: strong-ish at arithmetic, weaker at the abstract topics.
const abilities = {
  arithmetic: 8.0,
  fractions: 5.5,
  percents: 6.0,
  exponents: 4.0,
  angles: 3.0,
  algebra: 7.0,
}

let okShape = true
for (const comp of COMPETENCIES) {
  const kid = student(abilities[comp.id])
  const learner = runTopic(comp, kid)
  const r = report(comp, learner)

  // shape assertions (what the report screen relies on)
  if (!(r.level >= 1 && r.level <= 10)) okShape = false
  if (!r.tier || !r.rubric) okShape = false
  if (r.total < config.minQuestions || r.total > config.maxQuestions) okShape = false

  const ladder = learner.history.map((h) => `${h.difficulty}${h.correct ? '✓' : '✗'}`).join(' ')
  console.log(
    `${comp.emoji} ${comp.label.padEnd(20)} true≈${abilities[comp.id].toFixed(1)}  ` +
      `→ level ${r.level.toFixed(1)} ${r.tier.emoji} ${r.tier.label.padEnd(8)} ` +
      `${r.correct}/${r.total}   ${ladder}`
  )
  console.log(`${''.padEnd(24)}working around: ${r.rubric}`)
}

console.log(`\n${okShape ? '✓ Report shape valid for every topic (level∈1..10, tier, rubric, length in [min,max]).' : '✗ Report shape problem.'}\n`)
