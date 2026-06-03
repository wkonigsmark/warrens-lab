import Scene from './Scene'
import FlipPowerPrompt from './prompts/FlipPowerPrompt'

// Lesson 2 — Negative exponents. Picks up exactly where Lesson 1 ended (the
// exponent-0 staircase) and keeps walking DOWN below zero, where powers turn
// into tiny fractions. Same scroll-down, picture-first, guided style.

function Words({ title, children }) {
  return (
    <div className="text-center mb-7">
      {title && <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-3">{title}</h2>}
      {children && <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">{children}</p>}
    </div>
  )
}

// One rung of the descending staircase.
function Rung({ exp, value, note, highlight }) {
  return (
    <p className={highlight ? 'text-emerald-600' : 'text-gray-700'}>
      2<sup className="text-violet-600">{exp}</sup> = <strong>{value}</strong>
      {note && <span className="text-gray-300 text-base ml-2">{note}</span>}
    </p>
  )
}

export default function Lesson3() {
  return (
    <div className="pb-24">
      {/* 1 — recap the staircase */}
      <Scene>
        <Words title="Going below zero ⬇️">
          In Lesson 1 we counted <em>down</em> the staircase to 2<sup className="text-violet-600">0</sup> = 1.
          Every step, we divided by the base. So… what if we just <strong>keep going?</strong> 🐜
        </Words>
        <div className="text-center text-2xl sm:text-3xl font-black space-y-1">
          <Rung exp={3} value="8" />
          <Rung exp={2} value="4" note="(÷2)" />
          <Rung exp={1} value="2" note="(÷2)" />
          <Rung exp={0} value="1" note="(÷2)" />
        </div>
      </Scene>

      {/* 2 — one step below zero */}
      <Scene>
        <Words title="One more step down">
          We're at 2<sup className="text-violet-600">0</sup> = 1. Divide by 2 one more time: 1 ÷ 2 = ½.
          The exponent drops to <strong>−1</strong>.
        </Words>
        <div className="text-center text-2xl sm:text-3xl font-black space-y-1">
          <Rung exp={1} value="2" />
          <Rung exp={0} value="1" note="(÷2)" />
          <Rung exp={'−1'} value="½" note="(÷2)" highlight />
        </div>
        <p className="text-center text-gray-500 mt-6 text-lg">
          A <strong>negative</strong> exponent! It didn't break — it just made a fraction.
        </p>
      </Scene>

      {/* 3 — keep going, gets tiny */}
      <Scene>
        <Words title="Smaller and smaller">
          Keep dividing by 2. The powers get <strong>tiny</strong> — but they never quite reach zero.
        </Words>
        <div className="text-center text-2xl sm:text-3xl font-black space-y-1">
          <Rung exp={'−1'} value="½" />
          <Rung exp={'−2'} value="¼" note="(÷2)" />
          <Rung exp={'−3'} value="⅛" note="(÷2)" />
        </div>
        <p className="text-center text-gray-500 mt-6 text-lg">
          Going <strong>up</strong> doubles; going <strong>down</strong> halves. Same staircase, both ways. ↕️
        </p>
      </Scene>

      {/* 4 — the rule */}
      <Scene>
        <Words title="The secret: flip it under a 1">
          Here's the trick. A negative exponent means <strong>“1 over”</strong> the normal power. The
          minus sign flips it underneath a 1.
        </Words>
        <p className="text-center text-3xl sm:text-4xl font-black text-gray-700">
          2<sup className="text-violet-600">−3</sup> ={' '}
          <span className="inline-flex flex-col items-center align-middle text-2xl sm:text-3xl mx-1">
            <span>1</span>
            <span className="block w-12 h-0.5 bg-gray-700 my-1" />
            <span>2<sup className="text-violet-600">3</sup></span>
          </span>{' '}
          ={' '}
          <span className="inline-flex flex-col items-center align-middle text-2xl sm:text-3xl text-emerald-600 mx-1">
            <span>1</span>
            <span className="block w-8 h-0.5 bg-emerald-600 my-1" />
            <span>8</span>
          </span>
        </p>
      </Scene>

      {/* 5 — try it */}
      <Scene>
        <FlipPowerPrompt base={2} n={2} />
      </Scene>

      {/* 6 — powers of 10 the other way */}
      <Scene>
        <Words title="Powers of 10 — the tiny direction">
          Remember 10<sup>2</sup> = 100? Going the other way makes the <strong>tiny</strong> numbers
          we use for decimals.
        </Words>
        <div className="text-center text-2xl sm:text-3xl font-black text-gray-700 space-y-1">
          <p>10<sup className="text-violet-600">−1</sup> = <span className="text-emerald-600">0.1</span> <span className="text-gray-300 text-base">(a tenth)</span></p>
          <p>10<sup className="text-violet-600">−2</sup> = <span className="text-emerald-600">0.01</span> <span className="text-gray-300 text-base">(a hundredth)</span></p>
          <p>10<sup className="text-violet-600">−3</sup> = <span className="text-emerald-600">0.001</span> <span className="text-gray-300 text-base">(a thousandth)</span></p>
        </div>
        <p className="text-center text-gray-500 mt-6 text-lg">
          The negative exponent counts the <strong>zeros after the dot</strong>. Neat, right?
        </p>
      </Scene>

      {/* 7 — try it, base 10 */}
      <Scene>
        <FlipPowerPrompt base={3} n={2} />
      </Scene>

      {/* 8 — celebrate */}
      <Scene>
        <Words title="You did it! 🎉">
          Now you know the <strong>whole staircase</strong>: a <strong>positive</strong> exponent
          makes big numbers (keep multiplying), <strong>zero</strong> is 1, and a{' '}
          <strong>negative</strong> exponent makes tiny fractions (1 over the power). Up doubles,
          down halves — forever. 🔁
        </Words>
        <p className="text-center text-gray-400 mt-6">
          More to come: the power-of-a-power rule, a real 3-D cube, and a story about an ant colony
          that doubles every single day.
        </p>
      </Scene>
    </div>
  )
}
