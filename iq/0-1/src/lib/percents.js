// Shared percent helpers for Play and Challenge.

// Friendly percents and the fraction names kids already know from the lessons.
export const FRACS = { 0: '0', 25: '1/4', 50: '1/2', 75: '3/4', 100: '1 whole' }
export const FRAC_WORDS = { 25: 'one quarter', 50: 'one half', 75: 'three quarters', 100: 'one whole' }

export const CORE = [25, 50, 75, 100]
export const TENS = [10, 20, 30, 40, 60, 70, 80, 90]
export const FRIENDLY = [...CORE, ...TENS]

// Weighted pool — the core ¼·½·¾·whole values show up more often, so early
// questions lean toward the easy, confidence-building wins.
export const POOL = [...CORE, ...CORE, ...TENS]

export const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]

// A short, upbeat line for a correct answer — names the fraction when there is one.
export function praise(v) {
  switch (v) {
    case 0: return '0% — none at all!'
    case 25: return '25% is one quarter! 🟦'
    case 50: return '50% is half! 🍕'
    case 75: return '75% is three quarters!'
    case 100: return '100% — the whole thing! 🎉'
    default: return `${v}% — nice one!`
  }
}
