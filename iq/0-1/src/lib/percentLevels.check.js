// Validator for the 0 → 1 progression architecture.
//   node src/lib/percentLevels.check.js
// Fuzz every unit × tier and assert the question invariants, then print the
// full level map + one fresh sample per level for an eyeball pass.

import { LEVELS, TOPICS, TIER_DEFS, isCorrect } from './percentLevels.js'

let failures = 0
const N = 300

for (const level of LEVELS) {
  for (let i = 0; i < N; i++) {
    const q = level.generate()
    const where = level.id
    const bad = []
    if (!q || typeof q.promptTitle !== 'string' || !q.promptTitle) bad.push('no prompt')
    if (q.type === 'choice') {
      if (!Array.isArray(q.choices) || q.choices.length < 2) bad.push('too few choices')
      if (new Set(q.choices).size !== q.choices.length) bad.push(`dup choices [${q.choices}]`)
      if (!q.choices.includes(q.answer)) bad.push(`answer "${q.answer}" not in [${q.choices}]`)
      if (!isCorrect(q, q.answer)) bad.push('isCorrect(answer) false')
    } else if (q.type === 'number') {
      if (typeof q.answer !== 'number' || !Number.isFinite(q.answer)) bad.push('answer not a number')
      if (!isCorrect(q, q.answer)) bad.push('isCorrect(answer) false')
    } else {
      bad.push(`bad type ${q.type}`)
    }
    if (bad.length) {
      failures++
      if (failures <= 25) console.log(`✗ ${where}: ${bad.join('; ')} :: ${q.promptTitle}`)
    }
  }
}

console.log(
  failures === 0
    ? `\n✓ ${TOPICS.length} units × ${TIER_DEFS.length} tiers = ${LEVELS.length} levels · ${N} draws each · all valid.\n`
    : `\n✗ ${failures} failures.\n`
)

for (const topic of TOPICS) {
  console.log(`${topic.emoji}  ${topic.title}`)
  for (const tier of TIER_DEFS) {
    const level = LEVELS.find((l) => l.id === `${topic.id}-${tier.id}`)
    const q = level.generate()
    const a = q.formatAnswer ?? q.answer
    console.log(`   ${tier.label.padEnd(10)} ${String(q.promptTitle).padEnd(40)} → ${a}`)
  }
  console.log()
}
