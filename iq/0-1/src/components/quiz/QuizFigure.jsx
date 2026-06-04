import PercentGrid from '../PercentGrid'

// Renders the picture for a quiz question: a single grid, or two labelled grids
// for "which is more?". Returns null when a question has no figure.
export default function QuizFigure({ fig }) {
  if (!fig) return null

  if (fig.kind === 'grid') {
    return <PercentGrid value={fig.value} size={240} />
  }

  if (fig.kind === 'compare') {
    return (
      <div className="flex gap-8 items-end">
        {['a', 'b'].map((k) => (
          <div key={k} className="text-center">
            <PercentGrid value={fig[k]} size={150} />
            <div className="mt-2 text-xl font-black text-cyan-600">{fig[k]}%</div>
          </div>
        ))}
      </div>
    )
  }

  return null
}
