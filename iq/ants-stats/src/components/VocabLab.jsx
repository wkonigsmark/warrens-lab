import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import VocabVisual from './VocabVisual'
import { VOCAB } from '../lib/vocab'
import { saveSession, TOOL_ID } from '../lib/sessions'
import { playCorrect, playWrong, playSummit } from '../lib/sound'

const ACCENT = '#0ea5e9'

// ── Deck building ────────────────────────────────────────────────────────────
function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]] } return b }
function sample(pool, n, excludeId) { return shuffle(pool.filter((t) => t.id !== excludeId)).slice(0, n) }

function makeQuiz(target, pool) {
  const canMulti = pool.length >= 3
  const r = Math.random()
  const type = !canMulti ? 'yesno' : r < 0.4 ? 'pick-word' : r < 0.8 ? 'pick-pic' : 'yesno'
  if (type === 'pick-word') {
    const ds = sample(pool, 2, target.id)
    return { type, shown: target, options: shuffle([target.word, ...ds.map((d) => d.word)]), answer: target.word }
  }
  if (type === 'pick-pic') {
    const ds = sample(pool, 2, target.id)
    return { type, targetWord: target.word, targetColor: target.color, options: shuffle([target, ...ds]), answerId: target.id }
  }
  const yes = Math.random() < 0.6 || pool.length < 2
  const shown = yes ? target : (sample(pool, 1, target.id)[0] || target)
  return { type: 'yesno', shown, targetWord: target.word, targetColor: target.color, answer: shown.id === target.id ? 'yes' : 'no' }
}

function buildDeck() {
  const deck = []
  const met = []
  for (const t of VOCAB) {
    deck.push({ type: 'meet', term: t })
    met.push(t)
    deck.push(makeQuiz(t, [...met]))
    if (met.length >= 3) deck.push(makeQuiz(met[Math.floor(Math.random() * met.length)], [...met]))
  }
  for (let i = 0; i < 10; i++) deck.push(makeQuiz(VOCAB[Math.floor(Math.random() * VOCAB.length)], VOCAB))
  return deck
}

// ── Component ────────────────────────────────────────────────────────────────
export default function VocabLab({ user, onExit }) {
  const deck = useMemo(buildDeck, [])
  const totalQuiz = useMemo(() => deck.filter((c) => c.type !== 'meet').length, [deck])
  const timer = useRef(null)
  const startedAt = useRef(Date.now())
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)

  const card = deck[idx]

  const advance = () => {
    setPicked(null)
    if (idx + 1 >= deck.length) finish()
    else setIdx((i) => i + 1)
  }

  const finish = () => {
    saveSession({
      id: Date.now(), ts: new Date().toISOString(), toolId: TOOL_ID, userId: user,
      kind: 'vocab', topicId: 'vocab', tier: 0, levelId: 'vocab',
      levelTitle: 'Stat Words', tierLabel: 'Vocab', passed: true,
      count: totalQuiz, correct, total: totalQuiz, score: correct,
      ms: Date.now() - startedAt.current,
    }, user)
    playSummit()
    setDone(true)
  }

  const answer = (isCorrect, value) => {
    if (picked !== null) return
    setPicked(value)
    if (isCorrect) { setCorrect((c) => c + 1); playCorrect() } else playWrong()
    timer.current = setTimeout(advance, isCorrect ? 950 : 1500)
  }

  if (done) return <Done correct={correct} total={totalQuiz} onExit={onExit} onReplay={() => window.location.reload()} />

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-extrabold text-gray-800">🔤 Stat Words</h1>
        <button onClick={onExit} className="text-xs text-gray-400 hover:text-gray-600">✕ Quit</button>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-5 overflow-hidden">
        <div className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-violet-400 transition-all"
          style={{ width: `${(idx / deck.length) * 100}%` }} />
      </div>

      {card.type === 'meet' && <MeetCard term={card.term} onNext={advance} />}
      {card.type !== 'meet' && <QuizCard key={idx} card={card} picked={picked} onAnswer={answer} />}
    </div>
  )
}

// ── Meet a new word ──────────────────────────────────────────────────────────
function MeetCard({ term, onNext }) {
  return (
    <motion.div key={term.id} className="bg-white rounded-3xl shadow-lg p-6 text-center"
      initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}>
      <div className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-1">New word</div>
      <div className="text-6xl mb-1">{term.emoji}</div>
      <h2 className="text-4xl font-extrabold mb-2" style={{ color: term.color }}>{term.word}</h2>
      <div className="bg-slate-50 rounded-2xl py-3 my-3"><VocabVisual term={term} /></div>
      <p className="text-gray-600 text-lg font-medium">{term.kid}</p>
      <button onClick={onNext} className="w-full mt-5 text-white font-extrabold py-4 rounded-2xl text-xl active:scale-95 transition-all"
        style={{ backgroundColor: term.color }}>
        I see it! 👍
      </button>
    </motion.div>
  )
}

// ── Quiz cards ───────────────────────────────────────────────────────────────
function QuizCard({ card, picked, onAnswer }) {
  const answered = picked !== null
  if (card.type === 'pick-word') return <PickWord card={card} picked={picked} answered={answered} onAnswer={onAnswer} />
  if (card.type === 'pick-pic') return <PickPic card={card} picked={picked} answered={answered} onAnswer={onAnswer} />
  return <YesNo card={card} picked={picked} answered={answered} onAnswer={onAnswer} />
}

