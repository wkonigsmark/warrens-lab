// "Stat Words" — the dead-simple vocabulary layer that comes BEFORE Topic 1.
// Each word pairs a big picture with a pulsing visual cue, so a very young
// learner can associate the term with what it looks like on a dotplot. The
// quiz drills that association immediately (pick the word, pick the picture,
// or yes/no). No numbers to compute — just "which one is the median?"
//
// Each term carries a tiny fixed dataset (`values`) that its VocabVisual draws
// as a dotplot, plus a `viz` key that selects the pulsing highlight.

export const VOCAB = [
  {
    id: 'data', word: 'Data', emoji: '🔵', color: '#0ea5e9', viz: 'data',
    kid: 'The dots! Each dot is one thing we counted.',
    values: [3, 3, 4, 5, 5, 6, 7],
  },
  {
    id: 'distribution', word: 'Distribution', emoji: '🏔️', color: '#6366f1', viz: 'distribution',
    kid: 'The whole picture of ALL our dots together.',
    values: [2, 3, 3, 4, 4, 4, 5, 5, 6],
  },
  {
    id: 'peak', word: 'Peak', emoji: '⛰️', color: '#0ea5e9', viz: 'peak',
    kid: 'The tallest stack — the one we saw the most.',
    values: [2, 3, 3, 4, 4, 4, 4, 5, 6],
  },
  {
    id: 'mean', word: 'Mean', emoji: '⚖️', color: '#f59e0b', viz: 'mean',
    kid: 'The balance point — where the dots tip evenly. (The average!)',
    values: [2, 3, 4, 4, 5, 6],
  },
  {
    id: 'median', word: 'Median', emoji: '🎯', color: '#8b5cf6', viz: 'median',
    kid: 'The middle! Same number of dots on each side.',
    values: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: 'skew', word: 'Skew', emoji: '🐍', color: '#ec4899', viz: 'skew',
    kid: 'A long tail leaning off to one side.',
    values: [1, 1, 1, 2, 2, 3, 4, 6],
  },
  {
    id: 'outlier', word: 'Outlier', emoji: '🌟', color: '#ef4444', viz: 'outlier',
    kid: 'A loner — one dot far away from all the others.',
    values: [3, 4, 4, 5, 5, 6, 12],
  },
  {
    id: 'spread', word: 'Spread', emoji: '↔️', color: '#14b8a6', viz: 'spread',
    kid: 'How wide the dots reach — smallest to biggest.',
    values: [2, 4, 5, 6, 8, 10],
  },
]

export const getWord = (id) => VOCAB.find((v) => v.id === id)

// Little helpers the visual uses.
export const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length
export const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
export const modeValue = (xs) => {
  const c = {}
  xs.forEach((x) => (c[x] = (c[x] || 0) + 1))
  return +Object.entries(c).sort((a, b) => b[1] - a[1])[0][0]
}
