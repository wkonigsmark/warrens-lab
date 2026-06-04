// Pythagorean question generators. Use Pythagorean triples so every answer is a
// clean whole number. Same question shape as the angle/circle generators.
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

// [leg, leg, hypotenuse]
const TRIPLES = [
  [3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15],
  [8, 15, 17], [12, 16, 20], [7, 24, 25], [20, 21, 29],
]

// Find the hypotenuse from the two legs.
function genHypotenuse() {
  const [x, y, z] = pick(TRIPLES)
  const [a, b] = Math.random() < 0.5 ? [x, y] : [y, x]
  return {
    type: 'number', figure: 'rightTriangle', a, b,
    labelA: `${a}`, labelB: `${b}`, labelC: '?',
    promptTitle: 'Find the length of the hypotenuse.',
    promptText: 'Use a² + b² = c².',
    unit: '', hint: `${a}² + ${b}² = c²`, tolerance: 0,
    answer: z, formatAnswer: `${z}`, formatGuess: (g) => `${g}`,
  }
}

// Find a missing leg from one leg and the hypotenuse.
function genMissingLeg() {
  const [x, y, z] = pick(TRIPLES)
  const knownIsX = Math.random() < 0.5
  const known = knownIsX ? x : y
  const unknown = knownIsX ? y : x
  return {
    type: 'number', figure: 'rightTriangle', a: known, b: unknown,
    labelA: `${known}`, labelB: '?', labelC: `${z}`,
    promptTitle: 'Find the length of the missing leg.',
    promptText: 'Use a² + b² = c² (c is the longest side).',
    unit: '', hint: `${known}² + b² = ${z}²`, tolerance: 0,
    answer: unknown, formatAnswer: `${unknown}`, formatGuess: (g) => `${g}`,
  }
}

export const TRIANGLE_GENERATORS = {
  hypotenuse: genHypotenuse,
  missingLeg: genMissingLeg,
}

export const TRIANGLE_LEVELS = [
  { id: 12, title: 'Find the Hypotenuse', blurb: 'Two legs given — use a² + b² = c² to find the longest side.', accent: '#f59e0b', category: 'Right Triangles', generate: genHypotenuse },
  { id: 13, title: 'Find a Missing Leg', blurb: 'A leg and the hypotenuse given — find the other leg.', accent: '#22c55e', category: 'Right Triangles', generate: genMissingLeg },
]
