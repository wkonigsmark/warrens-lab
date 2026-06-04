import Scene from './Scene'
import Pie from './Pie'
import PieStack from './PieStack'
import Frac from './Frac'
import MixedPrompt from './prompts/MixedPrompt'

const range = (n) => Array.from({ length: n }, (_, i) => i)

function Words({ title, children }) {
  return (
    <div className="text-center mb-7">
      {title && <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-3">{title}</h2>}
      {children && <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">{children}</p>}
    </div>
  )
}

// A mixed number shown big: a whole number next to a small stacked fraction.
function Mixed({ whole, num, den }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-6xl font-black text-gray-800">{whole}</span>
      <Frac num={num} den={den} className="text-3xl font-black text-amber-700" />
    </span>
  )
}

// Lesson 5 — improper fractions & mixed numbers. The picture does the work:
// fractions can be MORE than one whole, and the same amount has two names.
export default function Lesson5() {
  return (
    <div className="pb-24">
      {/* 1 — more than one whole */}
      <Scene>
        <Words title="Lesson 5: More than one whole">
          Every fraction so far has been part of <em>one</em> pie. But what if you have{' '}
          <strong>5 quarter-slices</strong>? That's more pie than one whole! 🥧🥧
        </Words>
        <div className="flex justify-center">
          <PieStack num={5} den={4} size={130} />
        </div>
      </Scene>

      {/* 2 — see 5/4 */}
      <Scene>
        <Words title="Five quarters">
          Five quarters fills <strong>one whole pie</strong> (that's 4 quarters) and leaves{' '}
          <strong>one quarter</strong> on the next pie. We can write all five quarters as{' '}
          <Frac num={5} den={4} className="text-2xl font-black text-amber-600" />.
        </Words>
        <div className="flex justify-center">
          <PieStack num={5} den={4} size={130} />
        </div>
      </Scene>

      {/* 3 — improper fraction */}
      <Scene>
        <Words title="An “improper” fraction">
          When the <span className="font-bold text-amber-500">top</span> number is bigger than the{' '}
          <span className="font-bold text-amber-800">bottom</span>, the fraction is more than one whole. We
          call it an <strong>improper fraction</strong>. <Frac num={5} den={4} className="text-xl font-black" /> is
          improper because 5 is bigger than 4.
        </Words>
      </Scene>

      {/* 4 — mixed number */}
      <Scene>
        <Words title="A mixed number">
          The very same amount can be written as <strong>1 whole and 1 quarter</strong> — a{' '}
          <strong>mixed number</strong>: a whole number <em>and</em> a fraction together.
        </Words>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <PieStack num={5} den={4} size={110} />
          <span className="text-4xl font-black text-amber-500">=</span>
          <Mixed whole={1} num={1} den={4} />
        </div>
        <p className="text-center text-gray-500 mt-7 text-lg">
          <Frac num={5} den={4} className="text-xl font-black" /> and <strong>1¼</strong> are the same amount — two names!
        </p>
      </Scene>

      {/* 5 — how to convert improper → mixed */}
      <Scene>
        <Words title="How to find the wholes">
          To change an improper fraction into a mixed number, see how many <strong>whole pies</strong> you can
          fill. For <Frac num={5} den={4} className="text-xl font-black" />: 4 quarters fill 1 whole, and 1
          quarter is left — so <strong>1 whole and 1/4</strong>.
        </Words>
        <div className="flex justify-center">
          <PieStack num={5} den={4} size={120} />
        </div>
      </Scene>

      {/* 6 — try it: improper → mixed */}
      <Scene>
        <MixedPrompt num={7} den={4} mode="toMixed" />
      </Scene>

      {/* 7 — a bigger one */}
      <Scene>
        <Words title="It works with any size">
          <Frac num={7} den={3} className="text-xl font-black" /> means 7 thirds. Three thirds fill a whole,
          another three fill a second whole, and 1 third is left: <strong>2 wholes and 1/3</strong>.
        </Words>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <PieStack num={7} den={3} size={104} />
          <span className="text-4xl font-black text-amber-500">=</span>
          <Mixed whole={2} num={1} den={3} />
        </div>
      </Scene>

      {/* 8 — going back: mixed → improper */}
      <Scene>
        <Words title="Going the other way">
          To turn a mixed number back into one fraction, just <strong>count every piece</strong>. For{' '}
          <strong>1¾</strong>: the whole pie is 4 quarters, plus 3 more = <strong>7 quarters</strong>, which is{' '}
          <Frac num={7} den={4} className="text-xl font-black" />.
        </Words>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <Mixed whole={1} num={3} den={4} />
          <span className="text-4xl font-black text-amber-500">=</span>
          <PieStack num={7} den={4} size={104} />
        </div>
      </Scene>

      {/* 9 — try it: mixed → improper */}
      <Scene>
        <MixedPrompt num={5} den={2} mode="toImproper" />
      </Scene>

      {/* 10 — celebrate */}
      <Scene>
        <Words title="You can go past one whole now! 🎉">
          An <strong>improper fraction</strong> (top bigger than bottom) and a <strong>mixed number</strong>{' '}
          (a whole plus a fraction) are just two ways to write the same amount. Keep practicing in the{' '}
          <strong>📚 Quiz</strong> and <strong>🖨 Worksheets</strong>!
        </Words>
        <div className="flex justify-center">
          <PieStack num={9} den={4} size={104} />
        </div>
        <p className="text-center text-gray-500 mt-4 text-lg">
          <Frac num={9} den={4} className="text-xl font-black" /> = 2¼
        </p>
      </Scene>
    </div>
  )
}
