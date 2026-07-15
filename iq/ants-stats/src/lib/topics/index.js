// The topic registry — metadata, concept intros, worked examples, and the
// question generator for each module. This is where the "reading-heavy, less
// manipulative" character of the game lives: every topic opens with a real
// explanation and a real-world hook, then walks 2–3 worked examples before any
// tracked question is asked.

import { generate as genDescribing } from './describing'
import { generate as genSummaries } from './summaries'
import { generate as genRelationships } from './relationships'

export const TOPICS = [
  {
    id: 'describing',
    n: 1,
    title: 'Describing Distributions',
    emoji: '📊',
    accent: '#0ea5e9',
    hook: 'Before you calculate a single number, you have to SEE the data.',
    generate: genDescribing,
    intro: [
      { h: 'What is a distribution?', body: `A distribution is just the full picture of what values a variable takes and how often. A dotplot or histogram is a map of that picture — one glance tells you more than a table of numbers ever could.` },
      { h: 'The three things to notice', body: `Every time you look at a distribution, describe its Shape, Center, and Spread — and always call out any unusual features (outliers, gaps, clusters). This is the "SOCS" habit that carries through all of AP Statistics.` },
      { h: 'Shape vocabulary', body: `Symmetric means the two halves roughly mirror each other. Bimodal means two distinct peaks — often a sign two groups got mixed together. Uniform means every value is about equally common (a flat top). And then there's skew — which trips up almost everyone at first.` },
      { h: '⚠️ Which way does it skew? (the counterintuitive rule)', body: `A distribution is named for its TAIL — the long, thin, stretched-out side — NOT for where the tall bars pile up. So: tall bars on the LEFT with a thin tail trailing off to the RIGHT is skewed RIGHT. Tall bars on the RIGHT with a thin tail trailing off to the LEFT is skewed LEFT. Memory trick: "the tail names the skew." Point at the long tail — that's your answer. (Yes, it feels backwards. That backwards feeling is exactly why it's a favorite exam trap.)` },
      { h: 'Real-world hook', body: `Household incomes are a classic skewed-RIGHT distribution: most families pile up at modest incomes (tall bars on the LEFT), while a few enormous earners stretch a long thin tail off to the RIGHT. The tail points right, so it's skewed right — even though most people are on the left. That's also why news reports quote the MEDIAN income, not the mean: the long tail drags the mean upward, so the median is the more honest "typical" value.` },
    ],
    examples: [
      {
        prompt: 'Describe the shape of this distribution of quiz scores.',
        chart: { type: 'histogram', bins: [
          { label: '4', count: 1 }, { label: '5', count: 2 }, { label: '6', count: 4 },
          { label: '7', count: 6 }, { label: '8', count: 4 }, { label: '9', count: 2 }, { label: '10', count: 1 },
        ] },
        steps: [
          'Find the peak: the tallest bar is over 7, near the middle.',
          'Compare the two sides: the bars fall off at roughly the same rate on both sides.',
          'No long tail one way or the other, no separated bars.',
        ],
        answer: 'Roughly symmetric, single-peaked, centered near 7, no outliers.',
      },
      {
        prompt: 'Which way is this distribution skewed? (Watch out — this is the classic trap.)',
        chart: { type: 'histogram', bins: [
          { label: '2', count: 1 }, { label: '3', count: 2 }, { label: '4', count: 3 },
          { label: '5', count: 4 }, { label: '6', count: 6 }, { label: '7', count: 8 },
        ] },
        steps: [
          'Where does the data pile up? The tall bars are on the RIGHT (6 and 7).',
          'Where is the tail? A few short bars trail off to the LEFT (2, 3, 4).',
          'A distribution is named for its TAIL, not its tall bars — and the tail points left.',
        ],
        answer: 'Skewed to the LEFT — even though the tall bars are on the right, the long thin tail points left, and the tail names the skew.',
      },
      {
        prompt: 'How many ants recorded more than 5 minutes?',
        chart: { type: 'dotplot', values: [3, 3, 4, 4, 4, 5, 5, 6, 6, 7, 9], unit: 'minutes' },
        steps: [
          '"More than 5" means strictly greater than 5 — do not count the 5s.',
          'Count the dots over 6, 7, and 9: that\'s 2 + 1 + 1.',
        ],
        answer: '4 ants recorded more than 5 minutes.',
      },
      {
        prompt: 'This distribution is skewed right. Would you report the mean or the median as the "typical" value?',
        chart: { type: 'histogram', bins: [
          { label: '1', count: 6 }, { label: '2', count: 5 }, { label: '3', count: 3 },
          { label: '4', count: 2 }, { label: '5', count: 1 }, { label: '6', count: 1 }, { label: '7', count: 1 },
        ] },
        steps: [
          'The long tail on the right pulls the mean up toward the big values.',
          'The median only cares about position, so the tail barely moves it.',
        ],
        answer: 'The median — it resists the tail and better represents a typical value.',
      },
    ],
  },
  {
    id: 'summaries',
    n: 2,
    title: 'Numerical Summaries',
    emoji: '🔢',
    accent: '#8b5cf6',
    hook: 'One or two numbers that stand in for a whole data set — if you pick the right ones.',
    generate: genSummaries,
    intro: [
      { h: 'Center: mean vs median', body: `The mean is the balancing point (add everything, divide by n). The median is the middle value in order. They agree when data is symmetric and disagree when it's skewed — and the gap between them is itself a clue about shape.` },
      { h: 'Spread: range, IQR, standard deviation', body: `Range = max − min (uses only the extremes). IQR = Q3 − Q1, the width of the middle 50% (ignores the extremes). Standard deviation is the typical distance of a value from the mean. Small spread = consistent; large spread = variable.` },
      { h: 'Resistance', body: `A measure is "resistant" if a wild outlier barely moves it. The median and IQR are resistant. The mean, range, and standard deviation are NOT — a single extreme value can swing them a lot. That's why skewed data is summarized with median + IQR.` },
      { h: 'The five-number summary & boxplots', body: `Min, Q1, Median, Q3, Max — five numbers that draw a boxplot. The box holds the middle 50%; the line inside is the median; the whiskers reach the extremes. Boxplots are built for comparing groups side by side.` },
    ],
    examples: [
      {
        prompt: 'Find the median and IQR of: 4, 6, 7, 9, 10, 14, 18',
        steps: [
          'Already in order; n = 7, so the median is the 4th value: 9.',
          'Lower half (below the median): 4, 6, 7 → Q1 = 6.',
          'Upper half (above the median): 10, 14, 18 → Q3 = 14.',
          'IQR = Q3 − Q1 = 14 − 6 = 8.',
        ],
        answer: 'Median = 9, IQR = 8.',
      },
      {
        prompt: 'A data set has median 50 and mean 61. What does the gap suggest?',
        steps: [
          'The mean sits well above the median.',
          'The mean gets pulled toward a tail; here it\'s pulled high.',
        ],
        answer: 'Skewed to the right — a high tail drags the mean above the median.',
      },
      {
        prompt: 'Every score gets a +5 curve. What happens to the mean and the standard deviation?',
        steps: [
          'Adding a constant slides every value over by 5.',
          'Center (mean, median) shifts up by 5.',
          'Spread depends on DIFFERENCES between values, which are unchanged.',
        ],
        answer: 'Mean rises by 5; standard deviation (and IQR, range) stays the same.',
      },
    ],
  },
  {
    id: 'relationships',
    n: 3,
    title: 'Relationships Between Variables',
    emoji: '📈',
    accent: '#f59e0b',
    hook: 'When two variables move together, how do we measure it — and what can we (not) conclude?',
    generate: genRelationships,
    intro: [
      { h: 'Reading a scatterplot', body: `Describe Direction (positive = rises left-to-right, negative = falls), Form (linear or curved), and Strength (how tightly points hug the pattern). Then note any outliers. Same "describe what you see first" discipline as distributions.` },
      { h: 'Correlation r', body: `r measures the strength and direction of a LINEAR relationship, from −1 to +1. The sign is the direction; the distance from 0 is the strength (|r| ≥ 0.8 strong, ~0.5 moderate, near 0 weak). r has no units and r near 0 doesn't rule out a curved relationship.` },
      { h: 'The regression line & prediction', body: `The least-squares line ŷ = a + bx predicts y from x. The slope b is the predicted change in y for each one-unit increase in x — always state it "in context." The intercept a is the predicted y when x = 0 (sometimes meaningless).` },
      { h: 'Residuals, extrapolation & causation', body: `A residual = observed − predicted; positive means the point sits above the line. Predicting outside the data's x-range (extrapolation) is risky. And the big one: correlation is NOT causation — a lurking variable can drive both.` },
    ],
    examples: [
      {
        prompt: 'The regression line is ŷ = 3 + 2x. Predict y when x = 5, then find the residual if the observed value was 15.',
        steps: [
          'Predict: ŷ = 3 + 2(5) = 13.',
          'Residual = observed − predicted = 15 − 13 = 2.',
          'A positive residual means the point sits above the line.',
        ],
        answer: 'Predicted 13; residual = +2 (point is above the line).',
      },
      {
        prompt: 'Two variables have r = −0.9. Describe the association.',
        steps: [
          'Sign is negative → as one goes up, the other goes down.',
          '|−0.9| = 0.9 ≥ 0.8 → strong.',
        ],
        answer: 'A strong, negative linear association (but still not proof of causation).',
      },
      {
        prompt: 'Ice cream sales and drownings are strongly correlated. Does ice cream cause drownings?',
        steps: [
          'A strong correlation only says they move together.',
          'Look for a lurking variable that could drive both.',
          'Hot summer weather boosts both ice cream sales and swimming.',
        ],
        answer: 'No — a lurking variable (warm weather) explains both. Correlation ≠ causation.',
      },
    ],
  },
]

export function getTopic(id) {
  return TOPICS.find((t) => t.id === id) ?? null
}

// ── Mixed-review checkpoints ─────────────────────────────────────────────────
// Stats is cumulative; retention breaks down between units. After every 3
// topics we drop in a checkpoint that pulls questions from all prior topics.
export const CHECKPOINTS = [
  {
    id: 'checkpoint-a',
    title: 'Checkpoint A — Mixed Review',
    emoji: '🧩',
    accent: '#14b8a6',
    afterTopic: 'relationships', // unlocks once Topics 1–3 are in play
    sources: ['describing', 'summaries', 'relationships'],
    blurb: 'A little of everything from Topics 1–3. Stats builds on itself — keep it all fresh.',
    generate(tier, skill) {
      const srcId = this.sources[Math.floor(Math.random() * this.sources.length)]
      const q = getTopic(srcId).generate(tier, skill)
      return { ...q, sourceTopicId: srcId }
    },
  },
]

export function getCheckpoint(id) {
  return CHECKPOINTS.find((c) => c.id === id) ?? null
}
