// Shows a base's powers climbing step by step, so the "exponents grow FAST"
// idea is something you can see, not just read. Each step is a bar whose height
// grows with the value; under it we label the power and its answer.
//
// Defaults to powers of 2 (1·2·4·8·16·32) — the classic doubling staircase.

export default function GrowthChain({ base = 2, upto = 5 }) {
  // steps: exponent 1..upto
  const steps = Array.from({ length: upto }, (_, i) => i + 1)
  const max = base ** upto

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-4">
      {steps.map((e) => {
        const value = base ** e
        const h = 30 + (value / max) * 150 // bar height in px, always visible
        return (
          <div key={e} className="flex flex-col items-center">
            <div className="text-sm font-black text-emerald-600 mb-1">{value.toLocaleString()}</div>
            <div
              className="w-9 sm:w-11 rounded-t-lg bg-gradient-to-t from-indigo-600 to-violet-400 shadow-sm transition-all"
              style={{ height: `${h}px` }}
            />
            <div className="mt-2 leading-none flex items-start">
              <span className="text-xl font-black text-indigo-600">{base}</span>
              <span className="text-sm font-black text-violet-600 -mt-1">{e}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
