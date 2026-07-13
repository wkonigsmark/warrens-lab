import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import ClimbSession from './ClimbSession'
import { TOPICS, TIER_DEFS, LEVELS } from '../lib/algebraQuiz'
import { getSessions } from '../lib/sessions'
import { getUser } from '../lib/users'

// Base Camp: the progress dashboard + launcher (same pattern as Ants & Axes).
export default function AlgebraQuizMode({ user }) {
  const [level, setLevel] = useState(null)
  const [sessionKey, setSessionKey] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const passedIds = useMemo(
    () => new Set(getSessions(user).filter(s => s.passed).map(s => s.levelId)),
    [user, refreshKey]
  )

  const userObj = getUser(user)

  const playLevel = (lvl) => {
    setLevel(lvl)
    setSessionKey(k => k + 1)
  }

  const handleBack = () => { setRefreshKey(k => k + 1); setLevel(null) }
  const handleDone = (replay = false) => {
    setRefreshKey(k => k + 1)
    if (replay) { setSessionKey(k => k + 1); return }
    // Advance to the next unpassed tier in the same topic (or back to camp)
    const topicLevels = LEVELS.filter(l => l.topicId === level.topicId)
    const idx = topicLevels.findIndex(l => l.id === level.id)
    const next = topicLevels[idx + 1]
    if (next) playLevel(next)
    else setLevel(null)
  }

  if (level) {
    return (
      <ClimbSession
        key={`${level.id}-${sessionKey}`}
        user={user}
        level={level}
        onBack={handleBack}
        onDone={handleDone}
      />
    )
  }

  const passedCount = LEVELS.filter(l => passedIds.has(l.id)).length

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="text-4xl mb-1">{userObj?.emoji}</div>
        <h1 className="text-2xl font-extrabold text-gray-800">{userObj?.name}'s Base Camp</h1>
        <p className="text-sm text-gray-400 mt-1">Climb the anthill — balance every scale to reach the crown!</p>
      </div>

      {/* Overall progress */}
      <div className="bg-white rounded-2xl shadow p-5 mb-6">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Anthill Progress</span>
          <span className="text-lg font-extrabold text-gray-800">
            {passedCount}<span className="text-gray-300 text-sm font-normal"> / {LEVELS.length}</span>
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all"
            style={{ width: `${(passedCount / LEVELS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Topic cards */}
      <div className="flex flex-col gap-4">
        {TOPICS.map((topic, i) => {
          const tiers = LEVELS.filter(l => l.topicId === topic.id)
          const passed = tiers.filter(l => passedIds.has(l.id)).length
          const current = tiers.find(l => !passedIds.has(l.id)) ?? tiers[tiers.length - 1]
          return (
            <motion.div
              key={topic.id}
              className="bg-white rounded-2xl shadow-lg p-5 border-l-8"
              style={{ borderColor: topic.accent }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{topic.emoji} {topic.title}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">{topic.blurb}</p>
                  <p className="text-xs text-gray-300 mt-1">{passed} / {tiers.length} tiers</p>
                </div>
                <button
                  onClick={() => playLevel(current)}
                  className="text-white font-bold px-5 py-2.5 rounded-xl hover:shadow-lg active:scale-95 transition-all"
                  style={{ backgroundColor: topic.accent }}
                >
                  Climb →
                </button>
              </div>
              <TierTrack tiers={tiers} passedIds={passedIds} onPlay={playLevel} />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function TierTrack({ tiers, passedIds, onPlay }) {
  const currentIdx = tiers.findIndex(l => !passedIds.has(l.id))
  return (
    <div className="flex items-center">
      {tiers.map((lvl, i) => {
        const passed = passedIds.has(lvl.id)
        const current = i === (currentIdx === -1 ? tiers.length : currentIdx)
        const locked = !passed && !current
        return (
          <div key={lvl.id} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => !locked && onPlay(lvl)}
              disabled={locked}
              title={`${lvl.tierLabel}${passed ? ' — cleared' : current ? ' — up next' : ' — locked'}`}
              className={`relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all flex-shrink-0
                ${passed ? 'text-white shadow-sm' : current ? 'bg-white' : 'bg-gray-50 border-gray-200 text-gray-300'}`}
              style={passed
                ? { backgroundColor: lvl.accent, borderColor: lvl.accent }
                : current ? { borderColor: lvl.accent, color: lvl.accent } : {}}
            >
              {passed ? '✓' : current ? '→' : '○'}
              {current && (
                <span
                  className="absolute inset-0 rounded-full animate-ping opacity-25"
                  style={{ backgroundColor: lvl.accent }}
                />
              )}
            </button>
            <span className={`ml-1.5 text-[10px] font-semibold ${passed || current ? 'text-gray-500' : 'text-gray-300'}`}>
              {lvl.tierLabel}
            </span>
            {i < tiers.length - 1 && <div className="flex-1 h-0.5 mx-2 rounded bg-gray-100" />}
          </div>
        )
      })}
    </div>
  )
}
