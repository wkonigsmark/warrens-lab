// Problem generators for the printable worksheets. Each topic returns problems
// shaped as { display, answer } — `display` is the left side of the equation
// (e.g. "7²" or "2 × 2 × 2") and `answer` is the printed answer-key value.
// Mirrors the structure of the Ants & Angles worksheet lib.
//
// Every generator takes a difficulty ('easy' | 'standard' | 'hard') and scales
// its number ranges, so the same six topics work for a 7-year-old and a 10-year-old.

const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
export const sup = (n) => String(n).split('').map((d) => SUP[d]).join('')

export const DIFFICULTIES = [
  { id: 'easy', label: 'Easier' },
  { id: 'standard', label: 'Standard' },
  { id: 'hard', label: 'Harder' },
]

const rint = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1))
const comma = (n) => n.toLocaleString()
const pick = (arr) => arr[rint(0, arr.length - 1)]

// Per-topic ranges, one row per difficulty. [baseLo, baseHi, expLo, expHi]
// (some topics only use part of this).
const RANGES = {
  squares: { easy: [2, 6], standard: [2, 12], hard: [2, 20] },
  powers: { easy: [2, 4, 2, 3], standard: [2, 6, 2, 4], hard: [2, 9, 2, 5] },
  tens: { easy: [1, 3], standard: [1, 6], hard: [1, 9] },
  writeAsPower: { easy: [2, 4, 2, 3], standard: [2, 6, 2, 4], hard: [2, 9, 3, 5] },
  expand: { easy: [2, 3, 2, 3], standard: [2, 5, 2, 4], hard: [2, 6, 2, 5] },
  multiply: { easy: [2, 3, 1, 3], standard: [2, 5, 1, 4], hard: [2, 9, 2, 5] },
  divide: { easy: [2, 3, 2, 4], standard: [2, 6, 3, 5], hard: [2, 9, 4, 6] },
}

const GENERATORS = {
  squares(diff) {
    const [lo, hi] = RANGES.squares[diff]
    const n = rint(lo, hi)
    return { display: `${n}${sup(2)}`, answer: comma(n * n) }
  },
  powers(diff) {
    const [bLo, bHi, eLo, eHi] = RANGES.powers[diff]
    const b = rint(bLo, bHi)
    const e = rint(eLo, eHi)
    return { display: `${b}${sup(e)}`, answer: comma(b ** e) }
  },
  tens(diff) {
    const [lo, hi] = RANGES.tens[diff]
    const e = rint(lo, hi)
    return { display: `10${sup(e)}`, answer: comma(10 ** e) }
  },
  writeAsPower(diff) {
    const [bLo, bHi, eLo, eHi] = RANGES.writeAsPower[diff]
    const b = rint(bLo, bHi)
    const e = rint(eLo, eHi)
    const chain = Array.from({ length: e }, () => b).join(' × ')
    return { display: chain, answer: `${b}${sup(e)}` }
  },
  expand(diff) {
    const [bLo, bHi, eLo, eHi] = RANGES.expand[diff]
    const b = rint(bLo, bHi)
    const e = rint(eLo, eHi)
    const chain = Array.from({ length: e }, () => b).join(' × ')
    return { display: `${b}${sup(e)}`, answer: `${chain} = ${comma(b ** e)}` }
  },
  multiply(diff) {
    const [bLo, bHi, eLo, eHi] = RANGES.multiply[diff]
    const b = rint(bLo, bHi)
    const x = rint(eLo, eHi)
    const y = rint(eLo, eHi)
    return { display: `${b}${sup(x)} × ${b}${sup(y)}`, answer: `${b}${sup(x + y)}` }
  },
  divide(diff) {
    const [bLo, bHi, xLo, xHi] = RANGES.divide[diff]
    const b = rint(bLo, bHi)
    const x = rint(xLo, xHi)
    const y = rint(1, x - 1) // keep the result a positive power
    return { display: `${b}${sup(x)} ÷ ${b}${sup(y)}`, answer: `${b}${sup(x - y)}` }
  },
  mixed(diff) {
    const g = pick([GENERATORS.squares, GENERATORS.powers, GENERATORS.tens, GENERATORS.writeAsPower])
    return g(diff)
  },
}

export const TOPICS = [
  {
    id: 'squares',
    title: 'Square Numbers',
    instructions: 'Find each square. Remember: n² means n × n.',
    blank: '0.9in',
    gen: GENERATORS.squares,
  },
  {
    id: 'powers',
    title: 'Powers',
    instructions: 'Work out each power by multiplying the base.',
    blank: '1.1in',
    gen: GENERATORS.powers,
  },
  {
    id: 'tens',
    title: 'Powers of 10',
    instructions: 'The exponent tells you how many zeros!',
    blank: '1.4in',
    gen: GENERATORS.tens,
  },
  {
    id: 'writeAsPower',
    title: 'Write as a Power',
    instructions: 'Rewrite each repeated multiplication as a power.',
    blank: '1in',
    gen: GENERATORS.writeAsPower,
  },
  {
    id: 'expand',
    title: 'Expand & Solve',
    instructions: 'Write each power out the long way, then find the answer.',
    blank: '2.4in',
    gen: GENERATORS.expand,
  },
  {
    id: 'multiply',
    title: 'Multiply Powers',
    instructions: 'Same base? Add the exponents. Write each answer as a power.',
    blank: '1in',
    gen: GENERATORS.multiply,
  },
  {
    id: 'divide',
    title: 'Divide Powers',
    instructions: 'Same base? Subtract the exponents. Write each answer as a power.',
    blank: '1in',
    gen: GENERATORS.divide,
  },
  {
    id: 'mixed',
    title: 'Mixed Review',
    instructions: 'A little of everything — read each problem carefully.',
    blank: '1.6in',
    gen: GENERATORS.mixed,
  },
]

// Build `count` problems. We avoid repeating any of the last couple of problems
// (so a sheet never shows "3² , 3²" back to back), but allow repeats across the
// whole sheet — the "Easier" ranges are small pools (e.g. squares 2–6), so full
// uniqueness isn't always possible. Always returns exactly `count`.
export function buildProblems(topic, count, diff = 'standard') {
  const out = []
  const recent = []
  let guard = 0
  while (out.length < count && guard++ < count * 60) {
    const p = topic.gen(diff)
    if (recent.includes(p.display)) continue
    out.push(p)
    recent.push(p.display)
    if (recent.length > 2) recent.shift()
  }
  while (out.length < count) out.push(topic.gen(diff)) // safety net for tiny pools
  return out
}
