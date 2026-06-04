import PercentLab from '../PercentLab'

// Play has one toy for v1: the percent grid lab. More tools (a 0→1 number
// line, fraction↔percent matching, decimals) will slot in beside it later,
// using the same little toolbar the other Ants tools use.
export default function PlayMode() {
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <span className="px-4 py-2 rounded-full text-sm font-semibold bg-white shadow text-cyan-600">
          🔲 Percent Grid
        </span>
      </div>
      <div className="bg-white/60 rounded-3xl shadow-sm p-6">
        <PercentLab />
      </div>
    </div>
  )
}
