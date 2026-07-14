import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TOPICS, TIER_DEFS, LEVELS } from '../../lib/fractionQuiz'
import { getSessions } from '../../lib/sessions'
import { getUser } from '../../lib/users'
import QuizShell from './QuizShell'

const TOTAL = LEVELS.length // 40

// Topic cards with a 4-tier ladder each — same pattern as Ants & Axes/Angles.
// Tiers unlock in order per topic; a tier counts as cleared once a saved
// session for that exact level id has passed: true.
export default function QuizMode({ user }) {
  const [level, setLevel] = useState(null)
  const [sessionKey, setSessionKey] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const userObj = getUser(user)

  const passedIds = useMemo(() => {
    return new Set(getSessions(user).filter((s) => s.passed).map((s) => s.levelId))
  }, [user, refreshKey])

  const handleBack = () => {
    setRefreshKey((k) => k + 1)
    setLevel(null)
  }

  if (level) {
    return (
      <QuizShell
        key={sessionKey}
        user={user}
        level={level}
        onBack={handleBack}
      />
    )
  }

  const passedCount = LEVELS.filter((l) => passedIds.has(l.id)).length
  const pct = Math.round((passedCount / TOTAL) * 100)

  const playLevel = (lvl) => {
    setLevel(lvl)
    setSessionKey((k) => k + 1)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div className="text-center mb-5" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-800">📚 Fractions Quiz</h1>
        <p className="text-gray-500 mt-1">Climb each ladder — fresh questions every time.</p>
      </motion.div>

      <motion.div
        className="bg-white rounded-2xl shadow-md p-4 mb-6"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.04 } }}
      >
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            {userObj?.name ?? 'Your'} Progress
          </span>
          <span className="text-lg font-extrabold text-gray-800">
            {passedCount} <span className="text-gray-300 font-normal text-sm">/ {TOTAL}</span>
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%`, transition: { duration: 0.8, ease: 'easeOut' } }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-right">{pct}% complete</p>
      </motion.div>

      <div className="flex flex-col gap-4">
        {TOPICS.map((topic, i) => {
          const tiers = TIER_DEFS.map((tier, ti) => ({
            ...tier,
            levelId: `${topic.id}-${tier.id}`,
            passed: passedIds.has(`${topic.id}-${tier.id}`),
            tierIndex: ti,
          }))
          const passedTiers = tiers.filter((t) => t.passed).length
          const currentTier = tiers.find((t) => !t.passed) ?? tiers[tiers.length - 1]
          const allMastered = passedTiers === TIER_DEFS.length
          const playLvl = LEVELS.find((l) => l.id === currentTier.levelId)

          return (
            <motion.div
              key={topic.id}
              className="bg-white rounded-2xl shadow-lg p-5 border-l-8"
              style={{ borderColor: topic.accent }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{topic.emoji}</span>
                    <h3 className="text-base font-bold text-gray-800">{topic.title}</h3>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {allMastered ? '🏆 Mastered!' : topic.blurb}
                  </p>
                </div>
                <button
                  onClick={() => playLevel(playLvl)}
                  className="flex-shrink-0 text-sm font-bold text-white px-4 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all"
                  style={{ backgroundColor: topic.accent }}
                >
                  {allMastered ? 'Replay ↺' : 'Play →'}
                </button>
              </div>

              <TierTrack
                tiers={tiers}
                accent={topic.accent}
                currentId={currentTier.id}
                allMastered={allMastered}
                onPlay={(tier) => playLevel(LEVELS.find((l) => l.id === tier.levelId))}
              />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function TierTrack({ tiers, accent, currentId, allMastered, onPlay }) {
  return (
    <div className="flex items-center">
      {tiers.map((tier, i) => {
        const isCurrent = !allMastered && tier.id === currentId
        const isPassed = tier.passed
        const isLocked = !isPassed && !isCurrent

        return (
          <div key={tier.id} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="relative">
                {isCurrent && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-30"
                    style={{ backgroundColor: accent }}
                  />
                )}
                <button
                  onClick={() => !isLocked && onPlay(tier)}
                  disabled={isLocked}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                    isPassed ? 'text-white shadow-md cursor-pointer' :
                    isCurrent ? 'text-white shadow-md ring-4 ring-opacity-30 cursor-pointer' :
                    'bg-gray-100 text-gray-300 cursor-default'
                  }`}
                  style={isPassed || isCurrent ? { backgroundColor: accent } : {}}
                >
                  {isPassed ? '✓' : isCurrent ? '→' : '○'}
                </button>
              </div>
              <span
                className={`text-[10px] font-semibold mt-1 leading-none ${
                  isPassed ? 'text-gray-600' : isCurrent ? 'font-bold' : 'text-gray-300'
                }`}
                style={isCurrent ? { color: accent } : {}}
              >
                {tier.label}
              </span>
            </div>

            {i < tiers.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-1 rounded-full"
                style={{ backgroundColor: tiers[i + 1]?.passed || tier.passed ? accent : '#e5e7eb' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
