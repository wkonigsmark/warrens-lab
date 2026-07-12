import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { LEVELS, ANGLE_TOPIC_DEFS, TIER_DEFS, getLevel } from '../../lib/angleQuiz'
import { visibleItems } from '../../lib/wholeNumbers'
import { getSessions } from '../../lib/sessions'
import WholeNumbersToggle from './WholeNumbersToggle'
import QuizShell from './QuizShell'

// Find the first un-passed level in order — that's where a returning student lands.
function startingLevel(user, levels) {
  const sessions = getSessions(user)
  if (!sessions.length) return levels[0]?.id ?? null
  const passed = new Set(sessions.filter(s => s.passed).map(s => s.levelId))
  return levels.find(l => !passed.has(l.id))?.id ?? levels[0]?.id ?? null
}

// nextLevelTitle from current level to next: show just the tier label when
// staying in the same topic, or the topic title when crossing to a new one.
function nextTitle(current, next) {
  if (!next) return null
  if (next.topicId && next.topicId === current?.topicId) return next.tierLabel
  return next.title
}

export default function QuizMode({ user, wholeOnly, onWholeChange, startLevel, focusCategory, onFocusConsumed }) {
  const shown0 = visibleItems(LEVELS, wholeOnly)
  const [levelId, setLevelId] = useState(() => startLevel ?? startingLevel(user, shown0))
  const focusRef = useRef({})

  // Scroll to the focused category on arrival from a story.
  useEffect(() => {
    if (!focusCategory) return
    const timer = setTimeout(() => {
      const el = focusRef.current[focusCategory]
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        el.classList.add('ring-2', 'ring-amber-400', 'ring-offset-2', 'rounded-xl')
        setTimeout(() => el.classList.remove('ring-2', 'ring-amber-400', 'ring-offset-2', 'rounded-xl'), 1800)
      }
      onFocusConsumed?.()
    }, 150)
    return () => clearTimeout(timer)
  }, [focusCategory]) // eslint-disable-line react-hooks/exhaustive-deps

  const shown = visibleItems(LEVELS, wholeOnly)
  const hiddenCount = LEVELS.length - shown.length

  if (levelId) {
    const currentIdx = shown.findIndex(l => l.id === levelId)
    const nextLevel  = currentIdx >= 0 && currentIdx < shown.length - 1 ? shown[currentIdx + 1] : null
    const current    = getLevel(levelId)
    return (
      <QuizShell
        key={levelId}
        user={user}
        level={current}
        wholeOnly={wholeOnly}
        onBack={() => setLevelId(null)}
        onAdvance={nextLevel ? () => setLevelId(nextLevel.id) : null}
        nextLevelTitle={nextTitle(current, nextLevel)}
      />
    )
  }

  return <LevelPicker user={user} shown={shown} hiddenCount={hiddenCount} wholeOnly={wholeOnly}
    onWholeChange={onWholeChange} onSelect={setLevelId} focusRef={focusRef} />
}

// ── Level Picker ──────────────────────────────────────────────────────────

function LevelPicker({ user, shown, hiddenCount, wholeOnly, onWholeChange, onSelect, focusRef }) {
  // Build pass state from session history (re-computed each render).
  const passedIds = useMemo(() => {
    const sessions = getSessions(user)
    return new Set(sessions.filter(s => s.passed).map(s => s.levelId))
  }, [user])

  // Angle topics: show topics with tier row.
  const visibleTopics = ANGLE_TOPIC_DEFS.filter(t =>
    shown.some(l => l.topicId === t.id)
  )

  // Non-tiered levels (triangles, circles) grouped by category.
  const nonTiered = shown.filter(l => !l.tiered)
  const nonTieredByCategory = useMemo(() => nonTiered.reduce((acc, l) => {
    ;(acc[l.category] ||= []).push(l)
    return acc
  }, {}), [nonTiered])

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div className="text-center mb-6" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-800">📚 Geometry Quiz</h1>
        <p className="text-gray-500 mt-1">Pick a topic and tier — they get trickier as you go.</p>
      </motion.div>

      <WholeNumbersToggle wholeOnly={wholeOnly} onChange={onWholeChange} hiddenCount={hiddenCount} />

      {/* ── Angles: topic cards with tier row ── */}
      {visibleTopics.length > 0 && (
        <div className="mb-8" ref={el => { if (focusRef?.current) focusRef.current['Angles'] = el }}>
          <h2 className="text-sm uppercase tracking-wide text-gray-400 font-bold mb-3 px-1">Angles</h2>
          <div className="grid grid-cols-1 gap-4">
            {visibleTopics.map((topic, i) => {
              const tiers = shown.filter(l => l.topicId === topic.id)
              return (
                <motion.div
                  key={topic.id}
                  className="bg-white rounded-2xl shadow-lg p-5 border-l-8"
                  style={{ borderColor: topic.accent }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                >
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-800">{topic.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{topic.blurb}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {tiers.map(lvl => (
                      <TierButton
                        key={lvl.id}
                        level={lvl}
                        passed={passedIds.has(lvl.id)}
                        accent={topic.accent}
                        onClick={() => onSelect(lvl.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Non-tiered categories (Triangles, Circles) ── */}
      {Object.entries(nonTieredByCategory).map(([category, levels]) => (
        <div key={category} className="mb-8" ref={el => { if (focusRef?.current) focusRef.current[category] = el }}>
          <h2 className="text-sm uppercase tracking-wide text-gray-400 font-bold mb-3 px-1">{category}</h2>
          <div className="grid grid-cols-1 gap-4">
            {levels.map((lvl, i) => (
              <motion.button
                key={lvl.id}
                onClick={() => onSelect(lvl.id)}
                className="bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow border-l-8"
                style={{ borderColor: lvl.accent }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">{lvl.title}</h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${passedIds.has(lvl.id) ? 'bg-green-100 text-green-700' : 'text-white'}`}
                    style={passedIds.has(lvl.id) ? {} : { backgroundColor: lvl.accent }}>
                    {passedIds.has(lvl.id) ? '✓ Passed' : 'Play'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{lvl.blurb}</p>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Tier button ───────────────────────────────────────────────────────────

const TIER_LABELS = TIER_DEFS.map(t => t.label)

function TierButton({ level, passed, accent, onClick }) {
  const label = level.tierLabel
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
