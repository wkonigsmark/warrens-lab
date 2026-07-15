// Topic 2 — Numerical Summaries.
// Mean, median, range, quartiles & IQR, the five-number summary and boxplots,
// resistant vs non-resistant measures, and how transformations move them.

import { rand, pick, shuffle, round, mean, median, quartiles, mc, numericChoices } from './helpers'

function dataset(tier) {
  const n = tier <= 2 ? pick([5, 5, 7]) : pick([7, 9, 9])
  const lo = rand(2, 8)
  return Array.from({ length: n }, () => lo + rand(0, tier <= 2 ? 8 : 14))
}

// ── Computation ──────────────────────────────────────────────────────────────
function computation(tier) {
  const kind = pick(
    tier <= 2 ? ['median', 'range', 'mean'] :
    tier <= 4 ? ['median', 'mean', 'iqr', 'q1q3'] :
                ['iqr', 'q1q3', 'mean', 'iqr-from-summary']
  )
  const data = dataset(tier)
  const sortedStr = [...data].sort((a, b) => a - b).join(', ')

  if (kind === 'median') {
    const m = median(data)
    return {
      prompt: `Find the median of this data set:\n${sortedStr}`,
      ...numericChoices(m, { spread: 1, decimals: 1 }),
      explain: `With ${data.length} values in order, the median is the middle value: ${round(m, 1)}.`,
    }
  }
  if (kind === 'mean') {
    const m = mean(data)
    return {
      prompt: `Find the mean of this data set (round to one decimal):\n${sortedStr}`,
      ...numericChoices(round(m, 1), { spread: 1.2, decimals: 1 }),
      explain: `Add all ${data.length} values (${data.reduce((s, x) => s + x, 0)}) and divide by ${data.length}: mean ≈ ${round(m, 1)}.`,
    }
  }
  if (kind === 'range') {
    const r = Math.max(...data) - Math.min(...data)
    return {
      prompt: `Find the range of this data set:\n${sortedStr}`,
      ...numericChoices(r, { spread: 1 }),
      explain: `Range = max − min = ${Math.max(...data)} − ${Math.min(...data)} = ${r}.`,
    }
  }
  if (kind === 'q1q3') {
    const { q1, q3 } = quartiles(data)
    const which = pick(['q1', 'q3'])
    const ans = which === 'q1' ? q1 : q3
    return {
      prompt: `Find ${which === 'q1' ? 'the first quartile (Q1)' : 'the third quartile (Q3)'} of this data set:\n${sortedStr}`,
      ...numericChoices(ans, { spread: 1, decimals: 1 }),
      explain: `${which === 'q1' ? 'Q1' : 'Q3'} is the median of the ${which === 'q1' ? 'lower' : 'upper'} half of the ordered data: ${round(ans, 1)}.`,
    }
  }
  if (kind === 'iqr') {
    const { q1, q3 } = quartiles(data)
    const iqr = q3 - q1
    return {
      prompt: `Find the interquartile range (IQR) of this data set:\n${sortedStr}`,
      ...numericChoices(iqr, { spread: 1, decimals: 1 }),
      explain: `IQR = Q3 − Q1 = ${round(q3, 1)} − ${round(q1, 1)} = ${round(iqr, 1)}.`,
    }
  }
  // iqr-from-summary — read a five-number summary, compute IQR
  const q1 = rand(10, 20), med = q1 + rand(3, 8), q3 = med + rand(3, 8)
  const min = q1 - rand(3, 6), max = q3 + rand(3, 6)
  const iqr = q3 - q1
  return {
    prompt: `A boxplot has this five-number summary:\nMin ${min} · Q1 ${q1} · Median ${med} · Q3 ${q3} · Max ${max}\nWhat is the IQR?`,
    chart: { type: 'boxplot', min, q1, median: med, q3, max },
    ...numericChoices(iqr, { spread: 2 }),
    explain: `IQR = Q3 − Q1 = ${q3} − ${q1} = ${iqr}. (It ignores the min and max.)`,
  }
}

