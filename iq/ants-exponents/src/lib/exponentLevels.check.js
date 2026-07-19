// Validator for the exponents progression.
//   node src/lib/exponentLevels.check.js
import { LEVELS, TOPICS, TIER_DEFS, isCorrect } from './exponentLevels.js'

let failures = 0
const N = 300

for (const level of LEVELS) {
  for (let i = 0; i < N; i++) {
    const q = level.generate()
    const where = level.id
    const bad = []
    if (!q || typeof q.prompt !== 'string' || !q.prompt) bad.push('no prompt')
    if (!Array.isArray(q.choices) || q.choices.length < 2) bad.push('too few choices')
    if (new Set(q.choices.map(String)).size !== q.choices.length) bad.push(`dup choices [${q.choices}]`)
    if (!q.choices.map(String).includes(String(q.answer))) bad.push(`answer "${q.answer}" not in [${q.choices}]`)
    if (!isCorrect(q, q.answer)) bad.push('isCorrect(answer) false')
    if (bad.length) {
      failures++
      if (failures <= 25) console.log(`✗ ${where}: ${bad.join('; ')} :: ${q.prompt}`)
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
    const fmt = q.format ?? ((v) => v)
    console.log(`   ${tier.label.padEnd(10)} ${String(q.prompt).padEnd(22)} → ${fmt(q.answer)}   [${q.choices.map(fmt).join(' · ')}]`)
  }
  console.log()
}
