import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon } from '@heroicons/react/24/outline'
import { IQuiz, IQuizQuestion, QuizSubmissionResult } from '@/types/quiz'

interface QuizSessionProps {
  quiz: IQuiz
  onComplete: (result: QuizSubmissionResult) => void
  onExit: () => void
}

export default function QuizSession({ quiz, onComplete, onExit }: QuizSessionProps) {
  const { data: session } = useSession()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>(new Array(quiz.questions.length).fill(-1))
  const [timeSpentPerQuestion, setTimeSpentPerQuestion] = useState<number[]>(new Array(quiz.questions.length).fill(0))
  const [remainingTime, setRemainingTime] = useState<number | null>(quiz.timeLimit ? quiz.timeLimit * 60 : null)
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Timer logic
  useEffect(() => {
    if (remainingTime === null) return

    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [remainingTime])

  // Track time spent on current question
  useEffect(() => {
    setQuestionStartTime(Date.now())
    return () => {
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000)
      setTimeSpentPerQuestion(prev => {
        const updated = [...prev]
        updated[currentQuestionIndex] += timeSpent
        return updated
      })
    }
  }, [currentQuestionIndex])

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => {
      const updated = [...prev]
      updated[currentQuestionIndex] = optionIndex
      return updated
    })
  }

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Calculate final time for current question
      const finalTimeSpent = [...timeSpentPerQuestion];
      const currentTimeSpent = Math.round((Date.now() - questionStartTime) / 1000);
      finalTimeSpent[currentQuestionIndex] += currentTimeSpent;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/${quiz._id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({
          answers: answers,
          timeSpentPerQuestion: finalTimeSpent,
        }),
      })

      const result = await response.json()
      
      if (!response.ok || !result.success) {
        setError(result.message || 'Failed to submit quiz')
        return
      }
      
      onComplete({
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        explanations: result.explanations,
        detailedAnswers: result.detailedAnswers.map((ans: any, index: number) => ({
          ...ans,
          timeTaken: finalTimeSpent[index]
        })),
        passed: result.passed
      })
    } catch (err) {
      console.error('Error submitting quiz:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit quiz')
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1
  const hasAnsweredAll = answers.every(answer => answer !== -1)

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
        {remainingTime !== null && (
          <div className="flex items-center gap-2 text-accent-neon">
            <ClockIcon className="h-5 w-5" />
            <span>{formatTime(remainingTime)}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-neon transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <h2 className="text-xl text-white">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </h2>
          <p className="text-lg text-white/90">{currentQuestion.question}</p>

          {/* Options */}
          <div className="grid gap-4">
            {currentQuestion.options.map((option, optionIndex) => (
              <button
                key={optionIndex}
                onClick={() => handleAnswerSelect(optionIndex)}
                className={`p-4 rounded-lg text-left transition-all ${
                  answers[currentQuestionIndex] === optionIndex
                    ? 'bg-accent-neon text-black'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="h-5 w-5" />
          Previous
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={!hasAnsweredAll || isSubmitting}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              hasAnsweredAll && !isSubmitting
                ? 'bg-accent-neon text-black hover:bg-accent-neon/90'
                : 'bg-white/10 text-white/50 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={answers[currentQuestionIndex] === -1}
            className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 text-red-500 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
} 