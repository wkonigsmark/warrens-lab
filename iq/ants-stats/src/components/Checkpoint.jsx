import { useState } from 'react'
import TierRun from './TierRun'

// Mixed-review checkpoint — a brief lead-in, then one tracked climb that pulls
// questions from every prior topic. Runs at a mid tier (On Level) with no speed
// gate: this is cumulative retention practice, not a difficulty gate.
const CHECKPOINT_TIER = 3

export default function Checkpoint({ user, checkpoint, onExit }) {
  const [started, setStarted] = useState(false)
  const [runKey, setRunKey] = useState(0)

  if (!started) {
    return (
      <div className="max-w-lg mx-auto">
        <button onClick={onExit} className="text-xs text-gray-400 hover:text-gray-600 mb-3">← Base camp</button>
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-2">{checkpoint.emoji}</div>
          <h1 className="text-2xl font-extrabold text-gray-800">{checkpoint.title}</h1>
          <p className="text-gray-500 mt-2 text-[15px]">{checkpoint.blurb}</p>
          <p className="text-xs text-gray-400 mt-3">
            A single climb, interleaving computation and interpretation, pulling from every prior topic.
          </p>
          <button
            onClick={() => setStarted(true)}
            className="w-full mt-6 text-white font-bold py-4 rounded-xl text-lg hover:shadow-lg"
            style={{ backgroundColor: checkpoint.accent }}
          >
            Start checkpoint →
          </button>
        </div>
      </div>
    )
  }

  return (
    <TierRun
      key={runKey}
      user={user}
      unit={checkpoint}
      tier={CHECKPOINT_TIER}
      kind="checkpoint"
      onExit={onExit}
      onDone={() => setRunKey((k) => k + 1)}
    />
  )
}
