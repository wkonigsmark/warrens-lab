import { useState, useMemo } from 'react'
import { TOPICS, CHECKPOINTS } from '../lib/topics/index'
import { TIER_DEFS, TIER_MAX, SKILLS, SKILL_IDS, skillLabel } from '../lib/statsEngine'
import { getSessions, clearSessions } from '../lib/sessions'
import { TRACKED_USERS } from '../lib/users'

const PIN = '2019'
const fmt = (ts) => new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

const passedTiers = (sessions, topicId) =>
  new Set(sessions.filter((s) => s.passed && s.topicId === topicId && s.tier >= 1).map((s) => s.tier))

// Aggregate accuracy for one skill on one topic across ALL of a student's runs.
function skillAgg(sessions, topicId, skillId) {
  let correct = 0, total = 0
  for (const s of sessions) {
    if (s.topicId !== topicId || !s.skills?.[skillId]) continue
    correct += s.skills[skillId].correct || 0
    total += s.skills[skillId].total || 0
  }
  if (!total) return null
  const acc = correct / total
  return { correct, total, acc, label: skillLabel(acc, total) }
}
const labelRank = (acc) => (acc >= 0.8 ? 3 : acc >= 0.55 ? 2 : 1)

export default function StatsAdminView() {
  const [pin, setPin] = useState('')
  const [unlocked, setUnlock] = useState(false)
  const [err, setErr] = useState(false)

  const handlePin = (e) => {
    e.preventDefault()
    if (pin === PIN) { setUnlock(true); setErr(false) } else { setErr(true); setPin('') }
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-80 text-center">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">Admin Access</h1>
          <p className="text-sm text-gray-400 mb-6">Ants &amp; Statistics</p>
          <form onSubmit={handlePin} className="flex flex-col gap-3">
            <input type="password" value={pin} autoFocus
              onChange={(e) => { setPin(e.target.value); setErr(false) }} placeholder="Enter PIN"
              className={`border-2 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest outline-none focus:border-indigo-400 ${err ? 'border-red-400' : 'border-gray-200'}`} />
            {err && <p className="text-red-500 text-sm">Incorrect PIN</p>}
            <button type="submit" className="bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700">Unlock</button>
          </form>
        </div>
      </div>
    )
  }
  return <Dashboard />
}

