// Pure, framework-free fraction helpers — the source of truth for the few bits
// of arithmetic the UI needs (mainly: reducing a fraction to its simplest form).

export function gcd(a, b) {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a || 1
}

export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b)
}

// Reduce num/den to lowest terms, e.g. simplify(2,4) -> { num:1, den:2 }.
export function simplify(num, den) {
  if (num === 0) return { num: 0, den: 1 }
  const g = gcd(num, den)
  return { num: num / g, den: den / g }
}

// Is num/den already in lowest terms?
export function isSimplest(num, den) {
  return gcd(num, den) === 1
}
