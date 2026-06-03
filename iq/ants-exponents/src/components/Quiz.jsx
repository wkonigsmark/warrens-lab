import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 📚 Quiz — leveled exponent questions with instant, guided feedback. Mirrors the
// Ants & Angles quiz: a progress bar, a running score, and — crucially — when a
// child misses one we don't just buzz; we show the worked-out reason so the miss
// teaches something. Questions are freshly generated each run.

const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
const sup = (n) => String(n).split('').map((d) => SUP[d]).join('')
const rint = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1))
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1])

// Build a 4-way multiple choice: the answer plus the best wrong guesses, deduped.
function choices(answer, distractors) {
  const seen = new Set([String(answer)])
  const out = [answer]
  for (const d of distractors) {
    if (out.length >= 4) break
    if (d == null) continue
    const key = String(d)
    if (!seen.has(key)) { seen.add(key); out.push(d) }
  }
  // pad with nearby numbers if we somehow came up short
  let pad = answer
  while (out.length < 4 && typeof answer === 'number') {
    pad += 1
    if (!seen.has(String(pad))) { seen.add(String(pad)); out.push(pad) }
  }
  return shuffle(out)
}

// ---- the five levels, each a generator returning one question ----------------

const LEVELS = [
  {
    name: 'Squares',
    make() {
      const b = rint(2, 7)
      const ans = b * b
      return {
        prompt: <Big>{b}{sup(2)} = ?</Big>,
        sub: `${b} squared`,
        choices: choices(ans, [b + b, b * 2, b + 2, ans + b]),
        answer: ans,
        explain: `${b}${sup(2)} means ${b} × ${b} = ${ans}. (Squaring is NOT ${b} + ${b}!)`,
      }
    },
  },
  {
    name: 'Small powers',
    make() {
      const b = rint(2, 5)
      const e = rint(2, 3)
      const ans = b ** e
      const chain = Array.from({ length: e }, () => b).join(' × ')
      return {
        prompt: <Big>{b}{sup(e)} = ?</Big>,
        sub: `${chain}`,
        choices: choices(ans, [b * e, b + e, ans + b, b ** (e - 1)]),
        answer: ans,
        explain: `${b}${sup(e)} means ${chain} = ${ans}.`,
      }
    },
  },
  {
    name: 'Write it as a power',
    make() {
      const b = rint(2, 5)
      const e = rint(2, 4)
      const chain = Array.from({ length: e }, () => b).join(' × ')
      const answer = `${b}${sup(e)}`
      const wrong = [`${b}×${e}`, `${e}${sup(b)}`, `${b * e}`]
      return {
        prompt: <Big className="text-3xl sm:text-4xl">{chain}</Big>,
        sub: 'Write this as a power',
        choices: choices(answer, wrong),
        answer,
        explain: `We used ${b} a total of ${e} times, so it's ${b}${sup(e)} (base ${b}, exponent ${e}).`,
      }
    },
  },
  {
    name: 'Powers of 10',
    make() {
      const e = rint(2, 6)
      const ans = 10 ** e
      return {
        prompt: <Big>10{sup(e)} = ?</Big>,
        sub: 'a power of ten',
        choices: choices(ans, [10 ** (e - 1), 10 ** (e + 1), 10 * e]),
        answer: ans,
        explain: `The exponent ${e} tells you the number of zeros: 10${sup(e)} = ${ans.toLocaleString()}.`,
        format: (v) => (typeof v === 'number' ? v.toLocaleString() : v),
      }
    },
  },
  {
    name: 'Which is bigger?',
    make() {
      // two different small powers
      let a, b
      do {
        a = { base: rint(2, 5), exp: rint(2, 3) }
        b = { base: rint(2, 5), exp: rint(2, 3) }
      } while (a.base ** a.exp === b.base ** b.exp)
      const av = a.base ** a.exp
      const bv = b.base ** b.exp
      const bigger = av > bv ? `${a.base}${sup(a.exp)}` : `${b.base}${sup(b.exp)}`
      return {
        prompt: <Big>Which is bigger?</Big>,
        sub: 'compare the two powers',
        choices: shuffle([`${a.base}${sup(a.exp)}`, `${b.base}${sup(b.exp)}`]),
        answer: bigger,
        explain: `${a.base}${sup(a.exp)} = ${av} and ${b.base}${sup(b.exp)} = ${bv}, so ${bigger} is bigger.`,
      }
    },
  },
  {
    name: 'Multiply powers',
    make() {
      const b = rint(2, 5)
      let x, y
      // Skip combos where x+y === x×y (only 2,2) so the tempting "multiply the
      // exponents" wrong answer is always distinct from the correct sum.
      do {
        x = rint(1, 4)
        y = rint(1, 4)
      } while (x + y === x * y)
      const ans = x + y
      return {
        prompt: (
          <Big>
            {b}{sup(x)} × {b}{sup(y)} = {b}<span className="text-violet-600">▢</span>
          </Big>
        ),
        sub: 'same base → add the exponents',
        // x×y is the classic mistake (multiplying instead of adding) — list it
        // first so it always survives into the four choices.
        choices: choices(ans, [x * y, x, y, ans + 1]),
        answer: ans,
        explain: `Same base, so ADD the exponents: ${x} + ${y} = ${ans} (don't multiply them!). So ${b}${sup(x)} × ${b}${sup(y)} = ${b}${sup(ans)}.`,
      }
    },
  },
  {
    name: 'Divide powers',
    make() {
      const b = rint(2, 5)
      const x = rint(3, 6)
      const y = rint(1, x - 1) // keep the result positive
      const ans = x - y
      // x+y (added instead of subtracted) is the #1 trap — always shown.
      // The "divided the exponents" mistake is only a tidy distractor when it's
      // a whole number that isn't already the answer, so add it conditionally.
      const dists = [x + y, x, y, ans + 1]
      if (x % y === 0 && x / y !== ans) dists.splice(1, 0, x / y)
      return {
        prompt: (
          <Big>
            {b}{sup(x)} ÷ {b}{sup(y)} = {b}<span className="text-violet-600">▢</span>
          </Big>
        ),
        sub: 'same base → subtract the exponents',
        choices: choices(ans, dists),
        answer: ans,
        explain: `Same base, so SUBTRACT the exponents: ${x} − ${y} = ${ans} (don't add them!). So ${b}${sup(x)} ÷ ${b}${sup(y)} = ${b}${sup(ans)}.`,
      }
    },
  },
]

