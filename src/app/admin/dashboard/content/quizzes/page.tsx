'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AcademicCapIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import { useDebounce } from '@/hooks/useDebounce'
import { showToast } from '@/components/ui/Toast'
import { TableRowSkeleton, StatsCardSkeleton, QuickFilterButtonsSkeleton, SearchFiltersSkeleton } from '@/components/ui/Skeleton'
import ConfirmModal from '@/components/ui/ConfirmModal'
import Link from 'next/link'

interface Quiz {
  _id: string
  title: string
  description: string
  type: 'individual' | 'by-notes' | 'by-deck'
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
  isPublic: boolean
  questionCount: number
  timeLimit: number // in minutes
  passingScore: number // percentage
  attempts: number
  completions: number
  averageScore: number
  averageTime: number // in minutes
  createdAt: string
  updatedAt: string
  tags: string[]
}

interface QuizFilters {
  search: string
  deck: string
  difficulty: string
  status: string
  type: string
  author: string
  dateRange: {
    from: string
    to: string
  }
}

export default function QuizzesManagementPage() {
  const { hasPermission } = useAdminAuth()
  const adminApi = useAdminApi()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalQuizzes, setTotalQuizzes] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [quizStats, setQuizStats] = useState({
    total: 0,
    individual: 0,
    byNotes: 0,
    byDeck: 0,
    active: 0
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  const [filters, setFilters] = useState<QuizFilters>({
    search: '',
    deck: '',
    difficulty: '',
    status: '',
    type: '',
    author: '',
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
    type: filters.type,
    author: filters.author,
    dateRange: filters.dateRange
  }), [filters.deck, filters.difficulty, filters.status, filters.type, filters.author, filters.dateRange])

  const fetchQuizStats = async () => {
    try {
      // Fetch stats for all quiz types without pagination
      const [totalResponse, individualResponse, notesResponse, deckResponse, activeResponse] = await Promise.all([
        adminApi.get('/api/admin/content/quizzes?limit=1'), // Just get total count
        adminApi.get('/api/admin/content/quizzes?type=individual&limit=1'),
        adminApi.get('/api/admin/content/quizzes?type=by-notes&limit=1'),
        adminApi.get('/api/admin/content/quizzes?type=by-deck&limit=1'),
        adminApi.get('/api/admin/content/quizzes?status=active&limit=1')
      ])

      setQuizStats({
        total: totalResponse.pagination?.total || 0,
        individual: individualResponse.pagination?.total || 0,
        byNotes: notesResponse.pagination?.total || 0,
        byDeck: deckResponse.pagination?.total || 0,
        active: activeResponse.pagination?.total || 0
      })
    } catch (error) {
      console.error('Error fetching quiz stats:', error)
    }
  }

  const fetchQuizzes = async () => {
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
      if (nonSearchFilters.type) queryParams.append('type', nonSearchFilters.type)
      if (nonSearchFilters.author) queryParams.append('author', nonSearchFilters.author)
      if (nonSearchFilters.dateRange.from) queryParams.append('dateFrom', nonSearchFilters.dateRange.from)
      if (nonSearchFilters.dateRange.to) queryParams.append('dateTo', nonSearchFilters.dateRange.to)


      const response = await adminApi.get(`/api/admin/content/quizzes?${queryParams.toString()}`)
      
      if (response.success && response.data) {
        
        setQuizzes(response.data)
        setTotalQuizzes(response.pagination?.total || 0)
        setTotalPages(response.pagination?.pages || 0)
      } else {
        throw new Error(response.error || 'Failed to fetch quizzes')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quizzes')
      console.error('Error fetching quizzes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [currentPage, itemsPerPage, debouncedSearchTerm, nonSearchFilters])

  useEffect(() => {
    fetchQuizStats()
  }, []) // Only fetch stats once on mount

  // Server-side filtering is handled in fetchQuizzes, no client-side filtering needed

  const handleQuizAction = async (action: string, quiz: Quiz) => {
    switch (action) {
      case 'view':
        // Open view modal
        setSelectedQuiz(quiz)
        setShowViewModal(true)
        break
      case 'edit':
        // Open edit modal
        setSelectedQuiz(quiz)
        setShowEditModal(true)
        break
      case 'delete':
        // Open delete confirmation modal
        setQuizToDelete(quiz)
        setShowDeleteModal(true)
        break
    }
  }

  const handleEditQuiz = async (quizData: any) => {
    if (!selectedQuiz) return

    try {
      setEditLoading(true)
      const response = await adminApi.put(`/api/admin/content/quizzes/${selectedQuiz._id}`, {
        title: quizData.title,
        description: quizData.description,
        difficulty: quizData.difficulty,
        timeLimit: quizData.timeLimit,
        passingScore: quizData.passingScore,
        tags: quizData.tags?.filter(Boolean) || []
      })
      
      if (response.success) {
        showToast({
          type: 'success',
          title: 'Quiz Updated',
          message: 'Quiz has been updated successfully.'
        })
        // Refresh the quizzes list and stats
        fetchQuizzes()
        fetchQuizStats()
        // Close modal
        setShowEditModal(false)
        setSelectedQuiz(null)
      } else {
        showToast({
          type: 'error',
          title: 'Update Failed',
          message: response.error || 'Failed to update quiz. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error updating quiz:', error)
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update quiz. Please try again.'
      })
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return

    try {
      setDeleteLoading(true)
      const response = await adminApi.delete(`/api/admin/content/quizzes/${quizToDelete._id}`)
      if (response.success) {
        showToast({
          type: 'success',
          title: 'Quiz Deleted',
          message: `"${quizToDelete.title}" has been deleted successfully.`
        })
        // Refresh the quizzes list and stats
        fetchQuizzes()
        fetchQuizStats()
        // Close modal
        setShowDeleteModal(false)
        setQuizToDelete(null)
      } else {
        showToast({
          type: 'error',
          title: 'Delete Failed',
          message: response.error || 'Failed to delete quiz. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error deleting quiz:', error)
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete quiz. Please try again.'
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  // Pagination is handled by backend, so we use the quizzes directly
  const paginatedQuizzes = quizzes

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

  const getQuizTypeBadge = (type: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    switch (type) {
      case 'individual':
        return `${baseClasses} bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300`
      case 'by-notes':
        return `${baseClasses} bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300`
      case 'by-deck':
        return `${baseClasses} bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-300`
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300`
    }
  }

  const getQuizTypeLabel = (type: string) => {
    switch (type) {
      case 'individual':
        return 'Individual Quiz'
      case 'by-notes':
        return 'Generated by Notes'
      case 'by-deck':
        return 'Generated by Deck'
      default:
        return 'Unknown Type'
    }
  }


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCompletionRate = (completions: number, attempts: number) => {
    if (attempts === 0) return 0
    return Math.round((completions / attempts) * 100)
  }


  // Show full page skeleton on initial load
  if (loading && quizzes.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <AcademicCapIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Quizzes Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage quizzes and track performance analytics
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>

        {/* Search and Filters Skeleton */}
        <SearchFiltersSkeleton />

        {/* Table Skeleton */}
        <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 flex flex-col" style={{ height: '600px' }}>
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto">
              <div className="min-h-0">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-accent-silver/10">
                  <thead className="bg-gray-50 dark:bg-accent-silver/5 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                        Quiz
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                        Type
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
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <AcademicCapIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quizzes Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage quizzes and track performance analytics
            </p>
          </div>
        </div>

        {hasPermission('content.write') && (
          <Link href="/admin/dashboard/content/quizzes/create">
            <button className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors">
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Quiz
            </button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {loading ? (
          // Skeleton loading for stats cards
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          [
            { 
              label: 'Total Quizzes', 
              value: quizStats.total, 
              color: 'purple', 
              icon: AcademicCapIcon 
            },
            { 
              label: 'Individual Quizzes', 
              value: quizStats.individual, 
              color: 'purple', 
              icon: UserIcon 
            },
            { 
              label: 'Generated by Notes', 
              value: quizStats.byNotes, 
              color: 'blue', 
              icon: ClockIcon 
            },
            { 
              label: 'Generated by Deck', 
              value: quizStats.byDeck, 
              color: 'teal', 
              icon: FolderIcon 
            },
            { 
              label: 'Active Quizzes', 
              value: quizStats.active, 
              color: 'green', 
              icon: CheckCircleIcon 
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
              placeholder="Search quizzes by title, description, deck, or author..."
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

        {/* Quick Type Filters */}
        {loading ? (
          <QuickFilterButtonsSkeleton />
        ) : (
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setFilters(prev => ({ ...prev, type: '' }))}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filters.type === '' 
                  ? 'bg-accent-neon text-black' 
                  : 'bg-gray-100 dark:bg-accent-silver/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-accent-silver/20'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, type: 'individual' }))}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filters.type === 'individual' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/20'
              }`}
            >
              Individual Quiz
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, type: 'by-notes' }))}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filters.type === 'by-notes' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/20'
              }`}
            >
              By Notes
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, type: 'by-deck' }))}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filters.type === 'by-deck' 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-teal-50 dark:bg-teal-900/10 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/20'
              }`}
            >
              By Deck
            </button>
          </div>
        )}

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-accent-silver/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quiz Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="individual">Individual Quiz</option>
                  <option value="by-notes">Generated by Notes</option>
                  <option value="by-deck">Generated by Deck</option>
                </select>
              </div>

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
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  placeholder="Search by author..."
                  value={filters.author}
                  onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
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
                    type: '',
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

      {/* Quizzes Table */}
      <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 flex flex-col" style={{ height: '600px' }}>
        <div className="flex flex-col h-full">
          {/* Table Container with Fixed Height */}
          <div className="flex-1 overflow-auto">
            <div className="min-h-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-accent-silver/10">
                <thead className="bg-gray-50 dark:bg-accent-silver/5 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Quiz
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Type
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
                    paginatedQuizzes.map((quiz, index) => (
                    <motion.tr
                      key={quiz._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-accent-silver/5 transition-colors"
                    >
                      {/* Quiz Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                              <AcademicCapIcon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {quiz.title}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Quiz Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getQuizTypeBadge(quiz.type)}>
                          {getQuizTypeLabel(quiz.type)}
                        </span>
                      </td>

                      {/* Deck */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FolderIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {quiz.deck.title}
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-accent-neon to-accent-gold flex items-center justify-center">
                              <span className="text-xs font-medium text-black">
                                {quiz.author.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {quiz.author.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Performance */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center space-x-4 mb-1">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 dark:text-accent-silver/70">Attempts:</span>
                              <span className="ml-1 font-medium">{quiz.attempts}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 dark:text-accent-silver/70">Completed:</span>
                              <span className="ml-1 font-medium">{quiz.completions}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 dark:text-accent-silver/70">Avg Score:</span>
                              <span className={`ml-1 font-medium ${
                                quiz.averageScore >= quiz.passingScore 
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {quiz.averageScore}%
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 dark:text-accent-silver/70">Completion:</span>
                              <span className="ml-1 font-medium">
                                {getCompletionRate(quiz.completions, quiz.attempts)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500 dark:text-accent-silver">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {formatDate(quiz.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleQuizAction('view', quiz)}
                            className="text-gray-400 hover:text-accent-neon transition-colors"
                            title="View quiz details"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          
                          {hasPermission('content.write') && (
                            <button
                              onClick={() => handleQuizAction('edit', quiz)}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit quiz"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                          )}
                          
                          {hasPermission('content.delete') && (
                            <button
                              onClick={() => handleQuizAction('delete', quiz)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete quiz"
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
          {totalQuizzes > 0 && (
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
                      {Math.min((currentPage - 1) * itemsPerPage + 1, totalQuizzes)}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalQuizzes)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{totalQuizzes}</span>{' '}
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

      {/* View Quiz Modal */}
      {showViewModal && selectedQuiz && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => {
              setShowViewModal(false)
              setSelectedQuiz(null)
            }} />
            
            <div className="inline-block transform overflow-hidden rounded-xl bg-gradient-to-br from-accent-obsidian to-accent-obsidian/95 shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle border border-accent-silver/20">
              <div className="bg-gradient-to-r from-accent-obsidian to-accent-obsidian/90 px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <AcademicCapIcon className="w-6 h-6 mr-2 text-accent-neon" />
                    Quiz Details
                  </h3>
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      setSelectedQuiz(null)
                    }}
                    className="text-accent-silver hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Quiz Info */}
                  <div className="bg-accent-silver/5 rounded-lg p-4 border border-accent-silver/10">
                    <h4 className="text-lg font-medium text-white mb-2">{selectedQuiz.title}</h4>
                    <p className="text-accent-silver/80 mb-4">{selectedQuiz.description || 'No description available'}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-accent-silver/70">Type:</span>
                        <div className="mt-1">
                          <span className={getQuizTypeBadge(selectedQuiz.type)}>
                            {getQuizTypeLabel(selectedQuiz.type)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-accent-silver/70">Difficulty:</span>
                        <div className="mt-1">
                          <span className={getDifficultyBadge(selectedQuiz.difficulty)}>
                            {selectedQuiz.difficulty}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-accent-silver/70">Questions:</span>
                        <p className="text-white font-medium">{selectedQuiz.questionCount}</p>
                      </div>
                      <div>
                        <span className="text-sm text-accent-silver/70">Time Limit:</span>
                        <p className="text-white font-medium">{selectedQuiz.timeLimit} minutes</p>
                      </div>
                      <div>
                        <span className="text-sm text-accent-silver/70">Passing Score:</span>
                        <p className="text-white font-medium">{selectedQuiz.passingScore}%</p>
                      </div>
                      <div>
                        <span className="text-sm text-accent-silver/70">Author:</span>
                        <p className="text-white font-medium">{selectedQuiz.author.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Performance Stats */}
                  <div className="bg-accent-silver/5 rounded-lg p-4 border border-accent-silver/10">
                    <h4 className="text-lg font-medium text-white mb-4">Performance Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-accent-neon">{selectedQuiz.attempts}</p>
                        <p className="text-sm text-accent-silver/70">Attempts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">{selectedQuiz.completions}</p>
                        <p className="text-sm text-accent-silver/70">Completions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-400">{selectedQuiz.averageScore}%</p>
                        <p className="text-sm text-accent-silver/70">Avg Score</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-400">{selectedQuiz.averageTime}m</p>
                        <p className="text-sm text-accent-silver/70">Avg Time</p>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedQuiz.tags && selectedQuiz.tags.length > 0 && (
                    <div className="bg-accent-silver/5 rounded-lg p-4 border border-accent-silver/10">
                      <h4 className="text-lg font-medium text-white mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedQuiz.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-accent-neon/20 text-accent-neon text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="bg-accent-silver/5 rounded-lg p-4 border border-accent-silver/10">
                    <h4 className="text-lg font-medium text-white mb-3">Metadata</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-accent-silver/70">Created:</span>
                        <p className="text-white">{formatDate(selectedQuiz.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-accent-silver/70">Last Updated:</span>
                        <p className="text-white">{formatDate(selectedQuiz.updatedAt)}</p>
                      </div>
                      <div>
                        <span className="text-accent-silver/70">Associated Deck:</span>
                        <p className="text-white">{selectedQuiz.deck.title}</p>
                      </div>
                      <div>
                        <span className="text-accent-silver/70">Status:</span>
                        <p className="text-white">{selectedQuiz.isActive ? 'Active' : 'Inactive'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quiz Modal */}
      {showEditModal && selectedQuiz && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => {
              setShowEditModal(false)
              setSelectedQuiz(null)
            }} />
            
            <div className="inline-block transform overflow-hidden rounded-xl bg-gradient-to-br from-accent-obsidian to-accent-obsidian/95 shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle border border-accent-silver/20">
              <div className="bg-gradient-to-r from-accent-obsidian to-accent-obsidian/90 px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <PencilIcon className="w-6 h-6 mr-2 text-accent-neon" />
                    Edit Quiz
                  </h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedQuiz(null)
                    }}
                    className="text-accent-silver hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  await handleEditQuiz({
                    title: formData.get('title'),
                    description: formData.get('description'),
                    difficulty: formData.get('difficulty'),
                    timeLimit: parseInt(formData.get('timeLimit') as string),
                    passingScore: parseInt(formData.get('passingScore') as string),
                    tags: formData.get('tags') ? formData.get('tags').toString().split(',').map(t => t.trim()) : []
                  })
                }} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Quiz Title
                    </label>
                    <input
                      name="title"
                      type="text"
                      defaultValue={selectedQuiz.title}
                      className="w-full px-4 py-3 border border-accent-silver/20 rounded-lg bg-accent-silver/5 text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all"
                      placeholder="Enter quiz title"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      defaultValue={selectedQuiz.description}
                      rows={3}
                      className="w-full px-4 py-3 border border-accent-silver/20 rounded-lg bg-accent-silver/5 text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all resize-none"
                      placeholder="Enter quiz description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Difficulty */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Difficulty
                      </label>
                      <select
                        name="difficulty"
                        defaultValue={selectedQuiz.difficulty}
                        className="w-full px-4 py-3 border border-accent-silver/20 rounded-lg bg-accent-silver/5 text-white focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all"
                      >
                        <option value="easy" className="bg-accent-obsidian text-white">Easy</option>
                        <option value="medium" className="bg-accent-obsidian text-white">Medium</option>
                        <option value="hard" className="bg-accent-obsidian text-white">Hard</option>
                      </select>
                    </div>

                    {/* Time Limit */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Time Limit (minutes)
                      </label>
                      <input
                        name="timeLimit"
                        type="number"
                        defaultValue={selectedQuiz.timeLimit}
                        min="1"
                        max="300"
                        className="w-full px-4 py-3 border border-accent-silver/20 rounded-lg bg-accent-silver/5 text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all"
                        placeholder="60"
                      />
                    </div>

                    {/* Passing Score */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Passing Score (%)
                      </label>
                      <input
                        name="passingScore"
                        type="number"
                        defaultValue={selectedQuiz.passingScore}
                        min="1"
                        max="100"
                        className="w-full px-4 py-3 border border-accent-silver/20 rounded-lg bg-accent-silver/5 text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all"
                        placeholder="70"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      name="tags"
                      type="text"
                      defaultValue={selectedQuiz.tags?.join(', ') || ''}
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
                        setSelectedQuiz(null)
                      }}
                      className="px-6 py-3 border border-accent-silver/30 text-accent-silver/80 hover:bg-accent-silver/10 hover:text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="px-6 py-3 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
          setQuizToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Quiz"
        message={`Are you sure you want to delete "${quizToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Quiz"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  )
}
