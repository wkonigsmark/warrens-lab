import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TOPICS, TIER_DEFS, LEVELS } from '../../lib/fractionQuiz'
import { getSessions } from '../../lib/sessions'
import { getUser } from '../../lib/users'

const TOTAL = LEVELS.length // 40

const MILESTONE_MSGS = [
  [0, "Let's get started! 🎯"],
  [1, 'Great start — keep going! 🚀'],
  [10, 'Building momentum! ⭐'],
  [20, 'Halfway to Fractions Master! 🌟'],
  [30, 'So close — almost there! 🔥'],
  [40, 'Fractions Master! 🏆'],
]

function milestone(n) {
  let msg = MILESTONE_MSGS[0][1]
  for (const [threshold, text] of MILESTONE_MSGS) {
    if (n >= threshold) msg = text
  }
  return msg
}

// The rich stats dashboard — overall %, milestone message, and a full
// tier-track per topic. Distinct from Quiz's lightweight level picker;
// "Play →" here deep-links straight into that tier via onPlay.
export default function ProgressMode({ user, onPlay }) {
  const userObj = getUser(user)

  const passedIds = useMemo(() => {
    return new Set(getSessions(user).filter((s) => s.passed).map((s) => s.levelId))
  }, [user])

  const passedCount = LEVELS.filter((l) => passedIds.has(l.id)).length
  const pct = Math.round((passedCount / TOTAL) * 100)

  // The single recommended "next unit": the first unpassed tier, scanning
  // topic-by-topic then tier-by-tier — i.e. keep going where you left off.
  const nextUnit = useMemo(() => {
    for (const topic of TOPICS) {
      for (const tier of TIER_DEFS) {
        const levelId = `${topic.id}-${tier.id}`
        if (!passedIds.has(levelId)) return { topic, tier, levelId }
      }
    }
    return null // everything mastered
  }, [passedIds])

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div className="text-center mb-6" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-5xl mb-2">{userObj?.emoji ?? '🎓'}</div>
        <h1 className="text-3xl font-extrabold text-gray-800">{userObj?.name}'s Progress</h1>
        <p className="text-gray-400 mt-1">{milestone(passedCount)}</p>
      </motion.div>

      {/* Pick up where you left off — one tap to the next unit to work on. */}
      {nextUnit ? (
        <motion.button
          onClick={() => onPlay(nextUnit.levelId)}
          className="w-full rounded-2xl shadow-lg p-5 mb-6 flex items-center justify-between text-white hover:shadow-xl active:scale-[0.99] transition-all"
          style={{ background: `linear-gradient(to right, ${nextUnit.topic.accent}, #7c3aed)` }}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.04 } }}
        >
          <div className="text-left">
            <div className="text-[11px] font-bold uppercase tracking-wide text-white/80">Pick up where you left off</div>
            <div className="text-lg font-black leading-tight">{nextUnit.topic.emoji} {nextUnit.topic.title}</div>
            <div className="text-sm text-white/90">{nextUnit.tier.label} tier · your next unit</div>
          </div>
          <span className="text-3xl font-black">→</span>
        </motion.button>
      ) : (
        <motion.div
          className="w-full rounded-2xl shadow-lg p-5 mb-6 text-center text-white font-black bg-gradient-to-r from-amber-400 to-rose-500"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.04 } }}
        >
          🏆 Every unit mastered — you're a Fractions Master!
        </motion.div>
      )}

      <motion.div
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}
      >
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Fractions Progress</span>
          <span className="text-2xl font-extrabold text-gray-800">{passedCount} <span className="text-gray-300 font-normal text-lg">/ {TOTAL}</span></span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <motion.div
            className="h-4 rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%`, transition: { duration: 0.8, ease: 'easeOut' } }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-right">{pct}% complete</p>
      </motion.div>

      <div className="mb-3">
        <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold px-1 mb-4">Topic by Topic</h2>
        <div className="grid grid-cols-1 gap-5">
          {TOPICS.map((topic, i) => {
            const tiers = TIER_DEFS.map((tier, ti) => ({
              ...tier,
              levelId: `${topic.id}-${tier.id}`,
              passed: passedIds.has(`${topic.id}-${tier.id}`),
              tierIndex: ti,
            }))
            const passedTiers = tiers.filter((t) => t.passed).length
            const currentTier = tiers.find((t) => !t.passed) ?? tiers[tiers.length - 1]
            const allMastered = passedTiers === tiers.length

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
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{topic.emoji}</span>
                      <h3 className="text-base font-bold text-gray-800">{topic.title}</h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {allMastered ? '🏆 Mastered!' : `${passedTiers} / ${TIER_DEFS.length} tiers`}
                    </p>
                  </div>
                  <button
                    onClick={() => onPlay(currentTier.levelId)}
                    className="flex-shrink-0 text-sm font-bold text-white px-4 py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all"
                    style={{ backgroundColor: topic.accent }}
                  >
                    {allMastered ? 'Replay ↺' : 'Play →'}
                  </button>
                </div>

                <TierTrack tiers={tiers} accent={topic.accent} currentId={currentTier.id} allMastered={allMastered} />
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Tier track: 4 nodes connected by a line.
function TierTrack({ tiers, accent, currentId, allMastered }) {
  return (
    <div className="flex items-center gap-0">
      {tiers.map((tier, i) => {
        const isCurrent = !allMastered && tier.id === currentId
        const isPassed = tier.passed

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
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                    isPassed ? 'text-white shadow-md' :
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
