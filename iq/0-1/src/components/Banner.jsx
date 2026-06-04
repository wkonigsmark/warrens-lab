// Simple text hero. There's no banner PNG for this tool yet (unlike the older
// Ants & ___ tools), so we draw a clean gradient header instead. Easy to swap
// for an <img> later if we make one.
export default function Banner() {
  return (
    <div className="no-print w-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 shadow-md py-7">
      <div className="max-w-4xl mx-auto px-4 text-center text-white">
        <div className="text-4xl sm:text-5xl font-black tracking-tight">
          0 <span className="opacity-70">→</span> 1
        </div>
        <p className="mt-1 text-sm sm:text-base font-semibold text-white/85">
          Percents &amp; decimals, one easy step at a time 🐜
        </p>
      </div>
    </div>
  )
}
