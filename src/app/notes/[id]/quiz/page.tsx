'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface Question {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Quiz {
  _id: string
  title: string
  questions: Question[]
  attempts: {
    date: string
    score: number
    totalQuestions: number
  }[]
}

export default function QuizPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = useParams()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [quizResults, setQuizResults] = useState<{
    score: number
    totalQuestions: number
    correctAnswers: number[]
    explanations: string[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        if (!session?.user?.accessToken) return

        console.log('Fetching quiz for note:', id);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/notes/${id}`, {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
          },
        })

        const data = await response.json()
        console.log('Quiz fetch response:', data);

        if (!response.ok) {
          if (response.status === 404) {
            console.log('Quiz not found, redirecting to generate page');
            router.push(`/notes/${id}/quiz/generate`)
            return
          }
          throw new Error(data.message || 'Failed to fetch quiz')
        }

        if (!data.success || !data.quiz) {
          console.log('Invalid quiz data received:', data);
          throw new Error('Invalid quiz data received')
        }

        console.log('Quiz fetched successfully:', data.quiz);
        setQuiz(data.quiz)
        setSelectedAnswers(new Array(data.quiz.questions.length).fill(-1))
      } catch (err) {
        console.error('Error fetching quiz:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch quiz')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuiz()
  }, [session, id, router])

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      if (!session?.user?.accessToken || !quiz) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/notes/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({ answers: selectedAnswers }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit quiz')
      }

      const results = await response.json()
      setQuizResults(results)
      setShowResults(true)
    } catch (err) {
      console.error('Error submitting quiz:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit quiz')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-obsidian py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-accent-obsidian py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Quiz not found</h2>
            <motion.button
              onClick={() => router.push(`/notes/${id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-accent-neon text-black rounded-lg mx-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Note
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  if (showResults && quizResults) {
    return (
      <div className="min-h-screen bg-accent-obsidian py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <motion.button
              onClick={() => router.push(`/notes/${id}`)}
              className="p-2 text-accent-silver hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </motion.button>
            <h1 className="text-3xl font-bold text-white">Quiz Results</h1>
          </div>

          <div className="bg-glass backdrop-blur-sm rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-white mb-2">
                {quizResults.score} / {quizResults.totalQuestions}
              </div>
              <div className="text-accent-silver">
                {Math.round((quizResults.score / quizResults.totalQuestions) * 100)}% Correct
              </div>
            </div>

            <div className="space-y-6">
              {quiz.questions.map((question, index) => (
                <div key={index} className="p-6 bg-black/20 rounded-lg">
                  <div className="flex items-start gap-4">
                    {selectedAnswers[index] === quizResults.correctAnswers[index] ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                    )}
                    <div>
                      <h3 className="text-white font-medium mb-2">{question.question}</h3>
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-3 rounded-lg ${
                              optionIndex === quizResults.correctAnswers[index]
                                ? 'bg-green-500/20 text-green-500'
                                : optionIndex === selectedAnswers[index]
                                ? 'bg-red-500/20 text-red-500'
                                : 'bg-white/5 text-accent-silver'
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-accent-silver">
                        <strong className="text-accent-neon">Explanation:</strong>{' '}
                        {quizResults.explanations[index]}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <motion.button
                onClick={() => {
                  setShowResults(false)
                  setSelectedAnswers(new Array(quiz.questions.length).fill(-1))
                  setCurrentQuestion(0)
                }}
                className="px-6 py-3 bg-accent-silver/20 text-accent-silver rounded-xl hover:bg-accent-silver/30 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Try Again
              </motion.button>
              <motion.button
                onClick={() => router.push(`/notes/${id}`)}
                className="px-6 py-3 bg-accent-neon text-black rounded-xl hover:bg-accent-neon/90 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back to Note
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-accent-obsidian">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-accent-neon/10 via-transparent to-transparent" />
      
      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <motion.button
              onClick={() => router.push(`/notes/${id}`)}
              className="p-2 text-accent-silver hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </motion.button>
            <h1 className="text-3xl font-bold text-white">{quiz.title}</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
              {error}
            </div>
          )}

          <div className="bg-glass backdrop-blur-sm rounded-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="text-accent-silver">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </div>
              <div className="text-accent-silver">
                {selectedAnswers.filter((a) => a !== -1).length} answered
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-6">
                {quiz.questions[currentQuestion].question}
              </h2>
              <div className="space-y-4">
                {quiz.questions[currentQuestion].options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 rounded-lg text-left transition-colors ${
                      selectedAnswers[currentQuestion] === index
                        ? 'bg-accent-neon text-black'
                        : 'bg-white/5 text-accent-silver hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <motion.button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-accent-silver/20 text-accent-silver rounded-xl hover:bg-accent-silver/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={currentQuestion > 0 ? { scale: 1.02 } : {}}
                whileTap={currentQuestion > 0 ? { scale: 0.98 } : {}}
              >
                Previous
              </motion.button>
              {currentQuestion === quiz.questions.length - 1 ? (
                <motion.button
                  onClick={handleSubmit}
                  disabled={selectedAnswers.some((a) => a === -1)}
                  className="px-6 py-3 bg-accent-neon text-black rounded-xl hover:bg-accent-neon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!selectedAnswers.some((a) => a === -1) ? { scale: 1.02 } : {}}
                  whileTap={!selectedAnswers.some((a) => a === -1) ? { scale: 0.98 } : {}}
                >
                  Submit
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleNext}
                  className="px-6 py-3 bg-accent-neon text-black rounded-xl hover:bg-accent-neon/90 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Next
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 