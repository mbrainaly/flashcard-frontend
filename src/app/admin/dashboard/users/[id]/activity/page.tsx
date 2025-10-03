'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAdminApi } from '@/hooks/useAdminApi'
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  UserIcon,
  ChartBarIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface ActivityItem {
  id: string
  type: 'study' | 'create' | 'edit' | 'delete' | 'login' | 'logout' | 'subscription' | 'achievement'
  title: string
  description: string
  timestamp: string
  metadata?: {
    deckName?: string
    cardCount?: number
    score?: number
    duration?: number
    achievementType?: string
    subscriptionPlan?: string
  }
  ipAddress?: string
  userAgent?: string
}

interface ActivityFilters {
  type: string
  dateRange: {
    from: string
    to: string
  }
  search: string
}

export default function UserActivityPage() {
  const params = useParams()
  const router = useRouter()
  const adminApi = useAdminApi()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [totalActivities, setTotalActivities] = useState(0)

  const [filters, setFilters] = useState<ActivityFilters>({
    type: '',
    dateRange: {
      from: '',
      to: ''
    },
    search: ''
  })

  const userId = params.id as string

  const fetchActivities = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      })
      
      // Add filters to query params
      if (filters.type) queryParams.append('type', filters.type)
      if (filters.search) queryParams.append('search', filters.search)
      if (filters.dateRange.from) queryParams.append('dateFrom', filters.dateRange.from)
      if (filters.dateRange.to) queryParams.append('dateTo', filters.dateRange.to)

      const response = await adminApi.get(`/api/admin/users/${userId}/activity?${queryParams.toString()}`)
      
      if (response.success && response.data) {
        setActivities(response.data)
        setTotalActivities(response.pagination?.total || 0)
        setTotalPages(response.pagination?.pages || 0)
      } else {
        throw new Error(response.error || 'Failed to fetch user activity')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user activity')
      console.error('Error fetching activities:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchActivities()
    }
  }, [userId, currentPage, filters])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'study':
        return AcademicCapIcon
      case 'create':
        return DocumentTextIcon
      case 'edit':
        return DocumentTextIcon
      case 'delete':
        return XCircleIcon
      case 'login':
        return CheckCircleIcon
      case 'logout':
        return XCircleIcon
      case 'subscription':
        return TrophyIcon
      case 'achievement':
        return TrophyIcon
      default:
        return UserIcon
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'study':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
      case 'create':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
      case 'edit':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
      case 'delete':
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
      case 'login':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
      case 'logout':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
      case 'subscription':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
      case 'achievement':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Pagination is handled by backend, so we use activities directly
  const paginatedActivities = activities
  const startIndex = (currentPage - 1) * itemsPerPage

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-neon"></div>
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
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-accent-silver/10 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Activity Log
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detailed activity history and audit trail
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-neon focus:border-transparent"
            />
          </div>

          {/* Activity Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-4 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
          >
            <option value="">All Activities</option>
            <option value="study">Study Sessions</option>
            <option value="create">Content Creation</option>
            <option value="edit">Content Edits</option>
            <option value="login">Logins</option>
            <option value="subscription">Subscription</option>
            <option value="achievement">Achievements</option>
          </select>

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
            Date Range
          </button>
        </div>

        {/* Date Range Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-accent-silver/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, from: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, to: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Activity Timeline ({totalActivities} activities)
          </h3>

          {paginatedActivities.length === 0 ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No activities found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedActivities.map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.type)
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-start space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-accent-silver/5 rounded-lg transition-colors"
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      <ActivityIcon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500 dark:text-accent-silver">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {formatDate(activity.timestamp)}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {activity.description}
                      </p>

                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {activity.metadata.deckName && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                              Deck: {activity.metadata.deckName}
                            </span>
                          )}
                          {activity.metadata.cardCount && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                              {activity.metadata.cardCount} cards
                            </span>
                          )}
                          {activity.metadata.score && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">
                              Score: {activity.metadata.score}%
                            </span>
                          )}
                          {activity.metadata.duration && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300">
                              <ClockIcon className="w-3 h-3 mr-1" />
                              {activity.metadata.duration}m
                            </span>
                          )}
                          {activity.metadata.achievementType && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300">
                              🏆 {activity.metadata.achievementType}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Technical Details */}
                      {activity.ipAddress && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-accent-silver">
                          IP: {activity.ipAddress}
                          {activity.userAgent && (
                            <span className="ml-2">
                              • {activity.userAgent.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-accent-silver/10 pt-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalActivities)} of {totalActivities} activities
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-accent-silver/20 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-accent-silver/20 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
