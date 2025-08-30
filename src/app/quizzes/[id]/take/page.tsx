'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { IQuiz, QuizSubmissionResult } from '@/types/quiz'
import QuizSession from '@/components/quiz/QuizSession'
import QuizResults from '@/components/quiz/QuizResults'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { fetchWithAuth } from '@/utils/fetchWithAuth'

type QuizState = 'loading' | 'taking' | 'completed'

export default function TakeQuizPage() {
  const router = useRouter()
  const params = useParams()
  const id = (params?.id as string) || ''
  const { data: session, status } = useSession()
  const [quiz, setQuiz] = useState<IQuiz | null>(null)
  const [quizState, setQuizState] = useState<QuizState>('loading')
  const [result, setResult] = useState<QuizSubmissionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetchWithAuth(`/api/quizzes/${id}`)

        if (!response.ok) {
          throw new Error('Failed to fetch quiz')
        }

        const data = await response.json()
        const q = data.quiz || data.data
        setQuiz(q)
        setQuizState('taking')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz')
      }
    }

    if (status === 'authenticated' && id) {
      fetchQuiz()
    } else if (status === 'unauthenticated') {
      setError('Please sign in to take the quiz')
    }
  }, [id, status, session?.user?.accessToken])

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