import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { pointInPolygon } from '../lib/polygons'

const GRID = 12
const CELL = 38
const PAD = 30
const SIZE = PAD * 2 + GRID * CELL

const toPx = (p) => ({ x: PAD + p.x * CELL, y: PAD + p.y * CELL })

export default function PolygonStage({ vertices, onChange, snap = true, showSquares = false }) {
  const svgRef = useRef(null)
  const [drag, setDrag] = useState(null)

  const px = vertices.map(toPx)

  // Unit cells whose center sits inside the polygon — the "countable" area.
  const filled = []
  if (showSquares) {
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        if (pointInPolygon({ x: i + 0.5, y: j + 0.5 }, vertices)) filled.push({ i, j })
      }
    }
  }

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
      onChange(vertices.map((v, i) => (i === drag ? clientToGrid(p.clientX, p.clientY) : v)))
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
    <svg ref={svgRef} viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto max-w-[480px] mx-auto touch-none select-none">
      {/* Grid */}
      {Array.from({ length: GRID + 1 }).map((_, i) => (
        <g key={i}>
          <line x1={PAD + i * CELL} y1={PAD} x2={PAD + i * CELL} y2={PAD + GRID * CELL} stroke="#eef2f7" strokeWidth="1" />
          <line x1={PAD} y1={PAD + i * CELL} x2={PAD + GRID * CELL} y2={PAD + i * CELL} stroke="#eef2f7" strokeWidth="1" />
        </g>
      ))}
      <rect x={PAD} y={PAD} width={GRID * CELL} height={GRID * CELL} fill="none" stroke="#e2e8f0" strokeWidth="1.5" />

      {/* Unit-square fill — each cell outlined so they stay countable */}
      {filled.map(({ i, j }) => (
        <rect
          key={`${i}-${j}`}
          x={PAD + i * CELL} y={PAD + j * CELL} width={CELL} height={CELL}
          fill="#6366f1" fillOpacity="0.16"
          stroke="#6366f1" strokeOpacity="0.5" strokeWidth="1"
        />
      ))}

      {/* Polygon body */}
      <polygon points={px.map((p) => `${p.x},${p.y}`).join(' ')} fill={showSquares ? 'none' : '#eef2ff'} stroke="#1f2937" strokeWidth="3" strokeLinejoin="round" />

      {/* Vertex handles */}
      {px.map((V, i) => (
        <motion.circle
          key={i}
          cx={V.x} cy={V.y} r="9"
          fill="white" stroke="#6366f1" strokeWidth="3.5"
          className="cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => { e.preventDefault(); setDrag(i) }}
          onTouchStart={(e) => { e.preventDefault(); setDrag(i) }}
          whileHover={{ scale: 1.2 }}
          animate={drag === i ? { scale: 1.3 } : { scale: 1 }}
        />
      ))}
    </svg>
  )
}
