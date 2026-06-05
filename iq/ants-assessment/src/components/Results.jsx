import { motion } from 'framer-motion'
import { byId, band } from '../lib/competencies'

// Roll the per-question results up into a score per competency, then show a
// warm report: a band per topic, plus a "practice this next" nudge that links
// straight to the matching sibling tool for the weakest area.
function summarize(results) {
  const map = new Map()
  for (const r of results) {
    const cur = map.get(r.compId) || { correct: 0, total: 0 }
    cur.total += 1
    if (r.correct) cur.correct += 1
    map.set(r.compId, cur)
  }
  return [...map.entries()].map(([compId, { correct, total }]) => ({
    comp: byId(compId),
    correct,
    total,
    score: correct / total,
  }))
}

export default function Results({ results, onRestart }) {
  const rows = summarize(results)
  const totalCorrect = rows.reduce((s, r) => s + r.correct, 0)
  const totalQ = rows.reduce((s, r) => s + r.total, 0)
  const overall = totalCorrect / totalQ

  // Weakest topic that wasn't already mastered → the practice suggestion.
  const focus = [...rows].sort((a, b) => a.score - b.score)[0]
  const needsWork = focus && focus.score < 0.85

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 14 }}
      >
        <div className="text-6xl mb-2">{overall >= 0.85 ? '🏆' : overall >= 0.5 ? '🌟' : '🌱'}</div>
        <h1 className="text-3xl font-black text-gray-800">Check-up complete!</h1>
        <p className="text-gray-500 mt-1">
          You got <span className="font-black text-gray-700">{totalCorrect}</span> of {totalQ} right.
        </p>
      </motion.div>

      <div className="space-y-3">
        {rows.map((r, i) => {
          const b = band(r.score)
          return (
            <motion.div
              key={r.comp.id}
              className="bg-white rounded-2xl shadow-md p-4"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0, transition: { delay: i * 0.07 } }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-xl">{r.comp.emoji}</span> {r.comp.label}
                </span>
                <span className="text-sm font-bold" style={{ color: b.color }}>
                  {b.emoji} {b.label}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: b.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(8, r.score * 100)}%`, transition: { delay: 0.2 + i * 0.07 } }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">{r.correct}/{r.total} correct</div>
            </motion.div>
          )
        })}
      </div>

      {needsWork && (
        <motion.div
          className="mt-6 rounded-2xl p-5 text-center border-2"
          style={{ borderColor: focus.comp.accent }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
        >
          <p className="text-sm font-semibold text-gray-500 mb-1">Want to level up?</p>
          <p className="font-black text-gray-800 mb-3">
            {focus.comp.emoji} Practice <span style={{ color: focus.comp.accent }}>{focus.comp.label}</span> next
          </p>
          <a
            href={focus.comp.tool.url}
            className="inline-block px-6 py-3 rounded-xl font-bold text-white shadow hover:shadow-lg transition-shadow"
            style={{ backgroundColor: focus.comp.accent }}
          >
            Open {focus.comp.tool.name} →
          </a>
        </motion.div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={onRestart}
          className="px-8 py-3 rounded-xl font-bold text-gray-600 bg-white shadow hover:shadow-md transition-shadow"
        >
          ↺ New check-up
        </button>
      </div>
    </div>
  )
}
