import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { roundedAngles, anglesOf } from '../lib/triangles'

const GRID = 12
const CELL = 38
const PAD = 30
const SIZE = PAD * 2 + GRID * CELL

// Per-vertex accent colors (shared by arcs, labels, handles, and readout chips).
export const VERTEX_COLORS = ['#22c55e', '#3b82f6', '#f59e0b']
export const VERTEX_NAMES = ['A', 'B', 'C']

const toPx = (p) => ({ x: PAD + p.x * CELL, y: PAD + p.y * CELL })

// Arc path at vertex V between neighbors P and Q (screen coords). Sweeps the
// minor (interior) angle, bulging toward the triangle's inside automatically.
function arcAt(V, P, Q, r) {
  const a1 = Math.atan2(P.y - V.y, P.x - V.x)
  const a2 = Math.atan2(Q.y - V.y, Q.x - V.x)
  let d = a2 - a1
  while (d <= -Math.PI) d += 2 * Math.PI
  while (d > Math.PI) d -= 2 * Math.PI
  const sweep = d > 0 ? 1 : 0
  const s = { x: V.x + r * Math.cos(a1), y: V.y + r * Math.sin(a1) }
  const e = { x: V.x + r * Math.cos(a2), y: V.y + r * Math.sin(a2) }
  return `M ${s.x} ${s.y} A ${r} ${r} 0 0 ${sweep} ${e.x} ${e.y}`
}

// Inward (bisector) direction at V — used to place the angle label inside.
function inwardDir(V, P, Q) {
  const u = (T) => {
    const dx = T.x - V.x, dy = T.y - V.y
    const L = Math.hypot(dx, dy) || 1
    return { x: dx / L, y: dy / L }
  }
  const a = u(P), b = u(Q)
  const x = a.x + b.x, y = a.y + b.y
  const L = Math.hypot(x, y) || 1
  return { x: x / L, y: y / L }
}

export default function TriangleStage({ vertices, onChange, snap = true }) {
  const svgRef = useRef(null)
  const [drag, setDrag] = useState(null) // index being dragged

  const px = vertices.map(toPx)
  const labels = roundedAngles(vertices[0], vertices[1], vertices[2])
  const exact = anglesOf(vertices[0], vertices[1], vertices[2])
  const labelArr = [labels.A, labels.B, labels.C]
  const exactArr = [exact.A, exact.B, exact.C]

  const clientToGrid = (clientX, clientY) => {
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = clientX; pt.y = clientY
    const p = pt.matrixTransform(svg.getScreenCTM().inverse())
    let gx = (p.x - PAD) / CELL
    let gy = (p.y - PAD) / CELL
    if (snap) { gx = Math.round(gx); gy = Math.round(gy) }
    gx = Math.max(0, Math.min(GRID, gx))
    gy = Math.max(0, Math.min(GRID, gy))
    return { x: gx, y: gy }
  }

  useEffect(() => {
    if (drag === null) return
    const move = (e) => {
      const p = e.touches ? e.touches[0] : e
      const next = vertices.map((v, i) => (i === drag ? clientToGrid(p.clientX, p.clientY) : v))
      onChange(next)
    }
    const end = () => setDrag(null)
    document.body.classList.add('dragging')
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', end)
    window.addEventListener('touchmove', move, { passive: false })
    window.addEventListener('touchend', end)
    return () => {
      document.body.classList.remove('dragging')
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', end)
      window.removeEventListener('touchmove', move)
      window.removeEventListener('touchend', end)
    }
  }, [drag, vertices]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="w-full h-auto max-w-[480px] mx-auto touch-none select-none"
    >
      {/* Grid */}
      {Array.from({ length: GRID + 1 }).map((_, i) => (
        <g key={i}>
          <line x1={PAD + i * CELL} y1={PAD} x2={PAD + i * CELL} y2={PAD + GRID * CELL} stroke="#eef2f7" strokeWidth="1" />
          <line x1={PAD} y1={PAD + i * CELL} x2={PAD + GRID * CELL} y2={PAD + i * CELL} stroke="#eef2f7" strokeWidth="1" />
        </g>
      ))}
      <rect x={PAD} y={PAD} width={GRID * CELL} height={GRID * CELL} fill="none" stroke="#e2e8f0" strokeWidth="1.5" />

      {/* Triangle body */}
      <polygon points={px.map((p) => `${p.x},${p.y}`).join(' ')} fill="#eef2ff" stroke="#1f2937" strokeWidth="3" strokeLinejoin="round" />

      {/* Angle arcs + degree labels */}
      {px.map((V, i) => {
        const P = px[(i + 1) % 3]
        const Q = px[(i + 2) % 3]
        const color = VERTEX_COLORS[i]
        const isRight = Math.abs(exactArr[i] - 90) < 0.6
        const dir = inwardDir(V, P, Q)
        const lp = { x: V.x + dir.x * 46, y: V.y + dir.y * 46 }
        return (
          <g key={i}>
            {isRight ? (
              <RightMarker V={V} P={P} Q={Q} color={color} />
            ) : (
              <path d={arcAt(V, P, Q, 26)} fill="none" stroke={color} strokeWidth="3" />
            )}
            <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="17" fontWeight="bold" fill={color}>
              {labelArr[i]}°
            </text>
          </g>
        )
      })}

      {/* Vertex handles */}
      {px.map((V, i) => (
        <g key={`h${i}`}>
          <motion.circle
            cx={V.x} cy={V.y} r="11"
            fill="white" stroke={VERTEX_COLORS[i]} strokeWidth="4"
            className="cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => { e.preventDefault(); setDrag(i) }}
            onTouchStart={(e) => { e.preventDefault(); setDrag(i) }}
            whileHover={{ scale: 1.15 }}
            animate={drag === i ? { scale: 1.25 } : { scale: 1 }}
          />
          <text x={V.x} y={V.y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="bold" fill={VERTEX_COLORS[i]} pointerEvents="none">
            {VERTEX_NAMES[i]}
          </text>
        </g>
      ))}
    </svg>
  )
}

// Small square drawn in a right-angle corner.
function RightMarker({ V, P, Q, color }) {
  const u = (T) => {
    const dx = T.x - V.x, dy = T.y - V.y
    const L = Math.hypot(dx, dy) || 1
    return { x: dx / L, y: dy / L }
  }
  const a = u(P), b = u(Q)
  const s = 16
  const p1 = { x: V.x + a.x * s, y: V.y + a.y * s }
  const p2 = { x: V.x + a.x * s + b.x * s, y: V.y + a.y * s + b.y * s }
  const p3 = { x: V.x + b.x * s, y: V.y + b.y * s }
  return <path d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`} fill="none" stroke={color} strokeWidth="2.5" />
}
