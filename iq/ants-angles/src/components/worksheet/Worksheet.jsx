import { useState, useMemo } from 'react'
import QuestionFigure from '../QuestionFigure'
import { buildProblems } from '../../lib/angleWorksheet'

// A printed answer line.
function Blank({ width = '1in' }) {
  return <span className="inline-block border-b-2 border-gray-800 align-baseline" style={{ width, height: '0.3in', minWidth: width }} />
}

export default function Worksheet({ topic, mode, onBack, wholeOnly = false }) {
  const [seed, setSeed] = useState(0)
  const [showKey, setShowKey] = useState(false)
  const isArithmetic = topic.kind === 'arithmetic'
  const isChoice     = topic.kind === 'choice'
  const cols = topic.cols || 4
  const figureMaxWidth = cols === 3 ? '2.6in' : cols === 2 ? '3.4in' : '1.5in'
  const count = topic.count || 6
  const problems = useMemo(() => buildProblems(topic, count, wholeOnly), [topic, seed, count, wholeOnly])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-indigo-100 print:bg-white">
      {/* Toolbar (hidden when printing) */}
      <div className="no-print bg-white shadow p-4 flex justify-between items-center sticky top-0 z-10">
        <button onClick={onBack} className="bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded hover:bg-gray-300">← Back</button>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showKey} onChange={(e) => setShowKey(e.target.checked)} className="w-4 h-4 accent-indigo-500" />
            Answer key
          </label>
          <button onClick={() => setSeed((s) => s + 1)} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-4 py-2 rounded hover:shadow-lg">↻ New Sheet</button>
          <button onClick={() => window.print()} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-4 py-2 rounded hover:shadow-lg">🖨 Print</button>
        </div>
      </div>

      {/* Printable page */}
      <div className="flex justify-center p-6 print:p-0">
        <div className="worksheet-page bg-white shadow-lg p-8 print:shadow-none" style={{ width: '11in', maxWidth: '100%', minHeight: '8.5in' }}>
          {/* Header */}
          <div className="border-b-2 border-gray-800 pb-2 mb-3 flex items-end justify-between gap-4">
            <div className="flex items-end gap-3 flex-shrink-0">
              <img src="/text_banner_ants_angles.png" alt="Ants & Angles" className="h-14 w-auto object-contain" />
              <div>
                <p className="text-base font-bold whitespace-nowrap">{topic.title}</p>
                <p className="text-sm text-gray-600">{topic.instructions}</p>
              </div>
            </div>
            <div className="text-sm flex gap-4 items-center flex-shrink-0 whitespace-nowrap">
              <span>Name: <Blank width="6em" /></span>
              <span>Date: <Blank width="4em" /></span>
              <span>Score: <Blank width="2em" /> / {count}</span>
            </div>
          </div>

          {/* Rules reminder (mentor mode) */}
          {mode === 'mentor' && (
            <div className="border-2 border-gray-800 rounded p-2 text-sm bg-gray-50 print:bg-white mb-3">
              <span className="font-bold mr-2">Remember:</span>{topic.rules}
            </div>
          )}

          {/* Problem grid — dense equations for arithmetic, figure cards otherwise */}
          {isArithmetic ? (
            <div className="grid grid-cols-2 gap-x-16 gap-y-4">
              {problems.map((q, idx) => (
                <div key={idx} className="worksheet-problem flex items-baseline gap-3 border-b border-gray-200 pb-2 min-w-0">
                  <span className="font-bold text-gray-400 flex-shrink-0" style={{ fontSize: '12pt' }}>{idx + 1}.</span>
                  <span className="flex items-baseline gap-2 font-bold whitespace-nowrap" style={{ fontSize: '18pt' }}>
                    {q.tokens.map((tok, i) =>
                      tok === null
                        ? <Blank key={i} width="0.9in" />
                        : <span key={i}>{tok}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : isChoice ? (
            /* Rapid-fire multiple choice: dense grid, circle a word. Column count
               is topic-tunable — Name the Angle is pure shape ID (4 tight cols is
               fine), but Read the Angle needs a bigger figure so the protractor
               scale stays legible on paper (fewer, larger cols). */
            <div className={`grid gap-2 ${cols === 3 ? 'grid-cols-3' : cols === 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
              {problems.map((q, idx) => (
                <div key={idx} className="worksheet-problem border border-gray-400 rounded p-1.5 flex flex-col items-center">
                  <p className="font-bold self-start leading-none" style={{ fontSize: cols >= 3 ? '13pt' : '11pt' }}>#{idx + 1}</p>
                  <div className="w-full" style={{ maxWidth: figureMaxWidth }}>
                    <QuestionFigure q={q} bw />
                  </div>
                  <div className="flex flex-wrap justify-center gap-1 mt-1">
                    {q.choices.map((c) => (
                      <span key={c} className="border border-gray-500 rounded-full px-1.5 font-semibold leading-snug" style={{ fontSize: cols >= 3 ? '10pt' : '8pt' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {problems.map((q, idx) => (
                <div key={idx} className="worksheet-problem border border-gray-400 rounded p-2 flex gap-2 items-center">
                  <div className="flex-1 min-w-0 max-w-[2.4in]">
                    <QuestionFigure q={q} bw />
                  </div>
                  <div className="flex-shrink-0" style={{ width: '46%' }}>
                    <p className="font-bold" style={{ fontSize: '16pt' }}>#{idx + 1}</p>
                    <p className="text-gray-800 my-2" style={{ fontSize: '11pt' }}>{q.promptTitle}</p>
                    {q.type === 'choice' ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {q.choices.map((c) => (
                          <span key={c} className="border border-gray-500 rounded-full px-3 py-1 font-semibold" style={{ fontSize: '12pt' }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '13pt' }}>Answer: <Blank width="1.1in" /></p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Answer key (optional) */}
          {showKey && (
            <div className="mt-3 border-t-2 border-gray-300 pt-2 text-sm">
              <span className="font-bold mr-2">Answer Key:</span>
              {problems.map((q, idx) => (
                <span key={idx} className="mr-4">{idx + 1}) {q.formatAnswer}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
