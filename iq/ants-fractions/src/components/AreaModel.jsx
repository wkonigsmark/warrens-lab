// The area model for multiplying fractions: a unit square split into `den1`
// columns and `den2` rows. `num1` columns are shaded one way (the first
// fraction) and `num2` rows the other way (the second fraction); where they
// OVERLAP is the product — num1·num2 little boxes out of den1·den2.
//
// Colors make the two factors and their overlap distinct on screen; `bw` uses
// greys for printed worksheets.
export default function AreaModel({ num1, den1, num2, den2, size = 220, bw = false }) {
  const cols = den1
  const rows = den2
  const cellW = size / cols
  const cellH = size / rows
  const grid = bw ? '#000000' : '#9ca3af'

  const fillFor = (i, j) => {
    const inA = i < num1 // first fraction → columns
    const inB = j < num2 // second fraction → rows
    if (inA && inB) return bw ? '#6b7280' : '#34d399' // the product (overlap)
    if (inA) return bw ? '#e5e7eb' : '#fde68a'
    if (inB) return bw ? '#d1d5db' : '#bfdbfe'
    return '#ffffff'
  }

  const cells = []
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      cells.push(
        <rect
          key={`${i}-${j}`}
          x={i * cellW}
          y={j * cellH}
          width={cellW}
          height={cellH}
          fill={fillFor(i, j)}
          stroke={grid}
          strokeWidth="1.5"
        />,
      )
    }
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="max-w-full h-auto">
      {cells}
      <rect x="1" y="1" width={size - 2} height={size - 2} fill="none" stroke={bw ? '#000' : '#6b7280'} strokeWidth="2.5" />
    </svg>
  )
}
