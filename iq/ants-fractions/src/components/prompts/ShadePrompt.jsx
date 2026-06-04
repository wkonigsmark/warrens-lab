import { useState } from 'react'
import { motion } from 'framer-motion'
import Pie from '../Pie'

// "Tap slices to shade N/D of the pie." The child works toward the target and
// gets gentle, specific nudges (how many more / one too many) instead of a
// blunt right-or-wrong — so they reason their way there.
export default function ShadePrompt({ den = 4, target = 2 }) {
  const [shaded, setShaded] = useState([])
  const toggle = (i) =>
    setShaded((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))

  const k = shaded.length
  const done = k === target

  let hint
  if (done) hint = `Perfect — ${target} shaded out of ${den}. That is ${target}/${den}! 🎉`
  else if (k === 0) hint = 'Tap a slice to shade it in.'
  else if (k < target) hint = `${k} shaded so far — tap ${target - k} more.`
  else hint = `That is ${k} slices — one too many. Tap a shaded one to clear it.`

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 text-center">
      <p className="text-xl font-extrabold text-gray-700 mb-1">Your turn! 👆</p>
      <p className="text-gray-500 mb-5">
        Shade <span className="font-black text-amber-600 text-lg">{target}/{den}</span> of the pie.
      </p>

      <div className="flex justify-center mb-4">
        <Pie parts={den} shaded={shaded} onToggle={toggle} size={240} />
      </div>

      <motion.p
        key={hint}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-lg font-bold ${done ? 'text-green-600' : 'text-gray-500'}`}
      >
        {hint}
      </motion.p>

      {k > 0 && !done && (
        <button onClick={() => setShaded([])} className="mt-3 text-sm text-gray-400 underline">
          start over
        </button>
      )}
    </div>
  )
}
