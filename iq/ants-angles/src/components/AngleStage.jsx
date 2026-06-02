import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  pointToDegrees,
  degreesToVector,
  snapTo,
  classifyAngle,
  arcPath,
} from '../lib/angles'

const SIZE = 480
const CX = SIZE / 2
const CY = SIZE / 2
const RAY_LEN = 190
const ARC_R = 70

// The draggable protractor. A fixed ray points east (0°); the second ray is
// dragged by its handle, and `angle` (0–360, CCW) flows back up to the parent
// so the readout panel can recompute live — same data-flow idea as the
// Chart→Calculations link in Ants & Axes.
export default function AngleStage({
  angle,
  onAngleChange,
  snap = 0,
  showProtractor = true,
  interactive = true,
  showLabel = true,
}) {
  const svgRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const cls = classifyAngle(angle)
  const baseEnd = { x: CX + RAY_LEN, y: CY }
  const movingVec = degreesToVector(angle, RAY_LEN)
  const movingEnd = { x: CX + movingVec.x, y: CY + movingVec.y }
  const labelVec = degreesToVector(angle / 2, ARC_R + 26)

  const clientToDegrees = (clientX, clientY) => {
    const svg = svgRef.current
    if (!svg) return angle
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const p = pt.matrixTransform(svg.getScreenCTM().inverse())
    const deg = pointToDegrees(p.x - CX, p.y - CY)
    return snap ? snapTo(deg, snap) % 360 : deg
  }

  const startDrag = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  useEffect(() => {
    if (!dragging) return
    const move = (e) => {
      const pt = e.touches ? e.touches[0] : e
      onAngleChange(clientToDegrees(pt.clientX, pt.clientY))
    }
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
  }, [dragging]) // eslint-disable-line react-hooks/exhaustive-deps

  // Tap anywhere on the stage to swing the ray there too (not just the handle).
  const handleStageClick = (e) => {
    if (!interactive || dragging) return
    onAngleChange(clientToDegrees(e.clientX, e.clientY))
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={`w-full h-auto max-w-[520px] mx-auto touch-none select-none ${interactive ? 'cursor-pointer' : ''}`}
      onClick={interactive ? handleStageClick : undefined}
    >
      {/* Protractor backdrop */}
      {showProtractor && (
        <g>
          <circle cx={CX} cy={CY} r={RAY_LEN + 8} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
          {Array.from({ length: 72 }).map((_, i) => {
            const deg = i * 5
            const major = deg % 30 === 0
            const inner = degreesToVector(deg, RAY_LEN + (major ? -6 : 0))
            const outer = degreesToVector(deg, RAY_LEN + 8)
            return (
              <line
                key={deg}
                x1={CX + inner.x}
                y1={CY + inner.y}
                x2={CX + outer.x}
                y2={CY + outer.y}
                stroke={major ? '#94a3b8' : '#cbd5e1'}
                strokeWidth={major ? 1.5 : 1}
              />
            )
          })}
          {Array.from({ length: 12 }).map((_, i) => {
            const deg = i * 30
            const v = degreesToVector(deg, RAY_LEN + 24)
            return (
              <text
                key={deg}
                x={CX + v.x}
                y={CY + v.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13"
                fill="#94a3b8"
                fontWeight="500"
              >
                {deg}
              </text>
            )
          })}
        </g>
      )}

      {/* Swept angle arc */}
      {angle > 0 && (
        <path d={arcPath(CX, CY, ARC_R, angle)} fill="none" stroke={cls.color} strokeWidth="4" strokeLinecap="round" />
      )}

      {/* Right-angle square marker */}
      {Math.round(angle) === 90 && (
        <path
          d={`M ${CX + 26} ${CY} L ${CX + 26} ${CY - 26} L ${CX} ${CY - 26}`}
          fill="none"
          stroke={cls.color}
          strokeWidth="3"
        />
      )}

      {/* Fixed base ray (east) */}
      <line x1={CX} y1={CY} x2={baseEnd.x} y2={baseEnd.y} stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />

      {/* Moving ray */}
      <line x1={CX} y1={CY} x2={movingEnd.x} y2={movingEnd.y} stroke={cls.color} strokeWidth="4" strokeLinecap="round" />

      {/* Degree label inside the arc */}
      {showLabel && (
        <text
          x={CX + labelVec.x}
          y={CY + labelVec.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="26"
          fontWeight="bold"
          fill={cls.color}
        >
          {Math.round(angle)}°
        </text>
      )}

      {/* Vertex */}
      <circle cx={CX} cy={CY} r="6" fill="#1f2937" />

      {/* Handle — draggable when interactive, otherwise a static endpoint dot */}
      {interactive ? (
        <motion.circle
          cx={movingEnd.x}
          cy={movingEnd.y}
          r="13"
          fill="white"
          stroke={cls.color}
          strokeWidth="4"
          className="cursor-grab active:cursor-grabbing"
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          whileHover={{ scale: 1.15 }}
          animate={dragging ? { scale: 1.2 } : { scale: 1 }}
        />
      ) : (
        <circle cx={movingEnd.x} cy={movingEnd.y} r="7" fill={cls.color} />
      )}
    </svg>
  )
}
