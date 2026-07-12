import { useMemo, useState } from 'react'
import { ANGLE_TOPIC_DEFS, TIER_DEFS } from '../../lib/angleQuiz'
import { generateWhole } from '../../lib/wholeNumbers'
import { getSessions } from '../../lib/sessions'
import { USERS } from '../../lib/users'
import QuestionFigure from '../QuestionFigure'

const Q_PER_PAGE = 6

function Blank({ width = '1.1in' }) {
  return (
    <span
      className="inline-block border-b-2 border-gray-800 align-baseline"
      style={{ width, height: '0.3in', minWidth: width }}
    />
  )
}

function computeTopicInfos(passedIds) {
  return ANGLE_TOPIC_DEFS.map(topic => {
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

export default function AnglesPrintPack({ userId, onClose }) {
  const user = USERS.find(u => u.id === userId)

  const initPassedIds = useMemo(
    () => new Set(getSessions(userId).filter(s => s.passed).map(s => s.levelId)),
    [userId]
  )

  const topicInfos = useMemo(() => computeTopicInfos(initPassedIds), [initPassedIds])

  const [checked, setChecked] = useState(() =>
    Object.fromEntries(
      ANGLE_TOPIC_DEFS.map(t => {
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
        problems: Array.from({ length: Q_PER_PAGE }, () =>
          generateWhole(info.topic.generates[info.tierIndex])
        ),
      }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  , [topicInfos, checked, seed])

  const toggle = (id) => setChecked(p => ({ ...p, [id]: !p[id] }))
  const allChecked = ANGLE_TOPIC_DEFS.every(t => checked[t.id])
  const toggleAll = () =>
    setChecked(Object.fromEntries(ANGLE_TOPIC_DEFS.map(t => [t.id, !allChecked])))

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
              {info.topic.title}
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
        <div key={info.topic.id} className="worksheet-page bg-white shadow-lg print:shadow-none" style={{ padding: '28px 32px' }}>
          {/* Page header */}
          <div className="border-b-2 border-gray-800 pb-2 mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="text-lg font-black text-gray-800">{info.topic.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Tier: <strong>{info.tierLabel}</strong> &nbsp;·&nbsp; {Q_PER_PAGE} problems
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-700">{user?.emoji} {user?.name}</div>
              <div className="text-xs text-gray-400">Ants &amp; Angles · Geometry Practice</div>
            </div>
          </div>

          {/* 2-column problem grid */}
          <div className="grid grid-cols-2 gap-4">
            {problems.map((q, qi) => (
              <div
                key={qi}
                className="worksheet-problem border border-gray-400 rounded p-2 flex gap-2 items-center"
              >
                <div className="flex-1 min-w-0 max-w-[2.4in]">
                  <QuestionFigure q={q} bw />
                </div>
                <div className="flex-shrink-0" style={{ width: '46%' }}>
                  <p className="font-bold" style={{ fontSize: '15pt' }}>#{qi + 1}</p>
                  <p className="text-gray-800 my-1.5" style={{ fontSize: '10pt' }}>{q.promptTitle}</p>
                  {q.type === 'choice' ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {q.choices.map((c) => (
                        <span key={c} className="border border-gray-500 rounded-full px-2 py-0.5 font-semibold" style={{ fontSize: '9.5pt' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '12pt' }}>
                      Answer: <Blank width="1.1in" />
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Answer key */}
          {showKey && (
            <div className="mt-3 border-t-2 border-gray-300 pt-2 text-sm">
              <span className="font-bold mr-2">Answer Key:</span>
              {problems.map((q, qi) => (
                <span key={qi} className="mr-4">{qi + 1}) {q.formatAnswer}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
