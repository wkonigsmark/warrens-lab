// A big, friendly power: the base with the exponent raised up high — the heart
// of "two to the power of three." Mirrors FractionLabel from Ants & Fractions.
//
// - `captions`  spells out in kid words what each number means (base vs exponent)
// - `expand`    shows the repeated multiplication  (2³ = 2 × 2 × 2)
// - `value`     shows the answer                   (2³ = ... = 8)

export default function PowerLabel({
  base,
  exp,
  captions = false,
  expand = false,
  value = false,
  big = false,
}) {
  const baseClass = big ? 'text-8xl' : 'text-6xl'
  const expClass = big ? 'text-5xl' : 'text-4xl'

  const factors = Array.from({ length: exp }, () => base)
  const product = base ** exp

  return (
    <div className="inline-flex flex-col items-center gap-4">
      <div className="flex items-end justify-center gap-2">
        {/* the power itself: base with a raised exponent */}
        <span className="leading-none flex items-start">
          <span className={`${baseClass} font-black text-indigo-600`}>{base}</span>
          <span className={`${expClass} font-black text-violet-600 -mt-2`}>{exp}</span>
        </span>

        {expand && (
          <span className="text-3xl sm:text-4xl font-black text-gray-400 ml-2 pb-1">
            = {factors.join(' × ')}
          </span>
        )}
        {value && (
          <span className="text-3xl sm:text-4xl font-black text-emerald-600 ml-2 pb-1">
            = {product.toLocaleString()}
          </span>
        )}
      </div>

      {captions && (
        <div className="text-left text-base sm:text-lg text-gray-500 space-y-3">
          <div>
            <span className="font-black text-indigo-600">{base}</span> = the base
            <span className="block text-xs text-gray-400">(the number we multiply)</span>
          </div>
          <div>
            <span className="font-black text-violet-600">{exp}</span> = the exponent
            <span className="block text-xs text-gray-400">(how many times we use the base)</span>
          </div>
        </div>
      )}
    </div>
  )
}
