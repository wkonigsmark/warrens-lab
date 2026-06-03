// Full-color hero banner (matches the rest of the Ants & ___ family).
export default function Banner() {
  return (
    <div className="no-print w-full bg-white shadow-md py-4">
      <div className="max-w-4xl mx-auto px-4">
        <img
          src="/banner-fractions.png"
          alt="Ants & Fractions — pies, pizzas and pieces of a whole"
          className="h-44 w-auto object-contain mx-auto rounded-2xl shadow-sm"
        />
      </div>
    </div>
  )
}
