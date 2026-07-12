import { useMemo, useState } from 'react'
import { TOPICS, TIER_DEFS } from '../lib/axesQuiz'
import { getSessions } from '../lib/sessions'
import { USERS } from '../lib/users'
import MiniGrid from './MiniGrid'

const Q_PER_PAGE = 8

function Blank({ w = '1.2in' }) {
  return (
    <span
      className="inline-block border-b-2 border-gray-700 mx-0.5"
      style={{ width: w, verticalAlign: 'bottom' }}
    />
  )
}

function AnswerArea({ q }) {
  switch (q.type) {
    case 'read-point':  return <span>( <Blank /> , <Blank /> )</span>
    case 'slope':       return <span>slope = <Blank /></span>
    case 'y-intercept': return <span>y = <Blank /></span>
    case 'midpoint':    return <span>midpoint = ( <Blank /> , <Blank /> )</span>
    default:            return <span>Answer: <Blank /></span>
  }
}

function answerText(q) {
  return q.choices?.[q.correctIndex] ?? '?'
}

function computeTopicInfos(passedIds) {
  return TOPICS.map(topic => {
    let tierIndex = TIER_DEFS.length - 1
    for (let ti = 0; ti < TIER_DEFS.length; ti++) {
      if (!passedIds.has(`${topic.id}-${TIER_DEFS[ti].id}`)) {
        tierIndex = ti
        break
      }
    }
    const allPassed = TIER_DEFS.every(t => passedIds.has(`${topic.id}-${t.id}`))
    return { topic, tierIndex, tierLabel: TIER_DEFS[tierIndex].label, allPassed, isGap: !allPassed }
  })
}

export default function AxesPrintPack({ userId, onClose }) {
  const user = USERS.find(u => u.id === userId)

  const initPassedIds = useMemo(
    () => new Set(getSessions(userId).filter(s => s.passed).map(s => s.levelId)),
    [userId]
  )

  const topicInfos = useMemo(() => computeTopicInfos(initPassedIds), [initPassedIds])

  const [checked, setChecked] = useState(() =>
    Object.fromEntries(
      TOPICS.map(t => {
        const allPassed = TIER_DEFS.every(tier => initPassedIds.has(`${t.id}-${tier.id}`))
        return [t.id, !allPassed]
      })
    )
  )

  const [showKey, setShowKey] = useState(false)
  const [seed, setSeed] = useState(0)

  const pages = useMemo(() =>
    topicInfos
      .filter(info => checked[info.topic.id])
      .map(info => ({
        info,
        problems: Array.from({ length: Q_PER_PAGE }, () => info.topic.generate(info.tierIndex)),
      }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  , [topicInfos, checked, seed])

  const toggle = (id) => setChecked(p => ({ ...p, [id]: !p[id] }))
  const allChecked = TOPICS.every(t => checked[t.id])
  const toggleAll = () => setChecked(Object.fromEntries(TOPICS.map(t => [t.id, !allChecked])))

  return (
    <div>
      {/* Config bar — hidden when printing */}
      <div className="no-print bg-white rounded-2xl shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{user?.emoji}</span>
            <div>
              <div className="font-bold text-gray-800 text-lg">{user?.name}'s Practice Pack</div>
              <div className="text-xs text-gray-400">
                Problems at each student's current tier · {Q_PER_PAGE} per topic
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-1.5 text-sm text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showKey}
                onChange={e => setShowKey(e.target.checked)}
                className="rounded"
              />
              Answer key
            </label>
            <button
              onClick={() => setSeed(s => s + 1)}
              className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 text-sm"
            >
              ↻ New Problems
            </button>
            <button
              onClick={() => window.print()}
              disabled={pages.length === 0}
              className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              🖨 Print
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Topic checklist */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={toggleAll}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-gray-200 hover:bg-gray-50 text-gray-500"
          >
            {allChecked ? 'Deselect All' : 'Select All'}
          </button>
          {topicInfos.map(info => (
            <label
              key={info.topic.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border-2 transition-all select-none"
              style={
                checked[info.topic.id]
                  ? { borderColor: info.topic.accent, backgroundColor: info.topic.accent, color: '#fff' }
                  : { borderColor: '#e5e7eb', color: '#6b7280', background: '#fff' }
              }
            >
              <input
                type="checkbox"
                checked={!!checked[info.topic.id]}
                onChange={() => toggle(info.topic.id)}
                className="sr-only"
              />
              {info.topic.emoji} {info.topic.title}
              <span className="opacity-70 font-normal ml-0.5">
                · {info.isGap ? info.tierLabel : '✓ Done'}
              </span>
            </label>
          ))}
        </div>

        {pages.length === 0 && (
          <p className="mt-3 text-sm text-amber-500 font-medium">
            Select at least one topic above to generate the worksheet.
          </p>
        )}
      </div>

      {/* Worksheet pages — printed */}
      {pages.map(({ info, problems }) => (
        <div key={info.topic.id} className="worksheet-page">
          {/* Page header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            borderBottom: '2px solid #1f2937', paddingBottom: '6px', marginBottom: '14px'
          }}>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 900, color: '#1f2937', letterSpacing: '-0.02em' }}>
                {info.topic.emoji} {info.topic.title}
              </div>
              <div style={{ fontSize: '10.5px', color: '#6b7280', marginTop: '1px' }}>
                Tier: <strong>{info.tierLabel}</strong> &nbsp;·&nbsp; {Q_PER_PAGE} problems
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#374151' }}>
                {user?.emoji} {user?.name}
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                Ants &amp; Axes · Coordinate Practice
              </div>
            </div>
          </div>

          {/* 4-column problem grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {problems.map((q, qi) => (
              <div
                key={qi}
                style={{
                  border: '1px solid #d1d5db', borderRadius: '8px',
                  padding: '8px 8px 10px', background: '#fafafa',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', marginBottom: '3px' }}>
                  {qi + 1}.
                </div>
                <MiniGrid
                  points={q.points.map(pt => ({ ...pt, color: '#374151' }))}
                  drawLine={q.drawLine}
                  highlightYAxis={q.type === 'y-intercept'}
                />
                <div style={{ fontSize: '9.5px', color: '#374151', marginTop: '5px', lineHeight: 1.4 }}>
                  {q.prompt}
                </div>
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#111827' }}>
                  <AnswerArea q={q} />
                </div>
              </div>
            ))}
          </div>

          {/* Answer key */}
          {showKey && (
            <div style={{
              marginTop: '18px', paddingTop: '8px',
              borderTop: '1px dashed #d1d5db',
            }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', marginBottom: '4px', letterSpacing: '0.05em' }}>
                ANSWER KEY
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px' }}>
                {problems.map((q, qi) => (
                  <span key={qi} style={{ fontSize: '10px', color: '#374151' }}>
                    {qi + 1}. {answerText(q)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
