import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import MiniChart from './MiniChart'
import { saveSession, TOOL_ID } from '../lib/sessions'
import { playCorrect, playWrong, playSummit } from '../lib/sound'

// A gated warm-up for a topic's NEW hard concepts (e.g. IQR, standard
// deviation). Each key idea is taught (picture + plain definition), then
// lightly quizzed at the DEFINITION level — no arithmetic — before the tracked
// tier ladder unlocks. Untracked in spirit, but records a completion session
// so the ladder knows the concepts have been introduced.
export default function ConceptCheck({ user, topic, onExit, onDone }) {
  // Flatten into a linear deck: teach a word, then its concept questions.
  // Options are shuffled so the answer isn't always in the same spot (the data
  // authors every correct choice first) — a kid has to actually read.
  const deck = useMemo(() => {
    const shuffleQ = (q) => {
      const order = q.choices.map((c, i) => ({ c, i }))
      for (let k = order.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1));[order[k], order[j]] = [order[j], order[k]] }
      return { ...q, choices: order.map((o) => o.c), correctIndex: order.findIndex((o) => o.i === q.correctIndex) }
    }
    const d = []
    for (const idea of topic.keyIdeas) {
      d.push({ type: 'teach', idea })
      idea.questions.forEach((q) => d.push({ type: 'q', idea, q: shuffleQ(q) }))
    }
    return d
  }, [topic])
  const totalQ = useMemo(() => deck.filter((c) => c.type === 'q').length, [deck])

  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)

  const card = deck[idx]

  const next = () => {
    setPicked(null)
    if (idx + 1 >= deck.length) finish()
    else setIdx((i) => i + 1)
  }

  const finish = () => {
    saveSession({
      id: Date.now(), ts: new Date().toISOString(), toolId: TOOL_ID, userId: user,
      kind: 'concept', topicId: topic.id, tier: 0, levelId: `${topic.id}-concept`,
      levelTitle: `${topic.title} · Key Ideas`, tierLabel: 'Key Ideas', passed: true,
      count: totalQ, correct, total: totalQ, score: correct,
    }, user)
    playSummit()
    setDone(true)
  }

  const pick = (i) => {
    if (picked !== null) return
    setPicked(i)
    if (i === card.q.correctIndex) { setCorrect((c) => c + 1); playCorrect() } else playWrong()
  }

  if (done) return <Done topic={topic} correct={correct} total={totalQ} onExit={onExit} onDone={onDone} />

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-extrabold text-gray-800">📘 {topic.title} · Key Ideas</h1>
        <button onClick={onExit} className="text-xs text-gray-400 hover:text-gray-600">✕ Quit</button>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-5 overflow-hidden">
        <div className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-violet-400 transition-all"
          style={{ width: `${(idx / deck.length) * 100}%` }} />
      </div>

      {card.type === 'teach'
        ? <TeachCard idea={card.idea} onNext={next} />
        : <ConceptQ idea={card.idea} q={card.q} picked={picked} onPick={pick} onNext={next} />}
    </div>
  )
}

function TeachCard({ idea, onNext }) {
  return (
    <motion.div key={idea.id} className="bg-white rounded-3xl shadow-lg p-6 text-center"
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <div className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-1">Key idea</div>
      <div className="text-5xl mb-1">{idea.emoji}</div>
      <h2 className="text-2xl font-extrabold mb-1" style={{ color: idea.color }}>{idea.term}</h2>
      {idea.visual && <div className="my-2"><MiniChart spec={idea.visual} /></div>}
      <p className="text-gray-600 text-[15px] leading-relaxed text-left mt-2">{idea.teach}</p>
      <button onClick={onNext} className="w-full mt-5 text-white font-extrabold py-4 rounded-2xl text-lg active:scale-95 transition-all"
        style={{ backgroundColor: idea.color }}>
        Got it 👍
      </button>
    </motion.div>
  )
}

function ConceptQ({ idea, q, picked, onPick, onNext }) {
  const answered = picked !== null
  return (
    <motion.div key={q.prompt} className="bg-white rounded-3xl shadow-lg p-6" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}>
      <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: idea.color }}>{idea.emoji} {idea.term}</div>
      <p className="text-gray-800 font-bold text-lg leading-relaxed">{q.prompt}</p>
      <div className="flex flex-col gap-2.5 mt-4">
        {q.choices.map((c, i) => {
          const isAnswer = i === q.correctIndex
          let cls = 'bg-slate-50 border-slate-200 text-gray-700 hover:bg-slate-100 active:scale-[0.99]'
          if (answered && isAnswer) cls = 'bg-green-500 border-green-500 text-white'
          else if (answered && i === picked) cls = 'bg-red-50 border-red-200 text-red-400'
          else if (answered) cls = 'bg-slate-50 border-slate-200 text-gray-300'
          return (
            <button key={i} disabled={answered} onClick={() => onPick(i)}
              className={`text-left px-4 py-3.5 rounded-2xl font-semibold text-[15px] border-2 transition-all ${cls}`}>
              {c}
            </button>
          )
        })}
      </div>
      {answered && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-xl text-sm" style={{ backgroundColor: picked === q.correctIndex ? '#f0fdf4' : '#fef2f2' }}>
          <span className="font-bold" style={{ color: picked === q.correctIndex ? '#16a34a' : '#dc2626' }}>
            {picked === q.correctIndex ? '✓ Right — ' : '☝️ '}
          </span>
          <span className="text-gray-600">{q.explain}</span>
        </motion.div>
      )}
      {answered && (
        <button onClick={onNext} className="w-full mt-4 text-white font-bold py-3.5 rounded-2xl text-lg hover:shadow-lg transition-shadow"
          style={{ backgroundColor: idea.color }}>
          Next →
        </button>
      )}
    </motion.div>
  )
}

function Done({ topic, correct, total, onExit, onDone }) {
  return (
    <div className="max-w-lg mx-auto">
      <motion.div className="bg-white rounded-3xl shadow-xl p-8 text-center" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="text-5xl mb-1">🔓</div>
        <h1 className="text-2xl font-extrabold text-gray-800">Key ideas unlocked!</h1>
        <p className="text-gray-500 mt-1">You met the big ideas for {topic.title}.</p>
        <div className="flex flex-wrap justify-center gap-2 my-4">
          {topic.keyIdeas.map((k) => (
            <span key={k.id} className="text-sm font-bold px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: k.color }}>
              {k.emoji} {k.term.split(' ')[0].replace('—', '')}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400 mb-5">You got {correct} of {total} right — now the tiers are open.</p>
        <div className="flex gap-3">
          <button onClick={onExit} className="flex-1 bg-white text-gray-600 font-bold py-4 rounded-2xl shadow hover:shadow-md">Base camp</button>
          <button onClick={onDone} className="flex-1 text-white font-bold py-4 rounded-2xl hover:shadow-lg" style={{ backgroundColor: topic.accent }}>
            Start climbing →
          </button>
        </div>
      </motion.div>
    </div>
  )
}
