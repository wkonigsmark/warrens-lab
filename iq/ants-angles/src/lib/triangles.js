// Pure triangle geometry — framework-free so the stage, readout, and any future
// quiz/worksheet can share it. Vertices are {x, y} in grid units.

const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y)

// Side lengths, each named for the vertex it sits opposite (a opposite A, …).
export function sideLengths(A, B, C) {
  return { a: dist(B, C), b: dist(C, A), c: dist(A, B) }
}

// Interior angle (degrees) between sides of length x and y, opposite side `opp`.
function lawOfCosines(x, y, opp) {
  if (x === 0 || y === 0) return 0
  let cos = (x * x + y * y - opp * opp) / (2 * x * y)
  cos = Math.max(-1, Math.min(1, cos)) // guard rounding / degenerate cases
  return (Math.acos(cos) * 180) / Math.PI
}

// Exact interior angles at each vertex.
export function anglesOf(A, B, C) {
  const { a, b, c } = sideLengths(A, B, C)
  return {
    A: lawOfCosines(b, c, a),
    B: lawOfCosines(a, c, b),
    C: lawOfCosines(a, b, c),
  }
}

// Integer angles that are guaranteed to sum to exactly 180 (for clean labels).
export function roundedAngles(A, B, C) {
  const ang = anglesOf(A, B, C)
  const ra = Math.round(ang.A)
  const rb = Math.round(ang.B)
  return { A: ra, B: rb, C: 180 - ra - rb }
}

export function perimeter(A, B, C) {
  const { a, b, c } = sideLengths(A, B, C)
  return a + b + c
}

// Shoelace area (always positive).
export function area(A, B, C) {
  return Math.abs((A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y)) / 2)
}

// Classify by largest angle. `right` wins if an angle is ~90°.
export function classifyByAngle(A, B, C) {
  const ang = anglesOf(A, B, C)
  const max = Math.max(ang.A, ang.B, ang.C)
  if (Math.abs(max - 90) < 0.6) return { name: 'Right', color: '#3b82f6' }
  if (max > 90) return { name: 'Obtuse', color: '#f59e0b' }
  return { name: 'Acute', color: '#22c55e' }
}

// Classify by equal sides (relative tolerance keeps dragging forgiving).
export function classifyBySide(A, B, C) {
  const { a, b, c } = sideLengths(A, B, C)
  const eq = (m, n) => Math.abs(m - n) <= 0.06 * Math.max(m, n)
  const ab = eq(a, b), bc = eq(b, c), ca = eq(c, a)
  if (ab && bc) return { name: 'Equilateral', color: '#8b5cf6' }
  if (ab || bc || ca) return { name: 'Isosceles', color: '#ec4899' }
  return { name: 'Scalene', color: '#0ea5e9' }
}

// True if the triangle is degenerate (vertices nearly collinear).
export function isDegenerate(A, B, C) {
  return area(A, B, C) < 0.25
}

// Pythagorean colors by square size: [smallest leg, other leg, hypotenuse].
export const PYTHAG_COLORS = ['#22c55e', '#6366f1', '#f59e0b']

// The three side-squares' areas, ascending, with whether a² + b² = c².
export function pythagorean(A, B, C) {
  const { a, b, c } = sideLengths(A, B, C)
  const sorted = [a * a, b * b, c * c].sort((x, y) => x - y)
  const [s0, s1, s2] = sorted
  const isRight = Math.abs(s0 + s1 - s2) <= 0.06 * s2
  return { legs: [s0, s1], hyp: s2, sum: s0 + s1, isRight }
}
