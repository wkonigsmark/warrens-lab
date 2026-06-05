// The assessment bank. Each competency mirrors one of the sibling /iq math
// tools, so a check-up here points the kid straight at the right place to
// practice. Generators are pure and framework-free; every question is
// multiple-choice (fast taps for little hands) and whole-number friendly.
//
// Difficulty is a 1–10 scale — fine-grained on purpose, so the adaptive engine
// (lib/adaptive.js) has real room to home in on a student's sweet spot, and so
// the level it settles on maps cleanly onto a worksheet tier at the end.
//
//   generate(difficulty) -> { prompt, choices:[...], answer, skill }
//     • answer is always one of choices (compared as strings)
//     • difficulty is clamped to 1..10; each level is a distinct skill with
//       randomized operands so nothing is memorizable.
//
// Each competency also exposes `rubric` — a 10-entry plain-English description of
// what each difficulty level means. That's the contract the engine, the report,
// and the worksheet mapping all lean on, and it doubles as the spec for authors.

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const clampD = (d) => Math.min(10, Math.max(1, Math.round(d)))

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build a multiple-choice question from a numeric answer + plausible distractors.
// `near` spreads wrong answers around the truth; we dedupe and never go below 0.
function choiceQ(prompt, answer, { near = 3, skill = '' } = {}) {
  const wrongs = new Set()
  let guard = 0
  while (wrongs.size < 3 && guard++ < 80) {
    const delta = randInt(-near, near) || near
    const w = answer + delta
    if (w !== answer && w >= 0) wrongs.add(w)
  }
  const choices = shuffle([answer, ...wrongs].map(String))
  return { prompt, choices, answer: String(answer), skill }
}

// A question with explicit choices (deduped, kept in given count, then shuffled).
function fromOptions(prompt, answer, options, skill = '') {
  const uniq = [...new Set(options.map(String))]
  return { prompt, choices: shuffle(uniq), answer: String(answer), skill }
}

// Run the right level builder for a competency. `builders` is 1-indexed (slot 0
// unused) so the code reads in lockstep with the rubric.
const dispatch = (builders) => (d) => builders[clampD(d)]()

// ── Arithmetic → Ants & Apples ──────────────────────────────────────────────
const arithmetic = {
  id: 'arithmetic',
  label: 'Arithmetic',
  emoji: '🍎',
  accent: '#ef4444',
  blurb: 'Adding, subtracting, times tables',
  tool: { name: 'Ants & Apples', url: 'https://warrens-lab.vercel.app/iq/ants-apples/' },
  rubric: [
    'Add within 10',
    'Subtract within 10',
    'Add within 20',
    'Subtract within 20',
    'Add two 2-digit numbers',
    'Subtract two 2-digit numbers',
    'Times tables to 5×5',
    'Times tables to 10×10',
    'Division facts',
    '2-digit × 1-digit',
  ],
  generate: dispatch([
    null,
    () => { const a = randInt(1, 5), b = randInt(1, 5); return choiceQ(`${a} + ${b} = ?`, a + b, { near: 2 }) },
    () => { const m = randInt(3, 10), s = randInt(1, m); return choiceQ(`${m} − ${s} = ?`, m - s, { near: 2 }) },
    () => { const a = randInt(5, 14), b = randInt(3, 20 - a < 3 ? 3 : 20 - a); return choiceQ(`${a} + ${b} = ?`, a + b, { near: 3 }) },
    () => { const m = randInt(11, 20), s = randInt(2, m - 1); return choiceQ(`${m} − ${s} = ?`, m - s, { near: 3 }) },
    () => { const a = randInt(11, 49), b = randInt(11, 49); return choiceQ(`${a} + ${b} = ?`, a + b, { near: 6 }) },
    () => { const a = randInt(31, 98), b = randInt(11, a - 1); return choiceQ(`${a} − ${b} = ?`, a - b, { near: 6 }) },
    () => { const a = randInt(2, 5), b = randInt(2, 5); return choiceQ(`${a} × ${b} = ?`, a * b, { near: 4 }) },
    () => { const a = randInt(3, 10), b = randInt(3, 10); return choiceQ(`${a} × ${b} = ?`, a * b, { near: 8 }) },
    () => { const q = randInt(2, 9), b = randInt(2, 9); return choiceQ(`${q * b} ÷ ${b} = ?`, q, { near: 3 }) },
    () => { const a = randInt(11, 25), b = randInt(3, 9); return choiceQ(`${a} × ${b} = ?`, a * b, { near: 12 }) },
  ]),
}

