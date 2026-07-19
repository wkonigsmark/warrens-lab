import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TOPICS, TIER_DEFS, LEVELS, getLevel } from '../../lib/exponentLevels'
import { getSessions } from '../../lib/sessions'
import QuizShell from './QuizShell'

function nextTitle(current, next) {
  if (!next) return null
  if (next.topicId === current?.topicId) return next.tierLabel
  return next.title
}

// A unit + tier picker. The rich stats hub lives in the "My Progress" tab.
// `startLevel` lets Progress deep-link straight into a specific tier.
export default function QuizMode({ user, startLevel }) {
  const [levelId, setLevelId] = useState(startLevel ?? null)

  const passedIds = useMemo(() => {
    return new Set(getSessions(user).filter((s) => s.passed).map((s) => s.levelId))
  }, [user])

  if (levelId) {
    const current = getLevel(levelId)
    const topicLevels = LEVELS.filter((l) => l.topicId === current.topicId)
    const currentIdx = topicLevels.findIndex((l) => l.id === levelId)
    const nextLevel = currentIdx >= 0 && currentIdx < topicLevels.length - 1 ? topicLevels[currentIdx + 1] : null

    return (
      <QuizShell
        key={levelId}
        user={user}
        level={current}
        onBack={() => setLevelId(null)}
        onAdvance={nextLevel ? () => setLevelId(nextLevel.id) : null}
        nextLevelTitle={nextTitle(current, nextLevel)}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div className="text-center mb-6" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-gray-800">📚 Exponents Quiz</h1>
        <p className="text-gray-500 mt-1">Pick a unit and tier — they get trickier as you go.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4">
        {TOPICS.map((topic, i) => {
          const tiers = TIER_DEFS.map((tier) => ({ ...tier, levelId: `${topic.id}-${tier.id}` }))
          return (
            <motion.div
              key={topic.id}
              className="bg-white rounded-2xl shadow-lg p-5 border-l-8"
              style={{ borderColor: topic.accent }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xl">{topic.emoji}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{topic.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{topic.blurb}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {tiers.map((tier) => (
                  <TierButton
                    key={tier.levelId}
                    label={tier.label}
                    passed={passedIds.has(tier.levelId)}
                    accent={topic.accent}
                    onClick={() => setLevelId(tier.levelId)}
                  />
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function TierButton({ label, passed, accent, onClick }) {
  if (passed) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold bg-green-50 text-green-700 border-2 border-green-300 hover:bg-green-100 transition-colors"
      >
        ✓ {label}
      </button>
    )
  }
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-sm font-bold text-white hover:opacity-90 active:scale-95 transition-all"
      style={{ backgroundColor: accent }}
    >
      {label}
    </button>
  )
}
