// Hero header for the Ants & ___ family. This sibling doesn't have its painted
// PNG banner yet, so for now it's a CSS hero in the exponents palette (indigo →
// violet, the "power" colors). Drop a `banner-ants-exponents.png` in /public and
// swap to an <img> to match Ants & Angles exactly.
export default function Banner() {
  return (
    <div className="w-full bg-white shadow-md py-6">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          <span className="text-indigo-600">⚡ Ants</span>{' '}
          <span className="text-gray-700">&amp;</span>{' '}
          <span className="text-violet-600">Exponents</span>
        </h1>
        <p className="mt-1 text-gray-400 font-medium">The fast way to multiply — one tiny step at a time.</p>
      </div>
    </div>
  )
}
