'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import { useDebounce } from '@/hooks/useDebounce'
import { showToast } from '@/components/ui/Toast'
import { TableRowSkeleton, StatsCardSkeleton } from '@/components/ui/Skeleton'
import ConfirmModal from '@/components/ui/ConfirmModal'
import Link from 'next/link'

interface Card {
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
  difficulty: 'easy' | 'medium' | 'hard'
  isActive: boolean
  tags: string[]
  studyCount: number
  correctCount: number
  createdAt: string
  updatedAt: string
  lastStudied?: string
}

interface CardFilters {
  search: string
  deck: string
  difficulty: string
  status: string
  author: string
  tags: string
  dateRange: {
    from: string
    to: string
  }
}

export default function CardsManagementPage() {
  const { hasPermission } = useAdminAuth()
  const adminApi = useAdminApi()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalCards, setTotalCards] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  const [filters, setFilters] = useState<CardFilters>({
    search: '',
    deck: '',
    difficulty: '',
    status: '',
    author: '',
    tags: '',
    dateRange: {
      from: '',
      to: ''
    }
  })

  // Debounce search term
  const debouncedSearchTerm = useDebounce(filters.search, 500)

  // Memoize non-search filters to prevent unnecessary re-renders
  const nonSearchFilters = useMemo(() => ({
    deck: filters.deck,
    difficulty: filters.difficulty,
    status: filters.status,
    author: filters.author,
    tags: filters.tags,
    dateRange: filters.dateRange
  }), [filters.deck, filters.difficulty, filters.status, filters.author, filters.tags, filters.dateRange])

  const fetchCards = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      })
      
      // Add filters to query params
      if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm)
      if (nonSearchFilters.deck) queryParams.append('deck', nonSearchFilters.deck)
      if (nonSearchFilters.difficulty) queryParams.append('difficulty', nonSearchFilters.difficulty)
      if (nonSearchFilters.status) queryParams.append('status', nonSearchFilters.status)
      if (nonSearchFilters.author) queryParams.append('author', nonSearchFilters.author)
      if (nonSearchFilters.tags) queryParams.append('tags', nonSearchFilters.tags)
      if (nonSearchFilters.dateRange.from) queryParams.append('dateFrom', nonSearchFilters.dateRange.from)
      if (nonSearchFilters.dateRange.to) queryParams.append('dateTo', nonSearchFilters.dateRange.to)

      const response = await adminApi.get(`/api/admin/content/cards?${queryParams.toString()}`)
      
      if (response.success && response.data) {
        console.log('Cards List Data:', {
          totalCards: response.pagination?.total || 0,
          sampleCard: response.data[0],
          allCards: response.data
        })
        
        setCards(response.data)
        setTotalCards(response.pagination?.total || 0)
        setTotalPages(response.pagination?.pages || 0)
      } else {
        throw new Error(response.error || 'Failed to fetch cards')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cards')
      console.error('Error fetching cards:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCards()
  }, [currentPage, itemsPerPage, debouncedSearchTerm, nonSearchFilters])

  // Server-side filtering is handled in fetchCards, no client-side filtering needed

  const handleCardAction = async (action: string, card: Card) => {
    switch (action) {
      case 'view':
        // Navigate to card details page
        window.location.href = `/admin/dashboard/content/cards/${card._id}`
        break
      case 'edit':
        // Open edit modal
        setSelectedCard(card)
        setShowEditModal(true)
        break
      case 'delete':
        // Open delete confirmation modal
        setCardToDelete(card)
        setShowDeleteModal(true)
        break
    }
  }

  const handleDeleteConfirm = async () => {
    if (!cardToDelete) return

    try {
      setDeleteLoading(true)
      const response = await adminApi.delete(`/api/admin/content/cards/${cardToDelete._id}`)
      if (response.success) {
        showToast({
          type: 'success',
          title: 'Card Deleted',
          message: `Card has been deleted successfully.`
        })
        // Refresh the cards list
        fetchCards()
        // Close modal
        setShowDeleteModal(false)
        setCardToDelete(null)
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
    }
  }

  const handleEditCard = async (cardData: any) => {
    if (!selectedCard) return

    try {
      setEditLoading(true)
      const response = await adminApi.put(`/api/admin/content/cards/${selectedCard._id}`, {
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
        // Refresh the cards list
        fetchCards()
        // Close modal
        setShowEditModal(false)
        setSelectedCard(null)
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

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  // Pagination is handled by backend, so we use the cards directly
  const paginatedCards = cards

  const getDifficultyBadge = (difficulty: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAccuracyRate = (correct: number, total: number) => {
    if (total === 0) return 0
    return Math.round((correct / total) * 100)
  }

  if (loading && cards.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cards Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage individual flashcards and their content
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>

        {/* Search and Filters Skeleton */}
        <div className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="h-10 bg-gray-200 dark:bg-accent-silver/10 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-10 w-24 bg-gray-200 dark:bg-accent-silver/10 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 flex flex-col" style={{ height: '600px' }}>
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
              <div className="min-h-0">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-accent-silver/10">
                  <thead className="bg-gray-50 dark:bg-accent-silver/5 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                        Card
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                        Deck
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                        Created
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-accent-obsidian divide-y divide-gray-200 dark:divide-accent-silver/10">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <TableRowSkeleton key={index} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <DocumentTextIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cards Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage individual flashcards and their content
            </p>
          </div>
        </div>

        {hasPermission('content.write') && (
          <Link href="/admin/dashboard/content/cards/create">
            <button className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors">
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Card
            </button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {loading ? (
          // Skeleton loading for stats cards
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          [
            { 
              label: 'Total Cards', 
              value: totalCards, 
              color: 'green', 
              icon: DocumentTextIcon 
            },
            { 
              label: 'Active Cards', 
              value: cards.filter(c => c.isActive).length, 
              color: 'blue', 
              icon: EyeIcon 
            },
            { 
              label: 'Total Studies', 
              value: cards.reduce((sum, c) => sum + c.studyCount, 0), 
              color: 'purple', 
              icon: ClockIcon 
            },
            { 
              label: 'Avg Accuracy', 
              value: cards.length > 0 ? `${Math.round(cards.reduce((sum, c) => sum + getAccuracyRate(c.correctCount, c.studyCount), 0) / cards.length)}%` : '0%', 
              color: 'orange', 
              icon: TagIcon 
            }
          ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-accent-silver">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-500 rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
          ))
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards by front, back, deck, or author..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-neon focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg font-medium transition-colors ${
              showFilters
                ? 'bg-accent-neon text-black'
                : 'bg-white dark:bg-accent-obsidian text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-accent-silver/10'
            }`}
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-accent-silver/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                >
                  <option value="">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="Search by tags..."
                  value={filters.tags}
                  onChange={(e) => setFilters(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    search: '',
                    deck: '',
                    difficulty: '',
                    status: '',
                    author: '',
                    tags: '',
                    dateRange: { from: '', to: '' }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-accent-silver/10 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Cards Table */}
      <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 flex flex-col" style={{ height: '600px' }}>
        <div className="flex flex-col h-full">
          {/* Table Container with Fixed Height */}
          <div className="flex-1 overflow-auto">
            <div className="min-h-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-accent-silver/10">
                <thead className="bg-gray-50 dark:bg-accent-silver/5 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Card
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Deck
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Created
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-accent-obsidian divide-y divide-gray-200 dark:divide-accent-silver/10">
                  {loading ? (
                    // Skeleton loading for table rows
                    Array.from({ length: itemsPerPage }).map((_, index) => (
                      <TableRowSkeleton key={index} />
                    ))
                  ) : (
                    paginatedCards.map((card, index) => (
                    <motion.tr
                      key={card._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-accent-silver/5 transition-colors"
                    >
                      {/* Card Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                              <DocumentTextIcon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {card.front.length > 50 ? card.front.substring(0, 50) + '...' : card.front}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Deck */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FolderIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {card.deck.title}
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-accent-neon to-accent-gold flex items-center justify-center">
                              <span className="text-xs font-medium text-black">
                                {card.author.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {card.author.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Performance */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs text-gray-500 dark:text-accent-silver/70">Studies:</span>
                            <span className="font-medium">{card.studyCount}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-accent-silver/70">Accuracy:</span>
                            <span className={`font-medium ${
                              getAccuracyRate(card.correctCount, card.studyCount) >= 80 
                                ? 'text-green-600 dark:text-green-400'
                                : getAccuracyRate(card.correctCount, card.studyCount) >= 60
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {getAccuracyRate(card.correctCount, card.studyCount)}%
                            </span>
                          </div>
                          {card.lastStudied && (
                            <div className="flex items-center space-x-2 mt-1">
                              <ClockIcon className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-accent-silver/70">
                                Last: {formatDate(card.lastStudied)}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(card.isActive)}
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500 dark:text-accent-silver">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {formatDate(card.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleCardAction('view', card)}
                            className="text-gray-400 hover:text-accent-neon transition-colors"
                            title="View card details"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          
                          {hasPermission('content.write') && (
                            <button
                              onClick={() => handleCardAction('edit', card)}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit card"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                          )}
                          
                          {hasPermission('content.delete') && (
                            <button
                              onClick={() => handleCardAction('delete', card)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete card"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Pagination - Fixed at bottom */}
          {totalCards > 0 && (
            <div className="flex-shrink-0 bg-white dark:bg-accent-obsidian px-4 py-4 border-t border-gray-200 dark:border-accent-silver/10">
              {/* Desktop Pagination */}
              <div className="flex items-center justify-between">
                {/* Left side - Items per page and info */}
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="text-sm border border-gray-300 dark:border-accent-silver/20 rounded-md bg-white dark:bg-accent-obsidian text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon px-3 py-1"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-700 dark:text-gray-300">entries</span>
                  </div>
                  
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing{' '}
                    <span className="font-medium">
                      {Math.min((currentPage - 1) * itemsPerPage + 1, totalCards)}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalCards)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{totalCards}</span>{' '}
                    results
                  </div>
                </div>

                {/* Right side - Page navigation */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  {totalPages > 1 && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-accent-silver/20 bg-white dark:bg-accent-obsidian text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-accent-silver/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-accent-silver/20 bg-white dark:bg-accent-obsidian text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-accent-silver/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Card Modal */}
      {showEditModal && selectedCard && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => {
              setShowEditModal(false)
              setSelectedCard(null)
            }} />
            
            <div className="inline-block transform overflow-hidden rounded-xl bg-accent-obsidian shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle border border-accent-silver/10">
              <div className="bg-accent-obsidian px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Edit Card</h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedCard(null)
                    }}
                    className="text-accent-silver hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  await handleEditCard({
                    front: formData.get('front'),
                    back: formData.get('back'),
                    hints: formData.get('hints') ? [formData.get('hints')] : [],
                    examples: formData.get('examples') ? [formData.get('examples')] : [],
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
                      defaultValue={selectedCard.front}
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
                      defaultValue={selectedCard.back}
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
                      defaultValue={selectedCard.tags?.join(', ') || ''}
                      className="w-full px-4 py-3 border border-accent-silver/20 rounded-lg bg-accent-silver/5 text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all"
                      placeholder="Enter tags separated by commas"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false)
                        setSelectedCard(null)
                      }}
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
        onClose={() => {
          setShowDeleteModal(false)
          setCardToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Card"
        message={`Are you sure you want to delete this card? This action cannot be undone.`}
        confirmText="Delete Card"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  )
}
