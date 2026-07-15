import { useState } from 'react'
import { motion } from 'framer-motion'
import MiniChart from './MiniChart'

// Steps through a topic's worked examples one at a time. Each example reveals
// its solution steps on demand (so the student can try it first), then the
// answer. Escalating difficulty is baked into the topic's `examples` order.
export default function WorkedExamples({ topic, onNext, onBack }) {
  const [i, setI] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const ex = topic.examples[i]
  const last = i === topic.examples.length - 1

  const next = () => {
    if (last) return onNext()
    setI((n) => n + 1)
    setRevealed(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="text-xs text-gray-400 hover:text-gray-600 mb-3">← Concept intro</button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">{topic.emoji} Worked Example {i + 1}</h1>
        <span className="text-xs text-gray-400">{i + 1} / {topic.examples.length}</span>
      </div>

      <motion.div key={i} className="bg-white rounded-2xl shadow-lg p-5" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
        <p className="text-gray-800 font-medium whitespace-pre-line leading-relaxed">{ex.prompt}</p>
        {ex.chart && <MiniChart spec={ex.chart} />}

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full mt-4 border-2 border-dashed rounded-xl py-3 font-semibold text-gray-500 hover:bg-slate-50"
            style={{ borderColor: `${topic.accent}66` }}
          >
            Show the solution ↓
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 overflow-hidden">
            <ol className="flex flex-col gap-2">
              {ex.steps.map((s, si) => (
                <li key={si} className="flex gap-2 text-[15px] text-gray-600">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: topic.accent }}>{si + 1}</span>
                  <span className="whitespace-pre-line">{s}</span>
                </li>
              ))}
            </ol>
            <div className="mt-3 p-3 rounded-xl bg-green-50 text-green-800 font-semibold text-[15px]">
              ✓ {ex.answer}
            </div>
          </motion.div>
        )}
      </motion.div>

      <button
        onClick={next}
        disabled={!revealed}
        className="w-full mt-6 text-white font-bold py-4 rounded-xl text-lg hover:shadow-lg transition-all disabled:opacity-40"
        style={{ backgroundColor: topic.accent }}
      >
        {last ? 'Try the practice set →' : 'Next example →'}
      </button>
    </div>
  )
}
