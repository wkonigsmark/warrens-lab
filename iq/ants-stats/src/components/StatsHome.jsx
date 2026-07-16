import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TOPICS, CHECKPOINTS } from '../lib/topics/index'
import { TIER_DEFS, TIER_MAX } from '../lib/statsEngine'
import { getSessions } from '../lib/sessions'
import { getUser } from '../lib/users'

// Which tiers has this student cleared, per unit? (levelId = `${unitId}-t${tier}`)
function passedTiersByUnit(sessions) {
  const map = {}
  for (const s of sessions) {
    // Only real tier climbs (1–5) count — not concept/vocab warm-ups (tier 0).
    if (!s.passed || !(s.tier >= 1)) continue
    ;(map[s.topicId] ??= new Set()).add(s.tier)
  }
  return map
}

// Gated ladder for one unit: cleared tiers, the current (next) tier unlocked,
// the rest locked. Same progression feel as the younger Ants games.
function TierTrack({ accent, passed, onPlay, conceptGated }) {
  // While the key-ideas check is pending, every tier is locked (no "current").
  const currentTier = conceptGated ? null : (TIER_DEFS.find((t) => !passed.has(t.tier))?.tier ?? null)
  return (
    <div className="flex items-center mt-3">
      {TIER_DEFS.map((t, i) => {
        const isPassed = passed.has(t.tier)
        const isCurrent = t.tier === currentTier
        const locked = !isPassed && !isCurrent
        return (
          <div key={t.tier} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => !locked && onPlay(t.tier)}
              disabled={locked}
              title={`${t.label}${isPassed ? ' — cleared' : isCurrent ? ' — up next' : ' — locked'}`}
              className={`relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all flex-shrink-0
                ${isPassed ? 'text-white shadow-sm' : isCurrent ? 'bg-white' : 'bg-gray-50 border-gray-200 text-gray-300'}`}
              style={isPassed ? { backgroundColor: accent, borderColor: accent } : isCurrent ? { borderColor: accent, color: accent } : {}}
            >
              {isPassed ? '✓' : isCurrent ? t.emoji : '🔒'}
              {isCurrent && <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: accent }} />}
            </button>
            {i < TIER_DEFS.length - 1 && <div className="flex-1 h-0.5 mx-1.5 rounded bg-gray-100" />}
          </div>
        )
      })}
    </div>
  )
}