// ── Interpretation ───────────────────────────────────────────────────────────
function interpretation(tier) {
  const kind = pick(
    tier <= 2 ? ['resistant', 'meaning', 'resistant'] :
    tier <= 4 ? ['resistant', 'skew-from-summary', 'transform-add', 'compare-box'] :
                ['transform-add', 'transform-mult', 'compare-box', 'spread-meaning']
  )

  if (kind === 'resistant') {
    const correct = 'The median and the IQR — both are resistant to outliers'
    const opts = [
      correct,
      'The mean and the range — they use every value',
      'The mean and the standard deviation',
      'The range and the mode',
    ]
    return {
      prompt: `A data set has one extreme outlier. Which pair of summaries is LEAST affected by it?`,
      choices: shuffle(opts), correctIndex: -1, _correct: correct,
      explain: `The median is a position and the IQR trims the extreme quarters, so both resist outliers. The mean, range, and standard deviation all use the extreme value directly.`,
    }
  }

  if (kind === 'meaning') {
    const correct = 'The spread of the middle 50% of the data'
    const opts = [correct, 'The single most common value', 'The distance from the smallest to largest value', 'The average of all the values']
    return {
      prompt: `What does the interquartile range (IQR) measure?`,
      choices: shuffle(opts), correctIndex: -1, _correct: correct,
      explain: `IQR = Q3 − Q1, the width of the middle half of the data — a spread measure that ignores the extremes.`,
    }
  }

  if (kind === 'skew-from-summary') {
    const skew = pick(['right', 'left'])
    const mn = 50, md = 50
    const meanVal = skew === 'right' ? md + rand(5, 10) : md - rand(5, 10)
    const correct = skew === 'right'
      ? 'Skewed to the right — the mean is pulled above the median'
      : 'Skewed to the left — the mean is pulled below the median'
    const opts = [
      correct,
      skew === 'right' ? 'Skewed to the left — the mean is below the median' : 'Skewed to the right — the mean is above the median',
      'Roughly symmetric — mean and median are basically equal',
      'The shape cannot be judged from the mean and median',
    ]
    return {
      prompt: `For a data set, the median is ${md} but the mean is ${meanVal}. What does this suggest about the shape?`,
      hint: 'The mean gets dragged toward the long tail; the median stays central. So the mean landing above or below the median tells you which way the tail — and the skew — points.',
      choices: shuffle(opts), correctIndex: -1, _correct: correct,
      explain: `mean ${meanVal > md ? '>' : '<'} median signals a tail on the ${skew} — and a distribution is named for its tail, so it's skewed to the ${skew}. (The mean chases the tail; the median stays central.)`,
    }
  }

  if (kind === 'transform-add') {
    const c = rand(5, 12)
    const correct = `The center rises by ${c}, but the spread (range, IQR, standard deviation) is unchanged`
    const opts = [
      correct,
      `Both the center and the spread rise by ${c}`,
      `The spread rises by ${c}; the center is unchanged`,
      `Nothing changes — adding a constant has no effect`,
    ]
    return {
      prompt: `Every value in a data set has ${c} added to it (e.g. a ${c}-point curve on a test). How do the summaries change?`,
      choices: shuffle(opts), correctIndex: -1, _correct: correct,
      explain: `Shifting every value slides the whole distribution over: measures of center rise by ${c}, but measures of spread depend only on differences, which don't change.`,
    }
  }

  if (kind === 'transform-mult') {
    const k = pick([2, 3, 10])
    const correct = `Both the center AND the spread are multiplied by ${k}`
    const opts = [
      correct,
      `The center is multiplied by ${k}; the spread is unchanged`,
      `The spread is multiplied by ${k}; the center is unchanged`,
      `Only the mean changes; median and IQR stay the same`,
    ]
    return {
      prompt: `Every value in a data set is multiplied by ${k} (e.g. converting to different units). How do the summaries change?`,
      choices: shuffle(opts), correctIndex: -1, _correct: correct,
      explain: `Scaling stretches the whole distribution: both center and spread are multiplied by ${k}.`,
    }
  }

  if (kind === 'spread-meaning') {
    const correct = 'Group A\'s values are, on average, farther from their mean than Group B\'s'
    const opts = [
      correct,
      'Group A has a higher mean than Group B',
      'Group A has more data values than Group B',
      'Group A is more skewed than Group B',
    ]
    return {
      prompt: `Group A has a standard deviation of 12; Group B has a standard deviation of 4. What does that tell you?`,
      choices: shuffle(opts), correctIndex: -1, _correct: correct,
      explain: `Standard deviation measures typical distance from the mean — a bigger value means more spread-out data, nothing about the center or count.`,
    }
  }

  // compare-box — two boxplots
  const aQ1 = rand(20, 30), aMed = aQ1 + rand(4, 8), aQ3 = aMed + rand(4, 8)
  const bQ1 = aQ1 + rand(8, 14), bMed = bQ1 + rand(4, 8), bQ3 = bMed + rand(4, 8)
  const correct = 'Class B has a higher median score than Class A'
  const opts = [
    correct,
    'Class A has a higher median score than Class B',
    'The two classes have identical medians',
    'Class A scored higher on every measure',
  ]
  return {
    prompt: `Two classes' test scores are shown as boxplots. Which statement is best supported?`,
    chart: { type: 'boxplots', groups: [
      { label: 'Class A', min: aQ1 - 5, q1: aQ1, median: aMed, q3: aQ3, max: aQ3 + 5 },
      { label: 'Class B', min: bQ1 - 5, q1: bQ1, median: bMed, q3: bQ3, max: bQ3 + 5 },
    ] },
    choices: shuffle(opts), correctIndex: -1, _correct: correct,
    explain: `Class B's median line sits to the right of Class A's, so Class B's typical score is higher.`,
  }
}

function finalize(q) {
  if (q.correctIndex === -1 && q._correct != null) q.correctIndex = q.choices.indexOf(q._correct)
  delete q._correct
  return q
}

export function generate(tier, skill) {
  const q = skill === 'computation' ? computation(tier) : finalize(interpretation(tier))
  return { topicId: 'summaries', skill, tier, ...q }
}
