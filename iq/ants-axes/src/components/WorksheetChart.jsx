const GRID_SIZE = 480
const CELL_SIZE = 40
const MAX_VALUE = 12
const TOP_PADDING = 25

// A compact, print-friendly chart with two labeled points and a connecting line.
// All black on white for clean printing.
export default function WorksheetChart({ points = [] }) {
  const lineData =
    points.length === 2
      ? {
          x1: 50 + points[0].x * CELL_SIZE,
          y1: TOP_PADDING + (MAX_VALUE - points[0].y) * CELL_SIZE,
          x2: 50 + points[1].x * CELL_SIZE,
          y2: TOP_PADDING + (MAX_VALUE - points[1].y) * CELL_SIZE,
        }
      : null

  return (
    <svg
      viewBox={`0 -30 ${GRID_SIZE + 100} ${GRID_SIZE + 115}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-auto"
    >
      {/* Grid lines */}
      {Array.from({ length: MAX_VALUE + 1 }).map((_, i) => (
        <g key={`grid-${i}`}>
          <line
            x1={50 + i * CELL_SIZE}
            y1={TOP_PADDING}
            x2={50 + i * CELL_SIZE}
            y2={TOP_PADDING + GRID_SIZE}
            stroke="#9ca3af"
            strokeWidth="1"
          />
          <line
            x1={50}
            y1={TOP_PADDING + i * CELL_SIZE}
            x2={50 + GRID_SIZE}
            y2={TOP_PADDING + i * CELL_SIZE}
            stroke="#9ca3af"
            strokeWidth="1"
          />
        </g>
      ))}

      {/* Axes */}
      <line
        x1={50}
        y1={TOP_PADDING + GRID_SIZE}
        x2={50 + GRID_SIZE}
        y2={TOP_PADDING + GRID_SIZE}
        stroke="#000"
        strokeWidth="2.5"
      />
      <line
        x1={50}
        y1={TOP_PADDING}
        x2={50}
        y2={TOP_PADDING + GRID_SIZE}
        stroke="#000"
        strokeWidth="2.5"
      />

      {/* Line through points */}
      {lineData && (
        <line
          x1={lineData.x1}
          y1={lineData.y1}
          x2={lineData.x2}
          y2={lineData.y2}
          stroke="#000"
          strokeWidth="2.5"
        />
      )}

      {/* Y-axis numbers */}
      {Array.from({ length: MAX_VALUE + 1 }).map((_, i) => (
        <text
          key={`y-${i}`}
          x="35"
          y={TOP_PADDING + (MAX_VALUE - i) * CELL_SIZE}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize="20"
          fill="#000"
        >
          {i}
        </text>
      ))}

      {/* X-axis numbers */}
      {Array.from({ length: MAX_VALUE + 1 }).map((_, i) => (
        <text
          key={`x-${i}`}
          x={50 + i * CELL_SIZE}
          y={TOP_PADDING + GRID_SIZE + 28}
          textAnchor="middle"
          fontSize="20"
          fill="#000"
        >
          {i}
        </text>
      ))}

      {/* X-axis title */}
      <text
        x={50 + GRID_SIZE + 25}
        y={TOP_PADDING + GRID_SIZE}
        textAnchor="start"
        dominantBaseline="middle"
        fontSize="28"
        fontWeight="bold"
        fill="#000"
      >
        X
      </text>

      {/* Y-axis title */}
      <text
        x={50}
        y={-10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="28"
        fontWeight="bold"
        fill="#000"
      >
        Y
      </text>

      {/* Points + labels (P1, P2) */}
      {points.map((point, idx) => {
        const cx = 50 + point.x * CELL_SIZE
        const cy = TOP_PADDING + (MAX_VALUE - point.y) * CELL_SIZE
        // Label position: up-right if point is in lower-left half, otherwise up-left
        const labelLeft = point.x > MAX_VALUE / 2
        const labelUp = point.y < MAX_VALUE - 1
        const labelX = cx + (labelLeft ? -14 : 14)
        const labelY = cy + (labelUp ? -14 : 28)
        const labelAnchor = labelLeft ? 'end' : 'start'
        return (
          <g key={idx}>
            <circle cx={cx} cy={cy} r="9" fill="#000" />
            <text
              x={labelX}
              y={labelY}
              textAnchor={labelAnchor}
              fontSize="24"
              fontWeight="bold"
              fill="#000"
            >
              P{idx + 1}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
