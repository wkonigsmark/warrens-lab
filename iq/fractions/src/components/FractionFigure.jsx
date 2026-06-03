import Pie from './Pie'
import GroupSet from './GroupSet'
import { range } from '../lib/fractionQuiz'

// Renders the picture for a quiz/worksheet question from its `fig` data.
// In color for the on-screen quiz; pass `bw` for printable worksheets.
export default function FractionFigure({ fig, bw = false, size }) {
  if (!fig) return null

  if (fig.kind === 'pie') {
    return <Pie parts={fig.parts} shaded={range(fig.shaded)} size={size || 220} bw={bw} />
  }

  // A blank pie with the cuts drawn — for "color the fraction" worksheets.
  if (fig.kind === 'pieBlank') {
    return <Pie parts={fig.parts} shaded={[]} size={size || 200} bw={bw} />
  }

  // A group of objects split into equal groups (a fraction of a number).
  // `cell` is the per-object size — small for print (bw), bigger on screen.
  // (Deliberately ignores the pie-oriented `size` prop, which is a whole-SVG size.)
  if (fig.kind === 'group') {
    return <GroupSet total={fig.total} den={fig.den} selected={range(fig.num)} cell={bw ? 19 : 34} bw={bw} />
  }

  if (fig.kind === 'compare') {
    const s = size || 150
    return (
      <div className="flex items-center justify-center gap-5">
        <LabeledPie f={fig.a} size={s} bw={bw} />
        <span className={`text-3xl font-black ${bw ? 'text-black' : 'text-gray-300'}`}>vs</span>
        <LabeledPie f={fig.b} size={s} bw={bw} />
      </div>
    )
  }

  if (fig.kind === 'add') {
    const s = size || 130
    const op = fig.op || '+'
    return (
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Pie parts={fig.a.den} shaded={range(fig.a.num)} size={s} bw={bw} />
        <span className={`text-3xl font-black ${bw ? 'text-black' : 'text-gray-400'}`}>{op}</span>
        <Pie parts={fig.b.den} shaded={range(fig.b.num)} size={s} bw={bw} />
        <span className={`text-3xl font-black ${bw ? 'text-black' : 'text-gray-400'}`}>=</span>
        <span className={`text-3xl font-black ${bw ? 'text-black' : 'text-gray-300'}`}>?</span>
      </div>
    )
  }

  return null
}

function LabeledPie({ f, size, bw }) {
  return (
    <div className="text-center">
      <Pie parts={f.den} shaded={range(f.num)} size={size} bw={bw} />
      <div className={`mt-1 font-bold ${bw ? 'text-black' : 'text-gray-600'}`}>
        {f.num}/{f.den}
      </div>
    </div>
  )
}
