// Topic 3 — Relationships Between Variables.
// Scatterplots (direction / form / strength), correlation r, least-squares
// prediction & residuals, slope-in-context, correlation ≠ causation,
// and the danger of extrapolation.

import { rand, pick, shuffle, round, mc, numericChoices } from './helpers'

// Generate scatter points around a line with controllable direction & strength.
function scatter(direction, strength, n = 12) {
  const b = direction === 'positive' ? rand(1, 3) : -rand(1, 3)
  const a = rand(4, 10)
  const noise = strength === 'strong' ? 1 : strength === 'moderate' ? 3 : 6
  const pts = Array.from({ length: n }, () => {
    const x = rand(1, 12)
    const y = a + b * x + (Math.random() * 2 - 1) * noise
    return [x, round(y, 1)]
  })
  return { type: 'scatter', points: pts }
}

// ── Computation ──────────────────────────────────────────────────────────────
function computation(tier) {
  const kind = pick(
    tier <= 2 ? ['predict', 'predict', 'residual'] :
    tier <= 4 ? ['predict', 'residual', 'predict-decimal'] :
                ['residual', 'predict-decimal', 'residual']
  )
  const a = rand(2, 12)
  const b = pick(tier <= 3 ? [2, 3, 4, -2, -3] : [1.5, 2.5, -1.5, 3, -2])
  const x = rand(2, 9)
  const pred = a + b * x
  const eq = `ŷ = ${a} ${b < 0 ? '−' : '+'} ${Math.abs(b)}x`

  if (kind === 'predict' || kind === 'predict-decimal') {
    return {
      prompt: `A least-squares regression line is\n${eq}.\nPredict ŷ when x = ${x}.`,
      ...numericChoices(round(pred, 1), { spread: Math.abs(b) || 1, decimals: 1, positiveOnly: false }),
      explain: `Substitute x = ${x}: ŷ = ${a} ${b < 0 ? '−' : '+'} ${Math.abs(b)}(${x}) = ${round(pred, 1)}.`,
    }
  }

  // residual = observed − predicted
  const observed = round(pred + pick([2, 3, -2, -3, 4, -4]), 1)
  const resid = round(observed - pred, 1)
  return {
    prompt: `The regression line is ${eq}. At x = ${x} the actual observed value was y = ${observed}. Find the residual (observed − predicted).`,
    ...numericChoices(resid, { spread: 1, decimals: 1, positiveOnly: false }),
    explain: `Predicted ŷ = ${round(pred, 1)}. Residual = observed − predicted = ${observed} − ${round(pred, 1)} = ${resid}.`,
  }
}

