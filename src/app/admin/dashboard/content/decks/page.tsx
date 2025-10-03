'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  FolderIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import { useDebounce } from '@/hooks/useDebounce'
import { showToast } from '@/components/ui/Toast'
import { TableRowSkeleton, StatsCardSkeleton } from '@/components/ui/Skeleton'
import ConfirmModal from '@/components/ui/ConfirmModal'
import Link from 'next/link'

interface Deck {
  _id: string
  title: string
  description: string
  author: {
    name: string
    email: string
  }
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  isPublic: boolean
  isActive: boolean
  cardCount: number
  studyCount: number
  rating: number
  createdAt: string
  updatedAt: string
  tags: string[]
}

interface DeckFilters {
  search: string
  category: string
  difficulty: string
  status: string
  author: string
  dateRange: {
    from: string
    to: string
  }
}

export default function DecksManagementPage() {
  const { hasPermission } = useAdminAuth()
  const adminApi = useAdminApi()
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalDecks, setTotalDecks] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [filters, setFilters] = useState<DeckFilters>({
    search: '',
    category: '',
    difficulty: '',
    status: '',
    author: '',
    dateRange: {
      from: '',
      to: ''
    }
  })

  // Debounce search to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(filters.search, 500)

  // Fetch decks from API
  const fetchDecks = async () => {
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
      if (filters.category) queryParams.append('category', filters.category)
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty)
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.author) queryParams.append('author', filters.author)
      if (filters.dateRange.from) queryParams.append('dateFrom', filters.dateRange.from)
      if (filters.dateRange.to) queryParams.append('dateTo', filters.dateRange.to)

      const response = await adminApi.get(`/api/admin/content/decks?${queryParams.toString()}`)
      
      if (response.success && response.data) {
        setDecks(response.data)
        setTotalDecks(response.pagination?.total || 0)
        setTotalPages(response.pagination?.pages || 0)
      } else {
        throw new Error(response.error || 'Failed to fetch decks')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch decks')
      console.error('Error fetching decks:', err)
    } finally {
      setLoading(false)
    }
  }

  // Memoize non-search filters to avoid unnecessary re-renders
  const nonSearchFilters = useMemo(() => ({
    category: filters.category,
    difficulty: filters.difficulty,
    status: filters.status,
    author: filters.author,
    dateRange: filters.dateRange
  }), [filters.category, filters.difficulty, filters.status, filters.author, filters.dateRange])

  useEffect(() => {
    fetchDecks()
  }, [currentPage, itemsPerPage, debouncedSearchTerm, nonSearchFilters])

  // Server-side filtering is handled in fetchDecks, no client-side filtering needed

  const handleDeckAction = async (action: string, deck: Deck) => {
    switch (action) {
      case 'view':
        // Navigate to deck details page in same tab
        window.location.href = `/admin/dashboard/content/decks/${deck._id}`
        break
      case 'edit':
        // Open edit modal
        setSelectedDeck(deck)
        setShowEditModal(true)
        break
      case 'delete':
        // Open delete confirmation modal
        setDeckToDelete(deck)
        setShowDeleteModal(true)
        break
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deckToDelete) return

    try {
      setDeleteLoading(true)
      const response = await adminApi.delete(`/api/admin/content/decks/${deckToDelete._id}`)
      if (response.success) {
        showToast({
          type: 'success',
          title: 'Deck Deleted',
          message: `"${deckToDelete.title}" has been deleted successfully.`
        })
        // Refresh the decks list
        fetchDecks()
        // Close modal
        setShowDeleteModal(false)
        setDeckToDelete(null)
      } else {
        showToast({
          type: 'error',
          title: 'Delete Failed',
          message: response.error || 'Failed to delete deck. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error deleting deck:', error)
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete deck. Please try again.'
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleEditDeck = async (deckData: any) => {
    try {
      const response = await adminApi.put(`/api/admin/content/decks/${selectedDeck?._id}`, deckData)
      if (response.success) {
        showToast({
          type: 'success',
          title: 'Deck Updated',
          message: `"${selectedDeck?.title}" has been updated successfully.`
        })
        setShowEditModal(false)
        setSelectedDeck(null)
        fetchDecks()
      } else {
        showToast({
          type: 'error',
          title: 'Update Failed',
          message: response.error || 'Failed to update deck. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error updating deck:', error)
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update deck. Please try again.'
      })
    }
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  // Pagination is handled by backend, so we use the decks directly
  const paginatedDecks = decks

  const getDifficultyBadge = (difficulty: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    switch (difficulty) {
      case 'beginner':
        return `${baseClasses} bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300`
      case 'intermediate':
        return `${baseClasses} bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300`
      case 'advanced':
        return `${baseClasses} bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300`
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300`
    }
  }

  const getStatusBadge = (isActive: boolean, isPublic: boolean) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
          Inactive
        </span>
      )
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isPublic 
          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
      }`}>
        {isPublic ? 'Public' : 'Private'}
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

  if (loading && decks.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Decks Management
            </h1>
            <p className="text-gray-600 dark:text-accent-silver">
              Create and manage flashcard decks
            </p>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10">
          <div className="overflow-hidden">
            <div className="flex-1 overflow-auto">
              <div className="min-h-0">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-accent-silver/10">
                  <thead className="bg-gray-50 dark:bg-accent-silver/5 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                        Deck
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                        Cards
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
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <FolderIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Decks Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage flashcard decks and their content
            </p>
          </div>
        </div>

        {hasPermission('content.write') && (
          <Link href="/admin/dashboard/content/decks/create">
            <button className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors">
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Deck
            </button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          // Skeleton loading for stats cards
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          [
            { label: 'Total Decks', value: totalDecks, color: 'blue', icon: FolderIcon },
            { label: 'Total Cards', value: decks.reduce((sum, d) => sum + d.cardCount, 0), color: 'orange', icon: DocumentTextIcon }
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
                  {stat.value.toLocaleString()}
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
              placeholder="Search decks by title, description, or author..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={filters.author}
                  onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Search by author name or email..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    search: '',
                    category: '',
                    difficulty: '',
                    status: '',
                    author: '',
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

      {/* Decks Table */}
      <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 flex flex-col" style={{ height: '600px' }}>
        <div className="flex flex-col h-full">
          {/* Table Container with Fixed Height */}
          <div className="flex-1 overflow-auto">
            <div className="min-h-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-accent-silver/10">
                <thead className="bg-gray-50 dark:bg-accent-silver/5 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Deck
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Cards
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
                    paginatedDecks.map((deck, index) => (
                    <motion.tr
                      key={deck._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-accent-silver/5 transition-colors"
                    >
                      {/* Deck Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <FolderIcon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {deck.title}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-accent-neon to-accent-gold flex items-center justify-center">
                              <span className="text-xs font-medium text-black">
                                {deck.author.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {deck.author.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-accent-silver">
                              {deck.author.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cards Count */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <DocumentTextIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{deck.cardCount} cards</span>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500 dark:text-accent-silver">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {formatDate(deck.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleDeckAction('view', deck)}
                            className="p-2 text-gray-400 hover:text-accent-neon hover:bg-accent-neon/10 rounded-lg transition-all duration-200"
                            title="View deck details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          
                          {hasPermission('content.write') && (
                            <button
                              onClick={() => handleDeckAction('edit', deck)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                              title="Edit deck"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          )}
                          
                          {hasPermission('content.delete') && (
                            <button
                              onClick={() => handleDeckAction('delete', deck)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                              title="Delete deck"
                            >
                              <TrashIcon className="w-4 h-4" />
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
          {totalDecks > 0 && (
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
                      {Math.min((currentPage - 1) * itemsPerPage + 1, totalDecks)}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalDecks)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{totalDecks}</span>{' '}
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

      {/* Edit Deck Modal */}
      {showEditModal && selectedDeck && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-accent-obsidian rounded-xl shadow-xl border border-gray-200 dark:border-accent-silver/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <FolderIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Edit Deck
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-accent-silver">
                      Update deck information and settings
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedDeck(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-accent-silver/10 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Edit Form */}
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const deckData = {
                  title: formData.get('title'),
                  description: formData.get('description')
                }
                handleEditDeck(deckData)
              }} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deck Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={selectedDeck.title}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-silver/5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-accent-silver/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter deck title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={selectedDeck.description}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-silver/5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-accent-silver/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter deck description"
                  />
                </div>



                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-accent-silver/10">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedDeck(null)
                    }}
                    className="px-6 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-accent-silver/10 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Update Deck
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeckToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Deck"
        message={`Are you sure you want to delete "${deckToDelete?.title}"? This action cannot be undone and will also delete all cards in this deck.`}
        confirmText="Delete Deck"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  )
}
