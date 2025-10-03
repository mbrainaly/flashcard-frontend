'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  FolderIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import { showToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Skeleton'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface CardDetails {
  _id: string
  front: string
  back: string
  deck: {
    _id: string
    title: string
  }
  author: {
    name: string
    email: string
  }
  difficulty?: 'easy' | 'medium' | 'hard'
  isActive: boolean
  tags: string[]
  studyCount: number
  correctCount: number
  createdAt: string
  updatedAt: string
  lastStudied?: string
  hints?: string[]
  examples?: string[]
  image?: string
}

export default function CardDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const cardId = params.id as string
  const { hasPermission } = useAdminAuth()
  const adminApi = useAdminApi()

  const [card, setCard] = useState<CardDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  const fetchCardDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await adminApi.get(`/api/admin/content/cards/${cardId}`)
      
      if (response.success && response.data) {
        // Use the analytics data from backend
        const cardData = response.data
        const analytics = cardData.analytics || {}
        
        const formattedCard: CardDetails = {
          _id: cardData._id,
          front: cardData.front,
          back: cardData.back,
          deck: {
            _id: cardData.deck._id,
            title: cardData.deck.title
          },
          author: {
            name: cardData.createdBy?.name || 'Unknown',
            email: cardData.createdBy?.email || 'unknown@example.com'
          },
          // Use real analytics data from backend
          difficulty: analytics.difficulty || 'easy',
          isActive: analytics.isActive ?? true,
          tags: cardData.tags || [],
          studyCount: analytics.studyCount || 0,
          correctCount: Math.round((analytics.estimatedAccuracy || 0) * (analytics.studyCount || 0) / 100),
          createdAt: cardData.createdAt,
          updatedAt: cardData.updatedAt,
          lastStudied: analytics.lastStudied || undefined,
          hints: cardData.hints || [],
          examples: cardData.examples || [],
          image: cardData.image
        }
        
        console.log('Card Analytics Data:', {
          cardId: cardData._id,
          rawData: cardData,
          analytics: analytics,
          formattedCard: formattedCard
        })
        
        setCard(formattedCard)
      } else {
        throw new Error(response.error || 'Failed to fetch card details')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch card details')
      console.error('Error fetching card details:', err)
    } finally {
      setLoading(false)
    }
  }

  // Analytics are now calculated by the backend

  useEffect(() => {
    fetchCardDetails()
  }, [cardId])

  const handleDeleteCard = async () => {
    try {
      setDeleteLoading(true)
      const response = await adminApi.delete(`/api/admin/content/cards/${cardId}`)
      
      if (response.success) {
        showToast({
          type: 'success',
          title: 'Card Deleted',
          message: 'Card has been deleted successfully.'
        })
        // Navigate back to cards list
        router.push('/admin/dashboard/content/cards')
      } else {
        showToast({
          type: 'error',
          title: 'Delete Failed',
          message: response.error || 'Failed to delete card. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error deleting card:', error)
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete card. Please try again.'
      })
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }

  const handleEditCard = async (cardData: any) => {
    try {
      setEditLoading(true)
      const response = await adminApi.put(`/api/admin/content/cards/${cardId}`, {
        front: cardData.front,
        back: cardData.back,
        hints: cardData.hints?.filter(Boolean) || [],
        examples: cardData.examples?.filter(Boolean) || [],
        tags: cardData.tags?.filter(Boolean) || []
      })
      
      if (response.success) {
        showToast({
          type: 'success',
          title: 'Card Updated',
          message: 'Card has been updated successfully.'
        })
        // Refresh card details
        fetchCardDetails()
        setShowEditModal(false)
      } else {
        showToast({
          type: 'error',
          title: 'Update Failed',
          message: response.error || 'Failed to update card. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error updating card:', error)
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update card. Please try again.'
      })
    } finally {
      setEditLoading(false)
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Invalid Date'
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDifficultyBadge = (difficulty?: string) => {
    if (!difficulty) return null
    
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    switch (difficulty) {
      case 'easy':
        return `${baseClasses} bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300`
      case 'medium':
        return `${baseClasses} bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300`
      case 'hard':
        return `${baseClasses} bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300`
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300`
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
          Active
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
        Inactive
      </span>
    )
  }

  const getAccuracyRate = (correct: number, total: number) => {
    if (total === 0) return 0
    return Math.round((correct / total) * 100)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Back button & action buttons */}
        <div className="flex justify-between items-center">
          <div className="h-8 w-24 bg-gray-200 dark:bg-accent-silver/10 rounded-lg animate-pulse"></div>
          <div className="flex space-x-2">
            <div className="h-8 w-8 bg-gray-200 dark:bg-accent-silver/10 rounded-lg animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-accent-silver/10 rounded-lg animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-accent-silver/10 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Main Card Info */}
        <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-accent-silver/10 rounded-xl animate-pulse"></div>
              <div>
                <div className="h-6 w-64 bg-gray-200 dark:bg-accent-silver/10 rounded-lg mb-2 animate-pulse"></div>
                <div className="h-4 w-96 bg-gray-200 dark:bg-accent-silver/10 rounded-lg animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-24 bg-gray-200 dark:bg-accent-silver/10 rounded-full animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-200 dark:bg-accent-silver/10 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-50 dark:bg-accent-silver/5 rounded-lg p-4">
                <div className="h-4 w-16 bg-gray-200 dark:bg-accent-silver/10 rounded mb-2 animate-pulse"></div>
                <div className="h-6 w-12 bg-gray-200 dark:bg-accent-silver/10 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Content sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6">
            <div className="h-6 w-32 bg-gray-200 dark:bg-accent-silver/10 rounded-lg mb-4 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-accent-silver/10 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-accent-silver/10 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6">
            <div className="h-6 w-32 bg-gray-200 dark:bg-accent-silver/10 rounded-lg mb-4 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-accent-silver/10 rounded animate-pulse"></div>
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-accent-silver/10 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-3 py-2 border border-accent-silver/30 text-accent-silver/80 hover:bg-accent-silver/10 hover:text-white rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!card) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-3 py-2 border border-accent-silver/30 text-accent-silver/80 hover:bg-accent-silver/10 hover:text-white rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-600 dark:text-yellow-400">Card not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button and Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-3 py-2 border border-accent-silver/30 text-accent-silver/80 hover:bg-accent-silver/10 hover:text-white rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Cards
        </button>

        <div className="flex items-center space-x-2">
          {hasPermission('content.write') && (
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Edit card"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </button>
          )}
          
          {hasPermission('content.delete') && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete card"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Main Card Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Card Details
              </h1>
              <p className="text-sm text-gray-600 dark:text-accent-silver">
                Created {formatDate(card.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {card.difficulty && (
              <span className={getDifficultyBadge(card.difficulty)}>
                {card.difficulty.charAt(0).toUpperCase() + card.difficulty.slice(1)}
              </span>
            )}
            {getStatusBadge(card.isActive)}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-accent-silver/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-accent-silver">
                  Study Count
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.studyCount}
                </p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-accent-silver/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-accent-silver">
                  Accuracy
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getAccuracyRate(card.correctCount, card.studyCount)}%
                </p>
              </div>
              <EyeIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-accent-silver/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-accent-silver">
                  Correct
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.correctCount}
                </p>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-accent-silver/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-accent-silver">
                  Last Studied
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {card.lastStudied ? formatDate(card.lastStudied) : 'Never'}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Deck and Author Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <FolderIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-accent-silver">Deck</p>
              <p className="font-medium text-gray-900 dark:text-white">{card.deck.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <UserIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-accent-silver">Author</p>
              <p className="font-medium text-gray-900 dark:text-white">{card.author.name}</p>
              <p className="text-sm text-gray-500 dark:text-accent-silver/70">{card.author.email}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Card Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Front Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Front Content
          </h3>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-accent-silver whitespace-pre-wrap">
              {card.front}
            </p>
          </div>
        </motion.div>

        {/* Back Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Back Content
          </h3>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-accent-silver whitespace-pre-wrap">
              {card.back}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Additional Information */}
      {(card.hints?.length > 0 || card.examples?.length > 0 || card.tags?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hints */}
          {card.hints && card.hints.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Hints
              </h3>
              <ul className="space-y-2">
                {card.hints.map((hint, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-accent-silver">
                    • {hint}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Examples */}
          {card.examples && card.examples.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Examples
              </h3>
              <ul className="space-y-2">
                {card.examples.map((example, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-accent-silver">
                    • {example}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {card.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                  >
                    <TagIcon className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setShowEditModal(false)} />
            
            <div className="inline-block transform overflow-hidden rounded-xl bg-accent-obsidian shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle border border-accent-silver/10">
              <div className="bg-accent-obsidian px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Edit Card</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-accent-silver hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  await handleEditCard({
                    front: formData.get('front'),
                    back: formData.get('back'),
                    tags: formData.get('tags') ? formData.get('tags').toString().split(',').map(t => t.trim()) : []
                  })
                }} className="space-y-4">
                  {/* Front */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Front Content
                    </label>
                    <textarea
                      name="front"
                      defaultValue={card.front}
                      rows={3}
                      className="w-full px-4 py-3 border border-accent-silver/20 rounded-lg bg-accent-silver/5 text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all resize-none"
                      placeholder="Enter the front content of the card"
                      required
                    />
                  </div>

                  {/* Back */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Back Content
                    </label>
                    <textarea
                      name="back"
                      defaultValue={card.back}
                      rows={3}
                      className="w-full px-4 py-3 border border-accent-silver/20 rounded-lg bg-accent-silver/5 text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all resize-none"
                      placeholder="Enter the back content of the card"
                      required
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      name="tags"
                      type="text"
                      defaultValue={card.tags?.join(', ') || ''}
                      className="w-full px-4 py-3 border border-accent-silver/20 rounded-lg bg-accent-silver/5 text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all"
                      placeholder="Enter tags separated by commas"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-accent-silver/30 text-accent-silver/80 hover:bg-accent-silver/10 hover:text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {editLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteCard}
        title="Delete Card"
        message="Are you sure you want to delete this card? This action cannot be undone."
        confirmText="Delete Card"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  )
}
