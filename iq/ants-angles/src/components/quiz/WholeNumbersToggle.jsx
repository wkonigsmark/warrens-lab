// Shared toggle for the universal "whole numbers only" rule (default on),
// used by both the Quiz and Worksheet pickers.
export default function WholeNumbersToggle({ wholeOnly, onChange, hiddenCount = 0 }) {
  return (
    <div className="mb-6 bg-white rounded-2xl shadow p-4 flex items-center gap-3">
      <span className="text-2xl">🔢</span>
      <div className="flex-1">
        <div className="font-bold text-gray-800">Whole numbers only</div>
        <div className="text-xs text-gray-400">
          Hides anything whose answers use fractions or decimals.
          {wholeOnly && hiddenCount > 0 && <span className="text-amber-500 font-semibold"> {hiddenCount} hidden — turn off to show.</span>}
        </div>
      </div>
      <button
        role="switch"
        aria-checked={wholeOnly}
        onClick={() => onChange(!wholeOnly)}
        className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${wholeOnly ? 'bg-indigo-500' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${wholeOnly ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  )
}