function Flash({ ok }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center text-2xl font-extrabold mt-4" style={{ color: ok ? '#16a34a' : '#f59e0b' }}>
      {ok ? '🎉 Yes!' : '☝️ This one!'}
    </motion.div>
  )
}

function PickWord({ card, picked, answered, onAnswer }) {
  return (
    <motion.div className="bg-white rounded-3xl shadow-lg p-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <p className="text-center text-xl font-extrabold text-gray-700 mb-2">What is this? 👀</p>
      <div className="bg-slate-50 rounded-2xl py-3"><VocabVisual term={card.shown} /></div>
      <div className="grid grid-cols-1 gap-2.5 mt-4">
        {card.options.map((w) => {
          const isAnswer = w === card.answer
          let cls = 'bg-slate-50 border-slate-200 text-gray-700 hover:bg-slate-100 active:scale-[0.98]'
          if (answered && isAnswer) cls = 'bg-green-500 border-green-500 text-white'
          else if (answered && w === picked) cls = 'bg-red-50 border-red-200 text-red-400'
          else if (answered) cls = 'bg-slate-50 border-slate-200 text-gray-300'
          return (
            <button key={w} disabled={answered} onClick={() => onAnswer(isAnswer, w)}
              className={`py-4 rounded-2xl font-extrabold text-2xl border-2 transition-all ${cls}`}>
              {w}
            </button>
          )
        })}
      </div>
      {answered && <Flash ok={picked === card.answer} />}
    </motion.div>
  )
}

function PickPic({ card, picked, answered, onAnswer }) {
  return (
    <motion.div className="bg-white rounded-3xl shadow-lg p-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <p className="text-center text-xl font-extrabold text-gray-700 mb-4">
        Which one is the <span style={{ color: card.targetColor }}>{card.targetWord}</span>? 👀
      </p>
      <div className="grid grid-cols-3 gap-2">
        {card.options.map((t) => {
          const isAnswer = t.id === card.answerId
          let ring = 'border-slate-200 bg-slate-50 hover:bg-slate-100'
          if (answered && isAnswer) ring = 'border-green-500 bg-green-50'
          else if (answered && t.id === picked) ring = 'border-red-300 bg-red-50'
          else if (answered) ring = 'border-slate-100 bg-slate-50 opacity-50'
          return (
            <button key={t.id} disabled={answered} onClick={() => onAnswer(isAnswer, t.id)}
              className={`rounded-2xl border-2 p-1.5 transition-all active:scale-95 ${ring}`}>
              <VocabVisual term={t} size="sm" />
            </button>
          )
        })}
      </div>
      {answered && <Flash ok={picked === card.answerId} />}
    </motion.div>
  )
}

function YesNo({ card, picked, answered, onAnswer }) {
  const btn = (val, label, color) => {
    const isAnswer = card.answer === val
    let cls = 'bg-white border-slate-200 text-gray-600 hover:bg-slate-50 active:scale-95'
    if (answered && isAnswer) cls = 'bg-green-500 border-green-500 text-white'
    else if (answered && val === picked) cls = 'bg-red-50 border-red-200 text-red-400'
    else if (answered) cls = 'opacity-40'
    return (
      <button disabled={answered} onClick={() => onAnswer(isAnswer, val)}
        className={`flex-1 py-6 rounded-2xl border-2 font-extrabold text-2xl transition-all ${cls}`}>
        {label}
      </button>
    )
  }
  return (
    <motion.div className="bg-white rounded-3xl shadow-lg p-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <p className="text-center text-xl font-extrabold text-gray-700 mb-2">
        Is this the <span style={{ color: card.targetColor }}>{card.targetWord}</span>?
      </p>
      <div className="bg-slate-50 rounded-2xl py-3"><VocabVisual term={card.shown} /></div>
      <div className="flex gap-3 mt-4">
        {btn('yes', '👍 Yes', '#16a34a')}
        {btn('no', '👎 No', '#ef4444')}
      </div>
      {answered && <Flash ok={picked === card.answer} />}
    </motion.div>
  )
}

// ── Done ─────────────────────────────────────────────────────────────────────
function Done({ correct, total, onExit, onReplay }) {
  const stars = Math.max(1, Math.round((correct / Math.max(1, total)) * 3))
  return (
    <div className="max-w-lg mx-auto">
      <motion.div className="bg-white rounded-3xl shadow-xl p-8 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="text-6xl mb-1">🎉</div>
        <h1 className="text-3xl font-extrabold text-gray-800">You learned the Stat Words!</h1>
        <div className="text-3xl my-3">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <p className="text-gray-500">You got <span className="font-extrabold text-gray-700">{correct}</span> of {total} right.</p>
        <div className="flex flex-wrap justify-center gap-2 my-5">
          {VOCAB.map((v) => (
            <span key={v.id} className="text-sm font-bold px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: v.color }}>
              {v.emoji} {v.word}
            </span>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onReplay} className="flex-1 bg-white text-gray-600 font-bold py-4 rounded-2xl shadow hover:shadow-md">Play again ↻</button>
          <button onClick={onExit} className="flex-1 text-white font-bold py-4 rounded-2xl hover:shadow-lg" style={{ backgroundColor: ACCENT }}>
            Go to Topic 1 →
          </button>
        </div>
      </motion.div>
    </div>
  )
}