// ── Fractions → Ants & Fractions ────────────────────────────────────────────
const UNIT = [2, 3, 4, 5, 6, 8]
const fractions = {
  id: 'fractions',
  label: 'Fractions',
  emoji: '🥧',
  accent: '#f59e0b',
  blurb: 'Pieces of a whole, comparing & equivalence',
  tool: { name: 'Ants & Fractions', url: 'https://ants-fractions.vercel.app/' },
  rubric: [
    'Recognise one half',
    'Compare unit fractions (1/2 vs 1/4)',
    'Compare same denominator',
    'Equivalent to 1/2',
    'Equivalent fractions (general)',
    'Simplify a simple fraction',
    'Unit fraction of a number',
    'Non-unit fraction of a number',
    'Add fractions, same denominator',
    'Compare unlike fractions',
  ],
  generate: dispatch([
    null,
    () => fromOptions('Which fraction means one half?', '1/2', ['1/2', '1/3', '1/4', '2/1'], 'recognise'),
    () => { const [a, b] = shuffle(UNIT).slice(0, 2); const bigger = a < b ? `1/${a}` : `1/${b}`; return fromOptions(`Which is bigger: 1/${a} or 1/${b}?`, bigger, [`1/${a}`, `1/${b}`], 'compare-unit') },
    () => { const d = pick([4, 5, 6, 8]); let x = randInt(1, d - 1), y = randInt(1, d - 1); while (y === x) y = randInt(1, d - 1); const bigger = x > y ? `${x}/${d}` : `${y}/${d}`; return fromOptions(`Which is bigger: ${x}/${d} or ${y}/${d}?`, bigger, [`${x}/${d}`, `${y}/${d}`], 'compare-same') },
    () => { const k = randInt(2, 6); return fromOptions('Which fraction is the same as 1/2?', `${k}/${2 * k}`, [`${k}/${2 * k}`, '2/3', '3/4', '2/5'], 'equiv-half') },
    () => { const base = pick([3, 4, 5]); const k = randInt(2, 4); return fromOptions(`Which fraction is equal to 1/${base}?`, `${k}/${base * k}`, [`${k}/${base * k}`, `1/${base + 1}`, `${k}/${base * k + 1}`, `${k + 1}/${base * k}`], 'equiv') },
    () => { const k = randInt(2, 5); const n = randInt(2, 4); return fromOptions(`Simplify ${n}/${n * k}. (lowest terms)`, `1/${k}`, [`1/${k}`, `1/${k + 1}`, `${n}/${k}`, `2/${k}`], 'simplify') },
    () => { const d = pick([2, 3, 4, 5]); const whole = d * randInt(2, 6); return choiceQ(`What is 1/${d} of ${whole}?`, whole / d, { near: 3, skill: 'unit-of' }) },
    () => { const d = pick([3, 4, 5]); const m = randInt(2, d - 1); const whole = d * randInt(2, 5); return choiceQ(`What is ${m}/${d} of ${whole}?`, (whole / d) * m, { near: 4, skill: 'nonunit-of' }) },
    () => { const d = pick([5, 6, 8, 10]); let a = randInt(1, d - 2); let b = randInt(1, d - a - 1); return fromOptions(`${a}/${d} + ${b}/${d} = ?`, `${a + b}/${d}`, [`${a + b}/${d}`, `${a + b}/${2 * d}`, `${a + b + 1}/${d}`, `${a}/${d}`], 'add-same') },
    () => { const pairs = [['1/3', '2/5', '2/5'], ['1/2', '3/5', '3/5'], ['2/3', '3/4', '3/4'], ['1/4', '2/7', '2/7'], ['3/8', '1/2', '1/2']]; const [a, b, big] = pick(pairs); return fromOptions(`Which is bigger: ${a} or ${b}?`, big, [a, b], 'compare-unlike') },
  ]),
}

