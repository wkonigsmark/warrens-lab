import Scene from './Scene'
import Pie from './Pie'
import FractionLabel from './FractionLabel'
import ShadePrompt from './prompts/ShadePrompt'

const range = (n) => Array.from({ length: n }, (_, i) => i)

function Words({ title, children }) {
  return (
    <div className="text-center mb-7">
      {title && <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-3">{title}</h2>}
      {children && <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">{children}</p>}
    </div>
  )
}

// Lesson 3 — adding fractions when the bottoms are DIFFERENT. The whole idea:
// use equivalent fractions to make the pieces the same size, then add the tops.
// Kept intuitive and picture-first — no formal "find the LCD" drilling.
export default function Lesson3() {
  return (
    <div className="pb-24">
      {/* 1 — the problem */}
      <Scene>
        <Words title="Lesson 3: Different-size pieces">
          Last time we learned the rule: we can only add pieces that are the <strong>same size</strong>.
          So what do we do with something like <strong>1/2 + 1/4</strong>? The pieces don't match! 🤔
        </Words>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Pie parts={2} shaded={[0]} size={140} />
          <span className="text-3xl font-black text-gray-400">+</span>
          <Pie parts={4} shaded={[0]} size={140} />
          <span className="text-3xl font-black text-gray-400">= ?</span>
        </div>
      </Scene>

      {/* 2 — make them match */}
      <Scene>
        <Words title="The secret: make them match">
          Remember equivalent fractions? <strong>1/2 is the same as 2/4.</strong> So let's swap the half for
          2/4 — now <em>every</em> piece is a quarter, all the same size!
        </Words>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <div className="text-center">
            <Pie parts={2} shaded={[0]} size={130} />
            <div className="mt-2 flex justify-center"><FractionLabel num={1} den={2} /></div>
          </div>
          <span className="text-3xl font-black text-amber-500">→</span>
          <div className="text-center">
            <Pie parts={4} shaded={[0, 1]} size={130} />
            <div className="mt-2 flex justify-center"><FractionLabel num={2} den={4} /></div>
          </div>
        </div>
      </Scene>

      {/* 3 — now add */}
      <Scene>
        <Words title="Now it's easy">
          With matching pieces we just add the tops, like before: <strong>2/4 + 1/4 = 3/4</strong>.
        </Words>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Pie parts={4} shaded={[0, 1]} size={120} />
          <span className="text-3xl font-black text-gray-400">+</span>
          <Pie parts={4} shaded={[0]} size={120} />
          <span className="text-3xl font-black text-gray-400">=</span>
          <Pie parts={4} shaded={[0, 1, 2]} size={120} />
        </div>
        <p className="text-center text-gray-600 mt-6 text-xl font-bold">1/2 + 1/4 = 3/4</p>
      </Scene>

      {/* 4 — try it */}
      <Scene>
        <ShadePrompt den={4} target={2} />
        <p className="text-center text-gray-400 mt-5">
          You made <strong>1/2</strong> using quarters (2/4) — that's the matching trick! 😊
        </p>
      </Scene>

      {/* 5 — a trickier pair */}
      <Scene>
        <Words title="A trickier pair">
          What about <strong>1/2 + 1/3</strong>? Halves and thirds don't match. We need pieces that work for
          <em> both</em>. If we cut the pie into <strong>6</strong>, we can make both!
        </Words>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <div className="text-center">
            <Pie parts={2} shaded={[0]} size={120} />
            <div className="mt-2 flex justify-center"><FractionLabel num={1} den={2} /></div>
          </div>
          <span className="text-3xl font-black text-gray-400">+</span>
          <div className="text-center">
            <Pie parts={3} shaded={[0]} size={120} />
            <div className="mt-2 flex justify-center"><FractionLabel num={1} den={3} /></div>
          </div>
        </div>
      </Scene>

      {/* 6 — convert both to sixths */}
      <Scene>
        <Words title="Everything in sixths">
          <strong>1/2 = 3/6</strong> and <strong>1/3 = 2/6</strong>. Now both are sixths — same size pieces!
        </Words>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="text-center">
            <Pie parts={6} shaded={range(3)} size={130} />
            <div className="mt-2 flex justify-center"><FractionLabel num={3} den={6} /></div>
          </div>
          <div className="text-center">
            <Pie parts={6} shaded={range(2)} size={130} />
            <div className="mt-2 flex justify-center"><FractionLabel num={2} den={6} /></div>
          </div>
        </div>
      </Scene>

      {/* 7 — add the sixths */}
      <Scene>
        <Words title="Add them up">
          Three sixths plus two sixths makes <strong>five sixths</strong>.
        </Words>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Pie parts={6} shaded={range(3)} size={120} />
          <span className="text-3xl font-black text-gray-400">+</span>
          <Pie parts={6} shaded={range(2)} size={120} />
          <span className="text-3xl font-black text-gray-400">=</span>
          <Pie parts={6} shaded={range(5)} size={120} />
        </div>
        <p className="text-center text-gray-600 mt-6 text-xl font-bold">1/2 + 1/3 = 3/6 + 2/6 = 5/6</p>
      </Scene>

      {/* 8 — try it */}
      <Scene>
        <ShadePrompt den={6} target={3} />
        <p className="text-center text-gray-400 mt-5">
          Shading <strong>3/6</strong> is the same as shading <strong>1/2</strong>. Matching pieces again! 🎉
        </p>
      </Scene>

      {/* 9 — recap */}
      <Scene>
        <Words title="You cracked the hardest one! 🏆">
          To add fractions with different bottoms: <strong>1)</strong> make the pieces the same size using
          equal fractions, then <strong>2)</strong> add the tops. The <strong>🧭 Play</strong> mode is great
          for trying your own — and the <strong>📚 Quiz</strong> has equivalent-fraction practice.
        </Words>
        <div className="flex justify-center">
          <Pie parts={6} shaded={range(5)} size={200} />
        </div>
      </Scene>
    </div>
  )
}
