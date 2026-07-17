import { enqueueSession } from '../../../_shared/progress/index.js'
import { byId } from './competencies'
import { ability, difficultyTier } from './adaptive'

const TOOL_ID = 'ants-assessment'
const key = (user) => `ants-assessment-sessions-${user}`

export function getSessions(user) {
  try {
    return JSON.parse(localStorage.getItem(key(user)) || '[]')
  } catch {
    return []
  }
}

function writeSessions(user, all) {
  try {
    localStorage.setItem(key(user), JSON.stringify(all))
  } catch {
    all.splice(0, 30) // trim oldest if we blow the quota
    localStorage.setItem(key(user), JSON.stringify(all))
  }
}

// A finished run is multi-topic, so it becomes ONE progress row per competency
// (Warren's choice) — the shape the sibling tools + the admin console already
// speak (levelTitle / topicId / tierLabel / score / total). Every row shares a
// runId but gets a unique id, which is the outbox's dedup key (client_id).
export function buildRunRows(finished, config, runId = Date.now()) {
  const ts = new Date().toISOString()
  return finished.map(({ compId, learner }) => {
    const comp = byId(compId)
    const { level } = ability(learner)
    const tier = difficultyTier(level)
    const correct = learner.history.filter((h) => h.correct).length
    const total = learner.history.length
    const rubricIdx = Math.min(10, Math.max(1, Math.round(level))) - 1
    return {
      id: `${runId}-${compId}`,
      runId: String(runId),
      ts,
      topicId: compId,
      levelId: Math.round(level),
      levelTitle: `Level ${level.toFixed(1)} · ${comp.rubric[rubricIdx]}`,
      tierId: tier.id,
      tierLabel: tier.label,
      score: correct,
      total,
      avgMs: total ? Math.round(learner.history.reduce((s, h) => s + (h.timeMs || 0), 0) / total) : 0,
      trace: learner.history.map((h) => ({ d: h.difficulty, ok: h.correct, ms: h.timeMs, theta: Number(h.theta.toFixed(2)) })),
      config,
    }
  })
}

// Local-first: write every competency row to this user's local history, then
// mirror each into the shared outbox (which syncs to Supabase when online).
export function recordRun(user, finished, config) {
  const rows = buildRunRows(finished, config)
  const all = getSessions(user)
  all.push(...rows)
  writeSessions(user, all)
  for (const row of rows) enqueueSession(TOOL_ID, user, row)
  return rows
}
