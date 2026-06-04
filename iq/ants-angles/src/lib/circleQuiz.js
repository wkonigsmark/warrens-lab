// Circle question generators — same shape as the angle generators so they plug
// straight into QuizShell and the worksheet builder. π ≈ 3.14 throughout.
import { PI_KID } from './circles'

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const round1 = (n) => Math.round(n * 10) / 10

// Radius ↔ Diameter (d = 2r) ---------------------------------------------
function genRadiusDiameter() {
  if (pick([true, false])) {
    const r = randInt(2, 10)
    return {
      type: 'number', figure: 'circle', mark: 'radius', markLabel: `${r}`,
      promptTitle: `The radius is ${r}. What is the diameter?`,
      promptText: 'The diameter goes all the way across, through the center.',
      unit: '', hint: 'diameter = 2 × radius', tolerance: 0,
      answer: 2 * r, formatAnswer: `${2 * r}`, formatGuess: (g) => `${g}`,
    }
  }
  const d = randInt(2, 9) * 2
  return {
    type: 'number', figure: 'circle', mark: 'diameter', markLabel: `${d}`,
    promptTitle: `The diameter is ${d}. What is the radius?`,
    promptText: 'The radius reaches from the center to the edge.',
    unit: '', hint: 'radius = diameter ÷ 2', tolerance: 0,
    answer: d / 2, formatAnswer: `${d / 2}`, formatGuess: (g) => `${g}`,
  }
}

// Circumference (C = π d) ------------------------------------------------
function genCircumference() {
  const d = randInt(2, 10)
  const ans = round1(PI_KID * d)
  return {
    type: 'number', figure: 'circle', mark: 'diameter', markLabel: `${d}`,
    promptTitle: `The diameter is ${d}. Find the circumference.`,
    promptText: 'Use π ≈ 3.14.',
    unit: '', hint: `C = π × diameter = 3.14 × ${d}`, tolerance: 0.5,
    answer: ans, formatAnswer: `${ans}`, formatGuess: (g) => `${g}`,
  }
}

// Area (A = π r²) --------------------------------------------------------
function genArea() {
  const r = randInt(2, 8)
  const ans = round1(PI_KID * r * r)
  return {
    type: 'number', figure: 'circle', mark: 'radius', markLabel: `${r}`,
    promptTitle: `The radius is ${r}. Find the area.`,
    promptText: 'Use π ≈ 3.14.',
    unit: '', hint: `Area = π × r × r = 3.14 × ${r} × ${r}`, tolerance: 0.5,
    answer: ans, formatAnswer: `${ans}`, formatGuess: (g) => `${g}`,
  }
}

// Name the part (MCQ) ----------------------------------------------------
function genNamePart() {
  const part = pick(['Radius', 'Diameter', 'Circumference'])
  const mark = part.toLowerCase()
  const desc = part === 'Circumference' ? 'highlighted curve' : 'highlighted line'
  return {
    type: 'choice', figure: 'circle', mark, markLabel: null,
    promptTitle: `What is the ${desc}?`,
    promptText: 'Look at the part of the circle shown in color.',
    choices: ['Radius', 'Diameter', 'Circumference'],
    answer: part, formatAnswer: part, formatGuess: (g) => `${g}`,
  }
}

export const CIRCLE_GENERATORS = {
  radiusDiameter: genRadiusDiameter,
  circumference: genCircumference,
  circleArea: genArea,
  namePart: genNamePart,
}

export const CIRCLE_LEVELS = [
  { id: 8, title: 'Radius & Diameter', blurb: 'The diameter is twice the radius — find one from the other.', accent: '#0ea5e9', category: 'Circles', generate: genRadiusDiameter },
  { id: 9, title: 'Name the Part', blurb: 'Radius, diameter or circumference? Spot each part of a circle.', accent: '#14b8a6', category: 'Circles', generate: genNamePart },
  { id: 10, title: 'Circumference', blurb: 'Go around the circle: C = π × diameter (use 3.14).', accent: '#8b5cf6', category: 'Circles', generate: genCircumference, decimals: true },
  { id: 11, title: 'Area of a Circle', blurb: 'Fill the circle: A = π × r × r (use 3.14).', accent: '#ec4899', category: 'Circles', generate: genArea, decimals: true },
]
