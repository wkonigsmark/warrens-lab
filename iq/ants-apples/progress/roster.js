// Vendored copy of iq/_shared/progress/roster.js, merged with the local
// session-storage helpers (getStoredUser etc.) since this tool doesn't
// split files the same way as the React apps. See config.js for why vendored.
import { selectRoster } from './client.js'

const CACHE_KEY = 'iq-progress-roster-cache'
const FETCH_TIMEOUT_MS = 4000

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || [] } catch { return [] }
}
function writeCache(roster) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(roster)) } catch {}
}

// Populated by loadRoster() before the game boots (see script.js) — gate.js
// reads these directly. Add a row to `students` in Supabase and it shows up
// here with no code change.
export let USERS = []
export let GUEST = { id: 'guest', name: 'Guest', emoji: '🎈', color: '#64748b' }
export let TRACKED_USERS = []

export async function loadRoster() {
  let roster
  try {
    roster = await Promise.race([
      selectRoster(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('roster fetch timed out')), FETCH_TIMEOUT_MS)),
    ])
    if (roster?.length) writeCache(roster)
    else roster = readCache()
  } catch {
    roster = readCache()
  }
  const guest = roster.find((u) => u.id === 'guest')
  if (guest) GUEST = guest
  USERS = roster.filter((u) => u.id !== 'guest')
  TRACKED_USERS = [...USERS, GUEST]
}

const USER_KEY = 'ants-apples-user'

export function getStoredUser() {
  return localStorage.getItem(USER_KEY) || null
}

export function storeUser(id) {
  localStorage.setItem(USER_KEY, id)
}

export function clearStoredUser() {
  localStorage.removeItem(USER_KEY)
}

export function getUser(id) {
  return TRACKED_USERS.find((u) => u.id === id) ?? null
}
