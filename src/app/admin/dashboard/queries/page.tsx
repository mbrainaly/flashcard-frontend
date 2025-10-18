'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChatBubbleLeftRightIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'

interface ContactSubmission {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  message: string
  status: 'new' | 'read' | 'replied' | 'resolved'
  source: string
  submittedAt: string
  readAt?: string
  repliedAt?: string
  resolvedAt?: string
  adminNotes?: string
  assignedTo?: {
    adminId: string
    name: string
    email: string
  }
  fullName: string
}

interface QueryData {
  submissions: ContactSubmission[]
  pagination: {
    currentPage: number
    totalPages: number
    totalSubmissions: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  statusStats: {
    new: number
    read: number
    replied: number
    resolved: number
    total: number
  }
}

export default function QueriesPage() {
  const { hasPermission } = useAdminAuth()
  const { get, put, delete: del } = useAdminApi()
  
  
  const [queryData, setQueryData] = useState<QueryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters and pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(25)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('submittedAt')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // Selected submissions for bulk actions
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState<ContactSubmission | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      })
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }
      
      const response = await get(`/api/admin/queries?${params.toString()}`)
      
      if (response.success) {
        setQueryData(response.data)
      } else {
        setError(response.message || 'Failed to fetch queries')
      }
    } catch (error) {
      console.error('Error fetching queries:', error)
      setError('Failed to fetch queries')
    } finally {
      setLoading(false)
    }
  }

  // View query in modal
  const viewQuery = async (id: string) => {
    // Open modal instantly with loading state
    setSelectedQuery(null)
    setModalLoading(true)
    setShowModal(true)
    
    try {
      const response = await get(`/api/admin/queries/${id}`)
      
      if (response.success) {
        setSelectedQuery(response.data)
      } else {
        setError(response.message || 'Failed to fetch query details')
        setShowModal(false) // Close modal on error
      }
    } catch (error) {
      console.error('Error fetching query details:', error)
      setError('Failed to fetch query details')
      setShowModal(false) // Close modal on error
    } finally {
      setModalLoading(false)
    }
  }

  // Update submission status
  const updateSubmissionStatus = async (id: string, status: string, adminNotes?: string) => {
    try {
      const updateData: any = { status }
      if (adminNotes !== undefined) {
        updateData.adminNotes = adminNotes
      }
      
      const response = await put(`/api/admin/queries/${id}`, updateData)
      
      if (response.success) {
        // Refresh data
        fetchSubmissions()
      } else {
        setError(response.message || 'Failed to update submission')
      }
    } catch (error) {
      console.error('Error updating submission:', error)
      setError('Failed to update submission')
    }
  }

  // Delete submission
  const deleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return
    }
    
    try {
      const response = await del(`/api/admin/queries/${id}`)
      
      if (response.success) {
        // Refresh data
        fetchSubmissions()
      } else {
        setError(response.message || 'Failed to delete submission')
      }
    } catch (error) {
      console.error('Error deleting submission:', error)
      setError('Failed to delete submission')
    }
  }

  // Handle bulk selection
  const toggleSubmissionSelection = (id: string) => {
    setSelectedSubmissions(prev => 
      prev.includes(id) 
        ? prev.filter(submissionId => submissionId !== id)
        : [...prev, id]
    )
  }

  const selectAllSubmissions = () => {
    if (!queryData) return
    
    if (selectedSubmissions.length === queryData.submissions.length) {
      setSelectedSubmissions([])
    } else {
      setSelectedSubmissions(queryData.submissions.map(s => s._id))
    }
  }

  // Effects
  useEffect(() => {
    fetchSubmissions()
  }, [currentPage, limit, statusFilter, searchTerm, sortBy, sortOrder])

  useEffect(() => {
    setShowBulkActions(selectedSubmissions.length > 0)
  }, [selectedSubmissions])

  // Status badge component
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300', icon: ExclamationTriangleIcon },
      read: { color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300', icon: EyeIcon },
      replied: { color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300', icon: ChatBubbleLeftRightIcon },
      resolved: { color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300', icon: CheckCircleIcon }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.toUpperCase()}
      </span>
    )
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!hasPermission('queries.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You don't have permission to view queries.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-accent-neon/10 flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-accent-neon" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Queries</h1>
            <p className="text-sm text-gray-500 dark:text-accent-silver">
              Manage and respond to customer inquiries
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {queryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-accent-silver truncate">
                    Total Queries
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {queryData.statusStats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-accent-silver truncate">
                    New
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {queryData.statusStats.new}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-accent-silver truncate">
                    Read
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {queryData.statusStats.read}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-accent-silver truncate">
                    Replied
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {queryData.statusStats.replied}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-accent-silver truncate">
                    Resolved
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {queryData.statusStats.resolved}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                placeholder="Search by name, email, or message..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Items per page */}
          <div className="sm:w-32">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Submissions Table */}
      <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-neon"></div>
          </div>
        ) : queryData && queryData.submissions.length > 0 ? (
          <>
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-accent-silver/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedSubmissions.length === queryData.submissions.length}
                    onChange={selectAllSubmissions}
                    className="h-4 w-4 text-accent-neon focus:ring-accent-neon border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-500 dark:text-accent-silver">
                    {selectedSubmissions.length > 0 
                      ? `${selectedSubmissions.length} selected`
                      : `${queryData.submissions.length} submissions`
                    }
                  </span>
                </div>
                
                {showBulkActions && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {/* Implement bulk status update */}}
                      className="px-3 py-1 text-sm bg-accent-neon hover:bg-accent-neon/90 text-black rounded-lg transition-colors"
                    >
                      Mark as Read
                    </button>
                    <button
                      onClick={() => {/* Implement bulk delete */}}
                      className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      Delete Selected
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Table Content */}
            <div className="admin-scrollable overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-accent-silver/10">
                <thead className="bg-gray-50 dark:bg-accent-silver/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-accent-obsidian divide-y divide-gray-200 dark:divide-accent-silver/10">
                  {queryData.submissions.map((submission) => (
                    <tr key={submission._id} className="hover:bg-gray-50 dark:hover:bg-accent-silver/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedSubmissions.includes(submission._id)}
                            onChange={() => toggleSubmissionSelection(submission._id)}
                            className="h-4 w-4 text-accent-neon focus:ring-accent-neon border-gray-300 rounded mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {submission.fullName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-accent-silver">
                              {submission.email}
                            </div>
                            {submission.phone && (
                              <div className="text-sm text-gray-500 dark:text-accent-silver">
                                {submission.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {submission.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(submission.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-accent-silver">
                        {formatDate(submission.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* View Button */}
                          <button
                            onClick={() => viewQuery(submission._id)}
                            disabled={modalLoading}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          
                          {/* Delete Button */}
                          {hasPermission('queries.delete') && (
                            <button
                              onClick={() => deleteSubmission(submission._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {queryData.pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-accent-silver/10">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-accent-silver">
                    Showing {((queryData.pagination.currentPage - 1) * queryData.pagination.limit) + 1} to{' '}
                    {Math.min(queryData.pagination.currentPage * queryData.pagination.limit, queryData.pagination.totalSubmissions)} of{' '}
                    {queryData.pagination.totalSubmissions} results
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={!queryData.pagination.hasPrevPage}
                      className="p-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-accent-silver/5"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </button>
                    
                    <span className="px-3 py-2 text-sm text-gray-700 dark:text-accent-silver">
                      Page {queryData.pagination.currentPage} of {queryData.pagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={!queryData.pagination.hasNextPage}
                      className="p-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-accent-silver/5"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No queries found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No contact submissions have been received yet.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Query Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-accent-obsidian rounded-xl shadow-xl border border-gray-200 dark:border-accent-silver/10 w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-accent-silver/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-accent-neon" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Query Details
                  </h3>
                  {modalLoading ? (
                    <div className="h-4 bg-gray-200 dark:bg-accent-silver/20 rounded animate-pulse w-32"></div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-accent-silver">
                      From {selectedQuery?.fullName}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="admin-scrollable px-6 py-4 max-h-[60vh] overflow-y-auto">
              {modalLoading ? (
                /* Skeleton Loading */
                <div className="space-y-6 animate-pulse">
                  {/* Contact Information Skeleton */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-accent-silver/20 rounded w-16 mb-2"></div>
                      <div className="h-5 bg-gray-200 dark:bg-accent-silver/20 rounded w-32"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-accent-silver/20 rounded w-12 mb-2"></div>
                      <div className="h-5 bg-gray-200 dark:bg-accent-silver/20 rounded w-48"></div>
                    </div>
                  </div>
                  
                  {/* Phone Skeleton */}
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-accent-silver/20 rounded w-12 mb-2"></div>
                    <div className="h-5 bg-gray-200 dark:bg-accent-silver/20 rounded w-36"></div>
                  </div>
                  
                  {/* Message Skeleton */}
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-accent-silver/20 rounded w-16 mb-2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-accent-silver/20 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 dark:bg-accent-silver/20 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 dark:bg-accent-silver/20 rounded w-3/4"></div>
                    </div>
                  </div>
                  
                  {/* Status and Date Skeleton */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-accent-silver/20 rounded w-12 mb-2"></div>
                      <div className="h-6 bg-gray-200 dark:bg-accent-silver/20 rounded w-20"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-accent-silver/20 rounded w-24 mb-2"></div>
                      <div className="h-5 bg-gray-200 dark:bg-accent-silver/20 rounded w-40"></div>
                    </div>
                  </div>
                  
                  {/* Admin Notes Skeleton */}
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-accent-silver/20 rounded w-24 mb-2"></div>
                    <div className="h-20 bg-gray-200 dark:bg-accent-silver/20 rounded w-full"></div>
                  </div>
                </div>
              ) : selectedQuery ? (
                <div className="space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-1">
                      Name
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedQuery.firstName} {selectedQuery.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-1">
                      Email
                    </label>
                    <p className="text-wrap-anywhere text-gray-900 dark:text-white break-words">
                      {selectedQuery.email}
                    </p>
                  </div>
                  {selectedQuery.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-1">
                        Phone
                      </label>
                      <p className="text-wrap-anywhere text-gray-900 dark:text-white break-words">
                        {selectedQuery.phone}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-1">
                      Submitted
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(selectedQuery.submittedAt)}
                    </p>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-2">
                    Message
                  </label>
                  <div className="bg-gray-50 dark:bg-accent-silver/5 rounded-lg p-4 border border-gray-200 dark:border-accent-silver/10">
                    <p className="text-wrap-anywhere text-gray-900 dark:text-white whitespace-pre-wrap break-words">
                      {selectedQuery.message}
                    </p>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-2">
                    Status
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      {getStatusBadge(selectedQuery.status)}
                    </div>
                    <div className="flex space-x-2">
                      {selectedQuery.status !== 'read' && (
                        <button
                          onClick={() => {
                            updateSubmissionStatus(selectedQuery._id, 'read')
                            setSelectedQuery({ ...selectedQuery, status: 'read' })
                          }}
                          className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                        >
                          Mark as Read
                        </button>
                      )}
                      {selectedQuery.status !== 'replied' && (
                        <button
                          onClick={() => {
                            updateSubmissionStatus(selectedQuery._id, 'replied')
                            setSelectedQuery({ ...selectedQuery, status: 'replied' })
                          }}
                          className="px-3 py-1 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                        >
                          Mark as Replied
                        </button>
                      )}
                      {selectedQuery.status !== 'resolved' && (
                        <button
                          onClick={() => {
                            updateSubmissionStatus(selectedQuery._id, 'resolved')
                            setSelectedQuery({ ...selectedQuery, status: 'resolved' })
                          }}
                          className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        >
                          Mark as Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={selectedQuery.adminNotes || ''}
                    onChange={(e) => setSelectedQuery({ ...selectedQuery, adminNotes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    placeholder="Add internal notes about this query..."
                  />
                </div>
              </div>
              ) : (
                /* No Data State */
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-accent-silver">No query data available</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedQuery && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-accent-silver/10 flex items-center justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-accent-silver hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Close
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (selectedQuery.adminNotes !== (queryData?.submissions.find(s => s._id === selectedQuery._id)?.adminNotes || '')) {
                      updateSubmissionStatus(selectedQuery._id, selectedQuery.status, selectedQuery.adminNotes)
                    }
                    setShowModal(false)
                  }}
                  className="px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
                >
                  Save Notes
                </button>
                {hasPermission('queries.delete') && (
                  <button
                    onClick={() => {
                      deleteSubmission(selectedQuery._id)
                      setShowModal(false)
                    }}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Delete Query
                  </button>
                )}
              </div>
            </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
