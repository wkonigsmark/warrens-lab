import { useState } from 'react'
import { motion } from 'framer-motion'
import GroupSet from '../GroupSet'

const range = (n) => Array.from({ length: n }, (_, i) => i)

// Guided "fraction of a number": split `total` into `den` groups, take `num` of
// them. The child taps the answer; a wrong tap explains the grouping, and the
// taken groups light up on success.
export default function GroupPrompt({ total = 8, den = 4, num = 1 }) {
  const groupSize = total / den
  const answer = num * groupSize
  const [done, setDone] = useState(false)
  const [wrong, setWrong] = useState(false)

  const pick = (v) => {
    if (v === answer) { setDone(true); setWrong(false) } else setWrong(true)
  }

  const choices = choicesAround(answer, 0, total)

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 text-center">
      <p className="text-xl font-extrabold text-gray-700 mb-1">Your turn! 🍪</p>
      <p className="text-gray-500 mb-5">
        What is <span className="font-black text-amber-600">{num}/{den}</span> of{' '}
        <span className="font-black text-amber-600">{total}</span>?
      </p>

      <div className="flex justify-center mb-5">
        <GroupSet total={total} den={den} selected={done ? range(num) : []} cell={34} />
      </div>

      {!done ? (
        <>
          <p className="text-gray-600 font-semibold mb-3">
            Split {total} into {den} equal groups, then take {num}.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            {choices.map((v) => (
              <button
                key={v}
                onClick={() => pick(v)}
                className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 text-2xl font-black hover:bg-amber-200 active:scale-95 transition"
              >
                {v}
              </button>
            ))}
          </div>
          {wrong && (
            <p className="mt-4 text-amber-600 font-semibold">
              {den} groups of {total} makes {groupSize} in each group. Now take {num} group{num > 1 ? 's' : ''}.
            </p>
          )}
        </>
      ) : (
        <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-green-600 font-bold text-lg">
          Yes! {num}/{den} of {total} = <span className="text-2xl">{answer}</span> 🎉
        </motion.p>
      )}

      {done && (
        <button onClick={() => { setDone(false); setWrong(false) }} className="mt-4 text-sm text-gray-400 underline">
          try it again
        </button>
      )}
    </div>
  )
}

function choicesAround(answer, min, max) {
  const set = new Set([answer])
  let lo = answer - 1
  let hi = answer + 1
  while (set.size < 3) {
    if (lo >= min) set.add(lo)
    if (set.size < 3 && hi <= max) set.add(hi)
    lo--; hi++
    if (lo < min && hi > max) break
  }
  return [...set].sort((x, y) => x - y)
}
