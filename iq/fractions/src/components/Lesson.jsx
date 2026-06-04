import Scene from './Scene'
import Pie from './Pie'
import Bar from './Bar'
import FractionLabel from './FractionLabel'
import ShadePrompt from './prompts/ShadePrompt'
import BuildFractionPrompt from './prompts/BuildFractionPrompt'
import NotationPrompt from './prompts/NotationPrompt'

// The scroll-down lesson. Each <Scene> is one gentle step: read a little, look
// at a picture, sometimes try something. It builds from "a whole pie" up to
// "read and make your own fraction," staying very concrete the whole way.

const range = (n) => Array.from({ length: n }, (_, i) => i)

// Big friendly headline + supporting line, used at the top of most scenes.
function Words({ title, children }) {
  return (
    <div className="text-center mb-7">
      {title && <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-3">{title}</h2>}
      {children && <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">{children}</p>}
    </div>
  )
}

export default function Lesson() {
  return (
    <div className="pb-24">
      {/* 1 — what's a fraction */}
      <Scene>
        <Words title="What is a fraction?">
          A fraction is just a <strong>piece of a whole</strong> thing. Let's use a pie to see it.
          Scroll down slowly — we'll go one little step at a time. 🐜
        </Words>
        <div className="flex justify-center">
          <Pie parts={1} size={260} />
        </div>
        <p className="text-center text-gray-400 mt-4">Here is one whole pie.</p>
      </Scene>

      {/* 2 — one whole */}
      <Scene>
        <Words title="One whole">
          When nothing is cut yet, we just have <strong>one whole pie</strong>. The whole thing is our
          starting point. Everything else will be pieces of this.
        </Words>
        <div className="flex justify-center">
          <Pie parts={1} shaded={[0]} size={240} />
        </div>
      </Scene>

      {/* 3 — cut into 4 equal parts */}
      <Scene>
        <Words title="Let's cut it">
          Now we cut the pie into <strong>4 equal parts</strong>. <em>Equal</em> means every piece is
          exactly the same size — no piece is bigger or smaller.
        </Words>
        <div className="flex justify-center">
          <Pie parts={4} size={240} />
        </div>
        <p className="text-center text-gray-400 mt-4">4 equal slices.</p>
      </Scene>

      {/* 4 — one slice is 1/4, with notation */}
      <Scene>
        <Words title="One slice is one quarter">
          Take just <strong>one</strong> slice. That one slice is <strong>one quarter</strong> of the
          whole pie. We write it as <strong>1 over 4</strong>, like this:
        </Words>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <Pie parts={4} shaded={[0]} size={220} />
          <FractionLabel num={1} den={4} captions big />
        </div>
        <p className="text-center text-gray-500 mt-7 text-lg">
          The <span className="font-bold text-amber-500">top</span> number is how many slices we have.
          The <span className="font-bold text-amber-800">bottom</span> number is how many slices the
          whole pie was cut into.
        </p>
      </Scene>

      {/* 4b — two ways to write the same fraction (stacked vs slash) */}
      <Scene>
        <Words title="Two ways to write it">
          We can write a fraction <strong>stacked</strong> — top number over bottom number — or on{' '}
          <strong>one line</strong> with a slash. Both mean exactly the same thing!
        </Words>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <FractionLabel num={1} den={4} big />
          <span className="text-4xl font-black text-gray-300">means the same as</span>
          <span className="text-7xl font-black">
            <span className="text-amber-500">1</span>
            <span className="text-gray-400">/</span>
            <span className="text-amber-800">4</span>
          </span>
        </div>
        <p className="text-center text-gray-500 mt-7 text-lg">
          The slash <strong>/</strong> is just the line, tilted. The number <em>before</em> it is the{' '}
          <span className="font-bold text-amber-500">top</span> (how many we have); the number{' '}
          <em>after</em> it is the <span className="font-bold text-amber-800">bottom</span> (pieces in the
          whole). You'll see the slash form in the games and worksheets.
        </p>
      </Scene>

      {/* 4c — quick reps on the two notations */}
      <Scene>
        <NotationPrompt />
      </Scene>

      {/* 5 — first do-it prompt */}
      <Scene>
        <ShadePrompt den={4} target={2} />
        <p className="text-center text-gray-400 mt-5">
          Two slices out of four is <strong>2/4</strong> — we'll come back to that one later. 😊
        </p>
      </Scene>

      {/* 6 — counting up to the whole */}
      <Scene>
        <Words title="Counting the slices">
          As we take more slices, the <strong>top number</strong> goes up. The bottom stays 4, because
          the pie is still cut into 4. When we have all 4 slices, we have the whole pie again!
        </Words>
        <div className="flex flex-wrap justify-center gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="text-center">
              <Pie parts={4} shaded={range(n)} size={130} />
              <div className="mt-2">
                <FractionLabel num={n} den={4} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 mt-6 text-lg">
          <strong>4/4</strong> means all four pieces — that's <strong>1 whole pie</strong>. 🥧
        </p>
      </Scene>

      {/* 7 — the bottom number changes the size of a piece */}
      <Scene>
        <Words title="More cuts = smaller pieces">
          Here's a big idea. The <strong>bottom number</strong> tells us how many pieces the whole was
          cut into. The bigger that number, the <strong>smaller</strong> each piece is.
        </Words>
        <div className="flex flex-wrap justify-center items-end gap-8">
          {[2, 4, 8].map((d) => (
            <div key={d} className="text-center">
              <Pie parts={d} shaded={[0]} size={150} />
              <div className="mt-3 flex justify-center">
                <FractionLabel num={1} den={d} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 mt-7 text-lg">
          One piece of a pie cut in <strong>2</strong> is big. One piece of a pie cut in{' '}
          <strong>8</strong> is small — even though each is just <strong>one</strong> slice.
        </p>
      </Scene>

      {/* 8 — read a fraction off a picture */}
      <Scene>
        <BuildFractionPrompt den={6} num={3} />
      </Scene>

      {/* 9 — a fraction works on any whole */}
      <Scene>
        <Words title="Not just pies!">
          A fraction works on <strong>any</strong> whole thing we cut into equal parts. Here's a
          chocolate bar split into <strong>3</strong> equal pieces. One piece is <strong>1/3</strong>.
        </Words>
        <div className="flex flex-col items-center gap-6">
          <Bar parts={3} shaded={[0]} width={340} />
          <FractionLabel num={1} den={3} />
        </div>
      </Scene>

      {/* 10 — one more do-it, slightly harder */}
      <Scene>
        <ShadePrompt den={6} target={4} />
      </Scene>

      {/* 11 — celebrate */}
      <Scene>
        <Words title="You did it! 🎉">
          A fraction is just <strong>pieces of a whole</strong>. The top number is how many pieces you
          have, and the bottom number is how many equal pieces the whole was cut into. That's the big
          secret!
        </Words>
        <div className="flex justify-center">
          <Pie parts={4} shaded={[0, 1, 2, 3]} size={200} />
        </div>
        <p className="text-center text-gray-400 mt-6">
          More to come: comparing fractions, equal fractions (like 2/4 = 1/2), and adding them up.
        </p>
      </Scene>
    </div>
  )
}
