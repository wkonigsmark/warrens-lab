import { useState } from 'react'
import { motion } from 'framer-motion'

// "Build the power." The child taps to use the base one more time, watching the
// chain grow (2 → 2 × 2 → 2 × 2 × 2) until it matches the exponent. Like
// ShadePrompt in Ants & Fractions, the feedback nudges ("use it one more time",
// "one too many") instead of buzzing right/wrong, so they reason their way there.
export default function ExpandPrompt({ base = 2, exp = 3 }) {
  const [count, setCount] = useState(0) // how many copies of the base used so far
  const done = count === exp
  const product = base ** count

  let hint
  if (done) hint = `Perfect — you used ${base} exactly ${exp} times. That is ${base}${sup(exp)} = ${product}! 🎉`
  else if (count === 0) hint = `Tap the button to use ${base} for the first time.`
  else if (count < exp) hint = `${count} so far — use ${base} ${exp - count} more time${exp - count > 1 ? 's' : ''}.`
  else hint = `That is ${count} times — one too many. Tap "start over."`

  const chain = count === 0 ? '—' : Array.from({ length: count }, () => base).join(' × ')

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 text-center">
      <p className="text-xl font-extrabold text-gray-700 mb-1">Your turn! 👆</p>
      <p className="text-gray-500 mb-5">
        Build{' '}
        <span className="leading-none inline-flex items-start font-black text-lg">
          <span className="text-indigo-600">{base}</span>
          <span className="text-violet-600 text-sm -mt-0.5">{exp}</span>
        </span>{' '}
        by using the base {exp} times.
      </p>

      <div className="min-h-[3rem] flex items-center justify-center mb-2">
        <motion.span
          key={chain}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-3xl sm:text-4xl font-black text-gray-700"
        >
          {chain}
          {count > 0 && <span className="text-emerald-600"> = {product}</span>}
        </motion.span>
      </div>

      <button
        onClick={() => setCount((c) => Math.min(c + 1, exp + 1))}
        disabled={done}
        className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 active:scale-95 transition disabled:opacity-40"
      >
        × use {base} one more time
      </button>

      <motion.p
        key={hint}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-5 text-lg font-bold ${done ? 'text-green-600' : 'text-gray-500'}`}
      >
        {hint}
      </motion.p>

      {count > 0 && (
        <button onClick={() => setCount(0)} className="mt-3 text-sm text-gray-400 underline">
          start over
        </button>
      )}
    </div>
  )
}

// tiny unicode-superscript helper for single-digit exponents in plain text
function sup(n) {
  const map = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
  return String(n).split('').map((d) => map[d]).join('')
}
