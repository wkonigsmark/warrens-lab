// Registry of tools wired into the shared progress-sync system. Add one
// entry here whenever a new /iq tool wires saveSession → enqueueSession —
// the motherbrain admin view (ants-assessment) reads this list so it can
// label rows without knowing any tool's internals.
//
// There's no per-level lookup to maintain: every tool already writes a
// human-readable levelTitle/tierLabel/topicId straight into its own
// session payload, so describeSession() below just reads those back.
export const TOOL_CATALOG = {
  'ants-angles': {
    name: 'Ants & Angles',
    emoji: '📐',
    color: '#10b981',
    url: 'https://ants-angles.vercel.app/',
  },
  'ants-algebra-v2': {
    name: 'Ants & Algebra 2',
    emoji: '⚖️',
    color: '#6366f1',
    url: 'https://warrens-lab.vercel.app/iq/ants-algebra-2/',
  },
  'ants-axes': {
    name: 'Ants & Axes',
    emoji: '📈',
    color: '#3b82f6',
    url: 'https://warrens-lab.vercel.app/iq/ants-axes/',
  },
  'ants-apples': {
    name: 'Ants & Apples',
    emoji: '🍎',
    color: '#ef4444',
    url: 'https://warrens-lab.vercel.app/iq/ants-apples/',
  },
  'ants-fractions': {
    name: 'Ants & Fractions',
    emoji: '🥧',
    color: '#f59e0b',
    url: 'https://ants-fractions.vercel.app/',
  },
  'ants-stats': {
    name: 'Ants & Statistics',
    emoji: '📊',
    color: '#0ea5e9',
    url: 'https://warrens-lab.vercel.app/iq/ants-stats/',
  },
  'ants-assessment': {
    name: 'Ants & Assessment',
    emoji: '🐜',
    color: '#10b981',
    url: 'https://warrens-lab.vercel.app/iq/ants-assessment/',
  },
}

export function getToolInfo(toolId) {
  return TOOL_CATALOG[toolId] ?? { name: toolId, emoji: '❔', color: '#94a3b8', url: null }
}

// Normalizes one progress_sessions row into a display-ready shape.
export function describeSession(row) {
  const tool = getToolInfo(row.tool_id)
  const p = row.payload || {}
  return {
    tool,
    studentId: row.student_id,
    levelTitle: p.levelTitle ?? row.level_id ?? '—',
    topicId: p.topicId ?? row.topic_id ?? null,
    tierLabel: p.tierLabel ?? p.tierId ?? null,
    score: row.score,
    total: row.total,
    ts: row.ts,
    verified: row.verified,
  }
}
