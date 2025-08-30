'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { PlayIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { IQuiz } from '@/types/quiz'
import { fetchWithAuth } from '@/utils/fetchWithAuth'

export default function QuizDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [quiz, setQuiz] = useState<IQuiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')

  const fetchQuiz = async () => {
    if (!params.id) return
    try {
      const response = await fetchWithAuth(`/api/quizzes/${params.id}`)

      if (!response.ok) {
        throw new Error('Failed to fetch quiz')
      }

      const data = await response.json()
      const q = data.quiz || data.data // handle both response shapes
      setQuiz(q)
      setEditedTitle(q?.title || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchQuiz()
    }
  }, [params.id, session?.user?.accessToken])

  const handleTakeQuiz = () => {
    router.push(`/quizzes/${params.id}/take`)
  }

  const handleEditQuiz = () => {
    setIsEditingTitle(true)
  }

  const handleSaveTitle = async () => {
    if (!quiz) return
    try {
      const response = await fetchWithAuth(`/api/quizzes/${quiz._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editedTitle.trim() || quiz.title }),
      })
      if (!response.ok) throw new Error('Failed to update quiz title')
      const updated = await response.json()
      setQuiz(updated.data || updated.quiz)
      setIsEditingTitle(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quiz title')
    }
  }

  const handleCancelEdit = () => {
    setIsEditingTitle(false)
    setEditedTitle(quiz?.title || '')
  }

  const handleDeleteQuiz = async () => {
    if (!confirm('Delete this quiz?')) return
    try {
      const response = await fetchWithAuth(`/api/quizzes/${params.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete quiz')
      router.push('/quizzes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quiz')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                className="bg-white/5 rounded-lg px-3 py-1.5 text-white border border-accent-silver/20"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
              <button onClick={handleSaveTitle} className="p-2 text-accent-neon hover:text-accent-neon/80">
                <CheckIcon className="h-5 w-5" />
              </button>
              <button onClick={handleCancelEdit} className="p-2 text-red-500 hover:text-red-400">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <h1 className="text-2xl font-bold text-white">{quiz?.title}</h1>
          )}
        </div>
        <div className="flex items-center gap-2">
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
          </div>
        </div>

        <div className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10">
          <h2 className="text-lg font-medium text-white mb-4">Actions</h2>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleTakeQuiz}
              className="flex items-center gap-2 px-4 py-2 bg-accent-neon text-black rounded-lg hover:bg-accent-neon/90 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PlayIcon className="h-5 w-5" />
              Take Quiz
            </motion.button>
          </div>
        </div>
      </div>

      {/* Questions Preview */}
      <div className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10">
        <h2 className="text-lg font-medium text-white mb-4">Questions</h2>
        <ul className="space-y-3">
          {quiz?.questions.map((q, idx) => (
            <li key={idx} className="text-accent-silver">
              {idx + 1}. {q.question}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 