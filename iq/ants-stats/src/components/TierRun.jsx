import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import QuestionCard from './QuestionCard'
import ClimbRail from './ClimbRail'
import { RUNGS, skillForIndex, evaluateSummit, runReport, tierDef } from '../lib/statsEngine'
import { saveSession, TOOL_ID } from '../lib/sessions'
import { playCorrect, playWrong, playClimb, playSummit } from '../lib/sound'

const CONFETTI = ['#22c55e', '#86efac', '#fbbf24', '#34d399', '#a3e635', '#6ee7b7', '#38bdf8']
function ConfettiPuff({ n = 22 }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {Array.from({ length: n }, (_, i) => {
        const angle = (360 / n) * i
        const dist = 52 + (i % 3) * 22
        const size = 6 + (i % 3) * 4
        return <span key={i} style={{
          position: 'absolute', left: '50%', top: '40%', width: size, height: size, borderRadius: '50%',
          background: CONFETTI[i % CONFETTI.length],
          animation: `confettiDot 0.65s ease-out ${(i % 5) * 0.03}s both`,
          '--dx': `${Math.cos((angle * Math.PI) / 180) * dist}px`,
          '--dy': `${Math.sin((angle * Math.PI) / 180) * dist}px`,
        }} />
      })}
    </div>
  )
}

// One gated climb up a single tier. Questions auto-advance: answer → a quick
// correct/wrong flash → the next question, no button. Correct climbs a rung;
// wrong spends a miss. Summit the top rung within the miss budget (and, on the
// top tiers, under the average-time gate) to clear the tier and unlock the next.
export default function TierRun({ user, unit, tier, kind = 'tier', onExit, onDone }) {
  const def = tierDef(tier)
  const rungRef = useRef(0)
  const missRef = useRef(0)
  const answersRef = useRef([])
  const startedAt = useRef(Date.now())
  const qStart = useRef(Date.now())
  const timer = useRef(null)

  const [rung, setRung] = useState(0)
  const [misses, setMisses] = useState(0)
  const [qIndex, setQIndex] = useState(0)
  const [q, setQ] = useState(null)
  const [picked, setPicked] = useState(null)
  const [result, setResult] = useState(null)

  const makeQ = (i) => {
    const skill = skillForIndex(i)
    return { ...unit.generate(tier, skill), _key: `${unit.id}-${tier}-${i}` }
  }

  useEffect(() => {
    setQ(makeQ(0)); qStart.current = Date.now()
    return () => clearTimeout(timer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const finish = (summited) => {
    const answers = answersRef.current
    const report = runReport(answers)
    const verdict = evaluateSummit({
      rung: rungRef.current, misses: missRef.current, missBudget: def.missBudget,
      avgMs: report.avgMs, maxAvgMs: def.maxAvgMs,
    })
    saveSession({
      id: Date.now(), ts: new Date().toISOString(), toolId: TOOL_ID, userId: user,
      kind, topicId: unit.id, tier, levelId: `${unit.id}-t${tier}`,
      levelTitle: unit.title, tierLabel: def.label,
      passed: verdict.passed,
      summited: verdict.summited, speedOk: verdict.speedOk,
      rungs: rungRef.current, misses: missRef.current, missBudget: def.missBudget,
      count: report.total, correct: report.correct, score: report.correct, total: report.total,
      ms: Date.now() - startedAt.current, avgMs: report.avgMs, maxAvgMs: def.maxAvgMs,
      skills: report.skills, answers,
    }, user)
    setResult({ ...verdict, report })
  }

  const nextQuestion = (i) => {
    setPicked(null)
    setQ(makeQ(i)); setQIndex(i)
    qStart.current = Date.now()
  }

  const pick = (choice) => {
    if (picked !== null || !q || result) return
    const correct = choice === q.correctIndex
    const ms = Date.now() - qStart.current
    answersRef.current.push({ skill: q.skill, correct, ms })
    setPicked(choice)

    let outcome = 'continue'
    if (correct) {
      rungRef.current += 1; setRung(rungRef.current)
      if (rungRef.current >= RUNGS) { playSummit(); outcome = 'summit' } else playClimb()
    } else {
      missRef.current += 1; setMisses(missRef.current)
      playWrong()
      if (missRef.current > def.missBudget) outcome = 'bust'
    }
    if (correct && outcome !== 'summit') playCorrect()

    const delay = correct ? 850 : 1500
    timer.current = setTimeout(() => {
      if (outcome === 'summit') finish(true)
      else if (outcome === 'bust') finish(false)
      else nextQuestion(qIndex + 1)
    }, delay)
  }

  if (result) return <RunResult result={result} unit={unit} def={def} onExit={onExit} onDone={onDone} />
  if (!q) return null

  const answered = picked !== null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          {unit.emoji} {unit.title}
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: unit.accent }}>
            {def.emoji} {def.label}
          </span>
        </h1>
        <button onClick={onExit} className="text-xs text-gray-400 hover:text-gray-600">✕ Quit</button>
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1">
          <QuestionCard
            q={q}
            phase={answered ? 'answered' : 'asking'}
            picked={picked}
            onPick={pick}
            accent={unit.accent}
            showExplain={false}     // timed run: quick flash, then auto-advance
            showHint={tier <= 2}    // scaffolding fades as the climb gets harder
          />
        </div>
        <ClimbRail rung={rung} misses={misses} missBudget={def.missBudget} accent={unit.accent} skill={q.skill} />
      </div>

      {def.maxAvgMs && (
        <p className="text-center text-[11px] text-gray-400 mt-3">
          ⏱ {def.label} mastery also needs an average under {Math.round(def.maxAvgMs / 1000)}s per question
        </p>
      )}
    </div>
  )
}

