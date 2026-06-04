import { useState } from 'react'
import PercentGrid from '../PercentGrid'

// "How much is filled?" — read a grid and tap the matching percent. A wrong tap
// just shakes and lets them try again (no penalty), keeping it all easy wins.
export default function ReadGridQuestion({ question, frozen, onCorrect }) {
  const { value, choices } = question
  const [wrong, setWrong] = useState(null)
  const [picked, setPicked] = useState(null)

  const choose = (c) => {
    if (frozen || picked != null) return
    if (c === value) {
      setPicked(c)
      onCorrect()
    } else {
      setWrong(c)
      setTimeout(() => setWrong((w) => (w === c ? null : w)), 450)
    }
  }

  return (
    <div className="text-center">
      <div className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-2">How much? 🤔</div>
      <h3 className="text-2xl sm:text-3xl font-black text-gray-800 mb-4">How much is filled?</h3>

      <div className="flex justify-center mb-6">
        <PercentGrid value={value} size={260} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {choices.map((c) => {
          const isPicked = picked === c
          const isWrong = wrong === c
          return (
            <button
              key={c}
              onClick={() => choose(c)}
              className={`py-4 rounded-2xl text-2xl font-black transition-colors ${isWrong ? 'shake' : ''} ${
                isPicked
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
              }`}
            >
              {c}%
            </button>
          )
        })}
      </div>
    </div>
  )
}
