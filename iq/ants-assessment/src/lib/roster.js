// Display-only roster — id → name/emoji/color for labeling motherbrain rows.
// Mirrors the TRACKED_USERS list duplicated in each game tool's own
// src/lib/users.js. No PINs here; this view is protected by ?admin only,
// same as the other tools' own AdminView pages.
export const TRACKED_USERS = [
  { id: 'ballard',  name: 'Ballard',   emoji: '🦁', color: '#6366f1' },
  { id: 'elle',     name: 'Elle',      emoji: '🌸', color: '#ec4899' },
  { id: 'edie',     name: 'Edie',      emoji: '⭐', color: '#f59e0b' },
  { id: 'ruby-l',   name: 'Ruby L.',   emoji: '💎', color: '#ef4444' },
  { id: 'winnie-l', name: 'Winnie L.', emoji: '🐻', color: '#0d9488' },
  { id: 'elle-s',   name: 'Elle S.',   emoji: '🦋', color: '#8b5cf6' },
  { id: 'guest',    name: 'Guest',     emoji: '🎈', color: '#64748b' },
]

export const getStudent = (id) => TRACKED_USERS.find((u) => u.id === id) ?? { id, name: id, emoji: '❔', color: '#94a3b8' }
