import { useState, useMemo } from 'react'
import { getSessions, clearSessions } from '../../lib/sessions'
import { USERS } from '../../lib/users'

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
    <Dashboard
      sessions={sessions}
      activeUser={activeUser}
      onSwitchUser={switchUser}
      onClear={() => { clearSessions(activeUser); setSessions([]) }}
    />
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-800">📐 Ants & Angles — Progress</h1>
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
