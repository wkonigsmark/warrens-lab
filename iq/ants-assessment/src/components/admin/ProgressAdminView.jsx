import { useEffect, useMemo, useState } from 'react'
import { isConfigured, selectSessions, describeSession } from '../../../../_shared/progress/index.js'
import { TRACKED_USERS, getStudent } from '../../lib/roster'

const fmtWhen = (iso) => {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

// Cross-tool progress console — reads the shared iq-progress Supabase
// project directly and labels rows via the tool catalog + local roster.
// No per-tool knowledge here beyond what both of those already expose.
export default function ProgressAdminView() {
  const [rows, setRows] = useState(null) // null = loading
  const [error, setError] = useState(null)
  const [studentFilter, setStudentFilter] = useState('all')

  const load = () => {
    setError(null)
    setRows(null)
    selectSessions('order=ts.desc&limit=500')
      .then(setRows)
      .catch((e) => setError(e.message))
  }

  useEffect(() => { if (isConfigured()) load() }, [])

  const described = useMemo(() => (rows ?? []).map(describeSession), [rows])

  const byStudent = useMemo(() => {
    const map = new Map()
    for (const s of described) {
      if (!map.has(s.studentId)) map.set(s.studentId, [])
      map.get(s.studentId).push(s)
    }
    return map
  }, [described])

  const perToolTotals = useMemo(() => {
    const totals = new Map() // studentId -> toolId -> { count, sum, max }
    for (const s of described) {
      if (!totals.has(s.studentId)) totals.set(s.studentId, new Map())
      const tools = totals.get(s.studentId)
      if (!tools.has(s.tool.name)) tools.set(s.tool.name, { emoji: s.tool.emoji, color: s.tool.color, count: 0, passRateSum: 0, last: s.ts })
      const t = tools.get(s.tool.name)
      t.count += 1
      if (s.total) t.passRateSum += s.score / s.total
      if (new Date(s.ts) > new Date(t.last)) t.last = s.ts
    }
    return totals
  }, [described])

  const studentsWithData = TRACKED_USERS.filter((u) => byStudent.has(u.id))
  const visibleRows = studentFilter === 'all' ? described : described.filter((s) => s.studentId === studentFilter)

  if (!isConfigured()) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">📊 Progress Console</h1>
        <p className="text-gray-500">
          The shared progress module isn't configured yet — fill in{' '}
          <code className="bg-gray-100 px-1 rounded">_shared/progress/config.js</code> with the
          iq-progress Supabase URL and publishable key.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📊 Progress Console</h1>
        <button onClick={load} className="text-sm font-semibold text-indigo-600 hover:underline">↻ Refresh</button>
      </div>

      {error && <p className="text-red-500 mb-4">Couldn't load sessions: {error}</p>}
      {rows === null && !error && <p className="text-gray-400">Loading…</p>}

      {rows !== null && (
        <>
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setStudentFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                studentFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 shadow'
              }`}
            >
              All students
            </button>
            {studentsWithData.map((u) => (
              <button
                key={u.id}
                onClick={() => setStudentFilter(u.id)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  studentFilter === u.id ? 'text-white shadow' : 'bg-white text-gray-500 shadow'
                }`}
                style={studentFilter === u.id ? { backgroundColor: u.color } : undefined}
              >
                {u.emoji} {u.name}
              </button>
            ))}
          </div>

          {described.length === 0 && (
            <p className="text-gray-400">No sessions synced yet. Play a quiz round in a wired tool and it'll show up here.</p>
          )}

          {studentsWithData
            .filter((u) => studentFilter === 'all' || studentFilter === u.id)
            .map((u) => (
              <div key={u.id} className="bg-white rounded-2xl shadow p-5 mb-6">
                <h2 className="font-bold text-lg text-gray-800 mb-3">{u.emoji} {u.name}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {[...perToolTotals.get(u.id).entries()].map(([toolName, t]) => (
                    <div key={toolName} className="rounded-xl p-3" style={{ backgroundColor: `${t.color}15` }}>
                      <div className="text-sm font-bold" style={{ color: t.color }}>{t.emoji} {toolName}</div>
                      <div className="text-xs text-gray-500">
                        {t.count} session{t.count === 1 ? '' : 's'} · avg {Math.round((t.passRateSum / t.count) * 100)}%
                      </div>
                      <div className="text-xs text-gray-400">last {fmtWhen(t.last)}</div>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b">
                        <th className="py-1 pr-3">Tool</th>
                        <th className="py-1 pr-3">Level</th>
                        <th className="py-1 pr-3">Score</th>
                        <th className="py-1 pr-3">When</th>
                        <th className="py-1">Synced</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byStudent.get(u.id).map((s, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-1.5 pr-3 whitespace-nowrap">{s.tool.emoji} {s.tool.name}</td>
                          <td className="py-1.5 pr-3">
                            {s.levelTitle}
                            {s.tierLabel && <span className="text-gray-400"> · {s.tierLabel}</span>}
                          </td>
                          <td className="py-1.5 pr-3 whitespace-nowrap">
                            {s.total ? `${s.score}/${s.total}` : s.score}
                          </td>
                          <td className="py-1.5 pr-3 whitespace-nowrap text-gray-400">{fmtWhen(s.ts)}</td>
                          <td className="py-1.5">{s.verified ? '✅' : '⏳ offline'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  )
}
