import { enqueueSession } from '../../../_shared/progress/index.js'

const TOOL_ID = 'ants-fractions'
const key = (user) => `ants-fractions-sessions-${user}`

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
