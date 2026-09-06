export const HOUSES = {
  gryffindor: {
    name: 'Gryffindor', emoji: '🦁',
    accent: '#e0433f', accentSoft: 'rgba(224,67,63,0.18)', trim: '#eeba30',
  },
  slytherin: {
    name: 'Slytherin', emoji: '🐍',
    accent: '#3fa45c', accentSoft: 'rgba(63,164,92,0.18)', trim: '#c0c8ce',
  },
  ravenclaw: {
    name: 'Ravenclaw', emoji: '🦅',
    accent: '#4f81e8', accentSoft: 'rgba(79,129,232,0.18)', trim: '#b98c4a',
  },
  hufflepuff: {
    name: 'Hufflepuff', emoji: '🦡',
    accent: '#e8b93f', accentSoft: 'rgba(232,185,63,0.18)', trim: '#efe5cf',
  },
}

export const CATS = {
  story: { label: 'Story', emoji: '📖', color: '#6ea8ff' },
  heart: { label: 'Heart & Courage', emoji: '💖', color: '#ff8fb2' },
  superfan: { label: 'Superfan', emoji: '⭐', color: '#ffd97a' },
  talk: { label: 'Talk it over', emoji: '💬', color: '#c9a2ff' },
}

export const BOOKS = [
  { id: 1, num: 'I', title: 'The Sorcerer’s Stone', emoji: '🪄', unlocked: true, blurb: 'A cupboard, a castle, and a very good dog named Fluffy.' },
  { id: 2, num: 'II', title: 'The Chamber of Secrets', emoji: '🐍', unlocked: true, blurb: 'A warning on the wall, a voice in the pipes…' },
  { id: 3, num: 'III', title: 'The Prisoner of Azkaban', emoji: '🌙', unlocked: true, blurb: 'A black dog, a strange map, and dementors at the gates…' },
  { id: 4, num: 'IV', title: 'The Goblet of Fire', emoji: '🏆', unlocked: true, blurb: 'Four champions, three tasks, and a name that shouldn’t be there…' },
  { id: 5, num: 'V', title: 'The Order of the Phoenix', emoji: '🐦‍🔥', unlocked: false },
  { id: 6, num: 'VI', title: 'The Half-Blood Prince', emoji: '📖', unlocked: false },
  { id: 7, num: 'VII', title: 'The Deathly Hallows', emoji: '△', unlocked: false },
]
