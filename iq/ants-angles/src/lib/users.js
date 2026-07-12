export const USERS = [
  { id: 'ballard', name: 'Ballard', emoji: '🦁', color: '#6366f1' },
  { id: 'elle',    name: 'Elle',    emoji: '🌸', color: '#ec4899' },
  { id: 'edie',    name: 'Edie',    emoji: '⭐', color: '#f59e0b' },
]

// Guest is deliberately NOT in USERS: admin/cockpit views iterate USERS, so
// guest play never pollutes the kids' mastery tracking. Guest sessions still
// save under their own key ('...-sessions-guest').
export const GUEST = { id: 'guest', name: 'Guest', emoji: '🎈', color: '#64748b' }

const USER_KEY = 'ants-angles-user'

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
  if (id === GUEST.id) return GUEST
  return USERS.find(u => u.id === id) ?? null
}
