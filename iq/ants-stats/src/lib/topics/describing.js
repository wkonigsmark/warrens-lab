// Topic 1 — Describing Distributions.
// Shape (skew / symmetry / modality), center, spread, clusters & outliers,
// read from dotplots and histograms.

import { rand, pick, shuffle, mc } from './helpers'

// Build integer data with a target SHAPE across a span of columns.
// Returns { values, bins } — values for dotplots, bins for histograms.
function shapedData(shape, span = 7, scale = 4) {
  const lo = rand(1, 4)
  const cols = Array.from({ length: span }, (_, i) => lo + i)
  const c = (span - 1) / 2
  const weight = (i) => {
    switch (shape) {
      case 'symmetric': return Math.max(0.15, 1 - Math.abs(i - c) / (c + 0.5))
      case 'right':     return Math.max(0.1, 1 - i / span) + 0.1        // mass low, tail high
      case 'left':      return Math.max(0.1, (i + 1) / span) + 0.1      // mass high, tail low
      case 'uniform':   return 0.8
      case 'bimodal':   return (Math.abs(i - 1) < 1 || Math.abs(i - (span - 2)) < 1) ? 1 : 0.2
      default:          return 0.8
    }
  }
  const bins = cols.map((v, i) => ({ label: String(v), value: v, count: Math.max(0, Math.round(weight(i) * scale)) }))
  // guarantee at least a little data
  if (bins.every((b) => b.count === 0)) bins[Math.floor(span / 2)].count = 2
  const values = bins.flatMap((b) => Array.from({ length: b.count }, () => b.value))
  return { values, bins }
}

const SHAPE_LABEL = {
  symmetric: 'roughly symmetric',
  right: 'skewed to the right',
  left: 'skewed to the left',
  uniform: 'roughly uniform',
  bimodal: 'bimodal (two peaks)',
}

// ── Computation: read counts / mode / range off a dotplot ────────────────────
function computation(tier) {
  const shape = pick(tier <= 2 ? ['symmetric', 'right', 'uniform'] : ['right', 'left', 'bimodal', 'symmetric'])
  const span = tier <= 2 ? 6 : 7
  const { values, bins } = shapedData(shape, span, tier <= 2 ? 3 : 5)
  const chart = { type: 'dotplot', values, unit: pick(['minutes', 'points', 'books', 'goals', 'texts']) }
  const kind = pick(tier <= 2 ? ['count-above', 'mode', 'total'] : ['count-above', 'count-between', 'range', 'total'])

  if (kind === 'mode') {
    const top = [...bins].sort((a, b) => b.count - a.count)[0]
    return {
      prompt: `The dotplot shows the number of ${chart.unit} recorded for each ant. Which value is the mode (occurs most often)?`,
      chart,
      ...mc(top.value, shuffle(bins.filter((b) => b.value !== top.value).map((b) => b.value)).slice(0, 3)),
      explain: `The tallest stack sits over ${top.value}, so ${top.value} is the mode.`,
    }
  }
  if (kind === 'total') {
    const n = values.length
    return {
      prompt: `How many ants are shown in this dotplot altogether?`,
      chart,
      ...mc(n, [n - 1, n + 1, n + 2, n - 2].filter((x) => x > 0)),
      explain: `Count every dot: there are ${n} in all.`,
    }
  }
  if (kind === 'range') {
    const min = Math.min(...values), max = Math.max(...values)
    const r = max - min
    return {
      prompt: `What is the range of this data (largest value − smallest value)?`,
      chart,
      ...mc(r, [r + 1, r - 1, max, r + 2].filter((x) => x >= 0)),
      explain: `Largest = ${max}, smallest = ${min}, so range = ${max} − ${min} = ${r}.`,
    }
  }
  if (kind === 'count-between') {
    const a = Math.min(...values) + 1, b = Math.max(...values) - 1
    const n = values.filter((v) => v >= a && v <= b).length
    return {
      prompt: `How many ants recorded between ${a} and ${b} ${chart.unit} (inclusive)?`,
      chart,
      ...mc(n, [n - 1, n + 1, n + 2, n - 2].filter((x) => x >= 0)),
      explain: `Add the stacks from ${a} through ${b}: that's ${n} dots.`,
    }
  }
  // count-above
  const thresh = Math.round((Math.min(...values) + Math.max(...values)) / 2)
  const n = values.filter((v) => v > thresh).length
  return {
    prompt: `How many ants recorded MORE than ${thresh} ${chart.unit}?`,
    chart,
    ...mc(n, [n - 1, n + 1, n + 2, values.filter((v) => v >= thresh).length].filter((x) => x >= 0 && x !== n)),
    explain: `Count only the dots strictly above ${thresh}: ${n} of them.`,
  }
}

