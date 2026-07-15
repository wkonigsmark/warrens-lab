// The "brain" of Ants & Statistics — gated tier ladders + skill-type tracking.
//
// Structure mirrors the younger Ants games (e.g. Algebra 2's Balance Lab):
// each topic is a ladder of difficulty TIERS you must clear in order. A tier is
// a short "climb" — answer questions to climb RUNGS to the summit. Get one
// wrong and it costs a MISS; blow the tier's miss budget and you slide back
// down and retry. Clearing a tier UNLOCKS the next, harder one. The top tiers
// add a SPEED GATE: you must also average under a time limit to earn mastery.
//
// Layered on top: every question is tagged computation vs interpretation-in-
// context, tracked separately so the diagnostic can say "strong on computation,
// weak on interpretation" instead of averaging the two away.
//
// Pure functions only — everything returns new values.

export const TIER_MIN = 1
export const TIER_MAX = 5
export const RUNGS = 8 // correct answers needed to summit a tier

export const TIER_LABELS = ['', 'Foundational', 'Building', 'On Level', 'Advanced', 'AP-Ready']

// Per-tier tuning. missBudget shrinks and (near the top) a speed gate appears —
// difficulty ramps exactly the way the younger games' tiers do, plus the
// "average completion time" requirement you hit as you approach mastery.
// maxAvgMs is generous because these questions read longer than the kids' games.
export const TIER_DEFS = [
  { tier: 1, id: 'foundational', label: 'Foundational', emoji: '🌱', missBudget: 4, maxAvgMs: null },
  { tier: 2, id: 'building',     label: 'Building',     emoji: '🧱', missBudget: 3, maxAvgMs: null },
  { tier: 3, id: 'onlevel',      label: 'On Level',     emoji: '🎯', missBudget: 2, maxAvgMs: null },
  { tier: 4, id: 'advanced',     label: 'Advanced',     emoji: '💪', missBudget: 2, maxAvgMs: 30000 },
  { tier: 5, id: 'apready',      label: 'AP-Ready',     emoji: '🚀', missBudget: 1, maxAvgMs: 22000 },
]
export const tierDef = (tier) => TIER_DEFS.find((t) => t.tier === tier)

// The two skill dimensions we track separately.
export const SKILLS = {
  computation: { id: 'computation', label: 'Computation', short: 'Compute', emoji: '🧮', color: '#0ea5e9' },
  interpretation: { id: 'interpretation', label: 'Interpretation', short: 'Interpret', emoji: '💬', color: '#8b5cf6' },
}
export const SKILL_IDS = ['computation', 'interpretation']

// Alternate skills so a climb samples both — computation on even rungs,
// interpretation on odd.
export function skillForIndex(i) {
  return i % 2 === 0 ? 'computation' : 'interpretation'
}

// A run ends when the climber summits (RUNGS reached) or busts (misses exceed
// budget). At the summit, a speed gate may still block mastery of a top tier.
export function evaluateSummit({ rung, misses, missBudget, avgMs, maxAvgMs }) {
  const summited = rung >= RUNGS
  const busted = misses > missBudget
  const speedOk = maxAvgMs == null || avgMs == null || avgMs <= maxAvgMs
  return {
    summited,
    busted,
    speedOk,
    passed: summited && !busted && speedOk, // cleared + within budget + fast enough
  }
}

// A per-skill label for one run (accuracy-based, quick to read). The gated
// ladder itself carries "mastery"; this surfaces the compute/interpret split.
export function skillLabel(acc, total) {
  if (!total) return { label: '—', color: '#cbd5e1', emoji: '·' }
  if (acc >= 0.8) return { label: 'Strong', color: '#16a34a', emoji: '💪' }
  if (acc >= 0.55) return { label: 'Solid', color: '#0ea5e9', emoji: '👍' }
  return { label: 'Shaky', color: '#f59e0b', emoji: '🌱' }
}

// Fold a run's answers into a report. answers: [{ skill, correct, ms }]
export function runReport(answers) {
  const skills = {}
  for (const id of SKILL_IDS) {
    const rows = answers.filter((a) => a.skill === id)
    const total = rows.length
    const correct = rows.filter((a) => a.correct).length
    const times = rows.map((a) => a.ms).filter((m) => m != null)
    const avgMs = times.length ? Math.round(times.reduce((s, m) => s + m, 0) / times.length) : 0
    const acc = total ? correct / total : 0
    skills[id] = { correct, total, avgMs, acc, label: skillLabel(acc, total) }
  }
  const total = answers.length
  const correct = answers.filter((a) => a.correct).length
  const times = answers.map((a) => a.ms).filter((m) => m != null)
  const avgMs = times.length ? Math.round(times.reduce((s, m) => s + m, 0) / times.length) : 0
  return { total, correct, avgMs, skills }
}
