'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { PlayIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { IQuiz, QuizSubmissionResult } from '@/types/quiz'

export default function QuizDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [quiz, setQuiz] = useState<IQuiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!params.id) return
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/${params.id}`, {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch quiz')
        }

        const data = await response.json()
        setQuiz(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.accessToken) {
      fetchQuiz()
    }
  }, [params.id, session?.user?.accessToken])

  const handleTakeQuiz = () => {
    router.push(`/quizzes/${params.id}/take`)
  }

  const handleEditQuiz = () => {
    router.push(`/quizzes/${params.id}/edit`)
  }

  const handleDeleteQuiz = async () => {
    if (!confirm('Are you sure you want to delete this quiz?')) {
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete quiz')
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quiz')
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Quiz Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{quiz?.title}</h1>
            <p className="text-accent-silver">{quiz?.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleEditQuiz}
              className="p-2 text-accent-silver hover:text-accent-neon"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PencilIcon className="h-5 w-5" />
            </motion.button>
            <motion.button
              onClick={handleDeleteQuiz}
              className="p-2 text-accent-silver hover:text-red-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <TrashIcon className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        {/* Quiz Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10">
            <h2 className="text-lg font-medium text-white mb-4">Quiz Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-accent-silver">Number of Questions</p>
                <p className="text-lg font-medium text-white">{quiz?.questions.length}</p>
              </div>
              <div>
                <p className="text-sm text-accent-silver">Difficulty</p>
                <p className="text-lg font-medium text-white capitalize">{quiz?.difficulty}</p>
              </div>
              <div>
                <p className="text-sm text-accent-silver">Time Limit</p>
                <p className="text-lg font-medium text-white">
                  {quiz?.timeLimit ? `${quiz.timeLimit} minutes` : 'No time limit'}
                </p>
              </div>
              <div>
                <p className="text-sm text-accent-silver">Passing Score</p>
                <p className="text-lg font-medium text-white">{quiz?.passingScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10">
            <h2 className="text-lg font-medium text-white mb-4">Analytics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-accent-silver">Total Attempts</p>
                <p className="text-lg font-medium text-white">{quiz?.analytics.totalAttempts}</p>
              </div>
              <div>
                <p className="text-sm text-accent-silver">Average Score</p>
                <p className="text-lg font-medium text-white">{quiz?.analytics.averageScore.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-accent-silver">Average Time</p>
                <p className="text-lg font-medium text-white">
                  {Math.round(quiz?.analytics.averageTimeSpent / 60)} minutes
                </p>
              </div>
              <div>
                <p className="text-sm text-accent-silver">Completion Rate</p>
                <p className="text-lg font-medium text-white">{quiz?.analytics.completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {quiz?.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {quiz.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-accent-neon/20 text-accent-neon rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Take Quiz Button */}
        <div className="flex justify-center">
          <motion.button
            onClick={handleTakeQuiz}
            className="flex items-center gap-2 px-8 py-3 bg-accent-neon text-black rounded-full font-medium hover:bg-accent-neon/90"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlayIcon className="h-5 w-5" />
            Take Quiz
          </motion.button>
        </div>

        <h2 className="text-lg font-semibold mt-8 mb-4">Your Score</h2>
        <p className="text-white">Score: {/* Display user's score here */}</p>
        <button className="mt-4 px-4 py-2 bg-accent-neon text-black rounded" onClick={() => {/* Logic to retake quiz */}}>Retake Quiz</button>
      </motion.div>
    </div>
  )
} 