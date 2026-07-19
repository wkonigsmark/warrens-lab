import { enqueueSession } from '../../../_shared/progress/index.js'

// Local-first per-user session history, mirrored into the shared progress
// outbox. One row per completed quiz level (unit × tier).
const TOOL_ID = 'ants-exponents'
const key = (user) => `ants-exponents-sessions-${user}`

export function saveSession(session, user) {
  const all = getSessions(user)
  all.push(session)
  try {
    localStorage.setItem(key(user), JSON.stringify(all))
  } catch {
    all.splice(0, 20)
    localStorage.setItem(key(user), JSON.stringify(all))
  }
  enqueueSession(TOOL_ID, user, session)
}

export function getSessions(user) {
  try {
    return JSON.parse(localStorage.getItem(key(user)) || '[]')
  } catch {
    return []
  }
}

export function clearSessions(user) {
  localStorage.removeItem(key(user))
}
