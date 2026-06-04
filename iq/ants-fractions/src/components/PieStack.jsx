import Pie from './Pie'

const range = (n) => Array.from({ length: n }, (_, i) => i)

// Shows `num`/`den` across as many pies as it takes — fill one whole, spill into
// the next. The picture for improper fractions & mixed numbers (e.g. 5/4 = a
// full pie + one more quarter).
export default function PieStack({ num, den, size = 110, bw = false }) {
  const count = Math.max(1, Math.ceil(num / den))
  let left = num
  const pies = []
  for (let i = 0; i < count; i++) {
    const s = Math.min(den, Math.max(0, left))
    pies.push(<Pie key={i} parts={den} shaded={range(s)} size={size} bw={bw} />)
    left -= s
  }
  return <div className="flex flex-wrap justify-center items-center gap-2">{pies}</div>
}