// ── Interpretation ───────────────────────────────────────────────────────────
function interpretation(tier) {
  const kind = pick(
    tier <= 2 ? ['r-meaning', 'strength', 'r-meaning'] :
    tier <= 4 ? ['r-meaning', 'causation', 'slope-context', 'residual-sign'] :
                ['causation', 'slope-context', 'extrapolation', 'residual-sign']
  )

  if (kind === 'r-meaning') {
    const r = pick([-0.92, -0.45, 0.15, 0.55, 0.88])
    const desc =
      Math.abs(r) >= 0.8 ? 'strong' : Math.abs(r) >= 0.4 ? 'moderate' : 'weak'
    const dir = r > 0 ? 'positive' : 'negative'
    const correct = `A ${desc}, ${dir} linear association`
    const opts = [
      correct,
      `A ${desc}, ${dir === 'positive' ? 'negative' : 'positive'} linear association`,
      r === 0.15 ? 'A strong association' : 'No association at all',
      'A cause-and-effect relationship',
    ]
    return {
      prompt: `Two variables have a correlation of r = ${r}. How is this association best described?`,
      choices: shuffle(opts), correctIndex: -1, _correct: correct,
      explain: `The sign of r gives direction (${dir}) and its distance from 0 gives strength (|${r}| → ${desc}). Correlation never proves causation.`,
    }
  }

  if (kind === 'strength') {
    const strength = pick(['strong', 'moderate', 'weak'])
    const direction = pick(['positive', 'negative'])
    const chart = scatter(direction, strength)
    const label = (s, d) => `${s.charAt(0).toUpperCase() + s.slice(1)} and ${d}`
    const correct = label(strength, direction)
    const others = []
    for (const s of ['strong', 'moderate', 'weak']) {
      for (const d of ['positive', 'negative']) {
        const l = label(s, d)
        if (l !== correct) others.push(l)
      }
    }
    return {
      prompt: `Describe the association shown in this scatterplot.`,
      chart,
      choices: shuffle([correct, ...shuffle(others).slice(0, 3)]),
      correctIndex: -1, _correct: correct,
      explain: `The points ${direction === 'positive' ? 'rise' : 'fall'} from left to right (${direction}) and cluster ${strength === 'strong' ? 'tightly' : strength === 'moderate' ? 'loosely' : 'very loosely'} around a line (${strength}).`,
    }
  }

  if (kind === 'causation') {
    const correct = 'A lurking variable (like warm weather) could drive both — correlation is not causation'
    const opts = [
      correct,
      'Ice cream sales cause drownings',
      'Drownings cause people to buy ice cream',
      'The correlation proves one directly causes the other',
    ]
    return {
      prompt: `Ice cream sales and drownings are strongly positively correlated across the year. What is the best conclusion?`,
      choices: shuffle(opts), correctIndex: -1, _correct: correct,
      explain: `Both rise in summer — a lurking variable (temperature) explains the link. A correlation, however strong, never establishes cause and effect.`,
    }
  }

  if (kind === 'slope-context') {
    const b = rand(2, 6)
    const correct = `For each additional hour studied, the predicted score rises by about ${b} points`
    const opts = [
      correct,
      `A student who studies 0 hours is predicted to score ${b} points`,
      `Studying causes scores to rise by exactly ${b} points every time`,
      `The correlation between hours and score is ${b}`,
    ]
    return {
      prompt: `For predicting test score from hours studied, the regression slope is ${b}. What does the slope mean in context?`,
      choices: shuffle(opts), correctIndex: -1, _correct: correct,
      explain: `Slope = predicted change in y per one-unit increase in x: each extra hour adds about ${b} predicted points. (The intercept, not the slope, is the value at x = 0.)`,
    }
  }

  if (kind === 'extrapolation') {
    const correct = 'Unreliable — x = 40 is far outside the range of the data, so this is extrapolation'
    const opts = [
      correct,
      'Perfectly reliable — the line works for any x value',
      'Unreliable only because the slope is negative',
      'Reliable as long as r is close to 1',
    ]
    return {
      prompt: `A regression line was built from data where x ranged from 1 to 10. Someone uses it to predict y at x = 40. How reliable is that prediction?`,
      choices: shuffle(opts), correctIndex: -1, _correct: correct,
      explain: `Predicting well beyond the observed x-range (extrapolation) assumes the pattern continues — which the data never showed. It's unreliable regardless of r.`,
    }
  }

  // residual-sign
  const correct = 'The actual value was ABOVE the regression line (observed > predicted)'
  const opts = [
    correct,
    'The actual value was below the regression line',
    'The prediction was exactly correct',
    'The correlation must be negative',
  ]
  return {
    prompt: `A data point has a positive residual. What does that tell you about that point?`,
    choices: shuffle(opts), correctIndex: -1, _correct: correct,
    explain: `Residual = observed − predicted. A positive residual means observed > predicted, so the point sits above the line.`,
  }
}

function finalize(q) {
  if (q.correctIndex === -1 && q._correct != null) q.correctIndex = q.choices.indexOf(q._correct)
  delete q._correct
  return q
}

export function generate(tier, skill) {
  const q = skill === 'computation' ? computation(tier) : finalize(interpretation(tier))
  return { topicId: 'relationships', skill, tier, ...q }
}
