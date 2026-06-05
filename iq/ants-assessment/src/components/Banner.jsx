// Text hero for the assessment hub. No banner PNG yet — a clean gradient
// header, easy to swap for an <img> later like the other Ants & ___ tools.
export default function Banner() {
  return (
    <div className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-md py-7">
      <div className="max-w-4xl mx-auto px-4 text-center text-white">
        <div className="text-4xl sm:text-5xl font-black tracking-tight">
          Ants &amp; Assessment <span className="opacity-80">🐜📋</span>
        </div>
        <p className="mt-1 text-sm sm:text-base font-semibold text-white/90">
          A friendly check-up — let's see what you've got! 🌟
        </p>
      </div>
    </div>
  )
}
