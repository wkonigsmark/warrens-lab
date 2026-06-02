// Full-color hero banner (matches the rest of the Ants & ___ family).
export default function Banner() {
  return (
    <div className="no-print w-full bg-white shadow-md py-4">
      <div className="max-w-3xl mx-auto px-4">
        <img
          src="/banner-ants-angles.png"
          alt="Ants & Angles — explore shapes, angles & the geometry of turning"
          className="h-36 w-auto object-contain mx-auto rounded-xl"
        />
      </div>
    </div>
  )
}
