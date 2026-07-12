// Generate `count` multiple-choice options that include `answer` as one of them.
// Distractors are offset from the correct answer — close enough to be plausible,
// spread enough to not be trivially different.
export function makeChoices(answer, { count = 4, min = 0, max = 999 } = {}) {
  const ans = Math.round(answer)
  const candidates = new Set([ans])

  // Scale step to the magnitude of the answer so distractors feel natural
  const step = Math.max(5, Math.round(Math.max(ans, 10) / 6 / 5) * 5)
  const deltas = [step, step * 2, step * 3, 10, 20, 30, 15, 45, 5]

  for (const d of [...new Set(deltas)]) {
    if (candidates.size >= count + 5) break
    const hi = ans + d
    const lo = ans - d
    if (hi <= max) candidates.add(hi)
    if (lo >= min) candidates.add(lo)
  }

  const distractors = [...candidates]
    .filter(n => n !== ans)
    .sort(() => Math.random() - 0.5)
    .slice(0, count - 1)

  // Shuffle correct answer into random position
  return [ans, ...distractors].sort(() => Math.random() - 0.5)
}