// ── Percents & Decimals → 0 → 1 ─────────────────────────────────────────────
const FRIENDLY100 = [10, 20, 40, 50, 60, 80, 100]
const percents = {
  id: 'percents',
  label: 'Percents & Decimals',
  emoji: '💯',
  accent: '#06b6d4',
  blurb: 'Percent of a number, percent ↔ fraction',
  tool: { name: '0 → 1', url: 'https://ants-0-1.vercel.app/' },
  rubric: [
    'Half & whole as a percent',
    'Common percents (¼, ¾)',
    '50% of a number',
    '10% of a number',
    '25% of a number',
    'Percent ↔ fraction',
    'Decimal ↔ percent (tenths)',
    '75% / 20% of a number',
    'Decimals as percents (0.1=10%)',
    'Trickier percents (15% of 20)',
  ],
  generate: dispatch([
    null,
    () => { const opts = [['the whole thing', '100%'], ['one half', '50%']]; const [thing, pct] = pick(opts); return fromOptions(`How much is ${thing}, as a percent?`, pct, ['100%', '50%', '25%', '10%'], 'meaning') },
    () => { const opts = [['one quarter (1/4)', '25%'], ['three quarters (3/4)', '75%']]; const [thing, pct] = pick(opts); return fromOptions(`How much is ${thing}, as a percent?`, pct, ['25%', '75%', '50%', '20%'], 'common') },
    () => { const n = pick(FRIENDLY100); return choiceQ(`What is 50% of ${n}?`, n / 2, { near: 5 }) },
    () => { const n = pick([10, 20, 30, 50, 70, 100]); return choiceQ(`What is 10% of ${n}?`, n / 10, { near: 3 }) },
    () => { const n = pick([20, 40, 60, 80, 100]); return choiceQ(`What is 25% of ${n}?`, n / 4, { near: 5 }) },
    () => { const opts = [['50%', '1/2'], ['25%', '1/4'], ['75%', '3/4'], ['10%', '1/10']]; const [pct, frac] = pick(opts); return fromOptions(`What fraction is the same as ${pct}?`, frac, ['1/2', '1/4', '3/4', '1/10'], 'pct-frac') },
    () => { const opts = [['0.5', '50%'], ['0.25', '25%'], ['0.1', '10%'], ['0.75', '75%']]; const [dec, pct] = pick(opts); return fromOptions(`${dec} is the same as what percent?`, pct, ['50%', '25%', '10%', '75%'], 'dec-pct') },
    () => { const n = pick([20, 40, 60, 80, 100]); return Math.random() < 0.5 ? choiceQ(`What is 75% of ${n}?`, (n / 4) * 3, { near: 6 }) : choiceQ(`What is 20% of ${n}?`, n / 5, { near: 4 }) },
    () => { const opts = [['0.3', '30%'], ['0.7', '70%'], ['0.9', '90%'], ['0.4', '40%']]; const [dec, pct] = pick(opts); return fromOptions(`Write ${dec} as a percent.`, pct, ['30%', '70%', '90%', '40%'], 'tenths') },
    () => { const cases = [['15% of 20', 3], ['5% of 80', 4], ['15% of 40', 6], ['30% of 20', 6], ['5% of 60', 3]]; const [q, ans] = pick(cases); return choiceQ(`What is ${q}?`, ans, { near: 3, skill: 'tricky' }) },
  ]),
}

