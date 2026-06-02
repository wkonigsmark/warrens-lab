import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const GRID = 12
const CELL = 38
const PAD = 30
const SIZE = PAD * 2 + GRID * CELL
const CXG = 6, CYG = 6 // center in grid units
const CXP = PAD + CXG * CELL
const CYP = PAD + CYG * CELL
const MIN_R = 1
const MAX_R = 5

// Drag the edge handle (any direction) to grow/shrink the radius. Radius snaps
// to whole units for clean numbers; the handle keeps the drag direction.
export default function CircleStage({ radius, onRadiusChange, snap = true, showDiameter = true }) {
  const svgRef = useRef(null)
  const [angle, setAngle] = useState(0)
  const [dragging, setDragging] = useState(false)

  const rPx = radius * CELL
  const hx = CXP + rPx * Math.cos(angle)
  const hy = CYP + rPx * Math.sin(angle)

  const update = (clientX, clientY) => {
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = clientX; pt.y = clientY
    const p = pt.matrixTransform(svg.getScreenCTM().inverse())
    const dx = p.x - CXP, dy = p.y - CYP
    setAngle(Math.atan2(dy, dx))
    let r = Math.hypot(dx, dy) / CELL
    if (snap) r = Math.round(r)
    onRadiusChange(Math.max(MIN_R, Math.min(MAX_R, r)))
  }

  useEffect(() => {
    if (!dragging) return
    const move = (e) => { const p = e.touches ? e.touches[0] : e; update(p.clientX, p.clientY) }
    const end = () => setDragging(false)
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
  }, [dragging, snap]) // eslint-disable-line react-hooks/exhaustive-deps

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

      {/* Circle */}
      <circle cx={CXP} cy={CYP} r={rPx} fill="#eef2ff" stroke="#1f2937" strokeWidth="3" />

      {/* Diameter (faint) */}
      {showDiameter && (
        <line x1={CXP - rPx} y1={CYP} x2={CXP + rPx} y2={CYP} stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" />
      )}

      {/* Radius line */}
      <line x1={CXP} y1={CYP} x2={hx} y2={hy} stroke="#6366f1" strokeWidth="3.5" />
      <text
        x={(CXP + hx) / 2} y={(CYP + hy) / 2 - 10}
        textAnchor="middle" fontSize="16" fontWeight="bold" fill="#6366f1"
      >
        r = {radius}
      </text>

      {/* Center + handle */}
      <circle cx={CXP} cy={CYP} r="5" fill="#1f2937" />
      <motion.circle
        cx={hx} cy={hy} r="11"
        fill="white" stroke="#6366f1" strokeWidth="4"
        className="cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => { e.preventDefault(); setDragging(true) }}
        onTouchStart={(e) => { e.preventDefault(); setDragging(true) }}
        whileHover={{ scale: 1.15 }}
        animate={dragging ? { scale: 1.25 } : { scale: 1 }}
      />
    </svg>
  )
}
