import { useRef } from 'react'
import { motion } from 'framer-motion'

const GRID_SIZE = 480
const CELL_SIZE = 40
const MAX_VALUE = 12
const TOP_PADDING = 25

export default function Chart({ points, onPointClick, showCoordinates = true }) {
  const svgRef = useRef(null)

  const handleSvgClick = (e) => {
    if (!svgRef.current) return

    // Convert screen coords to SVG viewBox coords (works regardless of display size)
    const pt = svgRef.current.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM().inverse())

    const x = svgP.x - 50 // offset for Y-axis labels
    const y = svgP.y - TOP_PADDING // offset for top padding

    // Convert pixel coords to grid coords
    const gridX = Math.round(x / CELL_SIZE)
    const gridY = Math.round(y / CELL_SIZE)

    // Convert screen Y to math Y (flip it)
    const mathY = MAX_VALUE - gridY

    // Clamp to max values
    const clampedX = Math.max(0, Math.min(gridX, MAX_VALUE))
    const clampedY = Math.max(0, Math.min(mathY, MAX_VALUE))

    onPointClick(clampedX, clampedY)
  }

  // Calculate line coordinates if we have 2 points (flip Y-axis for proper math orientation)
  const lineData = points.length === 2 ? {
    x1: 50 + points[0].x * CELL_SIZE,
    y1: TOP_PADDING + (MAX_VALUE - points[0].y) * CELL_SIZE,
    x2: 50 + points[1].x * CELL_SIZE,
    y2: TOP_PADDING + (MAX_VALUE - points[1].y) * CELL_SIZE
  } : null

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-gray-800">Chart</h2>

      <div className="bg-gray-50 rounded-lg p-4 cursor-crosshair flex justify-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${GRID_SIZE + 100} ${GRID_SIZE + 85}`}
          preserveAspectRatio="xMidYMid meet"
          className="border-2 border-gray-300 bg-white rounded w-full h-auto max-w-[580px]"
          onClick={handleSvgClick}
        >
          {/* Grid lines */}
          {Array.from({ length: MAX_VALUE + 1 }).map((_, i) => (
            <g key={`grid-${i}`}>
              {/* Vertical lines */}
              <line
                x1={50 + i * CELL_SIZE}
                y1={TOP_PADDING}
                x2={50 + i * CELL_SIZE}
                y2={TOP_PADDING + GRID_SIZE}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              {/* Horizontal lines */}
              <line
                x1={50}
                y1={TOP_PADDING + i * CELL_SIZE}
                x2={50 + GRID_SIZE}
                y2={TOP_PADDING + i * CELL_SIZE}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            </g>
          ))}

          {/* Axes */}
          <line x1={50} y1={TOP_PADDING + GRID_SIZE} x2={50 + GRID_SIZE} y2={TOP_PADDING + GRID_SIZE} stroke="#000" strokeWidth="2" />
          <line x1={50} y1={TOP_PADDING} x2={50} y2={TOP_PADDING + GRID_SIZE} stroke="#000" strokeWidth="2" />

          {/* Animated line if we have 2 points */}
          {lineData && (
            <motion.line
              x1={lineData.x1}
              y1={lineData.y1}
              x2={lineData.x2}
              y2={lineData.y2}
              stroke="#ef4444"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          )}

          {/* Y-axis labels */}
          {Array.from({ length: MAX_VALUE + 1 }).map((_, i) => (
            <text
              key={`y-label-${i}`}
              x="20"
              y={TOP_PADDING + (MAX_VALUE - i) * CELL_SIZE}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="14"
              fill="#666"
              fontWeight="500"
            >
              {i}
            </text>
          ))}

          {/* X-axis labels */}
          {Array.from({ length: MAX_VALUE + 1 }).map((_, i) => (
            <text
              key={`x-label-${i}`}
              x={50 + i * CELL_SIZE}
              y={TOP_PADDING + GRID_SIZE + 35}
              textAnchor="middle"
              fontSize="14"
              fill="#666"
              fontWeight="500"
            >
              {i}
            </text>
          ))}

          {/* Points */}
          {points.map((point, idx) => (
            <motion.g
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
            >
              <circle
                cx={50 + point.x * CELL_SIZE}
                cy={TOP_PADDING + (MAX_VALUE - point.y) * CELL_SIZE}
                r="6"
                fill="#3b82f6"
                stroke="#1e40af"
                strokeWidth="2"
              />
              <motion.circle
                cx={50 + point.x * CELL_SIZE}
                cy={TOP_PADDING + (MAX_VALUE - point.y) * CELL_SIZE}
                r="6"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                animate={{ r: 12, opacity: 0 }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Coordinates display */}
      {showCoordinates && (
        <div className="text-sm text-gray-600">
          {points.length === 0 && <p>Click on the grid to add a point</p>}
          {points.length === 1 && <p>Added point: ({points[0].x}, {points[0].y})</p>}
          {points.length === 2 && (
            <p>
              Points: ({points[0].x}, {points[0].y}) → ({points[1].x}, {points[1].y})
            </p>
          )}
        </div>
      )}
    </div>
  )
}
