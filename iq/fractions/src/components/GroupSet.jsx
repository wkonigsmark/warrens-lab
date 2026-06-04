// A set of `total` objects split into `den` equal groups (one group per row).
// Groups whose index is in `selected` are shaded — that's "taking" that many
// groups. This is the picture for "a fraction of a number": split into the
// bottom number of groups, take the top number of them.
//
// If `onToggleGroup` is given, each group row is tappable (used by Play).

const FILLED = '#fbbf24'
const EMPTY = '#fffaf0'
const INK = '#b45309'

export default function GroupSet({ total, den, selected = [], onToggleGroup, cell = 32, bw = false }) {
  const filled = bw ? '#cbd5e1' : FILLED
  const empty = bw ? '#ffffff' : EMPTY
  const ink = bw ? '#000000' : INK
  const tint = bw ? 'none' : '#fef3c7'

  const groupSize = Math.max(1, Math.round(total / den))
  const cols = groupSize
  const rows = den
  const rowGap = Math.round(cell * 0.32)
  const r = cell * 0.34
  const sel = new Set(selected)
  const interactive = typeof onToggleGroup === 'function'

  const width = cols * cell
  const rowH = cell
  const height = rows * rowH + (rows - 1) * rowGap

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="max-w-full h-auto">
      {Array.from({ length: rows }).map((_, i) => {
        const y0 = i * (rowH + rowGap)
        const on = sel.has(i)
        return (
          <g key={i}>
            {/* group background (color mode only) */}
            {!bw && <rect x={-4} y={y0 - 3} width={width + 8} height={rowH + 6} rx={cell * 0.3} fill={on ? tint : 'transparent'} />}
            {Array.from({ length: cols }).map((_, j) => (
              <circle
                key={j}
                cx={j * cell + cell / 2}
                cy={y0 + rowH / 2}
                r={r}
                fill={on ? filled : empty}
                stroke={ink}
                strokeWidth="2"
                className="transition-[fill] duration-200"
              />
            ))}
            {/* tap target for the whole group row */}
            {interactive && (
              <rect
                x={-4}
                y={y0 - 3}
                width={width + 8}
                height={rowH + 6}
                fill="transparent"
                onClick={() => onToggleGroup(i)}
                style={{ cursor: 'pointer' }}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}
