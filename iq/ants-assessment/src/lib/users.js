import { fetchRoster } from '../../../_shared/progress/index.js'

// Live roster, mirrors the other /iq tools (see ants-angles). Populated by
// loadRoster() before the app renders (main.jsx); live ES-module bindings mean
// reassigning here updates every importer (UserPicker, PinGate, Banner).
export let USERS = []
export let GUEST = { id: 'guest', name: 'Guest', emoji: '🎈', color: '#64748b' }
export let TRACKED_USERS = []

export async function loadRoster() {
  const roster = await fetchRoster()
  const guest = roster.find((u) => u.id === 'guest')
  if (guest) GUEST = guest
  USERS = roster.filter((u) => u.id !== 'guest')
  TRACKED_USERS = [...USERS, GUEST]
}

const USER_KEY = 'ants-assessment-user'

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
