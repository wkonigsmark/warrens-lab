import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Chart from './Chart'

const MAX_VALUE = 12

// Pythagorean triples (positive a, b values + hypotenuse c) that fit in the 0-12 grid.
// Using these guarantees the distance is a whole number.
const PYTH_TRIPLES = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [12, 5, 13],
  [9, 12, 15],
  [12, 9, 15],
]

// Compare a user-entered decimal answer to the correct value with tolerance
function approxEqual(a, b) {
  return Math.abs(a - b) < 0.001
}

// Format midpoint coords for display ("3" if whole, else "3.5")
function fmtMid(n) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(1)
}

export default function QuizLevelMidpoint({ mode = 'master', onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])

  // Master mode inputs: distance, Mx, My
  const [inputDistance, setInputDistance] = useState('')
  const [inputMx, setInputMx] = useState('')
  const [inputMy, setInputMy] = useState('')

  // Mentor mode state
  const [mentorStep, setMentorStep] = useState(0)
  // 0=info, 1=P1, 2=P2, 3=Δx, 4=Δy, 5=distance, 6=Mx, 7=My
  const [mentorX1, setMentorX1] = useState('')
  const [mentorY1, setMentorY1] = useState('')
  const [mentorX2, setMentorX2] = useState('')
  const [mentorY2, setMentorY2] = useState('')
  const [mentorDx, setMentorDx] = useState(null)
  const [mentorDy, setMentorDy] = useState(null)
  const [mentorDistance, setMentorDistance] = useState(null)
  const [mentorMx, setMentorMx] = useState(null)
  const [inputAnswer, setInputAnswer] = useState('')

  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState('')
  const [quizSeed, setQuizSeed] = useState(0)

  const masterDistanceRef = useRef(null)
  const masterMxRef = useRef(null)
  const masterMyRef = useRef(null)
  const mentorXRef = useRef(null)
  const mentorYRef = useRef(null)
  const inputRef = useRef(null)
  const blockEnterRef = useRef(false)

  // Auto-focus based on mode and step
  useEffect(() => {
    if (showResults) return
    setTimeout(() => {
      if (mode === 'master') {
        masterDistanceRef.current?.focus()
      } else if (mode === 'mentor') {
        if (mentorStep === 1 || mentorStep === 2) {
          mentorXRef.current?.focus()
        } else if (mentorStep >= 3 && mentorStep <= 7) {
          inputRef.current?.focus()
        }
      }
    }, 0)
  }, [currentQuestion, showResults, mode, mentorStep])

  // Enter on results → Try Again
  useEffect(() => {
    if (!showResults) return
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        blockEnterRef.current = true
        setCurrentQuestion(0)
        setAnswers([])
        setInputDistance('')
        setInputMx('')
        setInputMy('')
        setShowResults(false)
        if (mode === 'mentor') {
          setMentorStep(0)
          setMentorX1('')
          setMentorY1('')
          setMentorX2('')
          setMentorY2('')
          setMentorDx(null)
          setMentorDy(null)
          setMentorDistance(null)
          setMentorMx(null)
          setInputAnswer('')
        }
        setQuizSeed((s) => s + 1)
        setTimeout(() => {
          blockEnterRef.current = false
        }, 100)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showResults, mode])

  // Enter on quiz screens → submit
  useEffect(() => {
    if (showResults) return
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !blockEnterRef.current) {
        e.preventDefault()
        handleSubmitAnswer()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    showResults,
    mentorStep,
    inputDistance,
    inputMx,
    inputMy,
    mentorX1,
    mentorY1,
    mentorX2,
    mentorY2,
    inputAnswer,
  ])

  // Generate 3 problems using Pythagorean triples (whole-number distance,
  // possibly half-integer midpoints, which the student can enter as decimals)
  const questions = useMemo(() => {
    const generate = () => {
      const [absDx, absDy, c] = PYTH_TRIPLES[Math.floor(Math.random() * PYTH_TRIPLES.length)]
      const dx = Math.random() < 0.5 ? absDx : -absDx
      const dy = Math.random() < 0.5 ? absDy : -absDy
      const minX1 = Math.max(0, -dx)
      const maxX1 = Math.min(MAX_VALUE, MAX_VALUE - dx)
      const minY1 = Math.max(0, -dy)
      const maxY1 = Math.min(MAX_VALUE, MAX_VALUE - dy)
      const x1 = minX1 + Math.floor(Math.random() * (maxX1 - minX1 + 1))
      const y1 = minY1 + Math.floor(Math.random() * (maxY1 - minY1 + 1))
      const x2 = x1 + dx
      const y2 = y1 + dy
      return {
        x1,
        y1,
        x2,
        y2,
        dx,
        dy,
        distance: c,
        mx: (x1 + x2) / 2,
        my: (y1 + y2) / 2,
      }
    }

    const result = []
    let attempts = 0
    while (result.length < 3 && attempts < 100) {
      const q = generate()
      const dup = result.some(
        (r) => r.x1 === q.x1 && r.y1 === q.y1 && r.x2 === q.x2 && r.y2 === q.y2
      )
      if (!dup) result.push(q)
      attempts++
    }
    return result
  }, [quizSeed])

  const currentQuestion_ = questions[currentQuestion]
  const isLastQuestion = currentQuestion === 2

  const handleSubmitAnswer = () => {
    if (blockEnterRef.current) return
    if (mode === 'mentor') return handleMentorStep()

    // Master mode: distance + Mx + My
    const dVal = parseFloat(inputDistance)
    const mxVal = parseFloat(inputMx)
    const myVal = parseFloat(inputMy)

    if (isNaN(dVal) || isNaN(mxVal) || isNaN(myVal)) {
      setError('Please enter distance and both midpoint coordinates')
      return
    }

    setError('')
    const isCorrect =
      approxEqual(dVal, currentQuestion_.distance) &&
      approxEqual(mxVal, currentQuestion_.mx) &&
      approxEqual(myVal, currentQuestion_.my)

    setAnswers([
      ...answers,
      { distance: dVal, mx: mxVal, my: myVal, correct: isCorrect },
    ])

    if (isLastQuestion) {
      setShowResults(true)
    } else {
      setCurrentQuestion(currentQuestion + 1)
      setInputDistance('')
      setInputMx('')
      setInputMy('')
    }
  }

  const handleMentorStep = () => {
    if (mentorStep === 0) {
      setMentorStep(1)
      setError('')
      setTimeout(() => mentorXRef.current?.focus(), 0)
      return
    }

    if (mentorStep === 1) {
      const x1Val = parseInt(mentorX1)
      const y1Val = parseInt(mentorY1)
      if (isNaN(x1Val) || isNaN(y1Val)) {
        setError('Please enter both X and Y')
        return
      }
      if (x1Val !== currentQuestion_.x1 || y1Val !== currentQuestion_.y1) {
        setError(`Not quite. Point 1 is at (${currentQuestion_.x1}, ${currentQuestion_.y1})`)
        return
      }
      setError('')
      setMentorStep(2)
      setTimeout(() => mentorXRef.current?.focus(), 0)
      return
    }

    if (mentorStep === 2) {
      const x2Val = parseInt(mentorX2)
      const y2Val = parseInt(mentorY2)
      if (isNaN(x2Val) || isNaN(y2Val)) {
        setError('Please enter both X and Y')
        return
      }
      if (x2Val !== currentQuestion_.x2 || y2Val !== currentQuestion_.y2) {
        setError(`Not quite. Point 2 is at (${currentQuestion_.x2}, ${currentQuestion_.y2})`)
        return
      }
      setError('')
      setMentorStep(3)
      setTimeout(() => inputRef.current?.focus(), 0)
      return
    }

    if (mentorStep === 3) {
      // Δx = x2 - x1
      const dxVal = parseInt(inputAnswer)
      const correctDx = currentQuestion_.dx
      if (isNaN(dxVal)) {
        setError('Please enter a number')
        return
      }
      if (dxVal !== correctDx) {
        setError(`Not quite. ${currentQuestion_.x2} − ${currentQuestion_.x1} = ${correctDx}`)
        return
      }
      setMentorDx(dxVal)
      setInputAnswer('')
      setError('')
      setMentorStep(4)
      setTimeout(() => inputRef.current?.focus(), 0)
      return
    }

    if (mentorStep === 4) {
      // Δy = y2 - y1
      const dyVal = parseInt(inputAnswer)
      const correctDy = currentQuestion_.dy
      if (isNaN(dyVal)) {
        setError('Please enter a number')
        return
      }
      if (dyVal !== correctDy) {
        setError(`Not quite. ${currentQuestion_.y2} − ${currentQuestion_.y1} = ${correctDy}`)
        return
      }
      setMentorDy(dyVal)
      setInputAnswer('')
      setError('')
      setMentorStep(5)
      setTimeout(() => inputRef.current?.focus(), 0)
      return
    }

    if (mentorStep === 5) {
      // d = √(Δx² + Δy²)
      const dVal = parseFloat(inputAnswer)
      const correct = currentQuestion_.distance
      if (isNaN(dVal)) {
        setError('Please enter a number')
        return
      }
      if (!approxEqual(dVal, correct)) {
        const sum = mentorDx * mentorDx + mentorDy * mentorDy
        setError(`Not quite. √(${mentorDx}² + ${mentorDy}²) = √${sum} = ${correct}`)
        return
      }
      setMentorDistance(dVal)
      setInputAnswer('')
      setError('')
      setMentorStep(6)
      setTimeout(() => inputRef.current?.focus(), 0)
      return
    }

    if (mentorStep === 6) {
      // Mx = (X1 + X2) / 2
      const mxVal = parseFloat(inputAnswer)
      const correctMx = currentQuestion_.mx
      if (isNaN(mxVal)) {
        setError('Please enter a number')
        return
      }
      if (!approxEqual(mxVal, correctMx)) {
        setError(
          `Not quite. (${currentQuestion_.x1} + ${currentQuestion_.x2}) ÷ 2 = ${fmtMid(correctMx)}`
        )
        return
      }
      setMentorMx(mxVal)
      setInputAnswer('')
      setError('')
      setMentorStep(7)
      setTimeout(() => inputRef.current?.focus(), 0)
      return
    }

    if (mentorStep === 7) {
      // My = (Y1 + Y2) / 2
      const myVal = parseFloat(inputAnswer)
      const correctMy = currentQuestion_.my
      if (isNaN(myVal)) {
        setError('Please enter a number')
        return
      }
      if (!approxEqual(myVal, correctMy)) {
        setError(
          `Not quite. (${currentQuestion_.y1} + ${currentQuestion_.y2}) ÷ 2 = ${fmtMid(correctMy)}`
        )
        return
      }
      setError('')
      setAnswers([
        ...answers,
        {
          distance: mentorDistance,
          mx: mentorMx,
          my: myVal,
          correct: true,
        },
      ])

      if (isLastQuestion) {
        setShowResults(true)
      } else {
        setCurrentQuestion(currentQuestion + 1)
        setInputAnswer('')
        setMentorStep(0)
        setMentorX1('')
        setMentorY1('')
        setMentorX2('')
        setMentorY2('')
        setMentorDx(null)
        setMentorDy(null)
        setMentorDistance(null)
        setMentorMx(null)
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (blockEnterRef.current) {
        e.preventDefault()
      } else {
        e.preventDefault()
        handleSubmitAnswer()
      }
    }
  }

  const score = answers.filter((a) => a.correct).length

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="bg-white rounded-lg shadow-lg p-12 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Quiz Complete! 🎉</h1>
            <div className="text-6xl font-bold text-blue-600 mb-4">{score}/3</div>
            <p className="text-xl text-gray-600 mb-8">
              {score === 3 && 'Perfect! You got them all right!'}
              {score === 2 && 'Great job! You got 2 out of 3.'}
              {score === 1 && 'Good effort! You got 1 out of 3. Keep practicing!'}
              {score === 0 && "Don't worry! Review the formulas and try again."}
            </p>

            <div className="space-y-3 mb-8 text-left max-w-md mx-auto">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    answers[idx]?.correct
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                  }`}
                >
                  <p className="font-semibold text-gray-800">Question {idx + 1}</p>
                  <p className="text-sm text-gray-600">
                    Points: ({q.x1}, {q.y1}) and ({q.x2}, {q.y2})
                  </p>
                  <p className="text-sm text-gray-600">
                    Correct distance: <span className="font-bold">{q.distance}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Correct midpoint:{' '}
                    <span className="font-bold">
                      ({fmtMid(q.mx)}, {fmtMid(q.my)})
                    </span>
                  </p>
                  {answers[idx] && (
                    <p className="text-sm text-gray-600">
                      Your answer:{' '}
                      <span className="font-bold">
                        d = {answers[idx].distance}, M = ({fmtMid(answers[idx].mx)},{' '}
                        {fmtMid(answers[idx].my)})
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <motion.button
                onClick={() => {
                  setCurrentQuestion(0)
                  setAnswers([])
                  setInputDistance('')
                  setInputMx('')
                  setInputMy('')
                  setShowResults(false)
                  if (mode === 'mentor') {
                    setMentorStep(0)
                    setMentorX1('')
                    setMentorY1('')
                    setMentorX2('')
                    setMentorY2('')
                    setMentorDx(null)
                    setMentorDy(null)
                    setMentorDistance(null)
                    setMentorMx(null)
                    setInputAnswer('')
                  }
                  setQuizSeed((s) => s + 1)
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Try Again
              </motion.button>
              <motion.button
                onClick={onBack}
                className="w-full bg-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-400 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back to Levels
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Distance &amp; Midpoint
              <span className="text-lg ml-3 text-purple-600 font-semibold">
                {mode === 'master' ? '(Master Mode)' : '(Mentor Mode)'}
              </span>
            </h1>
            <span className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold">
              Question {currentQuestion + 1}/3
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / 3) * 100}%` }}
            />
          </div>
        </motion.div>

        {/* Quiz Container - Chart left, input right on desktop; stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Chart */}
          <motion.div
            className="bg-white rounded-lg shadow-lg p-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-gray-600 text-sm mb-4 font-semibold">
              Find the distance and midpoint between the two points:
            </p>
            <Chart
              points={[
                { x: currentQuestion_.x1, y: currentQuestion_.y1 },
                { x: currentQuestion_.x2, y: currentQuestion_.y2 },
              ]}
              onPointClick={() => {}}
              showCoordinates={false}
            />
          </motion.div>

          {/* Input panel */}
          <motion.div
            className="bg-white rounded-lg shadow-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {mode === 'mentor' ? (
              <>
                {mentorStep === 0 && (
                  <>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">
                      Let's find distance and midpoint!
                    </h2>
                    <p className="text-base text-gray-700 mb-2">We'll use these formulas:</p>
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-3">
                      <p className="text-xl font-bold text-gray-800 text-center">
                        d = √(∆x² + ∆y²)
                      </p>
                    </div>
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                      <p className="text-xl font-bold text-gray-800 text-center">
                        M = ((X₁ + X₂) ÷ 2, (Y₁ + Y₂) ÷ 2)
                      </p>
                    </div>
                    <p className="text-base text-gray-700">
                      First, read the coordinates from the chart above.
                    </p>
                  </>
                )}
                {mentorStep === 1 && (
                  <>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">
                      Step 1: Point 1 Coordinates
                    </h2>
                    <p className="text-sm text-gray-600 mb-3">
                      Look at the blue point on the left. Enter its X and Y values.
                    </p>
                    <div className="space-y-2 mb-3">
                      <input
                        ref={mentorXRef}
                        type="number"
                        min="0"
                        max="12"
                        value={mentorX1}
                        onChange={(e) => setMentorX1(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && mentorYRef.current?.focus()}
                        placeholder="X (0-12)"
                        className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                      />
                      <input
                        ref={mentorYRef}
                        type="number"
                        min="0"
                        max="12"
                        value={mentorY1}
                        onChange={(e) => setMentorY1(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Y (0-12)"
                        className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
                {mentorStep === 2 && (
                  <>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">
                      Step 2: Point 2 Coordinates
                    </h2>
                    <p className="text-sm text-gray-600 mb-3">
                      Look at the other blue point. Enter its X and Y values.
                    </p>
                    <div className="space-y-2 mb-3">
                      <input
                        ref={mentorXRef}
                        type="number"
                        min="0"
                        max="12"
                        value={mentorX2}
                        onChange={(e) => setMentorX2(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && mentorYRef.current?.focus()}
                        placeholder="X (0-12)"
                        className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                      />
                      <input
                        ref={mentorYRef}
                        type="number"
                        min="0"
                        max="12"
                        value={mentorY2}
                        onChange={(e) => setMentorY2(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Y (0-12)"
                        className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
                {mentorStep === 3 && (
                  <>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">Step 3: Calculate ∆x</h2>
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                      <p className="text-3xl font-bold text-gray-800 text-center">
                        ∆x = X₂ − X₁ = {mentorX2} − {mentorX1} = ?
                      </p>
                    </div>
                    <input
                      ref={inputRef}
                      type="number"
                      value={inputAnswer}
                      onChange={(e) => setInputAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter the answer"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded text-lg focus:outline-none focus:border-blue-500 mb-3"
                    />
                  </>
                )}
                {mentorStep === 4 && (
                  <>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">Step 4: Calculate ∆y</h2>
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                      <p className="text-3xl font-bold text-gray-800 text-center">
                        ∆y = Y₂ − Y₁ = {mentorY2} − {mentorY1} = ?
                      </p>
                    </div>
                    <input
                      ref={inputRef}
                      type="number"
                      value={inputAnswer}
                      onChange={(e) => setInputAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter the answer"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded text-lg focus:outline-none focus:border-blue-500 mb-3"
                    />
                  </>
                )}
                {mentorStep === 5 && (
                  <>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">
                      Step 5: Calculate Distance
                    </h2>
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                      <p className="text-2xl font-bold text-gray-800 text-center">
                        d = √(∆x² + ∆y²) = √(({mentorDx})² + ({mentorDy})²) = ?
                      </p>
                    </div>
                    <input
                      ref={inputRef}
                      type="number"
                      step="any"
                      value={inputAnswer}
                      onChange={(e) => setInputAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter the distance"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded text-lg focus:outline-none focus:border-blue-500 mb-3"
                    />
                  </>
                )}
                {mentorStep === 6 && (
                  <>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">
                      Step 6: Find Midpoint X
                    </h2>
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                      <p className="text-3xl font-bold text-gray-800 text-center">
                        Mx = ({mentorX1} + {mentorX2}) ÷ 2 = ?
                      </p>
                    </div>
                    <input
                      ref={inputRef}
                      type="number"
                      step="any"
                      value={inputAnswer}
                      onChange={(e) => setInputAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter the answer"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded text-lg focus:outline-none focus:border-blue-500 mb-3"
                    />
                  </>
                )}
                {mentorStep === 7 && (
                  <>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">
                      Step 7: Find Midpoint Y
                    </h2>
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                      <p className="text-3xl font-bold text-gray-800 text-center">
                        My = ({mentorY1} + {mentorY2}) ÷ 2 = ?
                      </p>
                    </div>
                    <input
                      ref={inputRef}
                      type="number"
                      step="any"
                      value={inputAnswer}
                      onChange={(e) => setInputAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter the answer"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded text-lg focus:outline-none focus:border-blue-500 mb-3"
                    />
                  </>
                )}
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-3">
                  Find the distance and midpoint
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                  Midpoints may be decimals (e.g., 3.5).
                </p>
                <div className="space-y-2 mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Distance (d)
                    <input
                      ref={masterDistanceRef}
                      type="number"
                      step="any"
                      value={inputDistance}
                      onChange={(e) => setInputDistance(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && masterMxRef.current?.focus()}
                      placeholder="d"
                      className="w-full mt-1 px-3 py-2 border-2 border-gray-300 rounded text-lg focus:outline-none focus:border-blue-500"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-gray-700">
                    Midpoint X (Mx)
                    <input
                      ref={masterMxRef}
                      type="number"
                      step="any"
                      value={inputMx}
                      onChange={(e) => setInputMx(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && masterMyRef.current?.focus()}
                      placeholder="Mx"
                      className="w-full mt-1 px-3 py-2 border-2 border-gray-300 rounded text-lg focus:outline-none focus:border-blue-500"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-gray-700">
                    Midpoint Y (My)
                    <input
                      ref={masterMyRef}
                      type="number"
                      step="any"
                      value={inputMy}
                      onChange={(e) => setInputMy(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="My"
                      className="w-full mt-1 px-3 py-2 border-2 border-gray-300 rounded text-lg focus:outline-none focus:border-blue-500"
                    />
                  </label>
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <motion.div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 rounded mb-3 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {/* Buttons */}
            <div className="space-y-1.5">
              <motion.button
                onClick={handleSubmitAnswer}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 rounded hover:shadow-lg transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {mode === 'mentor'
                  ? mentorStep === 0
                    ? 'Start →'
                    : mentorStep === 7 && isLastQuestion
                    ? '✓ Finish'
                    : '→ Next'
                  : isLastQuestion
                  ? '✓ Finish'
                  : '→ Next'}
              </motion.button>
              <motion.button
                onClick={onBack}
                className="w-full bg-gray-300 text-gray-700 font-semibold py-2 rounded hover:bg-gray-400 transition-colors text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ← Back
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
