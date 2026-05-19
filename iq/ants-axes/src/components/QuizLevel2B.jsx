import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Chart from './Chart'

const GRID_SIZE = 480
const CELL_SIZE = 40
const MAX_VALUE = 12
const TOP_PADDING = 25

export default function QuizLevel2B({ mode = 'master', onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [inputSlope, setInputSlope] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState('')
  const [mentorStep, setMentorStep] = useState(0) // 0=info, 1=point1, 2=point2, 3=rise, 4=run, 5=slope
  const [mentorX1, setMentorX1] = useState('')
  const [mentorY1, setMentorY1] = useState('')
  const [mentorX2, setMentorX2] = useState('')
  const [mentorY2, setMentorY2] = useState('')
  const [mentorRise, setMentorRise] = useState(null)
  const [mentorRun, setMentorRun] = useState(null)
  const mentorXRef = useRef(null)
  const mentorYRef = useRef(null)
  const inputRef = useRef(null)
  const blockEnterRef = useRef(false)

  // Auto-focus input when question changes
  useEffect(() => {
    if (inputRef.current && !showResults) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [currentQuestion, showResults])

  // Handle Enter key on results screen to trigger Try Again
  useEffect(() => {
    if (!showResults) return

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        blockEnterRef.current = true
        setCurrentQuestion(0)
        setAnswers([])
        setInputSlope('')
        setShowResults(false)
        if (mode === 'mentor') {
          setMentorStep(0)
          setMentorX1('')
          setMentorY1('')
          setMentorX2('')
          setMentorY2('')
          setMentorRise(null)
          setMentorRun(null)
        }
        setTimeout(() => { blockEnterRef.current = false }, 100)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showResults, mode])

  // Handle Enter key to trigger submit button on quiz screens
  useEffect(() => {
    if (showResults) return

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !showResults && !blockEnterRef.current) {
        e.preventDefault()
        handleSubmitAnswer()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showResults, inputSlope])

  // Generate 3 random questions with positive or negative whole number slopes
  const questions = useMemo(() => {
    const generateQuestion = () => {
      let x1, y1, x2, y2, slope
      let attempts = 0

      do {
        x1 = Math.floor(Math.random() * (MAX_VALUE - 4))
        y1 = Math.floor(Math.random() * (MAX_VALUE - 2))
        slope = -3 + Math.floor(Math.random() * 7) // slope from -3 to 3
        if (slope === 0) slope = 1 // avoid zero slope
        const dx = 1 + Math.floor(Math.random() * 2) // run of 1 or 2
        const dy = slope * dx // ensures whole number slope
        x2 = x1 + dx
        y2 = y1 + dy
        attempts++
      } while ((x2 > MAX_VALUE || y2 > MAX_VALUE || y2 < 0 || y1 < 0) && attempts < 10)

      return { x1, y1, x2, y2, slope }
    }

    return [generateQuestion(), generateQuestion(), generateQuestion()]
  }, [])

  const currentQuestion_ = questions[currentQuestion]
  const isLastQuestion = currentQuestion === 2

  const handleSubmitAnswer = () => {
    if (blockEnterRef.current) return

    if (mode === 'mentor') {
      return handleMentorStep()
    }

    // Master mode
    const slopeVal = parseInt(inputSlope)

    if (isNaN(slopeVal)) {
      setError('Please enter the slope')
      return
    }

    if (slopeVal < -12 || slopeVal > 12) {
      setError('Slope must be between -12 and 12')
      return
    }

    setError('')
    const isCorrect = slopeVal === currentQuestion_.slope
    setAnswers([...answers, { slope: slopeVal, correct: isCorrect }])

    if (isLastQuestion) {
      setShowResults(true)
    } else {
      setCurrentQuestion(currentQuestion + 1)
      setInputSlope('')
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
      const riseVal = parseInt(inputSlope)
      const x1Val = parseInt(mentorX1)
      const y1Val = parseInt(mentorY1)
      const x2Val = parseInt(mentorX2)
      const y2Val = parseInt(mentorY2)
      const correctRise = y2Val - y1Val
      if (isNaN(riseVal)) {
        setError('Please enter a number')
        return
      }
      if (riseVal !== correctRise) {
        setError(`Not quite. ${y2Val} - ${y1Val} = ${correctRise}`)
        return
      }
      setMentorRise(riseVal)
      setInputSlope('')
      setError('')
      setMentorStep(4)
      setTimeout(() => inputRef.current?.focus(), 0)
      return
    }

    if (mentorStep === 4) {
      const runVal = parseInt(inputSlope)
      const x1Val = parseInt(mentorX1)
      const x2Val = parseInt(mentorX2)
      const correctRun = x2Val - x1Val
      if (isNaN(runVal)) {
        setError('Please enter a number')
        return
      }
      if (runVal !== correctRun) {
        setError(`Not quite. ${x2Val} - ${x1Val} = ${correctRun}`)
        return
      }
      setMentorRun(runVal)
      setInputSlope('')
      setError('')
      setMentorStep(5)
      setTimeout(() => inputRef.current?.focus(), 0)
      return
    }

    if (mentorStep === 5) {
      const slopeVal = parseInt(inputSlope)
      const correctSlope = currentQuestion_.slope

      if (isNaN(slopeVal)) {
        setError('Please enter a number')
        return
      }

      if (slopeVal !== correctSlope) {
        setError(`Not quite. ${mentorRise} ÷ ${mentorRun} = ${correctSlope}`)
        return
      }

      setError('')
      setAnswers([...answers, { slope: slopeVal, correct: true }])

      if (isLastQuestion) {
        setShowResults(true)
      } else {
        setCurrentQuestion(currentQuestion + 1)
        setInputSlope('')
        setMentorStep(0)
        setMentorX1('')
        setMentorY1('')
        setMentorX2('')
        setMentorY2('')
        setMentorRise(null)
        setMentorRun(null)
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

            <div className="text-6xl font-bold text-blue-600 mb-4">
              {score}/3
            </div>

            <p className="text-xl text-gray-600 mb-8">
              {score === 3 && "Perfect! You got them all right!"}
              {score === 2 && "Great job! You got 2 out of 3."}
              {score === 1 && "Good effort! You got 1 out of 3. Keep practicing!"}
              {score === 0 && "Don't worry! Review the slope calculations and try again."}
            </p>

            {/* Answer Review */}
            <div className="space-y-3 mb-8 text-left max-w-md mx-auto">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    answers[idx]?.correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                  }`}
                >
                  <p className="font-semibold text-gray-800">Question {idx + 1}</p>
                  <p className="text-sm text-gray-600">
                    Points: ({q.x1}, {q.y1}) and ({q.x2}, {q.y2})
                  </p>
                  <p className="text-sm text-gray-600">
                    Correct slope: <span className="font-bold">{q.slope}</span>
                  </p>
                  {answers[idx] && (
                    <p className="text-sm text-gray-600">
                      Your answer: <span className="font-bold">{answers[idx].slope}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <motion.button
                onClick={() => {
                  setCurrentQuestion(0)
                  setAnswers([])
                  setInputSlope('')
                  setShowResults(false)
                  if (mode === 'mentor') {
                    setMentorStep(0)
                    setMentorX1('')
                    setMentorY1('')
                    setMentorX2('')
                    setMentorY2('')
                    setMentorRise(null)
                    setMentorRun(null)
                  }
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Level 2B: Calculate Slope (With Negatives)
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

        {/* Quiz Container - Single column */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Chart */}
          <motion.div
            className="bg-white rounded-lg shadow-lg p-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-gray-600 text-sm mb-4 font-semibold">Find the slope between the two points:</p>
            <Chart
              points={[
                { x: currentQuestion_.x1, y: currentQuestion_.y1 },
                { x: currentQuestion_.x2, y: currentQuestion_.y2 }
              ]}
              onPointClick={() => {}}
              showCoordinates={false}
            />
          </motion.div>

          {/* Input */}
          <motion.div
            className="bg-white rounded-lg shadow-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {mode === 'mentor' ? (
              <>
                {mentorStep === 0 && (
                  <>
                    <h2 className="text-lg font-bold text-gray-800 mb-3">Let's find the slope!</h2>
                    <p className="text-sm text-gray-600 mb-3">We'll use the formula: slope = (Y₂ - Y₁) ÷ (X₂ - X₁)</p>
                    <p className="text-sm text-gray-600">First, read the coordinates from the chart above.</p>
                  </>
                )}
                {mentorStep === 1 && (
                  <>
                    <h2 className="text-lg font-bold text-gray-800 mb-3">Step 1: Point 1 Coordinates</h2>
                    <p className="text-sm text-gray-600 mb-3">Look at the blue point on the left. Enter its X and Y values.</p>
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
                    <h2 className="text-lg font-bold text-gray-800 mb-3">Step 2: Point 2 Coordinates</h2>
                    <p className="text-sm text-gray-600 mb-3">Look at the blue point on the right. Enter its X and Y values.</p>
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
                    <h2 className="text-lg font-bold text-gray-800 mb-3">Step 3: Calculate the Rise</h2>
                    <p className="text-sm text-gray-600 mb-2">Y₂ - Y₁ = {mentorY2} - {mentorY1} = ?</p>
                    <div className="mb-3">
                      <input
                        ref={inputRef}
                        type="number"
                        value={inputSlope}
                        onChange={(e) => setInputSlope(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter the answer"
                        className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
                {mentorStep === 4 && (
                  <>
                    <h2 className="text-lg font-bold text-gray-800 mb-3">Step 4: Calculate the Run</h2>
                    <p className="text-sm text-gray-600 mb-2">X₂ - X₁ = {mentorX2} - {mentorX1} = ?</p>
                    <div className="mb-3">
                      <input
                        ref={inputRef}
                        type="number"
                        value={inputSlope}
                        onChange={(e) => setInputSlope(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter the answer"
                        className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
                {mentorStep === 5 && (
                  <>
                    <h2 className="text-lg font-bold text-gray-800 mb-3">Step 5: Calculate the Slope</h2>
                    <p className="text-sm text-gray-600 mb-2">Slope = Rise ÷ Run = {mentorRise} ÷ {mentorRun} = ?</p>
                    <div className="mb-3">
                      <input
                        ref={inputRef}
                        type="number"
                        value={inputSlope}
                        onChange={(e) => setInputSlope(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter the slope"
                        className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-800 mb-3">What is the slope?</h2>

                {/* Slope input */}
                <div className="mb-3">
                  <input
                    ref={inputRef}
                    type="number"
                    min="-12"
                    max="12"
                    value={inputSlope}
                    onChange={(e) => setInputSlope(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Slope (can be negative)"
                    className="w-full px-2 py-1.5 border-2 border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <motion.div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 rounded mb-3 text-xs"
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
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-1.5 rounded hover:shadow-lg transition-shadow text-xs"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {mode === 'mentor' ? (
                  mentorStep === 0 ? 'Start →' : mentorStep === 5 && isLastQuestion ? '✓ Finish' : '→ Next'
                ) : (
                  isLastQuestion ? '✓ Finish' : '→ Next'
                )}
              </motion.button>

              <motion.button
                onClick={onBack}
                className="w-full bg-gray-300 text-gray-700 font-semibold py-1.5 rounded hover:bg-gray-400 transition-colors text-xs"
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
