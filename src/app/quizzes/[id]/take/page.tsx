'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { IQuiz, QuizSubmissionResult } from '@/types/quiz'
import QuizSession from '@/components/quiz/QuizSession'
import QuizResults from '@/components/quiz/QuizResults'
import LoadingSpinner from '@/components/common/LoadingSpinner'

type QuizState = 'loading' | 'taking' | 'completed'

export default function TakeQuizPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [quiz, setQuiz] = useState<IQuiz | null>(null)
  const [quizState, setQuizState] = useState<QuizState>('loading')
  const [result, setResult] = useState<QuizSubmissionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { id } = await params;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${session?.user?.accessToken}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch quiz')
        }

        const data = await response.json()
        setQuiz(data.data)
        setQuizState('taking')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz')
      }
    }

    if (session?.user?.accessToken) {
      fetchQuiz()
    }
  }, [params, session?.user?.accessToken])

  const handleQuizComplete = (result: QuizSubmissionResult) => {
    setResult(result)
    setQuizState('completed')
  }

  const handleRetry = () => {
    setQuizState('taking')
    setResult(null)
  }

  const handleExit = () => {
    router.push('/quizzes')
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <button
            onClick={handleExit}
            className="px-6 py-2 bg-accent-neon text-black rounded-full font-medium hover:bg-accent-neon/90"
          >
            Return to Quizzes
          </button>
        </div>
      </div>
    )
  }

  if (quizState === 'loading' || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (quizState === 'completed' && result) {
    return (
      <QuizResults
        result={result}
        onRetry={handleRetry}
        onExit={handleExit}
      />
    )
  }

  return (
    <QuizSession
      quiz={quiz}
      onComplete={handleQuizComplete}
      onExit={handleExit}
    />
  )
} 