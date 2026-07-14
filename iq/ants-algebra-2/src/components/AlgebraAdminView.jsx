import { useState, useMemo } from 'react'
import { TOPICS, TIER_DEFS, LEVELS, RUNGS } from '../lib/algebraQuiz'
import { getSessions, clearSessions } from '../lib/sessions'
import { TRACKED_USERS } from '../lib/users'

const PIN = '2019'

function fmt(ts) {
  const d = new Date(ts)
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function fmtDur(ms) {
  if (!ms) return '–'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export default function AlgebraAdminView() {
  const [pin, setPin] = useState('')
  const [unlocked, setUnlock] = useState(false)
  const [err, setErr] = useState(false)

  const handlePin = (e) => {
    e.preventDefault()
    if (pin === PIN) { setUnlock(true); setErr(false) }
    else { setErr(true); setPin('') }
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-80 text-center">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">Admin Access</h1>
          <p className="text-sm text-gray-400 mb-6">Ants & Algebra · Balance Lab</p>
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

  return <AdminDashboard />
}

function AdminDashboard() {
  const [view, setView] = useState('cockpit')
  const [activeUser, setActiveUser] = useState(TRACKED_USERS[0].id)
  const [sessions, setSessions] = useState(() => getSessions(TRACKED_USERS[0].id))
  const [confirmClear, setConfirmClear] = useState(false)

  const switchUser = (id) => {
    setActiveUser(id)
    setSessions(getSessions(id))
    setConfirmClear(false)
  }

  const clearUser = () => {
    clearSessions(activeUser)
    setSessions([])
    setConfirmClear(false)
  }

  const activeUserObj = TRACKED_USERS.find(u => u.id === activeUser)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-gray-800">⚖️ Ants & Algebra — Admin</h1>
          {view === 'student' && (
            <div className="text-right">
              {!confirmClear
                ? <button onClick={() => setConfirmClear(true)} className="text-xs text-gray-300 hover:text-red-400">
                    Clear {activeUserObj?.name}'s data
                  </button>
                : <div className="flex gap-2">
                    <button onClick={clearUser} className="text-xs text-red-500 font-bold hover:text-red-700">Yes, clear</button>
                    <button onClick={() => setConfirmClear(false)} className="text-xs text-gray-400">Cancel</button>
                  </div>
              }
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
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

        {view === 'cockpit' && <CockpitView />}
        {view === 'student' && (
          <StudentView sessions={sessions} activeUser={activeUser} onSwitchUser={switchUser} />
        )}
      </div>
    </div>
  )
}

// ── Cockpit: all students × all topics × all tiers ────────────────────────────

function CockpitView() {
  const allPassed = useMemo(() => {
    const map = {}
    for (const u of TRACKED_USERS) {
      map[u.id] = new Set(getSessions(u.id).filter(s => s.passed).map(s => s.levelId))
    }
    return map
  }, [])

  const totals = TRACKED_USERS.map(u => ({
    ...u,
    count: LEVELS.filter(l => allPassed[u.id].has(l.id)).length,
    sessions: getSessions(u.id).length,
  }))

  return (
    <div>
      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {totals.map(u => {
          const pct = Math.round((u.count / LEVELS.length) * 100)
          return (
            <div key={u.id} className="bg-white rounded-2xl shadow p-5 text-center">
              <div className="text-3xl mb-1">{u.emoji}</div>
              <div className="font-extrabold text-gray-800 text-lg">{u.name}</div>
              <div className="text-2xl font-extrabold mt-2" style={{ color: u.color }}>
                {u.count}<span className="text-gray-300 text-base font-normal"> / {LEVELS.length}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
                <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: u.color }} />
              </div>
              <div className="text-xs text-gray-400 mt-1">{pct}% · {u.sessions} runs</div>
            </div>
          )
        })}
      </div>

      {/* Mastery grid */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-700">Mastery Grid</h2>
          <p className="text-xs text-gray-400 mt-0.5">Rows = topics · columns = tiers · filled = summited</p>
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
              {TOPICS.map(topic => (
                <tr key={topic.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: topic.accent }} />
                      <span className="font-semibold text-gray-700 text-xs leading-tight">{topic.emoji} {topic.title}</span>
                    </div>
                  </td>
                  {TIER_DEFS.map(tier => {
                    const levelId = `${topic.id}-${tier.id}`
                    return (
                      <td key={tier.id} className="py-3 px-2">
                        <div className="flex flex-wrap justify-center gap-1">
                          {TRACKED_USERS.map(u => {
                            const passed = allPassed[u.id].has(levelId)
                            return (
                              <div
                                key={u.id}
                                title={`${u.name}: ${passed ? '✓ Summited' : '○ Not yet'}`}
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
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
          {TRACKED_USERS.map(u => (
            <div key={u.id} className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white font-bold" style={{ backgroundColor: u.color }}>
                {u.emoji}
              </div>
              {u.name}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-300">○</div>
            Not yet summited
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Student Detail: per-student breakdown ────────────────────────────────────

function StudentView({ sessions, activeUser, onSwitchUser }) {
  const byLevel = useMemo(() => {
    const map = {}
    for (const s of sessions) {
      const k = s.levelId
      if (!map[k]) map[k] = {
        levelId: k,
        title: s.levelTitle,
        tierLabel: s.tierLabel,
        attempts: [], rungs: [], misses: [], wobbles: [], passes: [],
      }
      map[k].attempts.push(s)
      map[k].rungs.push(s.rungs ?? 0)
      map[k].misses.push(s.misses ?? 0)
      map[k].wobbles.push(s.wobbles ?? 0)
      map[k].passes.push(s.passed)
    }
    return Object.values(map).sort((a, b) => String(a.levelId).localeCompare(String(b.levelId)))
  }, [sessions])

  const summitRate = sessions.length
    ? Math.round((sessions.filter(s => s.passed).length / sessions.length) * 100)
    : null

  const recent = [...sessions].reverse().slice(0, 100)

  return (
    <div>
      {/* User tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TRACKED_USERS.map(u => (
          <button
            key={u.id}
            onClick={() => onSwitchUser(u.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              u.id === activeUser ? 'text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100'
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

      {sessions.length === 0 && (
        <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-400">
          No runs yet — climb some anthills first!
        </div>
      )}

      {sessions.length > 0 && <>
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Runs" value={sessions.length} />
          <StatCard label="Levels Tried" value={byLevel.length} />
          <StatCard label="Summit Rate" value={summitRate != null ? `${summitRate}%` : '–'}
            color={summitRate >= 60 ? 'text-green-600' : 'text-amber-500'} />
          <StatCard label="Total Rungs" value={sessions.reduce((s, x) => s + (x.rungs ?? 0), 0)} />
        </div>

        {/* By level */}
        <div className="bg-white rounded-2xl shadow mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-700">By Level</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
              <tr>
                <th className="text-left px-6 py-3">Level</th>
                <th className="text-center px-4 py-3">Runs</th>
                <th className="text-center px-4 py-3">Best Climb</th>
                <th className="text-center px-4 py-3">Avg Misses</th>
                <th className="text-center px-4 py-3">Close Calls</th>
                <th className="text-center px-4 py-3">Summit Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {byLevel.map(lvl => {
                const best = Math.max(...lvl.rungs)
                const avgMiss = (lvl.misses.reduce((s, x) => s + x, 0) / lvl.misses.length).toFixed(1)
                const wobbleTotal = lvl.wobbles.reduce((s, x) => s + x, 0)
                const pass = Math.round((lvl.passes.filter(Boolean).length / lvl.passes.length) * 100)
                return (
                  <tr key={lvl.levelId} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-700">{lvl.title} · {lvl.tierLabel}</td>
                    <td className="text-center px-4 py-3 text-gray-500">{lvl.attempts.length}</td>
                    <td className="text-center px-4 py-3 font-bold text-gray-700">{best}/{RUNGS}</td>
                    <td className="text-center px-4 py-3 text-gray-500">{avgMiss}</td>
                    <td className={`text-center px-4 py-3 ${wobbleTotal > 0 ? 'text-amber-500 font-medium' : 'text-gray-300'}`}>
                      {wobbleTotal > 0 ? `⚠️ ${wobbleTotal}` : '–'}
                    </td>
                    <td className={`text-center px-4 py-3 font-bold ${pass >= 60 ? 'text-green-600' : pass >= 30 ? 'text-amber-500' : 'text-red-400'}`}>
                      {pass}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Run log */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-700">Run Log <span className="font-normal text-gray-400 text-sm">(most recent first)</span></h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
              <tr>
                <th className="text-left px-6 py-3">Date</th>
                <th className="text-left px-4 py-3">Level</th>
                <th className="text-center px-4 py-3">Climb</th>
                <th className="text-center px-4 py-3">Misses</th>
                <th className="text-center px-4 py-3">Close Calls</th>
                <th className="text-center px-4 py-3">Time</th>
                <th className="text-center px-4 py-3">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-400 whitespace-nowrap">{fmt(s.ts)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.levelTitle}
                    <span className="ml-1 text-xs text-gray-400">· {s.tierLabel}</span>
                  </td>
                  <td className="text-center px-4 py-3">
                    <div className="inline-flex items-center gap-1.5">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${s.passed ? 'bg-green-500' : 'bg-amber-400'}`}
                          style={{ width: `${((s.rungs ?? 0) / RUNGS) * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-gray-700 text-xs">{s.rungs ?? 0}/{RUNGS}</span>
                    </div>
                  </td>
                  <td className={`text-center px-4 py-3 ${(s.misses ?? 0) > 0 ? 'text-red-400 font-medium' : 'text-gray-300'}`}>
                    {s.misses ?? 0}
                  </td>
                  <td className={`text-center px-4 py-3 ${(s.wobbles ?? 0) > 0 ? 'text-amber-500' : 'text-gray-300'}`}>
                    {s.wobbles ?? 0}
                  </td>
                  <td className="text-center px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDur(s.ms)}</td>
                  <td className="text-center px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.passed ? 'bg-green-100 text-green-700' : 'bg-amber-50 text-amber-500'}`}>
                      {s.passed ? '👑 Summit' : '🍂 Slid'}
                    </span>
                  </td>
                </tr>
              ))}
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
