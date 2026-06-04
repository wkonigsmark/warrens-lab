import Scene, { Words } from './Scene'
import NumberLine from './NumberLine'
import PercentGrid from './PercentGrid'

// Lesson 5 — "Three ways to say it"
// The payoff: fractions, decimals, and percents are three ways to write the SAME
// amount. Headline trio is ½ = 0.5 = 50%. Stay on tenths/halves/wholes so the
// decimals are all one place (no hundredths yet).

// One amount shown three ways, with the grid + line to prove it's the same.
function Trio({ frac, dec, pct }) {
  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-5">
      <div className="flex items-center justify-center gap-3 text-3xl sm:text-4xl font-black mb-4">
        <span className="text-pink-500">{frac}</span>
        <span className="text-gray-300">=</span>
        <span className="text-cyan-600">{dec}</span>
        <span className="text-gray-300">=</span>
        <span className="text-emerald-600">{pct}</span>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
        <PercentGrid value={parseInt(pct)} size={150} />
        <NumberLine value={parseInt(pct) / 100} width={300} />
      </div>
    </div>
  )
}

export default function Lesson5() {
  return (
    <div className="pb-24">
      {/* 1 — intro */}
      <Scene>
        <Words title="Three ways to say it">
          Here's a secret: <strong>fractions</strong>, <strong>decimals</strong>, and{' '}
          <strong>percents</strong> can all mean the <strong>same amount</strong>. They're just three
          different ways to write it! 🤝
        </Words>
      </Scene>

      {/* 2 — the headline trio */}
      <Scene>
        <Words title="Half, three ways">
          Take <strong>half</strong>. We can write it as the fraction <strong>½</strong>, the decimal{' '}
          <strong>0.5</strong>, or the percent <strong>50%</strong>. Same amount — look!
        </Words>
        <Trio frac="½" dec="0.5" pct="50%" />
        <p className="text-center text-gray-500 mt-5 text-lg">
          The grid is half full, and the dot is halfway. <strong>½ = 0.5 = 50%</strong>. 🟦
        </p>
      </Scene>

      {/* 3 — zero and one */}
      <Scene>
        <Words title="None and all">
          The ends are easy too. <strong>Nothing</strong> is <strong>0 = 0.0 = 0%</strong>. The{' '}
          <strong>whole</strong> thing is <strong>1 = 1.0 = 100%</strong>.
        </Words>
        <div className="space-y-5">
          <Trio frac="0" dec="0.0" pct="0%" />
          <Trio frac="1" dec="1.0" pct="100%" />
        </div>
      </Scene>

      {/* 4 — tenths trios */}
      <Scene>
        <Words title="Every tenth, three ways">
          Each tenth works the same way. <strong>1 tenth</strong> is{' '}
          <strong>1/10 = 0.1 = 10%</strong>. <strong>3 tenths</strong> is{' '}
          <strong>3/10 = 0.3 = 30%</strong>.
        </Words>
        <div className="space-y-5">
          <Trio frac="1/10" dec="0.1" pct="10%" />
          <Trio frac="3/10" dec="0.3" pct="30%" />
        </div>
      </Scene>

      {/* 5 — pick your favorite */}
      <Scene>
        <Words title="Pick whichever you like">
          Because they mean the same thing, you can use whichever is easiest. <strong>Half a pizza</strong>{' '}
          🍕 is <strong>½</strong>, or <strong>0.5</strong>, or <strong>50%</strong> — all correct!
        </Words>
        <div className="flex flex-wrap justify-center gap-3 text-2xl font-black">
          <span className="px-4 py-2 rounded-xl bg-pink-50 text-pink-500">½</span>
          <span className="px-4 py-2 rounded-xl bg-cyan-50 text-cyan-600">0.5</span>
          <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600">50%</span>
        </div>
      </Scene>

      {/* 6 — recap */}
      <Scene>
        <Words title="You did it! 🏆">
          Fractions, decimals, and percents are <strong>three ways to write the same amount</strong>.{' '}
          <strong>½ = 0.5 = 50%</strong>. Now you can read all three! 🐜
        </Words>
        <Trio frac="½" dec="0.5" pct="50%" />
        <p className="text-center text-gray-400 mt-6">
          Try the <strong>Number Line</strong> in Play, or test yourself in Challenge and Quiz.
        </p>
      </Scene>
    </div>
  )
}
