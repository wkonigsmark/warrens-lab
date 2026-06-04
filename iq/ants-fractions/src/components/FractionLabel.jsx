// A big, friendly stacked fraction: the top number over a bar over the bottom
// number. With `captions`, it spells out in kid words what each number means —
// the heart of "1 over 4."

export default function FractionLabel({ num, den, captions = false, big = false }) {
  const numClass = big ? 'text-7xl' : 'text-5xl'

  return (
    <div className="inline-flex items-center gap-5">
      <div className="text-center leading-none">
        <div className={`${numClass} font-black text-amber-500`}>{num}</div>
        <div className="h-1.5 bg-gray-800 rounded my-2" />
        <div className={`${numClass} font-black text-amber-800`}>{den}</div>
      </div>

      {captions && (
        <div className="text-left text-base sm:text-lg text-gray-500 space-y-3">
          <div>
            <span className="font-black text-amber-500">{num}</span> = pieces we have
            <span className="block text-xs text-gray-400">(how many slices)</span>
          </div>
          <div>
            <span className="font-black text-amber-800">{den}</span> = pieces in the whole
            <span className="block text-xs text-gray-400">(how many we cut it into)</span>
          </div>
        </div>
      )}
    </div>
  )
}
