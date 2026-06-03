// The workhorse visual for Ants & Exponents: a grid of `rows` × `cols` little
// squares. A square grid (rows === cols) is the whole reason we say a number is
// "squared" — n² really is an n-by-n square — so this picture does a lot of the
// teaching. If `onAddRow` is passed the grid grows one row at a time (used by a
// guided prompt).
//
// Colors match the family idiom (one filled color, a pale tile behind) but in
// the exponents palette: indigo squares so "a power" reads as a solid block.

const FILLED = '#6366f1' // indigo-500 — a square we "have"
const HALO = '#c7d2fe'   // indigo-200 — the tile behind each square
const EDGE = '#4338ca'   // indigo-700 — the outline

export default function DotArray({
  rows = 1,
  cols = 1,
  cell = 34,
  gap = 8,
  pad = 10,
}) {
  const step = cell + gap
  const width = pad * 2 + cols * step - gap
  const height = pad * 2 + rows * step - gap
  const squares = []

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = pad + c * step
      const y = pad + r * step
      squares.push(
        <rect
          key={`${r}-${c}`}
          x={x}
          y={y}
          width={cell}
          height={cell}
          rx={7}
          fill={FILLED}
          stroke={EDGE}
          strokeWidth="2"
        />,
      )
    }
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="max-w-full h-auto"
    >
      <rect x="0" y="0" width={width} height={height} rx={14} fill={HALO} opacity="0.5" />
      {squares}
    </svg>
  )
}
