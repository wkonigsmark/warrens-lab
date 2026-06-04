import Scene from './Scene'
import Pie from './Pie'
import AreaModel from './AreaModel'
import Frac from './Frac'
import MultiplyPrompt from './prompts/MultiplyPrompt'

function Words({ title, children }) {
  return (
    <div className="text-center mb-7">
      {title && <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-3">{title}</h2>}
      {children && <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">{children}</p>}
    </div>
  )
}

function Times({ a, b, c, d }) {
  return (
    <span className="inline-flex items-center gap-2 text-2xl font-black text-gray-800">
      <Frac num={a} den={b} /> <span>×</span> <Frac num={c} den={d} />
    </span>
  )
}

// Lesson 6 — multiplying fractions, taught with the area model. The key picture:
// "a fraction OF a fraction" is the overlap when you shade one way, then the
// other. Rule falls out naturally: multiply tops, multiply bottoms.
export default function Lesson6() {
  return (
    <div className="pb-24">
      {/* 1 — multiplying means "of" */}
      <Scene>
        <Words title="Lesson 6: Multiplying fractions">
          Here's a secret: <strong>×</strong> with fractions means <strong>"of."</strong> So{' '}
          <strong>1/2 × 1/2</strong> just means <strong>"half OF a half."</strong> Let's see how much that is.
        </Words>
        <div className="flex justify-center">
          <Pie parts={2} shaded={[0]} size={180} />
        </div>
        <p className="text-center text-gray-400 mt-4">We'll take half of this half.</p>
      </Scene>

      {/* 2 — half of a half with the area model */}
      <Scene>
        <Words title="Half of a half">
          Take a square. Shade <strong>1/2</strong> going across 🟨, then <strong>1/2</strong> going down 🟦.
          Where they <strong>overlap</strong> 🟩 is the answer — just <strong>1 box out of 4</strong>.
        </Words>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <AreaModel num1={1} den1={2} num2={1} den2={2} size={200} />
          <span className="text-4xl font-black text-amber-500">=</span>
          <Frac num={1} den={4} className="text-5xl font-black text-amber-700" />
        </div>
        <p className="text-center text-gray-500 mt-6 text-lg">Half of a half is a <strong>quarter</strong>!</p>
      </Scene>

      {/* 3 — the rule */}
      <Scene>
        <Words title="The easy rule">
          Look at the numbers: <strong>1 × 1 = 1</strong> on top, and <strong>2 × 2 = 4</strong> on the
          bottom. To multiply fractions, just <strong>multiply the tops</strong> and{' '}
          <strong>multiply the bottoms</strong>.
        </Words>
        <div className="flex justify-center">
          <span className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <Frac num={1} den={2} /> <span>×</span> <Frac num={1} den={2} /> <span>=</span> <Frac num={1} den={4} className="text-amber-600" />
          </span>
        </div>
      </Scene>

      {/* 4 — another example */}
      <Scene>
        <Words title="Try the picture again">
          <Times a={1} b={2} c={1} d={3} /> — shade 1 of 2 columns, and 1 of 3 rows. The overlap is{' '}
          <strong>1 box out of 6</strong>.
        </Words>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <AreaModel num1={1} den1={2} num2={1} den2={3} size={200} />
          <span className="text-4xl font-black text-amber-500">=</span>
          <Frac num={1} den={6} className="text-5xl font-black text-amber-700" />
        </div>
        <p className="text-center text-gray-500 mt-6 text-lg">1 × 1 = 1 on top, 2 × 3 = 6 on the bottom.</p>
      </Scene>

      {/* 5 — try it */}
      <Scene>
        <MultiplyPrompt num1={2} den1={3} num2={1} den2={2} />
      </Scene>

      {/* 6 — bigger tops */}
      <Scene>
        <Words title="Bigger tops work too">
          <Times a={2} b={3} c={3} d={4} /> — shade 2 of 3 columns and 3 of 4 rows. The overlap is{' '}
          <strong>6 boxes out of 12</strong>, which is the same as <strong>1/2</strong>.
        </Words>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <AreaModel num1={2} den1={3} num2={3} den2={4} size={210} />
          <span className="text-4xl font-black text-amber-500">=</span>
          <span className="flex items-center gap-2">
            <Frac num={6} den={12} className="text-4xl font-black text-amber-700" />
            <span className="text-2xl font-black text-gray-400">=</span>
            <Frac num={1} den={2} className="text-4xl font-black text-green-600" />
          </span>
        </div>
        <p className="text-center text-gray-500 mt-6 text-lg">2 × 3 = 6 on top, 3 × 4 = 12 on the bottom.</p>
      </Scene>

      {/* 7 — try it */}
      <Scene>
        <MultiplyPrompt num1={3} den1={4} num2={1} den2={3} />
      </Scene>

      {/* 8 — celebrate */}
      <Scene>
        <Words title="You can multiply fractions now! 🎉">
          Remember: <strong>×</strong> means <strong>"of"</strong>, and the answer is the{' '}
          <strong>overlap</strong>. The shortcut: <strong>multiply the tops, multiply the bottoms</strong> —
          then simplify if you can. Keep going in <strong>📚 Quiz</strong> and <strong>🖨 Worksheets</strong>!
        </Words>
        <div className="flex justify-center">
          <AreaModel num1={3} den1={4} num2={2} den2={3} size={200} />
        </div>
        <p className="text-center text-gray-500 mt-4 text-lg">
          <span className="inline-flex items-center gap-2">
            <Frac num={3} den={4} /> <span>×</span> <Frac num={2} den={3} /> <span>=</span> <Frac num={6} den={12} /> <span>=</span> <Frac num={1} den={2} />
          </span>
        </p>
      </Scene>
    </div>
  )
}
