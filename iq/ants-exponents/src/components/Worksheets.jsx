import { useState, useMemo } from 'react'
import { TOPICS, DIFFICULTIES, buildProblems } from '../lib/worksheets'

// 🖨 Worksheets — printable practice pages, branded with the b&w text logo so a
// printed sheet still says "Ants & Exponents." Same shape as the Ants & Angles
// worksheet: pick a topic, then a clean printable page with a toolbar (New
// Sheet / Answer key / Print) that disappears when you actually print.

const COUNT = 12

export default function Worksheets() {
  const [topic, setTopic] = useState(null)
  if (topic) return <Sheet topic={topic} onBack={() => setTopic(null)} />
  return <Picker onPick={setTopic} />
}

function Picker({ onPick }) {
  return (
    <div className="max-w-3xl mx-auto mt-4">
      <p className="text-center text-gray-500 mb-6 text-lg">
        Pick a worksheet. Each one prints onto a single page — hit <strong>↻ New Sheet</strong> for
        fresh problems any time.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t)}
            className="text-left bg-white rounded-2xl shadow p-5 hover:shadow-lg hover:-translate-y-0.5 transition border-2 border-transparent hover:border-indigo-300"
          >
            <p className="text-lg font-black text-indigo-700">{t.title}</p>
            <p className="text-sm text-gray-500 mt-1">{t.instructions}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

// A printed answer line.
function Blank({ width = '1in' }) {
  return (
    <span
      className="inline-block border-b-2 border-gray-800 align-baseline"
      style={{ width, height: '0.3in', minWidth: width }}
    />
  )
}

function Sheet({ topic, onBack }) {
  const [seed, setSeed] = useState(0)
  const [showKey, setShowKey] = useState(false)
  const [diff, setDiff] = useState('standard')
  const problems = useMemo(() => buildProblems(topic, COUNT, diff), [topic, seed, diff])

  return (
    <div className="-mx-4 -mt-2">
      {/* Toolbar (hidden when printing) */}
      <div className="no-print bg-white shadow p-4 flex justify-between items-center sticky top-0 z-10">
        <button onClick={onBack} className="bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded hover:bg-gray-300">
          ← Back
        </button>

        {/* difficulty segmented control */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              onClick={() => setDiff(d.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-bold transition ${
                diff === d.id ? 'bg-white text-indigo-700 shadow' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showKey}
              onChange={(e) => setShowKey(e.target.checked)}
              className="w-4 h-4 accent-indigo-500"
            />
            Answer key
          </label>
          <button
            onClick={() => setSeed((s) => s + 1)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-4 py-2 rounded hover:shadow-lg"
          >
            ↻ New Sheet
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold px-4 py-2 rounded hover:shadow-lg"
          >
            🖨 Print
          </button>
        </div>
      </div>

      {/* Printable page */}
      <div className="flex justify-center p-6 print:p-0">
        <div
          className="worksheet-page bg-white shadow-lg p-8 print:shadow-none"
          style={{ width: '8.5in', maxWidth: '100%', minHeight: '11in' }}
        >
          {/* Header — branded with the b&w text logo */}
          <div className="border-b-2 border-gray-800 pb-2 mb-4 flex items-end justify-between gap-4">
            <div className="flex items-end gap-3 flex-shrink-0">
              <img src="/text_banner_ants_exponents.png" alt="Ants & Exponents" className="h-16 w-auto object-contain" />
              <div>
                <p className="text-base font-bold whitespace-nowrap">{topic.title}</p>
                <p className="text-sm text-gray-600">{topic.instructions}</p>
              </div>
            </div>
            <div className="text-sm flex flex-col gap-1 items-end flex-shrink-0 whitespace-nowrap">
              <span>Name: <Blank width="6em" /></span>
              <span>Date: <Blank width="4em" /></span>
              <span>Score: <Blank width="2em" /> / {COUNT}</span>
            </div>
          </div>

          {/* Problem grid */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-5">
            {problems.map((q, idx) => (
              <div
                key={idx}
                className="worksheet-problem flex items-baseline gap-3 border-b border-gray-200 pb-3 min-w-0"
              >
                <span className="font-bold text-gray-400 flex-shrink-0" style={{ fontSize: '12pt' }}>
                  {idx + 1}.
                </span>
                <span className="flex items-baseline gap-2 font-bold whitespace-nowrap" style={{ fontSize: '18pt' }}>
                  <span>{q.display}</span>
                  <span>=</span>
                  <Blank width={topic.blank} />
                </span>
              </div>
            ))}
          </div>

          {/* Answer key (optional) */}
          {showKey && (
            <div className="mt-5 border-t-2 border-gray-300 pt-2 text-sm">
              <span className="font-bold mr-2">Answer Key:</span>
              {problems.map((q, idx) => (
                <span key={idx} className="mr-4 inline-block">
                  {idx + 1}) {q.answer}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
