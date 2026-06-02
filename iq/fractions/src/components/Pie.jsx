// The workhorse visual for Ants & Fractions: a pie cut into `parts` equal slices.
// `shaded` is an array of slice indices that are filled in. If `onToggle` is
// passed, the slices become tappable (used by the guided prompts).
//
// Colors are chosen to actually read as a pie — golden filling, brown crust,
// pale empty pieces — so "shaded vs not" is obvious to a young child.

const TAU = Math.PI * 2
const FILLED = '#fbbf24' // amber-400 — a slice we "have"
const EMPTY = '#fffaf0'  // cream — an empty piece
const CRUST = '#b45309'  // amber-700 — the cuts + crust

export default function Pie({
  parts = 1,
  shaded = [],
  onToggle,
  size = 240,
}) {
  const r = size / 2 - 8
  const c = size / 2
  const shadedSet = new Set(shaded)
  const interactive = typeof onToggle === 'function'
  const point = (ang) => [c + r * Math.cos(ang), c + r * Math.sin(ang)]

  const pieces = []
  if (parts === 1) {
    pieces.push(
      <circle
        key="whole"
        cx={c}
        cy={c}
        r={r}
        fill={shadedSet.has(0) ? FILLED : EMPTY}
        onClick={interactive ? () => onToggle(0) : undefined}
        style={interactive ? { cursor: 'pointer' } : undefined}
      />,
    )
  } else {
    for (let i = 0; i < parts; i++) {
      const a0 = -Math.PI / 2 + (i / parts) * TAU
      const a1 = -Math.PI / 2 + ((i + 1) / parts) * TAU
      const [x0, y0] = point(a0)
      const [x1, y1] = point(a1)
      const large = a1 - a0 > Math.PI ? 1 : 0
      const d = `M ${c} ${c} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`
      pieces.push(
        <path
          key={i}
          d={d}
          fill={shadedSet.has(i) ? FILLED : EMPTY}
          stroke={CRUST}
          strokeWidth="2.5"
          strokeLinejoin="round"
          onClick={interactive ? () => onToggle(i) : undefined}
          style={interactive ? { cursor: 'pointer' } : undefined}
          className="transition-[fill] duration-200"
        />,
      )
    }
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="max-w-full h-auto">
      {/* plate behind the pie */}
      <circle cx={c} cy={c} r={r + 6} fill="#fef3c7" />
      {pieces}
      {/* outer crust on top so it never gets covered by a slice fill */}
      <circle cx={c} cy={c} r={r} fill="none" stroke={CRUST} strokeWidth="3.5" />
    </svg>
  )
}
