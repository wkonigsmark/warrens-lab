import Scene from './Scene'
import DotArray from './DotArray'
import Cube3D from './Cube3D'
import PowerLabel from './PowerLabel'
import ReadCubePrompt from './prompts/ReadCubePrompt'

// Lesson 2 — Cubes & 3-D. The gentle next step after Lesson 1: exponent 2 made a
// square, so exponent 3 makes a CUBE. Just one more dimension, still whole
// numbers, still picture-first. Builds straight on the strongest visual from
// Lesson 1 (the square grid → a 3-D cube of blocks).

function Words({ title, children }) {
  return (
    <div className="text-center mb-7">
      {title && <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-3">{title}</h2>}
      {children && <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">{children}</p>}
    </div>
  )
}

export default function Lesson2() {
  return (
    <div className="pb-24">
      {/* 1 — from squares to cubes */}
      <Scene>
        <Words title="From squares to cubes 🧊">
          Remember how 3<sup className="text-violet-600">2</sup> makes a <strong>square</strong>?
          Watch what one more step does. Take that flat square and give it <strong>depth</strong> —
          now it's a <strong>cube</strong>. 🐜
        </Words>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          <div className="text-center">
            <DotArray rows={3} cols={3} cell={24} gap={6} />
            <p className="mt-2 font-black text-indigo-600">3<sup className="text-violet-600">2</sup> · flat</p>
          </div>
          <span className="text-4xl text-gray-300 font-black">→</span>
          <div className="text-center">
            <Cube3D n={3} size={180} />
            <p className="mt-2 font-black text-indigo-600">3<sup className="text-violet-600">3</sup> · solid</p>
          </div>
        </div>
      </Scene>

      {/* 2 — 2 cubed */}
      <Scene>
        <Words title="Two cubed">
          A cube uses the base <strong>three</strong> times: once for width, once for depth, once for
          height. So 2<sup className="text-violet-600">3</sup> = 2 × 2 × 2 — a little cube of blocks.
        </Words>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <Cube3D n={2} size={170} />
          <PowerLabel base={2} exp={3} expand value />
        </div>
        <p className="text-center text-gray-500 mt-6 text-lg">
          2 across, 2 deep, 2 tall = <strong>8 blocks</strong>. 🧱
        </p>
      </Scene>

      {/* 3 — why "cubed" */}
      <Scene>
        <Words title="That's why we say “cubed”">
          Exponent <strong>2</strong> is called <em>squared</em> because it builds a square. Exponent{' '}
          <strong>3</strong> is called <em>cubed</em> because it builds a <strong>cube</strong>. The
          name is just the shape it makes!
        </Words>
        <div className="flex flex-wrap items-end justify-center gap-8">
          <div className="text-center">
            <DotArray rows={4} cols={4} cell={20} gap={5} />
            <p className="mt-2 text-gray-500">4<sup>2</sup> = 16 · a square</p>
          </div>
          <div className="text-center">
            <Cube3D n={4} size={180} />
            <p className="mt-2 text-gray-500">4<sup>3</sup> = 64 · a cube</p>
          </div>
        </div>
      </Scene>

      {/* 4 — count the blocks (layers) */}
      <Scene>
        <Words title="Counting the blocks">
          How many blocks in a 3-cube? It's <strong>3 layers</strong> of a 3 × 3 square. 9 + 9 + 9 =
          <strong> 27</strong>. The layers are the same "stacked squares" idea from the Play page!
        </Words>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <Cube3D n={3} size={200} />
          <PowerLabel base={3} exp={3} value />
        </div>
      </Scene>

      {/* 5 — try it */}
      <Scene>
        <ReadCubePrompt n={4} />
      </Scene>

      {/* 6 — perfect cubes */}
      <Scene>
        <Words title="The cube numbers">
          Just like 1, 4, 9, 16 were the <em>square</em> numbers, these are the <strong>cube
          numbers</strong> — what you get from cubing 1, 2, 3, 4.
        </Words>
        <div className="flex flex-wrap justify-center items-end gap-6">
          {[1, 2, 3, 4].map((c) => (
            <div key={c} className="text-center">
              <Cube3D n={c} size={110} />
              <div className="mt-2 leading-none">
                <span className="text-xl font-black text-indigo-600">{c}</span>
                <span className="text-sm font-black text-violet-600 align-super">3</span>
                <span className="text-gray-400 font-bold"> = {c ** 3}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 mt-6 text-lg">1, 8, 27, 64 … they jump up fast!</p>
      </Scene>

      {/* 7 — cubes grow faster than squares */}
      <Scene>
        <Words title="Cubes pile up fast">
          Adding a third dimension makes numbers grow even faster than squares. Same base{' '}
          <strong>4</strong>, look at the jump:
        </Words>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-2xl sm:text-3xl font-black text-gray-700">
          <span>4<sup className="text-violet-600">2</sup> = <span className="text-emerald-600">16</span></span>
          <span className="text-gray-300">vs</span>
          <span>4<sup className="text-violet-600">3</sup> = <span className="text-emerald-600">64</span></span>
        </div>
        <p className="text-center text-gray-500 mt-6 text-lg">
          A square is a slice; a cube is a whole stack of those slices. More dimensions, bigger
          numbers. 📈
        </p>
      </Scene>

      {/* 8 — celebrate */}
      <Scene>
        <Words title="You did it! 🎉">
          Exponent <strong>2</strong> = a <strong>square</strong> (flat). Exponent <strong>3</strong>{' '}
          = a <strong>cube</strong> (solid). The exponent is still just <em>how many times you use the
          base</em> — now you can even <strong>see it in 3-D</strong>.
        </Words>
        <div className="flex justify-center">
          <Cube3D n={3} size={170} />
        </div>
        <p className="text-center text-gray-400 mt-6">
          Up next: powers can go the other way too — what happens <em>below</em> zero? (That's where
          tiny fractions sneak in.)
        </p>
      </Scene>
    </div>
  )
}