// ── Interpretation: name the shape, choose the right summary, spot outliers ──
function interpretation(tier) {
  const kind = pick(
    tier <= 2 ? ['shape', 'shape', 'outlier'] :
    tier <= 4 ? ['shape', 'center-choice', 'outlier', 'compare'] :
                ['center-choice', 'compare', 'outlier-effect']
  )

  if (kind === 'shape') {
    const shape = pick(['symmetric', 'right', 'left', 'uniform', 'bimodal'])
    const { bins } = shapedData(shape, 7, 6)
    const options = shuffle(['symmetric', 'right', 'left', 'bimodal'].includes(shape)
      ? ['roughly symmetric', 'skewed to the right', 'skewed to the left', 'bimodal (two peaks)']
      : ['roughly symmetric', 'skewed to the right', 'skewed to the left', 'roughly uniform'])
    // Direction-specific explanations — a distribution is named for its TAIL,
    // not for where the tall bars sit. This is the #1 misconception to fix.
    const explains = {
      right: 'The tall bars sit on the LEFT and a thin tail stretches off to the RIGHT. A distribution is named for its tail, so this is skewed to the right — even though most of the data is on the left.',
      left: 'The tall bars sit on the RIGHT and a thin tail stretches off to the LEFT. A distribution is named for its tail, so this is skewed to the left — even though most of the data is on the right.',
      symmetric: 'Both halves roughly mirror each other and neither side has a long tail — roughly symmetric.',
      uniform: 'Every bar is about the same height — roughly uniform.',
      bimodal: 'There are two separate peaks — bimodal, often a sign two groups got mixed together.',
    }
    return {
      prompt: `Which phrase best describes the SHAPE of this distribution?`,
      hint: 'One peak or two (bimodal)? Roughly level (uniform)? Mirror-image halves (symmetric)? Or a long thin tail off one side (skewed)? Remember: a distribution is skewed toward its TAIL — not toward the tall bars.',
      chart: { type: 'histogram', bins },
      choices: options,
      correctIndex: options.indexOf(SHAPE_LABEL[shape]),
      explain: explains[shape],
    }
  }

  if (kind === 'center-choice') {
    const shape = pick(['right', 'left'])
    const { bins } = shapedData(shape, 7, 6)
    const correct = 'The median — it resists the pull of the long tail'
    const opts = [
      correct,
      'The mean — it uses every value so it is always best',
      'The mode — the tallest bar is all that matters',
      'It makes no difference which one you report',
    ]
    return {
      prompt: `This distribution is ${SHAPE_LABEL[shape]}. Which measure of center best describes a "typical" value here, and why?`,
      chart: { type: 'histogram', bins },
      choices: shuffle(opts),
      correctIndex: -1,
      _correct: correct,
      explain: `In a skewed distribution the tail drags the mean toward it, so the median is the more representative center.`,
    }
  }

  if (kind === 'outlier') {
    const { values } = shapedData('symmetric', 6, 3)
    const outlier = Math.max(...values) + rand(6, 10)
    const withO = { type: 'dotplot', values: [...values, outlier], unit: 'minutes' }
    const opts = [
      `Yes — ${outlier} sits far from the rest of the data, separated by a gap`,
      'No — every value is part of the pattern, there are no outliers',
      `Yes — the value ${Math.min(...values)} is unusually low`,
      'You cannot identify outliers from a dotplot',
    ]
    return {
      prompt: `Does this distribution appear to have an outlier? Pick the best answer.`,
      chart: withO,
      choices: opts,
      correctIndex: 0,
      explain: `${outlier} is separated from the cluster by a clear gap, which flags it as a likely outlier.`,
    }
  }

  if (kind === 'outlier-effect') {
    const correct = 'The mean would increase a lot, but the median would barely change'
    const opts = [
      correct,
      'Both the mean and the median would increase by the same amount',
      'The median would jump up; the mean would stay put',
      'Neither the mean nor the median would be affected',
    ]
    return {
      prompt: `A single very large outlier is added to the high end of a data set. What happens to the mean and the median?`,
      choices: shuffle(opts),
      correctIndex: -1,
      _correct: correct,
      explain: `The mean is pulled toward extreme values; the median (a position, not a total) is resistant, so it barely moves.`,
    }
  }

  // compare — two dotplots, judge center or spread
  const a = shapedData('symmetric', 6, 3)
  const shiftB = a.values.map((v) => v + rand(2, 4))
  const correct = 'Group B is centered higher, but the two have similar spread'
  const opts = [
    correct,
    'Group A is centered higher than Group B',
    'Group B has far more spread than Group A',
    'The two distributions are identical',
  ]
  return {
    prompt: `Compare the two groups. Which statement is best supported?`,
    chart: { type: 'dotplots', groups: [
      { label: 'Group A', values: a.values },
      { label: 'Group B', values: shiftB },
    ], unit: 'points' },
    choices: shuffle(opts),
    correctIndex: -1,
    _correct: correct,
    explain: `Group B's dots are the same shape shifted to the right — higher center, comparable spread.`,
  }
}

// Items that shuffle their options carry `_correct`; resolve the index here.
function finalize(q) {
  if (q.correctIndex === -1 && q._correct != null) {
    q.correctIndex = q.choices.indexOf(q._correct)
  }
  delete q._correct
  return q
}

export function generate(tier, skill) {
  const q = skill === 'computation' ? computation(tier) : finalize(interpretation(tier))
  return { topicId: 'describing', skill, tier, ...q }
}
