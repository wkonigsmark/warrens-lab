import { useState, useMemo } from 'react'
import { getSessions, clearSessions } from '../../lib/sessions'
import { USERS } from '../../lib/users'
import { ANGLE_TOPIC_DEFS, TIER_DEFS, LEVELS } from '../../lib/angleQuiz'
import AnglesPrintPack from './AnglesPrintPack'

const PIN = '2019'

function fmt(ts) {
  const d = new Date(ts)
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function avgMs(answers) {
  if (!answers?.length) return null
  return Math.round(answers.reduce((s, a) => s + a.ms, 0) / answers.length)
}

export default function AdminView() {
  const [pin, setPin]         = useState('')
  const [unlocked, setUnlock]   = useState(false)
  const [err, setErr]           = useState(false)
  const [activeUser, setActiveUser] = useState(USERS[0].id)
  const [sessions, setSessions] = useState(() => getSessions(USERS[0].id))

  const handlePin = (e) => {
    e.preventDefault()
    if (pin === PIN) { setUnlock(true); setErr(false) }
    else { setErr(true); setPin('') }
  }

  const switchUser = (id) => {
    setActiveUser(id)
    setSessions(getSessions(id))
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-80 text-center">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">Admin Access</h1>
          <p className="text-sm text-gray-400 mb-6">Ants & Angles · Progress Data</p>
          <form onSubmit={handlePin} className="flex flex-col gap-3">
            <input
              type="password"
              value={pin}
              onChange={e => { setPin(e.target.value); setErr(false) }}
              placeholder="Enter PIN"
              autoFocus
              className={`border-2 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest outline-none focus:border-indigo-400 ${err ? 'border-red-400' : 'border-gray-200'}`}
            />
            {err && <p className="text-red-500 text-sm">Incorrect PIN</p>}
            <button type="submit" className="bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700">
              Unlock
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <AdminDashboard
      sessions={sessions}
      activeUser={activeUser}
      onSwitchUser={switchUser}
      onClear={() => { clearSessions(activeUser); setSessions([]) }}
    />
  )
}

function AdminDashboard({ sessions, activeUser, onSwitchUser, onClear }) {
  const [view, setView] = useState('cockpit')
  const [printUser, setPrintUser] = useState(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="no-print flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-800">📐 Ants & Angles — Admin</h1>
        </div>
        {!printUser && (
          <div className="no-print flex gap-2 mb-8">
            {[
              { id: 'cockpit', label: '👨‍👩‍👧 Parent View' },
              { id: 'student', label: '📊 Student Detail' },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  view === v.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}
        {printUser
          ? <AnglesPrintPack userId={printUser} onClose={() => setPrintUser(null)} />
          : view === 'cockpit'
            ? <CockpitView onPrint={setPrintUser} />
            : <Dashboard sessions={sessions} activeUser={activeUser} onSwitchUser={onSwitchUser} onClear={onClear} />
        }
      </div>
    </div>
  )
}

function CockpitView({ onPrint }) {
  const allPassed = useMemo(() => {
    const map = {}
    for (const u of USERS) {
      map[u.id] = new Set(getSessions(u.id).filter(s => s.passed).map(s => s.levelId))
    }
    return map
  }, [])

  const TIERED_COUNT = ANGLE_TOPIC_DEFS.length * TIER_DEFS.length  // 28

  const totals = USERS.map(u => ({
    ...u,
    tieredPassed: ANGLE_TOPIC_DEFS.flatMap(t =>
      TIER_DEFS.map(tier => allPassed[u.id].has(`${t.id}-${tier.id}`))
    ).filter(Boolean).length,
  }))

  const bonusLevels = LEVELS.filter(l => !l.tiered)

  return (
    <div>
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {totals.map(u => {
          const pct = Math.round((u.tieredPassed / TIERED_COUNT) * 100)
          return (
            <div key={u.id} className="bg-white rounded-2xl shadow p-5 text-center">
              <div className="text-3xl mb-1">{u.emoji}</div>
              <div className="font-extrabold text-gray-800 text-lg">{u.name}</div>
              <div className="text-2xl font-extrabold mt-2" style={{ color: u.color }}>
                {u.tieredPassed}<span className="text-gray-300 text-base font-normal"> / {TIERED_COUNT}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
                <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: u.color }} />
              </div>
              <div className="text-xs text-gray-400 mt-1">{pct}% of core tiers</div>
              <button
                onClick={() => onPrint(u.id)}
                className="mt-3 w-full px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 text-gray-500 transition-colors"
              >
                🖨 Print Pack
              </button>
            </div>
          )
        })}
      </div>

      {/* Mastery grid — core topics */}
      <div className="bg-white rounded-2xl shadow mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-700">Core Topics — Mastery Grid</h2>
          <p className="text-xs text-gray-400 mt-0.5">Rows = topics · columns = tiers · filled = passed</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[580px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide w-44">Topic</th>
                {TIER_DEFS.map(tier => (
                  <th key={tier.id} className="text-center py-3 text-gray-400 font-semibold text-xs uppercase tracking-wide" style={{ width: '19%' }}>
                    {tier.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ANGLE_TOPIC_DEFS.map(topic => (
                <tr key={topic.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: topic.accent }} />
                      <span className="font-semibold text-gray-700 text-xs leading-tight">{topic.title}</span>
                    </div>
                  </td>
                  {TIER_DEFS.map(tier => {
                    const levelId = `${topic.id}-${tier.id}`
                    return (
                      <td key={tier.id} className="py-3 px-2">
                        <div className="flex justify-center gap-1.5">
                          {USERS.map(u => {
                            const passed = allPassed[u.id].has(levelId)
                            return (
                              <div
                                key={u.id}
                                title={`${u.name}: ${passed ? '✓ Passed' : '○ Not yet'}`}
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                  passed ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-300'
                                }`}
                                style={passed ? { backgroundColor: u.color } : {}}
                              >
                                {u.emoji}
                              </div>
                            )
                          })}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Legend */}
        <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-4">
          {USERS.map(u => (
            <div key={u.id} className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white font-bold" style={{ backgroundColor: u.color }}>
                {u.emoji}
              </div>
              {u.name}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-300">○</div>
            Not yet
          </div>
        </div>
      </div>

      {/* Bonus topics */}
      {bonusLevels.length > 0 && (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-700">Bonus Topics</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Level</th>
                {USERS.map(u => (
                  <th key={u.id} className="text-center px-4 py-3 text-gray-400 font-semibold text-xs uppercase">
                    {u.emoji} {u.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bonusLevels.map(lvl => (
                <tr key={lvl.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-6 rounded-full" style={{ backgroundColor: lvl.accent }} />
                      <span className="text-xs font-semibold text-gray-700">{lvl.title}</span>
                    </div>
                  </td>
                  {USERS.map(u => {
                    const passed = allPassed[u.id].has(lvl.id)
                    return (
                      <td key={u.id} className="text-center px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${passed ? 'bg-green-100 text-green-700' : 'text-gray-300'}`}>
                          {passed ? '✓' : '○'}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Dashboard({ sessions, activeUser, onSwitchUser, onClear }) {
  const [confirmClear, setConfirmClear] = useState(false)
  const activeUserObj = USERS.find(u => u.id === activeUser)

  const byLevel = useMemo(() => {
    const map = {}
    for (const s of sessions) {
      const key = s.levelId
      if (!map[key]) map[key] = { levelId: s.levelId, title: s.levelTitle, tierLabel: s.tierLabel ?? null, attempts: [], scores: [], times: [], passes: [], hintCounts: [] }
      map[key].attempts.push(s)
      map[key].scores.push(s.score)
      map[key].passes.push(s.passed)
      map[key].hintCounts.push(s.hintTotal ?? 0)
      // prefer pre-computed winsorized avg; fall back to raw answer times
      const t = s.avgMs ?? avgMs(s.answers)
      if (t) map[key].times.push(t)
    }
    return Object.values(map).sort((a, b) => String(a.levelId).localeCompare(String(b.levelId)))
  }, [sessions])

  const passRate = sessions.length
    ? Math.round((sessions.filter(s => s.passed).length / sessions.length) * 100)
    : null

  const recent = [...sessions].reverse().slice(0, 100)

  return (
    <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div />
          <div className="text-right">
            {!confirmClear
              ? <button onClick={() => setConfirmClear(true)} className="text-xs text-gray-300 hover:text-red-400">Clear {activeUserObj?.name}'s data</button>
              : <div className="flex gap-2">
                  <button onClick={() => { onClear(); setConfirmClear(false) }} className="text-xs text-red-500 font-bold hover:text-red-700">Yes, clear</button>
                  <button onClick={() => setConfirmClear(false)} className="text-xs text-gray-400">Cancel</button>
                </div>
            }
          </div>
        </div>

        {/* User tabs */}
        <div className="flex gap-2 mb-8">
          {USERS.map(u => (
            <button
              key={u.id}
              onClick={() => onSwitchUser(u.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                u.id === activeUser
                  ? 'text-white shadow-md'
                  : 'bg-white text-gray-500 hover:bg-gray-100'
              }`}
              style={u.id === activeUser ? { backgroundColor: u.color } : {}}
            >
              {u.emoji} {u.name}
              <span className={`text-xs font-normal ${u.id === activeUser ? 'text-white/70' : 'text-gray-400'}`}>
                {getSessions(u.id).length}
              </span>
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-400 -mt-4 mb-6">{sessions.length} sessions for {activeUserObj?.name}</p>

        {sessions.length === 0 && (
          <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-400">
            No sessions yet — play some quizzes first!
          </div>
        )}

        {sessions.length > 0 && <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Sessions" value={sessions.length} />
            <StatCard label="Levels Tried" value={byLevel.length} />
            <StatCard label="Pass Rate" value={passRate != null ? `${passRate}%` : '–'} color={passRate >= 70 ? 'text-green-600' : 'text-amber-500'} />
          </div>

          {/* Per-level breakdown */}
          <div className="bg-white rounded-2xl shadow mb-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-700">By Level</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                <tr>
                  <th className="text-left px-6 py-3">Level</th>
                  <th className="text-center px-4 py-3">Attempts</th>
                  <th className="text-center px-4 py-3">Avg Score</th>
                  <th className="text-center px-4 py-3">Pass Rate</th>
                  <th className="text-center px-4 py-3">Avg Time/Q</th>
                  <th className="text-center px-4 py-3">Hints/Session</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {byLevel.map(lvl => {
                  const count = lvl.attempts[0]?.count ?? 5
                  const avgScore = (lvl.scores.reduce((s, x) => s + x, 0) / lvl.scores.length).toFixed(1)
                  const pass = Math.round((lvl.passes.filter(Boolean).length / lvl.passes.length) * 100)
                  const avgTime = lvl.times.length
                    ? (lvl.times.reduce((s, t) => s + t, 0) / lvl.times.length / 1000).toFixed(1)
                    : '–'
                  const avgHints = lvl.hintCounts.length
                    ? (lvl.hintCounts.reduce((s, x) => s + x, 0) / lvl.hintCounts.length).toFixed(1)
                    : '–'
                  const displayTitle = lvl.tierLabel ? `${lvl.title} · ${lvl.tierLabel}` : lvl.title
                  return (
                    <tr key={lvl.levelId} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-700">{displayTitle}</td>
                      <td className="text-center px-4 py-3 text-gray-500">{lvl.attempts.length}</td>
                      <td className="text-center px-4 py-3 font-bold text-gray-700">{avgScore}/{count}</td>
                      <td className={`text-center px-4 py-3 font-bold ${pass >= 70 ? 'text-green-600' : pass >= 40 ? 'text-amber-500' : 'text-red-400'}`}>{pass}%</td>
                      <td className="text-center px-4 py-3 text-gray-500">{avgTime}s</td>
                      <td className={`text-center px-4 py-3 text-sm ${avgHints !== '–' && parseFloat(avgHints) > 0 ? 'text-amber-500 font-medium' : 'text-gray-300'}`}>
                        {avgHints !== '–' && parseFloat(avgHints) > 0 ? `💡 ${avgHints}` : '–'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Session log */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-700">Session Log <span className="font-normal text-gray-400 text-sm">(most recent first)</span></h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                <tr>
                  <th className="text-left px-6 py-3">Date</th>
                  <th className="text-left px-4 py-3">Level</th>
                  <th className="text-center px-4 py-3">Score</th>
                  <th className="text-center px-4 py-3">Avg Time/Q</th>
                  <th className="text-center px-4 py-3">Hints</th>
                  <th className="text-center px-4 py-3">Result</th>
                  <th className="text-left px-4 py-3 text-xs">Per Question</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map(s => {
                  // prefer stored winsorized avg; fall back to computing raw avg
                  const displayMs = s.avgMs ?? avgMs(s.answers)
                  const rawMs     = s.avgMsRaw ?? displayMs
                  const wasWinsorized = s.avgMsRaw && s.avgMs && s.avgMsRaw !== s.avgMs
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-400 whitespace-nowrap">{fmt(s.ts)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {s.levelTitle}{s.tierLabel ? <span className="ml-1 text-xs text-gray-400">· {s.tierLabel}</span> : null}
                      </td>
                      <td className="text-center px-4 py-3 font-bold text-gray-700">{s.score}/{s.count ?? 5}</td>
                      <td className="text-center px-4 py-3 text-gray-500 whitespace-nowrap">
                        {displayMs ? (displayMs / 1000).toFixed(1) + 's' : '–'}
                        {wasWinsorized && (
                          <span className="ml-1 text-amber-400" title={`Raw avg: ${(rawMs/1000).toFixed(1)}s — outlier times adjusted`}>⚡</span>
                        )}
                      </td>
                      <td className="text-center px-4 py-3">
                        {(s.hintTotal ?? 0) > 0 ? (
                          <span className="text-amber-500 text-xs font-medium" title={`${(s.hintTotalMs/1000).toFixed(0)}s total hint time`}>
                            💡 {s.hintTotal}×
                          </span>
                        ) : <span className="text-gray-200">–</span>}
                      </td>
                      <td className="text-center px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.passed ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-400'}`}>
                          {s.passed ? '✓ Pass' : '✗ Miss'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {s.answers?.map((a, i) => {
                            const hinted    = (a.hintCount || 0) > 0
                            const winsorized = a.msW && a.ms && a.msW !== a.ms
                            const title = [
                              `Q${i+1}: ${(a.ms/1000).toFixed(1)}s`,
                              winsorized ? `adjusted→${(a.msW/1000).toFixed(1)}s` : null,
                              hinted ? `💡 hint ${(a.hintMs/1000).toFixed(1)}s` : null,
                            ].filter(Boolean).join(' · ')
                            return (
                              <span key={i} title={title}
                                className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold relative
                                  ${a.correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-400'}`}>
                                {i + 1}
                                {hinted && <span className="absolute -top-1 -right-1 text-[8px] text-amber-400">💡</span>}
                              </span>
                            )
                          })}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>}
    </div>
  )
}

function StatCard({ label, value, color = 'text-gray-800' }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 text-center">
      <div className={`text-3xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
    </div>
  )
}
