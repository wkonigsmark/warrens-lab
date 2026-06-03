import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FractionFigure from '../FractionFigure'
import { isCorrect } from '../../lib/fractionQuiz'

const COUNT = 5

// Drives one quiz level end-to-end: rolls fresh questions on mount, shows the
// figure + answer UI, gives instant feedback, tracks score, shows results.
// Levels differ only by their pure generate() (see fractionQuiz.js).
export default function QuizShell({ level, onBack }) {
  const [seed, setSeed] = useState(0)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('asking') // 'asking' | 'feedback' | 'done'
  const [answers, setAnswers] = useState([])
  const [value, setValue] = useState('')          // number levels
  const [frac, setFrac] = useState({ num: '', den: '' }) // fraction levels
  const [lastCorrect, setLastCorrect] = useState(false)

  const questions = useMemo(
    () => Array.from({ length: COUNT }, () => level.generate()),
    [level, seed],
  )
  const q = questions[index]
  const isLast = index === COUNT - 1
  const score = answers.filter((a) => a.correct).length

  const reset = () => {
    setIndex(0); setPhase('asking'); setAnswers([]); setValue(''); setFrac({ num: '', den: '' }); setSeed((s) => s + 1)
  }

  const submit = (guess) => {
    if (phase !== 'asking') return
    if (q.type === 'number' && (guess === '' || guess === null)) return
    if (q.type === 'fraction' && (guess.num === '' || guess.den === '')) return
    const correct = isCorrect(q, guess)
    setLastCorrect(correct)
    setAnswers((a) => [...a, { guess, correct }])
    setPhase('feedback')
  }

  const next = () => {
    if (isLast) { setPhase('done'); return }
    setIndex((i) => i + 1); setValue(''); setFrac({ num: '', den: '' }); setPhase('asking')
  }

  // Results screen ------------------------------------------------------
  if (phase === 'done') {
    const messages = ['Keep practicing! 💪', 'Nice start! 🙂', 'Good work! 👍', 'Great job! 🌟', 'Almost perfect! 🚀', 'Perfect score! 🏆']
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div className="bg-white rounded-2xl shadow-lg p-10 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h1>
          <div className="text-6xl font-extrabold my-4" style={{ color: level.accent }}>{score}/{COUNT}</div>
          <p className="text-lg text-gray-600 mb-8">{messages[score]}</p>

          <div className="space-y-2 mb-8 text-left">
            {questions.map((qq, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg border-2 ${answers[i]?.correct ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                <span className="font-semibold text-gray-700">{answers[i]?.correct ? '✓' : '✗'} Question {i + 1}</span>
                <span className="text-sm text-gray-600">
                  {!answers[i]?.correct && <span className="mr-2">you: {qq.formatGuess(answers[i]?.guess)}</span>}
                  <span className="font-bold text-gray-800">{qq.formatAnswer}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <button onClick={reset} className="w-full text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow" style={{ backgroundColor: level.accent }}>Try Again (new questions)</button>
            <button onClick={onBack} className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors">← Back to Levels</button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Question screen -----------------------------------------------------
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold text-gray-800">Level {level.id}: {level.title}</h1>
          <span className="text-white px-3 py-1.5 rounded-lg font-bold text-sm" style={{ backgroundColor: level.accent }}>
            {index + 1} / {COUNT}
          </span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-2">
          <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${((index + (phase === 'feedback' ? 1 : 0)) / COUNT) * 100}%`, backgroundColor: level.accent }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Figure */}
        <motion.div key={`fig-${index}`} className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center min-h-[300px]" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <FractionFigure fig={q.fig} />
        </motion.div>

        {/* Question + answer */}
        <motion.div key={`q-${index}`} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{q.promptTitle}</h2>
            {q.promptText && <p className="text-sm text-gray-400 mt-1">{q.promptText}</p>}
          </div>

          {q.type === 'choice' && (
            <div className={`grid gap-3 ${q.choices.length > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {q.choices.map((c) => {
                const isAns = c === q.answer
                const isGuess = answers[index]?.guess === c
                let style = 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                if (phase === 'feedback') {
                  if (isAns) style = 'bg-green-500 text-white'
                  else if (isGuess) style = 'bg-red-400 text-white'
                  else style = 'bg-gray-100 text-gray-400'
                }
                return (
                  <button key={c} disabled={phase === 'feedback'} onClick={() => submit(c)} className={`py-3 rounded-xl font-black text-xl transition-colors ${style}`}>{c}</button>
                )
              })}
            </div>
          )}

          {q.type === 'number' && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={value}
                disabled={phase === 'feedback'}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit(value)}
                placeholder="?"
                className="w-28 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl py-3 focus:outline-none focus:border-amber-400 disabled:bg-gray-50"
              />
              <span className="text-xl font-bold text-gray-400">{q.unit}</span>
              {phase === 'asking' && (
                <button onClick={() => submit(value)} className="ml-auto text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-shadow" style={{ backgroundColor: level.accent }}>Check</button>
              )}
            </div>
          )}

          {q.type === 'fraction' && (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <input
                  type="number" value={frac.num} disabled={phase === 'feedback'}
                  onChange={(e) => setFrac((f) => ({ ...f, num: e.target.value }))}
                  placeholder="?" aria-label="top number"
                  className="w-20 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl py-2 focus:outline-none focus:border-amber-400 disabled:bg-gray-50"
                />
                <div className="w-20 h-1 bg-gray-800 my-1.5 rounded" />
                <input
                  type="number" value={frac.den} disabled={phase === 'feedback'}
                  onChange={(e) => setFrac((f) => ({ ...f, den: e.target.value }))}
                  placeholder="?" aria-label="bottom number"
                  className="w-20 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl py-2 focus:outline-none focus:border-amber-400 disabled:bg-gray-50"
                />
              </div>
              {phase === 'asking' && (
                <button onClick={() => submit(frac)} className="ml-auto text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-shadow" style={{ backgroundColor: level.accent }}>Check</button>
              )}
            </div>
          )}

          {q.hint && phase === 'asking' && <HintBox text={q.hint} />}

          <AnimatePresence>
            {phase === 'feedback' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl p-4 ${lastCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
                <p className={`font-bold ${lastCorrect ? 'text-green-700' : 'text-red-600'}`}>{lastCorrect ? '✓ Correct!' : '✗ Not quite'}</p>
                {!lastCorrect && <p className="text-sm text-gray-600 mt-1">Answer: <span className="font-bold">{q.formatAnswer}</span></p>}
                <button onClick={next} className="mt-3 w-full text-white font-bold py-2.5 rounded-lg hover:shadow-lg transition-shadow" style={{ backgroundColor: level.accent }}>
                  {isLast ? 'See Results →' : 'Next Question →'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600 mt-auto self-start">← Back to Levels</button>
        </motion.div>
      </div>
    </div>
  )
}

// A peekable hint.
function HintBox({ text }) {
  const [open, setOpen] = useState(false)
  return open ? (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 text-amber-800 font-semibold text-center">{text}</div>
  ) : (
    <button onClick={() => setOpen(true)} className="self-start text-sm font-semibold text-amber-500 hover:text-amber-600">💡 Need a hint?</button>
  )
}
