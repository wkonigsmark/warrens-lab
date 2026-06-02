import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Chart from './Chart'

const MAX_VALUE = 12

export default function QuizLevelMidpoint({ mode = 'master', onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])

  // Master mode: two inputs (Mx, My)
  const [inputMx, setInputMx] = useState('')
  const [inputMy, setInputMy] = useState('')

  // Mentor mode state
  const [mentorStep, setMentorStep] = useState(0) // 0=info, 1=point1, 2=point2, 3=Mx, 4=My
  const [mentorX1, setMentorX1] = useState('')
  const [mentorY1, setMentorY1] = useState('')
  const [mentorX2, setMentorX2] = useState('')
  const [mentorY2, setMentorY2] = useState('')
  const [mentorMx, setMentorMx] = useState(null)
  const [inputAnswer, setInputAnswer] = useState('') // shared input for mentor steps 3, 4

  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState('')
  const [quizSeed, setQuizSeed] = useState(0)

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
        masterMxRef.current?.focus()
      } else if (mode === 'mentor') {
        if (mentorStep === 1 || mentorStep === 2) {
          mentorXRef.current?.focus()
        } else if (mentorStep === 3 || mentorStep === 4) {
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
        setInputMx('')
        setInputMy('')
        setShowResults(false)
        if (mode === 'mentor') {
          setMentorStep(0)
          setMentorX1('')
          setMentorY1('')
          setMentorX2('')
          setMentorY2('')
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
  }, [showResults, mentorStep, inputMx, inputMy, mentorX1, mentorY1, mentorX2, mentorY2, inputAnswer])

  // Generate 3 problems with INTEGER midpoints (pick midpoint, then offsets)
  const questions = useMemo(() => {
    const generate = () => {
      let attempts = 0
      while (attempts < 50) {
        const mx = 2 + Math.floor(Math.random() * 9) // 2..10
        const my = 2 + Math.floor(Math.random() * 9)
        const dx = 1 + Math.floor(Math.random() * 4) // 1..4
        const dy = 1 + Math.floor(Math.random() * 4)
        const x1 = mx - dx
        const x2 = mx + dx
        const y1 = my - dy
        const y2 = my + dy
        if (x1 >= 0 && x2 <= MAX_VALUE && y1 >= 0 && y2 <= MAX_VALUE) {
          return { x1, y1, x2, y2, mx, my }
        }
        attempts++
      }
      return { x1: 2, y1: 2, x2: 6, y2: 8, mx: 4, my: 5 }
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

    if (mode === 'mentor') {
      return handleMentorStep()
    }

    // Master mode
    const mxVal = parseInt(inputMx)
    const myVal = parseInt(inputMy)

    if (isNaN(mxVal) || isNaN(myVal)) {
      setError('Please enter both midpoint coordinates')
      return
    }

    setError('')
    const isCorrect = mxVal === currentQuestion_.mx && myVal === currentQuestion_.my
    setAnswers([...answers, { mx: mxVal, my: myVal, correct: isCorrect }])

    if (isLastQuestion) {
      setShowResults(true)
    } else {
      setCurrentQuestion(currentQuestion + 1)
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
      // Mx = (X1 + X2) / 2
      const mxVal = parseInt(inputAnswer)
      const correctMx = currentQuestion_.mx
      if (isNaN(mxVal)) {
        setError('Please enter a number')
        return
      }
      if (mxVal !== correctMx) {
        setError(`Not quite. (${currentQuestion_.x1} + ${currentQuestion_.x2}) ÷ 2 = ${correctMx}`)
        return
      }
      setMentorMx(mxVal)
      setInputAnswer('')
      setError('')
      setMentorStep(4)
      setTimeout(() => inputRef.current?.focus(), 0)
      return
    }

    if (mentorStep === 4) {
      // My = (Y1 + Y2) / 2
      const myVal = parseInt(inputAnswer)
      const correctMy = currentQuestion_.my
      if (isNaN(myVal)) {
        setError('Please enter a number')
        return
      }
      if (myVal !== correctMy) {
        setError(`Not quite. (${currentQuestion_.y1} + ${currentQuestion_.y2}) ÷ 2 = ${correctMy}`)
        return
      }
      setError('')
      setAnswers([
        ...answers,
        { mx: mentorMx, my: myVal, correct: true },
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
              {score === 3 && "Perfect! You got them all right!"}
              {score === 2 && "Great job! You got 2 out of 3."}
              {score === 1 && "Good effort! You got 1 out of 3. Keep practicing!"}
              {score === 0 && "Don't worry! Review the midpoint formula and try again."}
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
                    Correct midpoint: <span className="font-bold">({q.mx}, {q.my})</span>
                  </p>
                  {answers[idx] && (
                    <p className="text-sm text-gray-600">
                      Your answer:{' '}
                      <span className="font-bold">
                        ({answers[idx].mx}, {answers[idx].my})
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
                  setInputMx('')
                  setInputMy('')
                  setShowResults(false)
                  if (mode === 'mentor') {
                    setMentorStep(0)
                    setMentorX1('')
                    setMentorY1('')
                    setMentorX2('')
                    setMentorY2('')
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
              Midpoint
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
              Find the midpoint between the two points:
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
                    <h2 className="text-xl font-bold text-gray-800 mb-3">Let's find the midpoint!</h2>
                    <p className="text-base text-gray-700 mb-2">We'll use this formula:</p>
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                      <p className="text-2xl font-bold text-gray-800 text-center">
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
                    <h2 className="text-xl font-bold text-gray-800 mb-3">Step 1: Point 1 Coordinates</h2>
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
                    <h2 className="text-xl font-bold text-gray-800 mb-3">Step 2: Point 2 Coordinates</h2>
                    <p className="text-sm text-gray-600 mb-3">
                      Look at the blue point on the right. Enter its X and Y values.
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
                    <h2 className="text-xl font-bold text-gray-800 mb-3">Step 3: Find Midpoint X</h2>
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                      <p className="text-3xl font-bold text-gray-800 text-center">
                        Mx = ({mentorX1} + {mentorX2}) ÷ 2 = ?
                      </p>
                    </div>
                    <div className="mb-3">
                      <input
                        ref={inputRef}
                        type="number"
                        value={inputAnswer}
                        onChange={(e) => setInputAnswer(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter the answer"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded text-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
                {mentorStep === 4 && (
                  <>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">Step 4: Find Midpoint Y</h2>
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                      <p className="text-3xl font-bold text-gray-800 text-center">
                        My = ({mentorY1} + {mentorY2}) ÷ 2 = ?
                      </p>
                    </div>
                    <div className="mb-3">
                      <input
                        ref={inputRef}
                        type="number"
                        value={inputAnswer}
                        onChange={(e) => setInputAnswer(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter the answer"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded text-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-3">What is the midpoint?</h2>
                <div className="space-y-2 mb-3">
                  <input
                    ref={masterMxRef}
                    type="number"
                    min="0"
                    max="12"
                    value={inputMx}
                    onChange={(e) => setInputMx(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && masterMyRef.current?.focus()}
                    placeholder="Mx (midpoint X)"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded text-lg focus:outline-none focus:border-blue-500"
                  />
                  <input
                    ref={masterMyRef}
                    type="number"
                    min="0"
                    max="12"
                    value={inputMy}
                    onChange={(e) => setInputMy(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="My (midpoint Y)"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded text-lg focus:outline-none focus:border-blue-500"
                  />
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
                    : mentorStep === 4 && isLastQuestion
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
