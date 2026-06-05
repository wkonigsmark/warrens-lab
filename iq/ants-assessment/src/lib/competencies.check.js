// Sanity checker for the question bank.
//   node src/lib/competencies.check.js
// Fuzz every competency × every difficulty and assert invariants, then print one
// fresh sample per level for an eyeball correctness pass.

import { COMPETENCIES } from './competencies.js'

let failures = 0
const N = 400

for (const c of COMPETENCIES) {
  for (let d = 1; d <= 10; d++) {
    for (let i = 0; i < N; i++) {
      const q = c.generate(d)
      const where = `${c.id} L${d}`
      const bad = []
      if (!q || typeof q.prompt !== 'string' || !q.prompt.length) bad.push('no prompt')
      if (!Array.isArray(q.choices) || q.choices.length < 2) bad.push('too few choices')
      if (new Set(q.choices).size !== q.choices.length) bad.push('duplicate choices')
      if (!q.choices.includes(q.answer)) bad.push(`answer "${q.answer}" not in choices [${q.choices}]`)
      if (q.answer === '' || q.answer == null) bad.push('empty answer')
      if (q.choices.some((ch) => /-/.test(ch) && !/^-?\d*\/\d+$|^-\d/.test(ch))) { /* allow negatives intentionally */ }
      if (bad.length) {
        failures++
        if (failures <= 25) console.log(`✗ ${where}: ${bad.join('; ')}  ::  ${q.prompt}`)
      }
    }
  }
}

console.log(failures === 0 ? `\n✓ All ${COMPETENCIES.length} competencies × 10 levels × ${N} draws passed.\n` : `\n✗ ${failures} failures.\n`)

// Eyeball samples — one fresh question per level.
for (const c of COMPETENCIES) {
  console.log(`\n${c.emoji}  ${c.label}`)
  for (let d = 1; d <= 10; d++) {
    const q = c.generate(d)
    const prompt = q.prompt.replace(/\s+/g, ' ').trim()
    console.log(`  L${String(d).padStart(2)}  ${prompt}`.padEnd(72) + `→ ${q.answer}   [${q.choices.join(' · ')}]`)
  }
}
console.log()
