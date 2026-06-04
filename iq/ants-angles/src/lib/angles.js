// Pure geometry helpers for Ants & Angles.
// Kept framework-free so they can be reused by the playground, quiz, and
// worksheet generators alike (mirrors the calc-panel philosophy of Ants & Axes).

export const TAU = Math.PI * 2

// Convert a pointer position (relative to the vertex) into a 0–360° measure,
// taken counter-clockwise from the positive x-axis (east). Screen-y points
// down, so we negate dy to get the familiar "up = bigger angle" feel.
export function pointToDegrees(dx, dy) {
  let deg = (Math.atan2(-dy, dx) * 180) / Math.PI
  if (deg < 0) deg += 360
  return deg
}

export function degreesToVector(deg, radius) {
  const rad = (deg * Math.PI) / 180
  return { x: Math.cos(rad) * radius, y: -Math.sin(rad) * radius }
}

export function snapTo(value, step) {
  if (!step) return value
  return Math.round(value / step) * step
}

// Classify a single angle the way a kid would name it.
export function classifyAngle(deg) {
  const d = Math.round(deg)
  if (d === 0 || d === 360) return { name: 'Zero angle', color: '#9ca3af' }
  if (d < 90) return { name: 'Acute angle', color: '#22c55e' }
  if (d === 90) return { name: 'Right angle', color: '#3b82f6' }
  if (d < 180) return { name: 'Obtuse angle', color: '#f59e0b' }
  if (d === 180) return { name: 'Straight angle', color: '#8b5cf6' }
  return { name: 'Reflex angle', color: '#ef4444' }
}

// Complement (sums to 90°) — only defined for acute angles.
export function complementOf(deg) {
  return deg < 90 ? 90 - deg : null
}

// Supplement (sums to 180°) — defined while the angle is below a straight line.
export function supplementOf(deg) {
  return deg < 180 ? 180 - deg : null
}

// Build the SVG path for an angle arc swept CCW from 0° to `deg`.
export function arcPath(cx, cy, radius, deg) {
  return arcBetween(cx, cy, radius, 0, deg)
}

// SVG arc path between two CCW angles a→b (screen-y down, so sweep-flag 0).
export function arcBetween(cx, cy, radius, a, b) {
  if (b <= a) return ''
  const start = degreesToVector(a, radius)
  const end = degreesToVector(b, radius)
  const largeArc = Math.abs(b - a) > 180 ? 1 : 0
  return `M ${cx + start.x} ${cy + start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${cx + end.x} ${cy + end.y}`
}
