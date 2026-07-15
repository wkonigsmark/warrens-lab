import { useMemo, useState } from 'react'
import QuestionCard from './QuestionCard'
import { SKILL_IDS } from '../lib/statsEngine'
import { playCorrect, playWrong } from '../lib/sound'

// Low-stakes practice — a short fixed set across both skill types and a spread
// of tiers, with instant feedback and NO tracking. This is where a student
// warms up and reads explanations before the assessment counts.
const PLAN = [
  { tier: 2, skill: 'computation' },
  { tier: 2, skill: 'interpretation' },
  { tier: 3, skill: 'computation' },
  { tier: 3, skill: 'interpretation' },
  { tier: 4, skill: 'interpretation' },
]

export default function PracticeSet({ topic, onNext, onBack }) {
  const questions = useMemo(
    () => PLAN.map((p, i) => ({ ...topic.generate(p.tier, p.skill), _key: `prac-${i}` })),
    [topic]
  )
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [correctCount, setCorrect] = useState(0)
  const q = questions[i]
  const answered = picked !== null
  const last = i === questions.length - 1

  const pick = (idx) => {
    if (answered) return
    setPicked(idx)
    if (idx === q.correctIndex) { setCorrect((c) => c + 1); playCorrect() } else playWrong()
  }
  const next = () => {
    if (last) return onNext(correctCount, questions.length)
    setI((n) => n + 1); setPicked(null)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="text-xs text-gray-400 hover:text-gray-600 mb-3">← Worked examples</button>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">{topic.emoji} Practice · <span className="font-normal text-gray-400 text-base">not graded</span></h1>
        <span className="text-xs text-gray-400">{i + 1} / {questions.length}</span>
      </div>

      <QuestionCard q={q} phase={answered ? 'answered' : 'asking'} picked={picked} onPick={pick} accent={topic.accent} />

      {answered && (
        <button
          onClick={next}
          className="w-full mt-5 text-white font-bold py-4 rounded-xl text-lg hover:shadow-lg transition-shadow"
          style={{ backgroundColor: topic.accent }}
        >
          {last ? 'Done — go climb the tiers →' : 'Next practice question →'}
        </button>
      )}
    </div>
  )
}
