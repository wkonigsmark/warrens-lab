// Same roster as every other /iq tool's src/lib/users.js (id/name/emoji/color
// only — PINs never live client-side, they're checked via the verify_pin RPC).
export const USERS = [
  { id: 'ballard',  name: 'Ballard',   emoji: '🦁', color: '#6366f1' },
  { id: 'elle',     name: 'Elle',      emoji: '🌸', color: '#ec4899' },
  { id: 'edie',     name: 'Edie',      emoji: '⭐', color: '#f59e0b' },
  { id: 'ruby-l',   name: 'Ruby L.',   emoji: '💎', color: '#ef4444' },
  { id: 'winnie-l', name: 'Winnie L.', emoji: '🐻', color: '#0d9488' },
  { id: 'elle-s',   name: 'Elle S.',   emoji: '🦋', color: '#8b5cf6' },
]

export const GUEST = { id: 'guest', name: 'Guest', emoji: '🎈', color: '#64748b' }

export const TRACKED_USERS = [...USERS, GUEST]

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
  return TRACKED_USERS.find(u => u.id === id) ?? null
}
