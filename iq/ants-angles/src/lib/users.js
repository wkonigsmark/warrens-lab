export const USERS = [
  { id: 'ballard', name: 'Ballard', emoji: '🦁', color: '#6366f1' },
  { id: 'elle',    name: 'Elle',    emoji: '🌸', color: '#ec4899' },
  { id: 'edie',    name: 'Edie',    emoji: '⭐', color: '#f59e0b' },
]

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
  return USERS.find(u => u.id === id) ?? null
}
