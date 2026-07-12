import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ANGLE_TOPIC_DEFS, TIER_DEFS, LEVELS } from '../../lib/angleQuiz'
import { getSessions } from '../../lib/sessions'
import { getUser } from '../../lib/users'
import { visibleItems } from '../../lib/wholeNumbers'

const TOTAL_TIERED = ANGLE_TOPIC_DEFS.length * TIER_DEFS.length  // 28

const MILESTONE_MSGS = [
  [0,   'Let\'s get started! 🎯'],
  [1,   'Great start — keep going! 🚀'],
  [8,   'Building momentum! ⭐'],
  [14,  'Halfway to Angles Master! 🌟'],
  [21,  'So close — almost there! 🔥'],
  [28,  'Angles Master! 🏆'],
]

function milestone(n) {
  let msg = MILESTONE_MSGS[0][1]
  for (const [threshold, text] of MILESTONE_MSGS) {
    if (n >= threshold) msg = text
  }
  return msg
}

export default function ProgressMode({ user, wholeOnly, onPlay }) {
  const userObj = getUser(user)

  const passedIds = useMemo(() => {
    const sessions = getSessions(user)
    return new Set(sessions.filter(s => s.passed).map(s => s.levelId))
  }, [user])

  const shown = visibleItems(LEVELS, wholeOnly)
  const passedCount = shown.filter(l => l.tiered && passedIds.has(l.id)).length
  const pct = Math.round((passedCount / TOTAL_TIERED) * 100)

  // Non-tiered levels for the bonus section
  const bonusLevels  = shown.filter(l => !l.tiered)
  const bonusPassed  = bonusLevels.filter(l => passedIds.has(l.id)).length
  const bonusByCategory = bonusLevels.reduce((acc, l) => {
    ;(acc[l.category] ||= []).push(l)
    return acc
  }, {})

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-5xl mb-2">{userObj?.emoji ?? '🎓'}</div>
        <h1 className="text-3xl font-extrabold text-gray-800">{userObj?.name}'s Progress</h1>
        <p className="text-gray-400 mt-1">{milestone(passedCount)}</p>
      </motion.div>

      {/* Overall progress bar */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}
      >
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Angles Progress</span>
          <span className="text-2xl font-extrabold text-gray-800">{passedCount} <span className="text-gray-300 font-normal text-lg">/ {TOTAL_TIERED}</span></span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <motion.div
            className="h-4 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%`, transition: { duration: 0.8, ease: 'easeOut' } }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-right">{pct}% complete</p>
      </motion.div>

      {/* Angle topic cards */}
      <div className="mb-3">
        <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold px-1 mb-4">Angles — Topic by Topic</h2>
        <div className="grid grid-cols-1 gap-5">
          {ANGLE_TOPIC_DEFS.map((topic, i) => {
            const tiers      = TIER_DEFS.map((tier, ti) => ({
              ...tier,
              levelId: `${topic.id}-${tier.id}`,
              passed: passedIds.has(`${topic.id}-${tier.id}`),
              tierIndex: ti,
            }))
            const passedTiers  = tiers.filter(t => t.passed).length
            const currentTier  = tiers.find(t => !t.passed) ?? tiers[tiers.length - 1]
            const allMastered  = passedTiers === tiers.length
            const playLevelId  = currentTier.levelId

            return (
              <motion.div
                key={topic.id}
                className="bg-white rounded-2xl shadow-lg p-5 border-l-8"
                style={{ borderColor: topic.accent }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-800">{topic.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {allMastered ? '🏆 Mastered!' : `${passedTiers} / ${TIER_DEFS.length} tiers`}
                    </p>
                  </div>
                  <button
                    onClick={() => onPlay(playLevelId)}
                    className="flex-shrink-0 text-sm font-bold text-white px-4 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all"
                    style={{ backgroundColor: topic.accent }}
                  >
                    {allMastered ? 'Replay ↺' : 'Play →'}
                  </button>
                </div>

                {/* Tier track */}
                <TierTrack tiers={tiers} accent={topic.accent} currentId={currentTier.id} allMastered={allMastered} />
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Bonus levels (triangles, circles) */}
      {bonusLevels.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold px-1 mb-4">
            Bonus Topics — {bonusPassed} / {bonusLevels.length} passed
          </h2>
          {Object.entries(bonusByCategory).map(([cat, levels]) => (
            <div key={cat} className="mb-4">
              <h3 className="text-xs text-gray-300 font-semibold uppercase tracking-wide px-1 mb-2">{cat}</h3>
              <div className="grid grid-cols-1 gap-3">
                {levels.map(lvl => {
                  const passed = passedIds.has(lvl.id)
                  return (
                    <div
                      key={lvl.id}
                      className="bg-white rounded-xl shadow p-4 flex items-center justify-between border-l-4"
                      style={{ borderColor: lvl.accent }}
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-700">{lvl.title}</p>
                        <p className="text-xs text-gray-400">{lvl.blurb}</p>
                      </div>
                      {passed
                        ? <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">✓ Passed</span>
                        : <button
                            onClick={() => onPlay(lvl.id)}
                            className="text-xs font-bold text-white px-3 py-1.5 rounded-lg"
                            style={{ backgroundColor: lvl.accent }}
                          >Play →</button>
                      }
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Tier track: 4 nodes connected by a line ───────────────────────────────

function TierTrack({ tiers, accent, currentId, allMastered }) {
  return (
    <div className="flex items-center gap-0">
      {tiers.map((tier, i) => {
        const isCurrent = !allMastered && tier.id === currentId
        const isPassed  = tier.passed

        return (
          <div key={tier.id} className="flex items-center flex-1 min-w-0">
            {/* Node */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="relative">
                {/* Pulse ring on current tier */}
                {isCurrent && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-30"
                    style={{ backgroundColor: accent }}
                  />
                )}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                    isPassed  ? 'text-white shadow-md' :
                    isCurrent ? 'text-white shadow-md ring-4 ring-opacity-30' :
                                'bg-gray-100 text-gray-300'
                  }`}
                  style={isPassed || isCurrent ? { backgroundColor: accent } : {}}
                >
                  {isPassed ? '✓' : isCurrent ? '→' : '○'}
                </div>
              </div>
              <span className={`text-[10px] font-semibold mt-1 leading-none ${
                isPassed ? 'text-gray-600' : isCurrent ? 'font-bold' : 'text-gray-300'
              }`}
                style={isCurrent ? { color: accent } : {}}
              >
                {tier.label}
              </span>
            </div>

            {/* Connector line (skip after last node) */}
            {i < tiers.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 rounded-full transition-colors"
                style={{ backgroundColor: tiers[i + 1]?.passed || tiers[i]?.passed ? accent : '#e5e7eb' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
