import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { byId } from '../../lib/competencies'
import { ability, difficultyTier } from '../../lib/adaptive'
import { saveSession } from '../../lib/config'

// Turn the finished learners into a report. For each competency we read the
// engine's settled sweet-spot level, map it to a tier + the rubric line for that
// level (what they're "working around"), and link the matching sibling tool.
// Below the warm summary sits a calibration drawer: the full per-question trace
// and a one-click export, so Warren can see exactly how a student moved and tune.
function summarize(session) {
  return session.map(({ compId, learner }) => {
    const comp = byId(compId)
    const { level } = ability(learner)
    const tier = difficultyTier(level)
    const correct = learner.history.filter((h) => h.correct).length
    const total = learner.history.length
    const rubricIdx = Math.min(10, Math.max(1, Math.round(level))) - 1
    const avgMs = total ? Math.round(learner.history.reduce((s, h) => s + (h.timeMs || 0), 0) / total) : 0
    return { comp, level, tier, correct, total, avgMs, working: comp.rubric[rubricIdx], history: learner.history }
  })
}

export default function AdaptiveResults({ session, config, onRestart }) {
  const rows = useMemo(() => summarize(session), [session])
  const [student, setStudent] = useState('')
  const [showTrace, setShowTrace] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const totalCorrect = rows.reduce((s, r) => s + r.correct, 0)
  const totalQ = rows.reduce((s, r) => s + r.total, 0)
  const focus = [...rows].sort((a, b) => a.level - b.level)[0]

  const sessionData = useMemo(
    () => ({
      ts: new Date().toISOString(),
      student: student || null,
      config,
      results: rows.map((r) => ({
        competency: r.comp.id,
        level: Number(r.level.toFixed(2)),
        tier: r.tier.id,
        correct: r.correct,
        total: r.total,
        avgMs: r.avgMs,
        trace: r.history.map((h) => ({ d: h.difficulty, ok: h.correct, ms: h.timeMs, theta: Number(h.theta.toFixed(2)) })),
      })),
    }),
    [rows, student, config]
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(sessionData, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const stash = () => {
    saveSession(sessionData)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 14 }}
      >
        <div className="text-6xl mb-2">🎓</div>
        <h1 className="text-3xl font-black text-gray-800">Check-up complete!</h1>
        <p className="text-gray-500 mt-1">
          {totalCorrect} of {totalQ} right — but what matters is <em>where each topic settled</em>.
        </p>
      </motion.div>

      <div className="space-y-3">
        {rows.map((r, i) => (
          <motion.div
            key={r.comp.id}
            className="bg-white rounded-2xl shadow-md p-4"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0, transition: { delay: i * 0.06 } }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-gray-800 flex items-center gap-2">
                <span className="text-xl">{r.comp.emoji}</span> {r.comp.label}
              </span>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: r.comp.accent }}
              >
                {r.tier.emoji} {r.tier.label}
              </span>
            </div>
            {/* The 1–10 level the engine settled on. */}
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: r.comp.accent }}
                initial={{ width: 0 }}
                animate={{ width: `${(r.level / 10) * 100}%`, transition: { delay: 0.2 + i * 0.06 } }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-gray-500">
                Working around: <span className="font-semibold text-gray-700">{r.working}</span>
              </span>
              <span className="text-[11px] text-gray-400">
                level {r.level.toFixed(1)} · {r.correct}/{r.total} · {(r.avgMs / 1000).toFixed(1)}s avg
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {focus && (
        <motion.div
          className="mt-6 rounded-2xl p-5 text-center border-2"
          style={{ borderColor: focus.comp.accent }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
        >
          <p className="text-sm font-semibold text-gray-500 mb-1">Best place to grow next</p>
          <p className="font-black text-gray-800 mb-3">
            {focus.comp.emoji} <span style={{ color: focus.comp.accent }}>{focus.comp.label}</span> — practice at the {focus.tier.label} level
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

      {/* ── Calibration drawer ─────────────────────────────────────────────── */}
      <div className="mt-8 bg-white/70 rounded-2xl border border-gray-200">
        <button
          onClick={() => setShowTrace((s) => !s)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-bold text-gray-600"
        >
          <span>🔧 Session detail (for calibration)</span>
          <span>{showTrace ? '▾' : '▸'}</span>
        </button>

        {showTrace && (
          <div className="px-5 pb-5">
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <input
                value={student}
                onChange={(e) => setStudent(e.target.value)}
                placeholder="Student label (optional)"
                className="flex-1 min-w-[140px] px-3 py-2 rounded-lg border border-gray-300 text-sm"
              />
              <button onClick={copy} className="px-3 py-2 rounded-lg bg-gray-800 text-white text-sm font-semibold">
                {copied ? 'Copied ✓' : 'Copy JSON'}
              </button>
              <button onClick={stash} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold">
                {saved ? 'Saved ✓' : 'Save session'}
              </button>
            </div>

            {rows.map((r) => (
              <div key={r.comp.id} className="mb-3">
                <div className="text-xs font-bold text-gray-600 mb-1">
                  {r.comp.emoji} {r.comp.label} → settled level {r.level.toFixed(1)}
                </div>
                <div className="flex flex-wrap gap-1">
                  {r.history.map((h, j) => (
                    <span
                      key={j}
                      title={`difficulty ${h.difficulty} · ${h.correct ? 'correct' : 'wrong'} · ${h.timeMs}ms · θ=${h.theta.toFixed(2)}`}
                      className={`px-2 py-1 rounded text-[11px] font-mono ${
                        h.correct ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      d{h.difficulty}{h.correct ? '✓' : '✗'}·{(h.timeMs / 1000).toFixed(1)}s
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-[11px] text-gray-400 mt-2">
              Each chip = one question: difficulty served, right/wrong, and time. Hover for θ.
              Tune the dials on the start screen, then re-run to compare.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
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