const PER_LEVEL = 2

function buildQuiz() {
  const qs = []
  for (const lvl of LEVELS) {
    for (let i = 0; i < PER_LEVEL; i++) qs.push({ level: lvl.name, ...lvl.make() })
  }
  return qs
}

export default function Quiz() {
  const [seed, setSeed] = useState(0)
  const questions = useMemo(buildQuiz, [seed])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)

  const q = questions[i]
  const total = questions.length
  const done = i >= total
  const answered = picked !== null
  const fmt = q?.format ?? ((v) => v)

  const pick = (c) => {
    if (answered) return
    setPicked(c)
    if (String(c) === String(q.answer)) setScore((s) => s + 1)
  }
  const next = () => { setPicked(null); setI((n) => n + 1) }
  const restart = () => { setI(0); setPicked(null); setScore(0); setSeed((s) => s + 1) }

  if (done) {
    const pct = Math.round((score / total) * 100)
    const msg = pct === 100 ? 'Perfect! You\'re an exponent expert! 🏆' : pct >= 70 ? 'Awesome work! 🌟' : 'Great try — every round makes you stronger! 💪'
    return (
      <div className="max-w-xl mx-auto mt-6 bg-white rounded-3xl shadow-lg p-10 text-center">
        <p className="text-2xl font-black text-gray-800 mb-2">You finished! 🎉</p>
        <p className="text-6xl font-black text-indigo-600 my-4">{score}<span className="text-2xl text-gray-400">/{total}</span></p>
        <p className="text-lg text-gray-600 mb-6">{msg}</p>
        <button onClick={restart} className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 active:scale-95 transition">
          Play again →
        </button>
      </div>
    )
  }

  const correct = answered && String(picked) === String(q.answer)

  return (
    <div className="max-w-xl mx-auto mt-6">
      {/* progress + score */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-sm font-bold text-gray-500">{q.level}</span>
        <span className="text-sm font-bold text-gray-500">Question {i + 1} / {total} · ⭐ {score}</span>
      </div>
      <div className="h-2 bg-indigo-100 rounded-full mb-6 overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500" animate={{ width: `${(i / total) * 100}%` }} />
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 text-center">
        <p className="text-gray-400 font-semibold mb-1">{q.sub}</p>
        <div className="mb-6">{q.prompt}</div>

        <div className="grid grid-cols-2 gap-3">
          {q.choices.map((c) => {
            const isAns = String(c) === String(q.answer)
            const isPicked = String(c) === String(picked)
            let cls = 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
            if (answered && isAns) cls = 'bg-green-500 text-white'
            else if (answered && isPicked) cls = 'bg-rose-400 text-white'
            else if (answered) cls = 'bg-gray-100 text-gray-400'
            return (
              <button
                key={String(c)}
                onClick={() => pick(c)}
                disabled={answered}
                className={`h-16 rounded-2xl text-2xl font-black transition active:scale-95 ${cls}`}
              >
                {fmt(c)}
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {answered && (
            <motion.div
              key="fb"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6"
            >
              <p className={`font-bold ${correct ? 'text-green-600' : 'text-violet-600'}`}>
                {correct ? 'Yes! 🎉' : 'Not quite —'}
              </p>
              <p className="text-gray-500 mt-1">{q.explain}</p>
              <button
                onClick={next}
                className="mt-5 px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 active:scale-95 transition"
              >
                {i + 1 === total ? 'See my score →' : 'Next →'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Big({ children, className = '' }) {
  return <span className={`inline-block text-5xl font-black text-gray-800 ${className}`}>{children}</span>
}