// ── Exponents → Ants & Exponents ────────────────────────────────────────────
const exponents = {
  id: 'exponents',
  label: 'Exponents',
  emoji: '⬆️',
  accent: '#8b5cf6',
  blurb: 'Squares, cubes & powers',
  tool: { name: 'Ants & Exponents', url: 'https://ants-exponents.vercel.app/' },
  rubric: [
    'Small squares (2², 3²)',
    'Squares to 6²',
    'Squares to 10²',
    'Small cubes (2³, 3³)',
    'Cubes to 5³',
    'Powers of ten',
    'Power of 0 and 1',
    'Product rule (aᵐ·aⁿ)',
    'Quotient rule (aᵐ÷aⁿ)',
    'Negative exponents',
  ],
  generate: dispatch([
    null,
    () => { const b = randInt(2, 3); return choiceQ(`What is ${b}² ?  (${b} × ${b})`, b * b, { near: 3 }) },
    () => { const b = randInt(4, 6); return choiceQ(`What is ${b}² ?`, b * b, { near: 6 }) },
    () => { const b = randInt(7, 10); return choiceQ(`What is ${b}² ?`, b * b, { near: 10 }) },
    () => { const b = randInt(2, 3); return choiceQ(`What is ${b}³ ?  (${b} × ${b} × ${b})`, b ** 3, { near: 6 }) },
    () => { const b = randInt(4, 5); return choiceQ(`What is ${b}³ ?`, b ** 3, { near: 18 }) },
    () => { const e = randInt(2, 4); return fromOptions(`What is 10${['', '¹', '²', '³', '⁴'][e]} ?`, 10 ** e, [10 ** e, 10 ** (e - 1), 10 ** (e + 1), e * 10], 'powers-of-ten') },
    () => { const b = randInt(3, 9); return Math.random() < 0.5 ? fromOptions(`What is ${b}⁰ ?`, 1, [1, 0, b, b * b], 'power-0') : fromOptions(`What is ${b}¹ ?`, b, [b, 1, 0, b * b], 'power-1') },
    () => { const e1 = randInt(2, 3), e2 = randInt(2, 4); return fromOptions(`2${supe(e1)} × 2${supe(e2)} = 2 to what power?`, e1 + e2, [e1 + e2, e1 * e2, e1 + e2 + 1, Math.abs(e1 - e2)], 'product-rule') },
    () => { const e2 = randInt(1, 3), e1 = e2 + randInt(1, 3); return fromOptions(`2${supe(e1)} ÷ 2${supe(e2)} = 2 to what power?`, e1 - e2, [e1 - e2, e1 + e2, e1, e2], 'quotient-rule') },
    () => { const b = randInt(2, 5); return fromOptions(`What is ${b}⁻¹ ?`, `1/${b}`, [`1/${b}`, `-${b}`, String(b), '0'], 'negative') },
  ]),
}
const supe = (n) => ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶'][n] || `^${n}`

// ── Angles & Geometry → Ants & Angles ───────────────────────────────────────
const angles = {
  id: 'angles',
  label: 'Angles & Geometry',
  emoji: '📐',
  accent: '#10b981',
  blurb: 'Angle types, lines & triangles',
  tool: { name: 'Ants & Angles', url: 'https://ants-angles.vercel.app/' },
  rubric: [
    'A right angle is 90°',
    'Name the angle type',
    'Straight line / full turn',
    'Complementary angles (sum 90)',
    'Angles on a line (sum 180)',
    'Angles around a point (sum 360)',
    'Triangle angle sum',
    'Shape facts (equilateral, quad)',
    'Isosceles triangle angles',
    'Exterior angle of a triangle',
  ],
  generate: dispatch([
    null,
    () => fromOptions('How many degrees is a right angle?', 90, [90, 180, 45, 360], 'right-angle'),
    () => { const a = pick([30, 45, 60, 90, 120, 135, 160]); const type = a < 90 ? 'acute' : a === 90 ? 'a right angle' : 'obtuse'; return fromOptions(`A ${a}° angle is…`, type, ['acute', 'a right angle', 'obtuse', 'straight'], 'classify') },
    () => { const opts = [['a straight line', 180], ['a full turn', 360], ['half a full turn', 180]]; const [thing, deg] = pick(opts); return fromOptions(`How many degrees is ${thing}?`, deg, [90, 180, 270, 360], 'whole-turns') },
    () => { const a = pick([20, 30, 40, 50, 60, 70]); return choiceQ(`Two angles together make a right angle (90°). One is ${a}°. What is the other?`, 90 - a, { near: 10, skill: 'complementary' }) },
    () => { const a = pick([30, 45, 60, 110, 120, 135, 150]); return choiceQ(`Two angles sit on a straight line. One is ${a}°. What is the other?`, 180 - a, { near: 10, skill: 'supplementary' }) },
    () => { const a = pick([90, 120, 150, 200, 240]); return choiceQ(`Angles around a point add to 360°. One angle is ${a}°. What is the rest?`, 360 - a, { near: 15, skill: 'around-point' }) },
    () => { const a = randInt(40, 80), b = randInt(40, 80); return choiceQ(`A triangle has angles ${a}° and ${b}°. What is the third?`, 180 - a - b, { near: 10, skill: 'triangle-sum' }) },
    () => { const opts = [['each angle in an equilateral triangle', 60], ['all four angles in a quadrilateral', 360], ['each angle in a square', 90]]; const [thing, deg] = pick(opts); return fromOptions(`How many degrees is ${thing}?`, deg, [60, 90, 180, 360], 'shape-facts') },
    () => { const apex = pick([20, 40, 50, 70, 80, 100]); return choiceQ(`An isosceles triangle has a top angle of ${apex}°. What is each equal base angle?`, (180 - apex) / 2, { near: 10, skill: 'isosceles' }) },
    () => { const a = randInt(40, 80), b = randInt(40, 80); return choiceQ(`Two angles of a triangle are ${a}° and ${b}°. The outside (exterior) angle at the third corner equals their sum. What is it?`, a + b, { near: 12, skill: 'exterior' }) },
  ]),
}

