import { enqueueSession } from '../../../_shared/progress/index.js'

export const TOOL_ID = 'ants-stats'
const KEY_PREFIX = 'ants-stats-sessions-'

export function getSessions(userId) {
  try {
    return JSON.parse(localStorage.getItem(KEY_PREFIX + userId) || '[]')
  } catch {
    return []
  }
}

export function saveSession(session, userId) {
  const all = getSessions(userId)
  all.push(session)
  localStorage.setItem(KEY_PREFIX + userId, JSON.stringify(all))
  enqueueSession(TOOL_ID, userId, session)
}

export function clearSessions(userId) {
  localStorage.removeItem(KEY_PREFIX + userId)
}
