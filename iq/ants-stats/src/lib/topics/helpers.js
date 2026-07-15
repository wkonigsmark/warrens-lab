// Shared helpers for the topic question generators.
//
// Every generator returns a question of this shape:
//   {
//     skill: 'computation' | 'interpretation',
//     tier:  1..5,
//     prompt: string,              // may be several sentences (this game reads more)
//     chart?: { type, ... },       // optional MiniChart spec (dotplot/histogram/boxplot/scatter)
//     choices: string[],           // rendered as tappable tiles/rows
//     correctIndex: number,
//     explain: string,             // shown after answering, tracked or not
//   }

export function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const round = (x, d = 0) => {
  const p = 10 ** d
  return Math.round(x * p) / p
}

export function mean(xs) { return xs.reduce((s, x) => s + x, 0) / xs.length }

export function median(xs) {
  const s = [...xs].sort((a, b) => a - b)
  const n = s.length
  const mid = Math.floor(n / 2)
  return n % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

// Quartiles by the "median of each half" method (excludes the overall median
// for odd n) — the convention most AP Stats courses use.
export function quartiles(xs) {
  const s = [...xs].sort((a, b) => a - b)
  const n = s.length
  const mid = Math.floor(n / 2)
  const lower = s.slice(0, mid)
  const upper = n % 2 ? s.slice(mid + 1) : s.slice(mid)
  return { q1: median(lower), med: median(s), q3: median(upper), min: s[0], max: s[n - 1] }
}

// Build a multiple-choice question from a correct answer + explicit distractors.
// Extra distractors are trimmed/padded to `count` total options.
export function mc(correct, distractors, count = 4) {
  const seen = new Set([String(correct)])
  const opts = []
  for (const d of distractors) {
    const key = String(d)
    if (!seen.has(key)) { seen.add(key); opts.push(d) }
    if (opts.length === count - 1) break
  }
  const choices = shuffle([correct, ...opts])
  return { choices: choices.map(String), correctIndex: choices.indexOf(correct) }
}

// Numeric distractors clustered around the answer. `spread` controls how far
// off the near-misses are; tighter spread = harder to eyeball.
export function numericChoices(answer, { spread = 1, decimals = 0, positiveOnly = true, count = 4 } = {}) {
  const deltas = [spread, -spread, spread * 2, -spread * 2, spread * 3]
  const pool = deltas.map((d) => round(answer + d, decimals))
  const distractors = positiveOnly ? pool.filter((v) => v >= 0) : pool
  return mc(round(answer, decimals), distractors, count)
}