// ── Algebra → Ants & Algebra ────────────────────────────────────────────────
const algebra = {
  id: 'algebra',
  label: 'Algebra',
  emoji: '🧮',
  accent: '#6366f1',
  blurb: 'Solving for the missing number',
  tool: { name: 'Ants & Algebra', url: 'https://warrens-lab.vercel.app/iq/ants-algebra/' },
  rubric: [
    'x + a = b',
    'x − a = b',
    'Bigger one-step add/subtract',
    'a·x = b',
    'x ÷ a = b',
    'Two-step (a·x + b = c)',
    'Two-step with subtraction',
    'Two-step, bigger numbers',
    'Variable on both sides (simple)',
    'Variable on both sides',
  ],
  generate: dispatch([
    null,
    () => { const x = randInt(1, 9), b = randInt(1, 9); return choiceQ(`x + ${b} = ${x + b}.  What is x?`, x, { near: 3 }) },
    () => { const x = randInt(1, 9), b = randInt(1, 9); return choiceQ(`x − ${b} = ${x}.  What is x?`, x + b, { near: 3 }) },
    () => { const x = randInt(10, 30), b = randInt(5, 20); return choiceQ(`x + ${b} = ${x + b}.  What is x?`, x, { near: 5 }) },
    () => { const x = randInt(2, 9), a = randInt(2, 6); return choiceQ(`${a}x = ${a * x}.  What is x?`, x, { near: 3 }) },
    () => { const x = randInt(2, 9), a = randInt(2, 5); return choiceQ(`x ÷ ${a} = ${x}.  What is x?`, x * a, { near: 4 }) },
    () => { const x = randInt(2, 9), a = randInt(2, 4), b = randInt(1, 9); return choiceQ(`${a}x + ${b} = ${a * x + b}.  What is x?`, x, { near: 3 }) },
    () => { const x = randInt(3, 9), a = randInt(2, 4), b = randInt(1, 9); return choiceQ(`${a}x − ${b} = ${a * x - b}.  What is x?`, x, { near: 3 }) },
    () => { const x = randInt(4, 12), a = randInt(3, 6), b = randInt(5, 20); return choiceQ(`${a}x + ${b} = ${a * x + b}.  What is x?`, x, { near: 4 }) },
    () => { const x = randInt(2, 9), a = randInt(2, 4); return choiceQ(`${a + 1}x = ${a}x + ${x}.  What is x?`, x, { near: 3 }) },
    () => { const x = randInt(2, 9), a = randInt(1, 3), b = randInt(1, 6); return choiceQ(`${a + 2}x + ${b} = ${a}x + ${2 * x + b}.  What is x?`, x, { near: 3 }) },
  ]),
}

export const COMPETENCIES = [arithmetic, fractions, percents, exponents, angles, algebra]

export const byId = (id) => COMPETENCIES.find((c) => c.id === id)

// Proficiency bands from a 0..1 score within a competency (legacy fixed-ladder
// scoring; the adaptive flow uses adaptive.difficultyTier instead).
export function band(score) {
  if (score >= 0.85) return { label: 'Mastered', emoji: '🏆', color: '#10b981' }
  if (score >= 0.6) return { label: 'Solid', emoji: '💪', color: '#06b6d4' }
  if (score >= 0.35) return { label: 'Getting it', emoji: '🌱', color: '#f59e0b' }
  return { label: 'Just starting', emoji: '🐣', color: '#ef4444' }
}
