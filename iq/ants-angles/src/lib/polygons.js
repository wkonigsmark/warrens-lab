// Pure polygon geometry — framework-free, shared by the stage & readout.
// Vertices are {x, y} in grid units, listed in order around the polygon.

const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y)

export const POLYGON_NAMES = {
  3: 'Triangle',
  4: 'Quadrilateral',
  5: 'Pentagon',
  6: 'Hexagon',
  7: 'Heptagon',
  8: 'Octagon',
}

export function polygonName(n) {
  return POLYGON_NAMES[n] || `${n}-gon`
}

// Shoelace area (always positive).
export function area(verts) {
  let sum = 0
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i]
    const b = verts[(i + 1) % verts.length]
    sum += a.x * b.y - b.x * a.y
  }
  return Math.abs(sum) / 2
}

export function perimeter(verts) {
  let total = 0
  for (let i = 0; i < verts.length; i++) {
    total += dist(verts[i], verts[(i + 1) % verts.length])
  }
  return total
}

export function sideLengths(verts) {
  return verts.map((v, i) => dist(v, verts[(i + 1) % verts.length]))
}

// Interior angle (degrees) at each vertex.
export function interiorAngles(verts) {
  return verts.map((cur, i) => {
    const prev = verts[(i - 1 + verts.length) % verts.length]
    const next = verts[(i + 1) % verts.length]
    const u = { x: prev.x - cur.x, y: prev.y - cur.y }
    const w = { x: next.x - cur.x, y: next.y - cur.y }
    const dot = u.x * w.x + u.y * w.y
    const mag = Math.hypot(u.x, u.y) * Math.hypot(w.x, w.y) || 1
    return (Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI
  })
}

// A polygon is "regular" when every side AND every angle are equal.
export function isRegular(verts) {
  if (verts.length < 3) return false
  const sides = sideLengths(verts)
  const angs = interiorAngles(verts)
  const near = (arr, tol) => Math.max(...arr) - Math.min(...arr) <= tol * Math.max(...arr)
  return near(sides, 0.06) && near(angs.map((a) => a + 0.0001), 0.04)
}

// Axis-aligned rectangle? Returns {w, h} (grid units) or null.
export function asRectangle(verts) {
  if (verts.length !== 4) return null
  const xs = [...new Set(verts.map((v) => Math.round(v.x * 100) / 100))]
  const ys = [...new Set(verts.map((v) => Math.round(v.y * 100) / 100))]
  if (xs.length !== 2 || ys.length !== 2) return null
  return { w: Math.abs(xs[0] - xs[1]), h: Math.abs(ys[0] - ys[1]) }
}

// Ray-casting point-in-polygon test (for the unit-square fill).
export function pointInPolygon(pt, verts) {
  let inside = false
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
    const a = verts[i], b = verts[j]
    const intersect =
      a.y > pt.y !== b.y > pt.y &&
      pt.x < ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x
    if (intersect) inside = !inside
  }
  return inside
}

export function isDegenerate(verts) {
  return area(verts) < 0.25
}

// Vertices of a regular n-gon centered at (cx, cy), first vertex at the top.
export function regularPolygon(n, cx, cy, r) {
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  })
}
