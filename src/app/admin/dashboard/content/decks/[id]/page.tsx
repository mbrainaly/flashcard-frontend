'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  FolderIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  EyeIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import { DeckDetailsSkeleton } from '@/components/ui/Skeleton'

interface DeckDetails {
  _id: string
  title: string
  description: string
  author?: {
    name?: string
    email?: string
  }
  category?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  isPublic: boolean
  isActive: boolean
  cardCount: number
  studyCount: number
  rating: number
  createdAt: string
  updatedAt: string
  recentCards?: Array<{
    _id: string
    front: string
    back: string
    createdAt: string
  }>
}

export default function DeckDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { hasPermission } = useAdminAuth()
  const adminApi = useAdminApi()
  const [deck, setDeck] = useState<DeckDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const deckId = params.id as string

  useEffect(() => {
    fetchDeckDetails()
  }, [deckId])

  const fetchDeckDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await adminApi.get(`/api/admin/content/decks/${deckId}`)
      
      if (response.success && response.data) {
        // Backend returns { deck: {...}, analytics: {...} }
        const { deck: deckData, analytics } = response.data
        
        // Combine deck data with analytics
        const combinedDeck = {
          ...deckData,
          author: deckData.owner, // Backend uses 'owner' but frontend expects 'author'
          cardCount: analytics.totalCards,
          recentCards: analytics.recentCards
        }
        
        setDeck(combinedDeck)
      } else {
        throw new Error(response.error || 'Failed to fetch deck details')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deck details')
      console.error('Error fetching deck details:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Invalid Date'
    
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDifficultyBadge = (difficulty: string | undefined) => {
    // Default to 'beginner' if difficulty is undefined or null
    const safeDifficulty = difficulty || 'beginner'
    
    const colors = {
      beginner: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
      intermediate: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
      advanced: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[safeDifficulty as keyof typeof colors]}`}>
        {safeDifficulty.charAt(0).toUpperCase() + safeDifficulty.slice(1)}
      </span>
    )
  }

  if (loading) {
    return <DeckDetailsSkeleton />
  }

  if (error || !deck) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">
          {error || 'Deck not found'}
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-accent-silver/10 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Deck Details
            </h1>
            <p className="text-gray-600 dark:text-accent-silver">
              View and manage deck information
            </p>
          </div>
        </div>
      </div>

      {/* Deck Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <FolderIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {deck.title || 'Untitled Deck'}
              </h2>
              <p className="text-gray-600 dark:text-accent-silver mt-1">
                {deck.description || 'No description available'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {deck.isPublic ? (
              <div className="flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full text-sm">
                <GlobeAltIcon className="w-4 h-4 mr-1" />
                Public
              </div>
            ) : (
              <div className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 rounded-full text-sm">
                <LockClosedIcon className="w-4 h-4 mr-1" />
                Private
              </div>
            )}
            {getDifficultyBadge(deck.difficulty)}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-accent-silver/5 rounded-lg">
            <DocumentTextIcon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {deck.cardCount || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-accent-silver">
              Cards
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-accent-silver/10">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Author Information
            </h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-accent-neon to-accent-gold rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-black">
                  {(deck.author?.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {deck.author?.name || 'Unknown Author'}
                </div>
                <div className="text-sm text-gray-500 dark:text-accent-silver">
                  {deck.author?.email || 'No email available'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Timestamps
            </h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-accent-silver">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Created: {formatDate(deck.createdAt)}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-accent-silver">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Updated: {formatDate(deck.updatedAt)}
              </div>
            </div>
          </div>
        </div>

      </motion.div>

      {/* All Cards */}
      {deck.recentCards && deck.recentCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            All Cards ({deck.recentCards.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {deck.recentCards.map((card, index) => (
              <div
                key={card._id}
                className="p-4 bg-gray-50 dark:bg-accent-silver/5 rounded-lg"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {card.front}
                </div>
                <div className="text-sm text-gray-600 dark:text-accent-silver">
                  {card.back}
                </div>
                <div className="text-xs text-gray-500 dark:text-accent-silver/70 mt-2">
                  Created: {formatDate(card.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