export default function StatsHome({ user, onClimb, onLearn, onCheckpoint, onVocab, onConcept, refreshKey }) {
  const userObj = getUser(user)
  const sessions = useMemo(() => getSessions(user), [user, refreshKey])
  const passed = useMemo(() => passedTiersByUnit(sessions), [sessions])
  const vocabDone = useMemo(() => sessions.some((s) => s.kind === 'vocab'), [sessions])
  const conceptDone = useMemo(() => {
    const s = new Set(sessions.filter((x) => x.kind === 'concept').map((x) => x.topicId))
    return (topicId) => s.has(topicId)
  }, [sessions])

  const totalTiers = TOPICS.length * TIER_MAX
  const clearedTiers = TOPICS.reduce((sum, t) => sum + (passed[t.id]?.size ?? 0), 0)
  const checkpointUnlocked = TOPICS.every((t) => (passed[t.id]?.size ?? 0) >= 1)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="text-4xl mb-1">{userObj?.emoji}</div>
        <h1 className="text-2xl font-extrabold text-gray-800">{userObj?.name}'s Stats Lab</h1>
        <p className="text-sm text-gray-400 mt-1">Learn the concept, then climb each topic's tiers to mastery.</p>
      </div>

      {/* Start here — the dead-simple vocabulary layer before Topic 1 */}
      <motion.button
        onClick={onVocab}
        className="w-full text-left rounded-2xl shadow-lg p-5 mb-6 text-white active:scale-[0.99] transition-transform"
        style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-white/70">
              {vocabDone ? 'Warm-up · replay anytime' : '★ Start here'}
            </div>
            <h3 className="text-xl font-extrabold mt-0.5">🔤 Stat Words {vocabDone && <span className="text-base">✓</span>}</h3>
            <p className="text-sm text-white/80 mt-0.5">Learn the picture for each word — median, mean, skew… Tap-along, no reading needed.</p>
          </div>
          <span className="text-white font-extrabold whitespace-nowrap bg-white/20 rounded-xl px-4 py-2.5">
            {vocabDone ? 'Again ↻' : 'Play →'}
          </span>
        </div>
      </motion.button>

      <div className="bg-white rounded-2xl shadow p-5 mb-6">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Tiers Cleared</span>
          <span className="text-lg font-extrabold text-gray-800">
            {clearedTiers}<span className="text-gray-300 text-sm font-normal"> / {totalTiers}</span>
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div className="h-2.5 rounded-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all"
            style={{ width: `${(clearedTiers / totalTiers) * 100}%` }} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {TOPICS.map((topic, i) => {
          const p = passed[topic.id] ?? new Set()
          const mastered = p.size >= TIER_MAX
          // Topics that introduce brand-new derived measures gate their tiers
          // behind a "Key Ideas" warm-up so the concepts are taught first.
          const gated = !!topic.keyIdeas && !conceptDone(topic.id)
          return (
            <motion.div
              key={topic.id}
              className="bg-white rounded-2xl shadow-lg p-5 border-l-8"
              style={{ borderColor: topic.accent }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-300">TOPIC {topic.n}</span>
                    {mastered && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">🏆 Mastered</span>}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mt-0.5">{topic.emoji} {topic.title}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">{topic.hook}</p>
                  <p className="text-[11px] text-gray-300 mt-1">{p.size} / {TIER_MAX} tiers cleared</p>
                </div>
                <div className="flex flex-col gap-2 items-stretch">
                  <button
                    onClick={() => (gated ? onConcept(topic.id) : onClimb(topic.id))}
                    className="text-white font-bold px-5 py-2.5 rounded-xl hover:shadow-lg active:scale-95 transition-all whitespace-nowrap"
                    style={{ backgroundColor: topic.accent }}
                  >
                    {gated ? '📘 Key Ideas →' : mastered ? 'Replay ↻' : p.size ? 'Climb →' : 'Start →'}
                  </button>
                  {topic.keyIdeas && !gated && (
                    <button onClick={() => onConcept(topic.id)} className="text-xs font-semibold text-gray-400 hover:text-gray-600">
                      📘 Key ideas ✓
                    </button>
                  )}
                  <button onClick={() => onLearn(topic.id)} className="text-xs font-semibold text-gray-400 hover:text-gray-600">
                    📖 Learn
                  </button>
                </div>
              </div>
              {gated && (
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold rounded-xl px-3 py-2"
                  style={{ backgroundColor: `${topic.accent}14`, color: topic.accent }}>
                  📘 Meet the key ideas first — IQR &amp; standard deviation — then the tiers open.
                </div>
              )}
              <TierTrack accent={topic.accent} passed={p} conceptGated={gated} onPlay={(tier) => onClimb(topic.id, tier)} />
            </motion.div>
          )
        })}

        {CHECKPOINTS.map((cp) => {
          const p = passed[cp.id] ?? new Set()
          const cleared = p.size >= 1
          return (
            <motion.div
              key={cp.id}
              className="rounded-2xl shadow-lg p-5 border-2 border-dashed"
              style={{ borderColor: cp.accent, backgroundColor: `${cp.accent}0d`, opacity: checkpointUnlocked ? 1 : 0.6 }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: checkpointUnlocked ? 1 : 0.6, y: 0 }}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <span className="text-[11px] font-bold" style={{ color: cp.accent }}>MIXED REVIEW</span>
                  <h3 className="text-lg font-bold text-gray-800 mt-0.5">{cp.emoji} {cp.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {checkpointUnlocked ? cp.blurb : 'Unlocks once you\'ve cleared at least one tier in every topic.'}
                  </p>
                  {cleared && <span className="inline-block mt-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Cleared</span>}
                </div>
                <button
                  onClick={() => checkpointUnlocked && onCheckpoint(cp.id)}
                  disabled={!checkpointUnlocked}
                  className="text-white font-bold px-5 py-2.5 rounded-xl hover:shadow-lg active:scale-95 transition-all whitespace-nowrap disabled:opacity-50"
                  style={{ backgroundColor: cp.accent }}
                >
                  {checkpointUnlocked ? (cleared ? 'Replay →' : 'Take it →') : '🔒'}
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      <p className="text-center text-[11px] text-gray-300 mt-8">
        Ants &amp; Statistics · v1 (Topics 1–3) · more units coming
      </p>
    </div>
  )
}
