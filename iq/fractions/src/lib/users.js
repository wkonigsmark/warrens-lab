import { fetchRoster } from '../../../_shared/progress/index.js'

// Populated by loadRoster() before the app renders (see main.jsx). Live ES
// module bindings mean reassigning them here updates every importer.
export let USERS = []
export let GUEST = { id: 'guest', name: 'Guest', emoji: '🎈', color: '#64748b' }
export let TRACKED_USERS = []

// Fetches the live roster from Supabase (student_roster view) and populates
// USERS/GUEST/TRACKED_USERS. Falls back to the last cached roster (or an
// empty list) if the network is unavailable — see _shared/progress/roster.js.
export async function loadRoster() {
  const roster = await fetchRoster()
  const guest = roster.find((u) => u.id === 'guest')
  if (guest) GUEST = guest
  USERS = roster.filter((u) => u.id !== 'guest')
  TRACKED_USERS = [...USERS, GUEST]
}

const USER_KEY = 'ants-fractions-user'

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
