import { useState, useMemo } from 'react'
import PercentGrid from '../PercentGrid'
import { buildProblems } from '../../lib/percentWorksheet'

// A printed answer line.
function Blank({ width = '1in' }) {
  return <span className="inline-block border-b-2 border-gray-800 align-baseline" style={{ width, height: '0.28in', minWidth: width }} />
}

export default function Worksheet({ topic, mode, onBack }) {
  const [seed, setSeed] = useState(0)
  const [showKey, setShowKey] = useState(false)
  const count = topic.count || 6
  const problems = useMemo(() => buildProblems(topic, count), [topic, seed, count])

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-indigo-100 print:bg-white -mx-4 -my-6">
      {/* Toolbar (hidden when printing) */}
      <div className="no-print bg-white shadow p-4 flex justify-between items-center sticky top-0 z-10">
        <button onClick={onBack} className="bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded hover:bg-gray-300">← Back</button>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showKey} onChange={(e) => setShowKey(e.target.checked)} className="w-4 h-4 accent-cyan-500" />
            Answer key
          </label>
          <button onClick={() => setSeed((s) => s + 1)} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-4 py-2 rounded hover:shadow-lg">↻ New Sheet</button>
          <button onClick={() => window.print()} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-4 py-2 rounded hover:shadow-lg">🖨 Print</button>
        </div>
      </div>

      {/* Printable page */}
      <div className="flex justify-center p-6 print:p-0">
        <div className="worksheet-page bg-white shadow-lg p-8 print:shadow-none" style={{ width: '8.5in', maxWidth: '100%', minHeight: '11in' }}>
          {/* Header */}
          <div className="border-b-2 border-gray-800 pb-2 mb-4 flex items-end justify-between gap-4">
            <div className="flex items-end gap-3 flex-shrink-0">
              <div className="text-3xl font-black tracking-tight whitespace-nowrap">0 <span className="text-gray-400">→</span> 1</div>
              <div>
                <p className="text-base font-bold whitespace-nowrap">{topic.title}</p>
                <p className="text-sm text-gray-600">{topic.instructions}</p>
              </div>
            </div>
            <div className="text-sm flex flex-col gap-2 items-end flex-shrink-0 whitespace-nowrap">
              <span>Name: <Blank width="6em" /></span>
              <span>Score: <Blank width="2em" /> / {count}</span>
            </div>
          </div>

          {/* Rules reminder (helper mode) */}
          {mode === 'helper' && (
            <div className="border-2 border-gray-800 rounded p-2 text-sm bg-gray-50 print:bg-white mb-4">
              <span className="font-bold mr-2">Remember:</span>{topic.rules}
            </div>
          )}

          {/* Problems */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {problems.map((q, idx) => (
              <Problem key={idx} q={q} idx={idx} />
            ))}
          </div>

          {/* Answer key (optional) */}
          {showKey && (
            <div className="mt-5 border-t-2 border-gray-300 pt-2 text-sm">
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

function Problem({ q, idx }) {
  const n = <span className="font-bold text-gray-500 flex-shrink-0" style={{ fontSize: '13pt' }}>{idx + 1}.</span>

  if (q.layout === 'text') {
    return (
      <div className="worksheet-problem flex items-baseline gap-2 border-b border-gray-200 pb-3">
        {n}
        <span className="font-bold" style={{ fontSize: '15pt' }}>{q.prompt}</span>
        <Blank width="1in" />
      </div>
    )
  }

  if (q.layout === 'compare') {
    return (
      <div className="worksheet-problem border border-gray-400 rounded p-3">
        <div className="flex items-baseline gap-2 mb-2">
          {n}
          <span className="font-bold" style={{ fontSize: '13pt' }}>Write &gt;, &lt;, or =</span>
        </div>
        <div className="flex items-center justify-center gap-4">
          <PercentGrid value={q.a} size={90} bw />
          <span className="font-black text-gray-300" style={{ fontSize: '22pt' }}>?</span>
          <PercentGrid value={q.b} size={90} bw />
        </div>
        <p className="text-center mt-2 font-bold" style={{ fontSize: '14pt' }}>{q.a}% <Blank width="0.5in" /> {q.b}%</p>
      </div>
    )
  }

  if (q.layout === 'shade') {
    return (
      <div className="worksheet-problem flex items-center gap-4 border border-gray-400 rounded p-3">
        {n}
        <div className="flex-shrink-0"><PercentGrid value={0} size={120} bw /></div>
        <div>
          <p className="text-gray-700" style={{ fontSize: '12pt' }}>Color this much:</p>
          <p className="font-black" style={{ fontSize: '24pt' }}>{q.target}</p>
        </div>
      </div>
    )
  }

  // figcard (name the percent)
  return (
    <div className="worksheet-problem flex items-center gap-3 border border-gray-400 rounded p-3">
      {n}
      <div className="flex-shrink-0"><PercentGrid value={q.fig.value} size={120} bw /></div>
      <div className="min-w-0">
        <p className="text-gray-800" style={{ fontSize: '12pt' }}>{q.prompt}</p>
        <p className="mt-3" style={{ fontSize: '13pt' }}>Answer: <Blank width="1in" /></p>
      </div>
    </div>
  )
}
