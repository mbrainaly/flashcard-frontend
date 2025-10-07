'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCardIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import { showToast } from '@/components/ui/Toast'
import EditSubscriptionModal from '@/components/admin/EditSubscriptionModal'
import HighlightedText from '@/components/admin/HighlightedText'
import Link from 'next/link'
import StatsCard from '@/components/admin/analytics/StatsCard'
import LineChart from '@/components/admin/analytics/LineChart'
import PieChart from '@/components/admin/analytics/PieChart'

interface Subscription {
  _id: string
  user: {
    name: string
    email: string
    avatar?: string
  }
  plan: {
    name: string
    price: number
    interval: 'monthly' | 'yearly'
    features: string[]
  }
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
  createdAt: string
  lastPayment?: {
    amount: number
    date: string
    status: 'succeeded' | 'failed' | 'pending'
  }
}

interface SubscriptionOverview {
  totalSubscriptions: number
  activeSubscriptions: number
  monthlyRevenue: number
  churnRate: number
  subscriptionTrend: {
    date: string
    active: number
    cancelled: number
    new: number
  }[]
  planDistribution: {
    name: string
    value: number
    color: string
  }[]
  recentSubscriptions: Subscription[]
}

export default function SubscriptionsOverviewPage() {
  const { hasPermission } = useAdminAuth()
  const adminApi = useAdminApi()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [overview, setOverview] = useState<SubscriptionOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalSubscriptions, setTotalSubscriptions] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filters, setFilters] = useState({
    status: '',
    plan: '',
    search: ''
  })
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)

  // Store all subscriptions for client-side filtering
  const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([])
  
  // Real-time client-side filtering
  const filteredSubscriptions = useMemo(() => {
    let filtered = allSubscriptions

    // Apply search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim()
      filtered = filtered.filter(subscription => 
        subscription.user.name.toLowerCase().includes(searchTerm) ||
        subscription.user.email.toLowerCase().includes(searchTerm) ||
        subscription.plan.name.toLowerCase().includes(searchTerm)
      )
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(subscription => subscription.status === filters.status)
    }

    // Apply plan filter
    if (filters.plan) {
      filtered = filtered.filter(subscription => subscription.plan.name === filters.plan)
    }

    return filtered
  }, [allSubscriptions, filters.search, filters.status, filters.plan])

  // Fetch subscriptions from API
  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      
      // Fetch all subscriptions without pagination for client-side filtering
      const response = await adminApi.get(`/api/admin/subscriptions?limit=1000`)
      
      if (response.success) {
        setAllSubscriptions(response.data || [])
        setTotalSubscriptions(response.data?.length || 0)
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: response.error || 'Failed to fetch subscriptions'
        })
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch subscriptions'
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch overview data from API
  const fetchOverview = async () => {
    try {
      const response = await adminApi.get('/api/admin/subscriptions/overview')
      
      if (response.success) {
        setOverview(response.data)
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: response.error || 'Failed to fetch overview data'
        })
      }
    } catch (error) {
      console.error('Error fetching overview:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch overview data'
      })
    }
  }

  // Client-side pagination
  const paginatedSubscriptions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredSubscriptions.slice(startIndex, endIndex)
  }, [filteredSubscriptions, currentPage, itemsPerPage])

  // Update total pages when filtered data changes
  useEffect(() => {
    const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage)
    setTotalPages(totalPages)
    setTotalSubscriptions(filteredSubscriptions.length)
    
    // Reset to first page if current page is beyond available pages
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [filteredSubscriptions.length, itemsPerPage, currentPage])

  // Fetch data only once on component mount
  useEffect(() => {
    fetchSubscriptions()
  }, [])

  useEffect(() => {
    fetchOverview()
  }, [])

  // Handle pagination changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  // Action handlers
  const handleViewSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setViewModalOpen(true)
  }

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setEditModalOpen(true)
  }

  const handleDeleteSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setDeleteModalOpen(true)
  }

  const confirmDeleteSubscription = async () => {
    if (!selectedSubscription) return

    try {
      await adminApi.delete(`/api/admin/subscriptions/${selectedSubscription._id}`)
      showToast('Subscription deleted successfully', 'success')
      setDeleteModalOpen(false)
      setSelectedSubscription(null)
      fetchSubscriptions() // Refresh the list
    } catch (error) {
      console.error('Error deleting subscription:', error)
      showToast('Failed to delete subscription', 'error')
    }
  }

  const handleUpdateSubscription = async (updatedData: any) => {
    if (!selectedSubscription) return

    try {
      await adminApi.put(`/api/admin/subscriptions/${selectedSubscription._id}`, updatedData)
      showToast('Subscription updated successfully', 'success')
      setEditModalOpen(false)
      setSelectedSubscription(null)
      fetchSubscriptions() // Refresh the list
    } catch (error) {
      console.error('Error updating subscription:', error)
      showToast('Failed to update subscription', 'error')
    }
  }

  const getStatusBadge = (status: Subscription['status']) => {
    const statusConfig = {
      active: { color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300', icon: CheckCircleIcon },
      cancelled: { color: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300', icon: XCircleIcon },
      past_due: { color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300', icon: ExclamationTriangleIcon },
      trialing: { color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300', icon: ClockIcon },
      incomplete: { color: 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300', icon: ClockIcon }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }


  // Calculate pagination display info
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalSubscriptions)

  if (!hasPermission('subscriptions.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to view subscriptions.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-accent-silver/20 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-accent-silver/20 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            Monitor and manage user subscriptions and billing
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Link
            href="/admin/dashboard/subscriptions/plans"
            className="inline-flex items-center px-4 py-2 border border-accent-silver/30 text-accent-silver/80 rounded-lg hover:bg-accent-silver/10 hover:text-white transition-colors"
          >
            <ChartBarIcon className="w-4 h-4 mr-2" />
            Manage Plans
          </Link>
          <Link
            href="/admin/dashboard/subscriptions/billing"
            className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
          >
            <CurrencyDollarIcon className="w-4 h-4 mr-2" />
            Billing Overview
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      {overview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard
            title="Total Subscriptions"
            value={overview.totalSubscriptions.toLocaleString()}
            change="+12.5%"
            trend="up"
            icon={<CreditCardIcon className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="Active Subscriptions"
            value={overview.activeSubscriptions.toLocaleString()}
            change="+8.2%"
            trend="up"
            icon={<UsersIcon className="w-6 h-6" />}
            color="green"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`$${overview.monthlyRevenue.toLocaleString()}`}
            change="+15.3%"
            trend="up"
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
            color="purple"
          />
          <StatsCard
            title="Churn Rate"
            value={`${overview.churnRate}%`}
            change="-0.8%"
            trend="down"
            icon={<ChartBarIcon className="w-6 h-6" />}
            color="orange"
          />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Subscription Trends</h3>
          {overview && (
            <LineChart
              data={overview.subscriptionTrend}
              xKey="date"
              yKeys={['active', 'new', 'cancelled']}
              colors={['#10B981', '#3B82F6', '#F59E0B']}
              height={300}
            />
          )}
        </motion.div>

        {/* Plan Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Plan Distribution</h3>
          {overview && (
            <PieChart
              data={overview.planDistribution}
              height={300}
            />
          )}
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search by name, email, or plan..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
            />
            {filters.search.trim() && (
              <div className="mt-1 text-xs text-gray-500 dark:text-accent-silver/70">
                {filteredSubscriptions.length} result{filteredSubscriptions.length !== 1 ? 's' : ''} found
                {filteredSubscriptions.length !== allSubscriptions.length && (
                  <span> out of {allSubscriptions.length} total</span>
                )}
              </div>
            )}
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
              <option value="trialing">Trialing</option>
              <option value="past_due">Past Due</option>
              <option value="cancelled">Cancelled</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Plan
            </label>
            <select
              value={filters.plan}
              onChange={(e) => setFilters(prev => ({ ...prev, plan: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
            >
              <option value="">All Plans</option>
              <option value="Basic">Basic</option>
              <option value="Pro">Pro</option>
              <option value="Premium">Premium</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', plan: '', search: '' })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-accent-silver/10 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Subscriptions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 flex flex-col"
        style={{ height: '600px' }}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-accent-silver/10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Subscriptions ({totalSubscriptions})
          </h3>
        </div>
        
        <div className="flex flex-col h-full">
          {/* Table Container with Fixed Height */}
          <div className="flex-1 overflow-auto">
            <div className="min-h-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-accent-silver/10">
                <thead className="bg-gray-50 dark:bg-accent-silver/5 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Current Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Last Payment
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-accent-obsidian divide-y divide-gray-200 dark:divide-accent-silver/10">
                  {paginatedSubscriptions.map((subscription) => (
                    <tr key={subscription._id} className="hover:bg-gray-50 dark:hover:bg-accent-silver/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {subscription.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              <HighlightedText text={subscription.user.name} searchTerm={filters.search} />
                            </div>
                            <div className="text-sm text-gray-500 dark:text-accent-silver">
                              <HighlightedText text={subscription.user.email} searchTerm={filters.search} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          <HighlightedText text={subscription.plan.name} searchTerm={filters.search} />
                        </div>
                        <div className="text-sm text-gray-500 dark:text-accent-silver">
                          ${subscription.plan.price}/{subscription.plan.interval}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(subscription.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>
                          {new Date(subscription.currentPeriodStart).toLocaleDateString()} - 
                        </div>
                        <div>
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {subscription.lastPayment ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              ${subscription.lastPayment.amount}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-accent-silver">
                              {new Date(subscription.lastPayment.date).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-accent-silver">No payment</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewSubscription(subscription)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          {hasPermission('subscriptions.write') && (
                            <>
                              <button 
                                onClick={() => handleEditSubscription(subscription)}
                                className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                                title="Edit Subscription"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteSubscription(subscription)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                title="Delete Subscription"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {paginatedSubscriptions.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-12">
                <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No subscriptions found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            </div>
          )}

          {/* Enhanced Pagination - Fixed at bottom */}
          {totalSubscriptions > 0 && (
            <div className="flex-shrink-0 bg-white dark:bg-accent-obsidian px-4 py-4 border-t border-gray-200 dark:border-accent-silver/10">
              {/* Mobile pagination */}
              <div className="flex items-center justify-between sm:hidden">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 dark:border-accent-silver/20 rounded bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-accent-silver bg-white dark:bg-accent-obsidian border border-gray-300 dark:border-accent-silver/20 rounded-md hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-accent-silver bg-white dark:bg-accent-obsidian border border-gray-300 dark:border-accent-silver/20 rounded-md hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Desktop pagination */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="px-3 py-1 border border-gray-300 dark:border-accent-silver/20 rounded bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-700 dark:text-gray-300">entries</span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {startIndex + 1} to {endIndex} of {totalSubscriptions} results
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-accent-silver bg-white dark:bg-accent-obsidian border border-gray-300 dark:border-accent-silver/20 rounded-md hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-accent-silver bg-white dark:bg-accent-obsidian border border-gray-300 dark:border-accent-silver/20 rounded-md hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {/* Page numbers with smart ellipsis */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                          currentPage === pageNum
                            ? 'bg-accent-neon text-black'
                            : 'text-gray-500 dark:text-accent-silver bg-white dark:bg-accent-obsidian border border-gray-300 dark:border-accent-silver/20 hover:bg-gray-50 dark:hover:bg-accent-silver/10'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-accent-silver bg-white dark:bg-accent-obsidian border border-gray-300 dark:border-accent-silver/20 rounded-md hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-accent-silver bg-white dark:bg-accent-obsidian border border-gray-300 dark:border-accent-silver/20 rounded-md hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* View Subscription Modal */}
      {viewModalOpen && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-accent-obsidian rounded-xl shadow-2xl border border-gray-200 dark:border-accent-silver/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-accent-silver/10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Subscription Details
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* User Information */}
              <div className="bg-accent-silver/5 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">User Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-accent-silver/70">Name</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedSubscription.user.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-accent-silver/70">Email</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedSubscription.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Subscription Information */}
              <div className="bg-accent-silver/5 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Subscription Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-accent-silver/70">Plan</label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedSubscription.plan.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-accent-silver/70">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedSubscription.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-accent-silver/70">Price</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      ${selectedSubscription.plan.price}/{selectedSubscription.plan.interval}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-accent-silver/70">Created</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(selectedSubscription.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-accent-silver/70">Current Period Start</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(selectedSubscription.currentPeriodStart).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-accent-silver/70">Current Period End</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(selectedSubscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Plan Features */}
              {selectedSubscription.plan.features && selectedSubscription.plan.features.length > 0 && (
                <div className="bg-accent-silver/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Plan Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedSubscription.plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700 dark:text-accent-silver">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-accent-silver/10 flex justify-end">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-accent-silver bg-white dark:bg-accent-silver/10 border border-gray-300 dark:border-accent-silver/20 rounded-lg hover:bg-gray-50 dark:hover:bg-accent-silver/20"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {editModalOpen && selectedSubscription && (
        <EditSubscriptionModal
          subscription={selectedSubscription}
          onClose={() => setEditModalOpen(false)}
          onUpdate={handleUpdateSubscription}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-accent-obsidian rounded-xl shadow-2xl border border-gray-200 dark:border-accent-silver/10 w-full max-w-md"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-accent-silver/10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Subscription
              </h3>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    Are you sure you want to delete this subscription for{' '}
                    <span className="font-medium">{selectedSubscription.user.name}</span>?
                  </p>
                  <p className="text-xs text-gray-500 dark:text-accent-silver/70 mt-1">
                    This action cannot be undone and will immediately cancel their access.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-accent-silver/10 flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-accent-silver bg-white dark:bg-accent-silver/10 border border-gray-300 dark:border-accent-silver/20 rounded-lg hover:bg-gray-50 dark:hover:bg-accent-silver/20"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSubscription}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Delete Subscription
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
