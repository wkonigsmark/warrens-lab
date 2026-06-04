import Scene, { Words } from './Scene'
import PercentGrid from './PercentGrid'
import PercentLab from './PercentLab'

// Lesson 1 — "What is a percent?"
// Builds from "100 squares make a whole" up to 0% / 100% / 50%, then hands the
// child a live grid to poke at. Stays very concrete and uses big whole numbers.
export default function Lesson1() {
  return (
    <div className="pb-24">
      {/* 1 — the whole is 100 squares */}
      <Scene>
        <Words title="What is a percent?">
          A <strong>percent</strong> tells you how much of something you have — out of{' '}
          <strong>100</strong>. The little sign <strong>%</strong> just means{' '}
          <strong>"out of 100"</strong>. Scroll down slowly — one little step at a time. 🐜
        </Words>
        <div className="flex justify-center">
          <PercentGrid value={0} size={280} />
        </div>
        <p className="text-center text-gray-400 mt-4">Here are 100 tiny squares. Together they make one whole.</p>
      </Scene>

      {/* 2 — 100% is all of it */}
      <Scene>
        <Words title="100% means all of it">
          When <strong>every</strong> square is filled, that's <strong>100%</strong>. One hundred
          percent means the <strong>whole</strong> thing — all of it!
        </Words>
        <div className="flex justify-center">
          <PercentGrid value={100} size={260} />
        </div>
        <p className="text-center text-gray-500 mt-5 text-lg">
          A full glass of juice? <strong>100%</strong> full. 🥤
        </p>
      </Scene>

      {/* 3 — 0% is none */}
      <Scene>
        <Words title="0% means none">
          When <strong>no</strong> squares are filled, that's <strong>0%</strong>. Zero percent means{' '}
          <strong>none</strong> at all.
        </Words>
        <div className="flex justify-center">
          <PercentGrid value={0} size={260} />
        </div>
        <p className="text-center text-gray-500 mt-5 text-lg">
          An empty glass? <strong>0%</strong> full.
        </p>
      </Scene>

      {/* 4 — 50% is half */}
      <Scene>
        <Words title="50% is half">
          Fill in <strong>half</strong> the squares — that's <strong>50</strong> of them — and you
          have <strong>50%</strong>. Fifty percent is exactly <strong>half</strong>!
        </Words>
        <div className="flex justify-center">
          <PercentGrid value={50} size={260} />
        </div>
        <p className="text-center text-gray-500 mt-5 text-lg">
          Half a pizza is <strong>50%</strong> of the pizza. 🍕 Half full, half empty — same thing!
        </p>
      </Scene>

      {/* 5 — your turn (live toy) */}
      <Scene>
        <Words title="Now you try! 🎉">
          Drag across the squares, slide the bar, or tap a button. The big number is the{' '}
          <strong>percent</strong> — how many squares out of 100 are filled.
        </Words>
        <PercentLab compact />
      </Scene>

      {/* 6 — recap */}
      <Scene>
        <Words title="The big secret">
          Percent is just <strong>"out of 100."</strong> <strong>0%</strong> is none,{' '}
          <strong>100%</strong> is all of it, and <strong>50%</strong> is half. The bigger the
          percent, the more you have. That's it! 🐜
        </Words>
        <div className="flex justify-center gap-4 flex-wrap">
          {[0, 50, 100].map((v) => (
            <div key={v} className="text-center">
              <PercentGrid value={v} size={120} />
              <div className="mt-2 font-black text-cyan-600 text-xl">{v}%</div>
            </div>
          ))}
        </div>
      </Scene>
    </div>
  )
}
