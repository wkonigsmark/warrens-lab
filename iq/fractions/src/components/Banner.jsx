// Hero header for the Ants & ___ family. This sibling doesn't have its painted
// PNG banner yet, so for now it's a CSS hero in the same warm palette as the
// pies. Drop a `banner-ants-fractions.png` in /public and swap to an <img> to
// match Ants & Angles exactly.
export default function Banner() {
  return (
    <div className="w-full bg-white shadow-md py-6">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          <span className="text-amber-500">🥧 Ants</span>{' '}
          <span className="text-gray-700">&amp;</span>{' '}
          <span className="text-amber-700">Fractions</span>
        </h1>
        <p className="mt-1 text-gray-400 font-medium">Pieces of a whole — one slice at a time.</p>
      </div>
    </div>
  )
}
