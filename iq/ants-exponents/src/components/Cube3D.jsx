// Isometric n×n×n cube of unit blocks — the headline visual for the Cubes
// lesson. Shows three faces (top, right, left), each divided into an n×n grid,
// so a child can literally count n along each edge and see why n³ fills a cube.
// Same indigo palette as DotArray (the square grid), so square→cube feels like
// the same family of pictures with one more dimension.

const COS30 = Math.cos(Math.PI / 6) // ≈ 0.866

const TOP = '#a5b4fc'   // indigo-300 — lit top
const RIGHT = '#6366f1' // indigo-500 — right face
const LEFT = '#4338ca'  // indigo-700 — shaded left face
const GRID = '#312e81'  // indigo-900 — cell lines + silhouette

export default function Cube3D({ n = 3, size = 200 }) {
  const s = size / 2 / n // unit-cell edge in px, so the whole cube ≈ `size` tall
  const w = s * COS30
  const pad = 14
  const width = 2 * n * w + pad * 2
  const height = 2 * n * s + pad * 2
  const ox = width / 2
  const oy = pad + n * s

  // project a 3-D lattice point (i = right, j = depth, k = up), each in 0..n
  const P = (i, j, k) => [ox + (i - j) * w, oy + (i + j) * 0.5 * s - k * s]
  const poly = (...corners) => corners.map((c) => P(...c).join(',')).join(' ')

  // the three visible faces — the ones meeting at the FRONT vertex (n,n,·):
  // top (z=n), front-right (x=n), front-left (y=n)
  const topFace = poly([0, 0, n], [n, 0, n], [n, n, n], [0, n, n])
  const rightFace = poly([n, 0, 0], [n, n, 0], [n, n, n], [n, 0, n])
  const leftFace = poly([0, n, 0], [n, n, 0], [n, n, n], [0, n, n])

  // grid lines on each face
  const lines = []
  for (let a = 0; a <= n; a++) {
    lines.push([P(a, 0, n), P(a, n, n)], [P(0, a, n), P(n, a, n)]) // top (z=n)
    lines.push([P(n, a, 0), P(n, a, n)], [P(n, 0, a), P(n, n, a)]) // front-right (x=n)
    lines.push([P(a, n, 0), P(a, n, n)], [P(0, n, a), P(n, n, a)]) // front-left (y=n)
  }

  // outer hexagon silhouette
  const silhouette = poly([0, 0, n], [n, 0, n], [n, 0, 0], [n, n, 0], [0, n, 0], [0, n, n])

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="max-w-full h-auto">
      <polygon points={leftFace} fill={LEFT} />
      <polygon points={rightFace} fill={RIGHT} />
      <polygon points={topFace} fill={TOP} />
      {lines.map(([a, b], i) => (
        <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={GRID} strokeWidth="1.5" strokeOpacity="0.45" />
      ))}
      <polygon points={silhouette} fill="none" stroke={GRID} strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  )
}
