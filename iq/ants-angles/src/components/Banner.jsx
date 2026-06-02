// Text banner for now — drop a banner-ants-angles.png into /public later to
// match the rest of the Ants & ___ family, then swap this for an <img>.
export default function Banner() {
  return (
    <div className="w-full bg-white shadow-md py-5">
      <div className="max-w-3xl mx-auto text-center px-4">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="text-indigo-600">Ants</span>
          <span className="text-gray-300"> &amp; </span>
          <span className="text-amber-500">Angles</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1 font-medium">
          Explore shapes, angles &amp; the geometry of turning
        </p>
      </div>
    </div>
  )
}
