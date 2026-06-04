import Scene, { Words } from './Scene'
import NumberLine from './NumberLine'
import TenthsBar from './TenthsBar'
import PercentGrid from './PercentGrid'
import DecimalLab from './DecimalLab'

// Lesson 4 — "Meet decimals" (tenths)
// First decimals lesson. A decimal is another way to write part of a whole. We
// live on the 0→1 line, split into ten equal steps (tenths). Tie every step back
// to the percents/grid they just learned. Big easy numbers only.
export default function Lesson4() {
  return (
    <div className="pb-24">
      {/* 1 — what is a decimal */}
      <Scene>
        <Words title="Meet decimals">
          A <strong>decimal</strong> is one more way to write <strong>part of a whole</strong> — like a
          fraction or a percent, but written with a little <strong>dot</strong>, like{' '}
          <strong>0.5</strong>. Let's see where decimals live. 🐜
        </Words>
        <div className="flex justify-center">
          <NumberLine value={0} marker={false} />
        </div>
        <p className="text-center text-gray-400 mt-4">Decimals live on the line from 0 to 1.</p>
      </Scene>

      {/* 2 — split 0→1 into ten steps */}
      <Scene>
        <Words title="Ten equal steps">
          Between <strong>0</strong> and <strong>1</strong> we make <strong>10 equal steps</strong>. Each
          step is <strong>one tenth</strong>. We write one tenth as <strong>0.1</strong>.
        </Words>
        <div className="flex justify-center">
          <NumberLine value={0.1} />
        </div>
        <p className="text-center text-gray-500 mt-4 text-lg">The dot is sitting on <strong>0.1</strong> — one step along.</p>
      </Scene>

      {/* 3 — the number after the dot counts tenths */}
      <Scene>
        <Words title="The number counts tenths">
          The number after the dot tells <strong>how many tenths</strong>. <strong>0.3</strong> means{' '}
          <strong>3 tenths</strong> — 3 steps along, or 3 pieces out of 10.
        </Words>
        <div className="flex flex-col items-center gap-6">
          <TenthsBar value={0.3} />
          <NumberLine value={0.3} />
        </div>
        <p className="text-center text-gray-600 mt-5 text-xl font-bold">0.3 = 3 tenths</p>
      </Scene>

      {/* 4 — 0.5 is half */}
      <Scene>
        <Words title="0.5 is halfway">
          <strong>0.5</strong> is <strong>5 tenths</strong> — right in the <strong>middle</strong> of 0 and
          1. That's <strong>half</strong>! So <strong>0.5 = ½</strong>.
        </Words>
        <div className="flex justify-center">
          <NumberLine value={0.5} />
        </div>
        <p className="text-center text-gray-500 mt-5 text-lg">Halfway along the line is <strong>0.5</strong>. 🟦</p>
      </Scene>

      {/* 5 — count up to one whole */}
      <Scene>
        <Words title="Counting tenths">
          Keep stepping: <strong>0.1, 0.2, 0.3 … 0.9</strong>, and then <strong>1.0</strong> — that's{' '}
          <strong>all ten tenths</strong>, which is <strong>one whole</strong>!
        </Words>
        <div className="flex flex-wrap justify-center gap-6">
          {[0.2, 0.6, 1.0].map((d) => (
            <div key={d} className="text-center">
              <TenthsBar value={d} width={200} />
              <div className="mt-2 font-black text-cyan-600 text-xl">{d.toFixed(1)}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 mt-6 text-lg"><strong>1.0</strong> is the whole thing — same as 100%. 🎉</p>
      </Scene>

      {/* 6 — bridge to the grid / percent */}
      <Scene>
        <Words title="Decimals and percents are friends">
          Each tenth is also <strong>10 squares</strong> of the 100-grid — that's <strong>10%</strong>. So{' '}
          <strong>0.3</strong> fills <strong>30</strong> squares: <strong>0.3 = 30%</strong>.
        </Words>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <PercentGrid value={30} size={180} />
          <div className="text-center text-2xl font-black text-gray-700">
            0.3 <span className="text-gray-300">=</span> <span className="text-cyan-600">30%</span>
          </div>
        </div>
      </Scene>

      {/* 7 — your turn */}
      <Scene>
        <Words title="Now you try! 🎉">
          Drag the dot along the line. See the <strong>decimal</strong>, the <strong>tenths</strong>, the{' '}
          <strong>percent</strong>, and the grid all change together.
        </Words>
        <DecimalLab compact />
      </Scene>

      {/* 8 — recap */}
      <Scene>
        <Words title="The big idea">
          A <strong>decimal</strong> uses a dot to show part of a whole. The number after the dot counts{' '}
          <strong>tenths</strong>. <strong>0.5</strong> is half, <strong>1.0</strong> is the whole, and each
          tenth is <strong>10%</strong>. 🐜
        </Words>
        <div className="flex justify-center">
          <NumberLine value={0.5} />
        </div>
        <p className="text-center text-gray-400 mt-6">
          Next: how <strong>fractions, decimals, and percents</strong> are three ways to say the same thing.
        </p>
      </Scene>
    </div>
  )
}
