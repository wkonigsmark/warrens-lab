// Quick-jump bar shown in every Explore panel. Lets a student go straight
// from exploring a topic to practising it — no hunting through menus.
export default function ExploreNav({ onQuiz, onWorksheet }) {
  return (
    <div className="flex gap-2 mt-3 mb-1">
      <button
        onClick={onQuiz}
        className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1.5 rounded-lg hover:shadow-md transition-shadow"
      >
        📚 Quiz on this
      </button>
      <button
        onClick={onWorksheet}
        className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 rounded-lg hover:shadow-md transition-shadow"
      >
        🖨 Worksheet
      </button>
    </div>
  )
}