function Dashboard() {
  const [view, setView] = useState('cockpit')
  const [activeUser, setActiveUser] = useState(TRACKED_USERS[0]?.id)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-6">📊 Ants &amp; Statistics — Admin</h1>
        <div className="flex flex-wrap gap-2 mb-8">
          {[{ id: 'cockpit', label: '👨‍👩‍👧 Class View' }, { id: 'student', label: '🧭 Skill Diagnostic' }].map((v) => (
            <button key={v.id} onClick={() => setView(v.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${view === v.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm'}`}>
              {v.label}
            </button>
          ))}
        </div>
        {view === 'cockpit' && <Cockpit />}
        {view === 'student' && <StudentDiagnostic activeUser={activeUser} onSwitch={setActiveUser} />}
      </div>
    </div>
  )
}

// ── Class View — tiers cleared, topics × tiers grid ──────────────────────────
function Cockpit() {
  const data = useMemo(() => {
    const m = {}
    for (const u of TRACKED_USERS) m[u.id] = getSessions(u.id)
    return m
  }, [])
  const totalTiers = TOPICS.length * TIER_MAX

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {TRACKED_USERS.map((u) => {
          const cleared = TOPICS.reduce((sum, t) => sum + passedTiers(data[u.id], t.id).size, 0)
          const pct = Math.round((cleared / totalTiers) * 100)
          return (
            <div key={u.id} className="bg-white rounded-2xl shadow p-5 text-center">
              <div className="text-3xl mb-1">{u.emoji}</div>
              <div className="font-extrabold text-gray-800">{u.name}</div>
              <div className="text-2xl font-extrabold mt-2" style={{ color: u.color }}>
                {cleared}<span className="text-gray-300 text-base font-normal"> / {totalTiers}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
                <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: u.color }} />
              </div>
              <div className="text-xs text-gray-400 mt-1">tiers cleared · {data[u.id].length} runs</div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-700">Tier Mastery Grid</h2>
          <p className="text-xs text-gray-400 mt-0.5">Rows = topics · columns = tiers · emoji = student who has cleared that tier</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[620px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase w-52">Topic</th>
                {TIER_DEFS.map((t) => (
                  <th key={t.tier} className="text-center py-3 text-gray-400 font-semibold text-xs" style={{ width: '15%' }}>
                    {t.emoji} {t.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {TOPICS.map((topic) => (
                <tr key={topic.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: topic.accent }} />
                      <span className="font-semibold text-gray-700 text-xs leading-tight">{topic.emoji} {topic.title}</span>
                    </div>
                  </td>
                  {TIER_DEFS.map((t) => (
                    <td key={t.tier} className="py-3 px-2">
                      <div className="flex flex-wrap justify-center gap-1">
                        {TRACKED_USERS.filter((u) => passedTiers(data[u.id], topic.id).has(t.tier)).map((u) => (
                          <span key={u.id} title={`${u.name} cleared ${t.label}`}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: `${u.color}22` }}>
                            {u.emoji}
                          </span>
                        ))}
                        {TRACKED_USERS.every((u) => !passedTiers(data[u.id], topic.id).has(t.tier)) && <span className="text-gray-200">–</span>}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Skill Diagnostic — computation vs interpretation, per student ────────────
function StudentDiagnostic({ activeUser, onSwitch }) {
  const [confirmClear, setConfirmClear] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const sessions = useMemo(() => getSessions(activeUser), [activeUser, refresh])
  const recent = [...sessions].reverse().slice(0, 60)
  const units = [...TOPICS, ...CHECKPOINTS]
  const clear = () => { clearSessions(activeUser); setConfirmClear(false); setRefresh((r) => r + 1) }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {TRACKED_USERS.map((u) => (
          <button key={u.id} onClick={() => { onSwitch(u.id); setConfirmClear(false) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${u.id === activeUser ? 'text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
            style={u.id === activeUser ? { backgroundColor: u.color } : {}}>
            {u.emoji} {u.name}
            <span className={`text-xs font-normal ${u.id === activeUser ? 'text-white/70' : 'text-gray-400'}`}>{getSessions(u.id).length}</span>
          </button>
        ))}
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-400">No sessions yet.</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-700">Computation vs Interpretation</h2>
                <p className="text-xs text-gray-400 mt-0.5">Accuracy on each skill across all runs, per unit — where the two diverge is the diagnostic.</p>
              </div>
              {!confirmClear
                ? <button onClick={() => setConfirmClear(true)} className="text-xs text-gray-300 hover:text-red-400">Clear data</button>
                : <div className="flex gap-2"><button onClick={clear} className="text-xs text-red-500 font-bold">Yes, clear</button><button onClick={() => setConfirmClear(false)} className="text-xs text-gray-400">Cancel</button></div>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="text-left px-5 py-3">Unit</th>
                    <th className="text-center px-4 py-3">Tiers</th>
                    {SKILL_IDS.map((id) => <th key={id} className="text-center px-4 py-3">{SKILLS[id].emoji} {SKILLS[id].short}</th>)}
                    <th className="text-center px-4 py-3">Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {units.map((unit) => {
                    const comp = skillAgg(sessions, unit.id, 'computation')
                    const interp = skillAgg(sessions, unit.id, 'interpretation')
                    if (!comp && !interp) return null
                    const tiers = passedTiers(sessions, unit.id).size
                    const isTopic = TOPICS.some((t) => t.id === unit.id)
                    const gap = comp && interp ? Math.abs(labelRank(comp.acc) - labelRank(interp.acc)) : 0
                    return (
                      <tr key={unit.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-700 text-xs">{unit.emoji} {unit.title}</td>
                        <td className="text-center px-4 py-3 text-xs font-bold text-gray-600">
                          {isTopic ? `${tiers}/${TIER_MAX}` : (tiers ? '✓' : '–')}
                        </td>
                        {[comp, interp].map((c, i) => (
                          <td key={i} className="text-center px-4 py-3">
                            {c
                              ? <div className="inline-flex flex-col items-center">
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: c.label.color }}>{c.label.emoji} {c.label.label}</span>
                                  <span className="text-[10px] text-gray-400 mt-0.5">{Math.round(c.acc * 100)}% ({c.correct}/{c.total})</span>
                                </div>
                              : <span className="text-gray-200">–</span>}
                          </td>
                        ))}
                        <td className="text-center px-4 py-3">
                          {gap >= 2 ? <span className="text-amber-500 font-bold" title="Notable skill gap">⚠️ {gap}</span> : gap === 1 ? <span className="text-gray-400">{gap}</span> : <span className="text-gray-200">–</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-700">Run Log <span className="font-normal text-gray-400 text-sm">(recent first)</span></h2></div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3">Date</th><th className="text-left px-4 py-3">Unit · Tier</th>
                  <th className="text-center px-4 py-3">Climb</th><th className="text-center px-4 py-3">Avg time</th><th className="text-center px-4 py-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{fmt(s.ts)}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {s.levelTitle}<span className="ml-1 text-xs text-gray-400">· {s.tierLabel}</span>
                      {s.kind === 'checkpoint' && <span className="ml-1 text-[10px] text-teal-500 font-bold">MIX</span>}
                    </td>
                    <td className="text-center px-4 py-3 font-bold text-gray-700">{s.rungs ?? 0}/8</td>
                    <td className="text-center px-4 py-3 text-gray-500">{s.avgMs ? `${(s.avgMs / 1000).toFixed(1)}s` : '–'}</td>
                    <td className="text-center px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.passed ? 'bg-green-100 text-green-700' : s.summited ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-400'}`}>
                        {s.passed ? '🚩 Cleared' : s.summited ? '⏱️ Too slow' : '🍂 Slid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