// ── Result screens ───────────────────────────────────────────────────────────
function RunResult({ result, unit, def, onExit, onDone }) {
  const { passed, summited, speedOk, report } = result
  const nextTier = def.tier < 5 ? def.tier + 1 : null

  // Cleared the tier fully
  if (passed) {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div className="bg-white rounded-2xl shadow-xl p-8 text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <ConfettiPuff n={26} />
          <div className="text-6xl mb-1">🚩</div>
          <h1 className="text-3xl font-extrabold text-gray-800">Tier cleared!</h1>
          <p className="text-gray-500 mt-1">
            {unit.title} · <span className="font-bold" style={{ color: unit.accent }}>{def.emoji} {def.label}</span>
          </p>
          <SkillSplit report={report} />
          <div className="flex gap-3 mt-6">
            {nextTier
              ? <button onClick={() => onDone(nextTier)} className="flex-1 text-white font-bold py-4 rounded-xl hover:shadow-lg" style={{ backgroundColor: unit.accent }}>
                  Next tier →
                </button>
              : <button onClick={onExit} className="flex-1 text-white font-bold py-4 rounded-xl hover:shadow-lg" style={{ backgroundColor: unit.accent }}>
                  🏆 Topic mastered!
                </button>}
            <button onClick={onExit} className="flex-1 bg-white text-gray-600 font-bold py-4 rounded-xl shadow hover:shadow-md">
              Base camp
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Climbed the summit but missed the speed gate
  if (summited && !speedOk) {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div className="bg-white rounded-2xl shadow-lg p-8 text-center" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="text-5xl mb-2">⏱️</div>
          <h1 className="text-2xl font-extrabold text-gray-800">So close!</h1>
          <p className="text-gray-500 mt-1">
            You climbed {def.label} — but averaged {(report.avgMs / 1000).toFixed(1)}s, and mastery needs under {Math.round(def.maxAvgMs / 1000)}s.
          </p>
          <p className="text-sm text-gray-400 mt-1">You know it — now build the speed. Run it again!</p>
          <SkillSplit report={report} />
          <button onClick={() => onDone(def.tier)} className="w-full mt-6 text-white font-bold py-4 rounded-xl hover:shadow-lg" style={{ backgroundColor: unit.accent }}>
            Try again ↻
          </button>
          <button onClick={onExit} className="mt-3 text-sm text-gray-400 hover:text-gray-600 block w-full">← Base camp</button>
        </motion.div>
      </div>
    )
  }

  // Busted the miss budget
  return (
    <div className="max-w-lg mx-auto">
      <motion.div className="bg-white rounded-2xl shadow-lg p-8 text-center" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="text-5xl mb-2">🍂</div>
        <h1 className="text-2xl font-extrabold text-gray-800">Slid down the hill</h1>
        <p className="text-gray-500 mt-1">
          {def.label} allows {def.missBudget} {def.missBudget === 1 ? 'miss' : 'misses'} — you had {report.total - report.correct}.
        </p>
        <SkillSplit report={report} />
        <button onClick={() => onDone(def.tier)} className="w-full mt-6 text-white font-bold py-4 rounded-xl hover:shadow-lg" style={{ backgroundColor: unit.accent }}>
          Try again ↻
        </button>
        <button onClick={onExit} className="mt-3 text-sm text-gray-400 hover:text-gray-600 block w-full">← Base camp</button>
      </motion.div>
    </div>
  )
}

// The computation-vs-interpretation split for this run.
function SkillSplit({ report }) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-5">
      {['computation', 'interpretation'].map((id) => {
        const s = report.skills[id]
        const SK = { computation: { label: 'Computation', emoji: '🧮', color: '#0ea5e9' }, interpretation: { label: 'Interpretation', emoji: '💬', color: '#8b5cf6' } }[id]
        return (
          <div key={id} className="bg-slate-50 rounded-xl p-3 text-left">
            <div className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white inline-block" style={{ backgroundColor: SK.color }}>
              {SK.emoji} {SK.label}
            </div>
            <div className="mt-1.5 text-lg font-extrabold" style={{ color: s.label.color }}>{s.label.emoji} {s.label.label}</div>
            <div className="text-xs text-gray-400">{s.total ? `${Math.round(s.acc * 100)}% (${s.correct}/${s.total})` : 'no items'}</div>
          </div>
        )
      })}
    </div>
  )
}
