const KEY_PREFIX = 'ants-algebra-sessions-'

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
}

export function clearSessions(userId) {
  localStorage.removeItem(KEY_PREFIX + userId)
}
