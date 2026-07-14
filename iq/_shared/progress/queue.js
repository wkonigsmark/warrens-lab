// Local-first outbox: every session is written to localStorage first
// (the tools' existing behavior is untouched), then pushed to Supabase
// whenever the network allows. Losing wifi never loses progress.
import { isConfigured, insertSessions } from './client.js'
import { isOfflineSession, touchSession } from './auth.js'

const OUTBOX_KEY = 'iq-progress-outbox'

function readOutbox() {
  try { return JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]') } catch { return [] }
}
function writeOutbox(rows) {
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(rows))
}
const rowKey = (r) => `${r.student_id}|${r.tool_id}|${r.client_id}`

// Mirror one saved session into the outbox. Shape-tolerant: anything the
// extracted columns don't cover survives inside `payload`.
export function enqueueSession(toolId, userId, session) {
  if (!isConfigured()) return
  const row = {
    student_id: userId,
    tool_id: toolId,
    client_id: String(session.id ?? Date.now()),
    ts: session.ts ?? new Date().toISOString(),
    level_id: session.levelId ?? null,
    topic_id: session.topicId ?? null,
    score: session.score ?? null,
    total: session.count ?? session.total ?? null,
    verified: !isOfflineSession(),
    payload: session,
  }
  const box = readOutbox()
  if (!box.some(r => rowKey(r) === rowKey(row))) {
    box.push(row)
    writeOutbox(box)
  }
  touchSession()
  void flush()
}

let flushing = false
export async function flush() {
  if (flushing || !isConfigured() || !navigator.onLine) return
  const batch = readOutbox()
  if (!batch.length) return
  flushing = true
  try {
    await insertSessions(batch)
    const sent = new Set(batch.map(rowKey))
    writeOutbox(readOutbox().filter(r => !sent.has(rowKey(r)))) // keep rows enqueued mid-flight
  } catch (err) {
    console.warn('[iq-progress] sync failed, will retry:', err.message)
  } finally {
    flushing = false
  }
}

// Call once at app startup.
export function startAutoFlush() {
  window.addEventListener('online', () => void flush())
  setInterval(() => void flush(), 60_000)
  void flush()
}

// One-time import of pre-existing local history into Supabase.
// `getSessions(userId)` is the tool's own reader; runs once per tool+user.
export function backfillFromLocal(toolId, userIds, getSessions) {
  if (!isConfigured()) return
  for (const userId of userIds) {
    const flag = `iq-progress-backfilled-${toolId}-${userId}`
    if (localStorage.getItem(flag)) continue
    for (const session of getSessions(userId)) enqueueSession(toolId, userId, session)
    localStorage.setItem(flag, '1')
  }
}
