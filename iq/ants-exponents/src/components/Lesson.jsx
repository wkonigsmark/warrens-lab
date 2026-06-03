import Scene from './Scene'
import DotArray from './DotArray'
import PowerLabel from './PowerLabel'
import GrowthChain from './GrowthChain'
import ExpandPrompt from './prompts/ExpandPrompt'
import ReadPowerPrompt from './prompts/ReadPowerPrompt'

// The scroll-down lesson. Each <Scene> is one gentle step: read a little, look
// at a picture, sometimes try something. It builds from "an exponent is fast
// multiplying" up to "read and build your own power," staying concrete the
// whole way. Assumes a kid who already knows multiplication.

// Big friendly headline + supporting line, used at the top of most scenes.
function Words({ title, children }) {
  return (
    <div className="text-center mb-7">
      {title && <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-3">{title}</h2>}
      {children && <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">{children}</p>}
    </div>
  )
}

// A plain repeated-multiplication chain, e.g. 2 × 2 × 2, with each base colored.
function Chain({ base, times }) {
  return (
    <div className="flex items-center justify-center gap-2 text-4xl sm:text-5xl font-black text-gray-700">
      {Array.from({ length: times }).map((_, i) => (
        <span key={i}>
          {i > 0 && <span className="text-gray-300 mr-2">×</span>}
          <span className="text-indigo-600">{base}</span>
        </span>
      ))}
    </div>
  )
}

export default function Lesson() {
  return (
    <div className="pb-24">
      {/* 1 — hook: you already know a fast way to add */}
      <Scene>
        <Words title="What is an exponent?">
          You already know a fast way to <strong>add</strong>: instead of 2 + 2 + 2 + 2 you can
          just say 2 × 4. An exponent is a fast way to <strong>multiply</strong>. Scroll down
          slowly — one little step at a time. 🐜
        </Words>
        <div className="space-y-4">
          <p className="text-center text-gray-400">Fast adding:</p>
          <p className="text-center text-2xl sm:text-3xl font-black text-gray-500">
            2 + 2 + 2 + 2 = <span className="text-emerald-600">2 × 4</span>
          </p>
          <p className="text-center text-gray-400 pt-2">Fast multiplying:</p>
          <p className="text-center text-2xl sm:text-3xl font-black text-gray-500">
            2 × 2 × 2 × 2 ={' '}
            <span className="leading-none inline-flex items-start text-emerald-600">
              2<span className="text-lg -mt-0.5">4</span>
            </span>
          </p>
        </div>
      </Scene>

      {/* 2 — multiplying the same number over and over */}
      <Scene>
        <Words title="The same number, again and again">
          An exponent is for when we multiply the <strong>same number</strong> over and over —
          like 2 × 2 × 2. It's a short way to write that.
        </Words>
        <Chain base={2} times={3} />
        <p className="text-center text-gray-400 mt-5">Three 2s, all multiplied together.</p>
      </Scene>

      {/* 3 — the notation: base + exponent */}
      <Scene>
        <Words title="The little number up high">
          We write it like this. The <strong>big</strong> number is the <strong>base</strong> —
          that's what we multiply. The <strong>little number up high</strong> is the{' '}
          <strong>exponent</strong> — that's how many times we use the base.
        </Words>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <PowerLabel base={2} exp={3} big />
          <PowerLabel base={2} exp={3} captions />
        </div>
        <p className="text-center text-gray-500 mt-7 text-lg">
          So <strong>2³</strong> just means <strong>2 × 2 × 2</strong>.
        </p>
      </Scene>

      {/* 4 — work it out */}
      <Scene>
        <Words title="Let's work it out">
          2 × 2 × 2 is 8. So <strong>2³ = 8</strong>. We read it as{' '}
          <em>"two to the power of three."</em>
        </Words>
        <div className="flex justify-center">
          <PowerLabel base={2} exp={3} expand value />
        </div>
      </Scene>

      {/* 5 — first do-it prompt: build a power */}
      <Scene>
        <ExpandPrompt base={3} exp={2} />
        <p className="text-center text-gray-400 mt-5">
          Using the base <strong>2 times</strong> is special — keep scrolling to see why. 😊
        </p>
      </Scene>

      {/* 6 — why "squared": the grid IS a square */}
      <Scene>
        <Words title="Why we say “squared”">
          When the exponent is <strong>2</strong>, we say the number is <strong>squared</strong> —
          because it really makes a square! 3² is a <strong>3-by-3</strong> square.
        </Words>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <DotArray rows={3} cols={3} />
          <PowerLabel base={3} exp={2} value />
        </div>
        <p className="text-center text-gray-500 mt-6 text-lg">
          3 across and 3 down = <strong>9</strong> little squares. That's 3 × 3 = 3².
        </p>
      </Scene>

      {/* 7 — the square numbers grow */}
      <Scene>
        <Words title="The square numbers">
          Watch the squares grow. Each side gets one longer, and the number of little squares is
          the side <strong>squared</strong>.
        </Words>
        <div className="flex flex-wrap justify-center items-end gap-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="text-center">
              <DotArray rows={s} cols={s} cell={22} gap={5} />
              <div className="mt-3 leading-none">
                <span className="text-2xl font-black text-indigo-600">{s}</span>
                <span className="text-base font-black text-violet-600 align-super">2</span>
                <span className="text-gray-400 font-bold"> = {s * s}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 mt-6 text-lg">1, 4, 9, 16 … these are the <strong>square numbers</strong>.</p>
      </Scene>

      {/* 8 — read a power off a picture */}
      <Scene>
        <ReadPowerPrompt n={4} />
      </Scene>

      {/* 9 — the WOW: exponents grow fast */}
      <Scene>
        <Words title="Exponents grow FAST 🚀">
          Here's the amazing part. Adding grows slowly. But multiplying the same number again and
          again grows <strong>super fast</strong>. Watch the powers of 2 climb:
        </Words>
        <GrowthChain base={2} upto={6} />
        <p className="text-center text-gray-500 mt-7 text-lg">
          If you could fold a paper in half <strong>10</strong> times, it'd be{' '}
          <strong>2¹⁰ = 1,024</strong> layers thick. From one little sheet! 😮
        </p>
      </Scene>

      {/* 10 — powers of 10 = zeros */}
      <Scene>
        <Words title="A neat trick: powers of 10">
          Base <strong>10</strong> is extra cool. The exponent tells you exactly how many{' '}
          <strong>zeros</strong> to write!
        </Words>
        <div className="space-y-2 text-center text-2xl sm:text-3xl font-black text-gray-600">
          <p>10¹ = <span className="text-emerald-600">10</span></p>
          <p>10² = <span className="text-emerald-600">100</span></p>
          <p>10³ = <span className="text-emerald-600">1,000</span></p>
          <p>10⁶ = <span className="text-emerald-600">1,000,000</span></p>
        </div>
        <p className="text-center text-gray-500 mt-6 text-lg">That's how we write really big numbers without all the writing.</p>
      </Scene>

      {/* 11 — second do-it, a bigger square */}
      <Scene>
        <ReadPowerPrompt n={5} />
      </Scene>

      {/* 12 — celebrate */}
      <Scene>
        <Words title="You did it! 🎉">
          An exponent is just <strong>fast multiplying</strong>. The <strong>base</strong> is the
          number you multiply, and the <strong>exponent</strong> is how many times you use it.
          That's the big secret!
        </Words>
        <div className="flex justify-center">
          <PowerLabel base={4} exp={2} expand value big />
        </div>
        <p className="text-center text-gray-400 mt-6">
          More to come: cubes (the exponent 3, a real 3-D cube!), the powers-of-10 place-value
          link, and the exponent rules for multiplying powers together.
        </p>
      </Scene>
    </div>
  )
}
