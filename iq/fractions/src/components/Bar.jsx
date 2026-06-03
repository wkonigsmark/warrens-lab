// A second "whole" shape — a chocolate bar split into `parts` equal pieces —
// so kids learn a fraction is about equal parts of ANY whole, not just pies.
// Same color language as Pie.jsx.

const FILLED = '#fbbf24'
const EMPTY = '#fffaf0'
const EDGE = '#b45309'

export default function Bar({ parts = 1, shaded = [], onToggle, width = 340, height = 88, bw = false }) {
  const filled = bw ? '#cbd5e1' : FILLED
  const empty = bw ? '#ffffff' : EMPTY
  const ink = bw ? '#000000' : EDGE
  const shadedSet = new Set(shaded)
  const interactive = typeof onToggle === 'function'
  const cell = width / parts

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="max-w-full h-auto">
      {Array.from({ length: parts }).map((_, i) => (
        <rect
          key={i}
          x={i * cell}
          y={0}
          width={cell}
          height={height}
          fill={shadedSet.has(i) ? filled : empty}
          stroke={ink}
          strokeWidth="2.5"
          onClick={interactive ? () => onToggle(i) : undefined}
          style={interactive ? { cursor: 'pointer' } : undefined}
          className="transition-[fill] duration-200"
        />
      ))}
      <rect x="1.5" y="1.5" width={width - 3} height={height - 3} fill="none" stroke={ink} strokeWidth="3" />
    </svg>
  )
}
