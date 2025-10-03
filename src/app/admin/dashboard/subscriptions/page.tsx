'use client'

import { useState, useEffect } from 'react'
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
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [overview, setOverview] = useState<SubscriptionOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    status: '',
    plan: '',
    search: ''
  })

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true)
        // Mock data for now
        const mockSubscriptions: Subscription[] = [
          {
            _id: '1',
            user: { name: 'John Doe', email: 'john@example.com' },
            plan: { name: 'Pro', price: 19.99, interval: 'monthly', features: ['Unlimited decks', 'Advanced analytics'] },
            status: 'active',
            currentPeriodStart: '2024-01-01',
            currentPeriodEnd: '2024-02-01',
            cancelAtPeriodEnd: false,
            createdAt: '2024-01-01',
            lastPayment: { amount: 19.99, date: '2024-01-01', status: 'succeeded' }
          },
          {
            _id: '2',
            user: { name: 'Jane Smith', email: 'jane@example.com' },
            plan: { name: 'Premium', price: 39.99, interval: 'monthly', features: ['Everything in Pro', 'Priority support'] },
            status: 'active',
            currentPeriodStart: '2024-01-15',
            currentPeriodEnd: '2024-02-15',
            cancelAtPeriodEnd: false,
            createdAt: '2024-01-15',
            lastPayment: { amount: 39.99, date: '2024-01-15', status: 'succeeded' }
          },
          {
            _id: '3',
            user: { name: 'Bob Wilson', email: 'bob@example.com' },
            plan: { name: 'Basic', price: 9.99, interval: 'monthly', features: ['10 decks', 'Basic analytics'] },
            status: 'past_due',
            currentPeriodStart: '2024-01-10',
            currentPeriodEnd: '2024-02-10',
            cancelAtPeriodEnd: false,
            createdAt: '2024-01-10',
            lastPayment: { amount: 9.99, date: '2024-01-10', status: 'failed' }
          },
          {
            _id: '4',
            user: { name: 'Alice Johnson', email: 'alice@example.com' },
            plan: { name: 'Pro', price: 199.99, interval: 'yearly', features: ['Unlimited decks', 'Advanced analytics'] },
            status: 'trialing',
            currentPeriodStart: '2024-01-20',
            currentPeriodEnd: '2024-02-20',
            cancelAtPeriodEnd: false,
            trialEnd: '2024-02-03',
            createdAt: '2024-01-20'
          },
          {
            _id: '5',
            user: { name: 'Charlie Brown', email: 'charlie@example.com' },
            plan: { name: 'Premium', price: 39.99, interval: 'monthly', features: ['Everything in Pro', 'Priority support'] },
            status: 'cancelled',
            currentPeriodStart: '2024-01-05',
            currentPeriodEnd: '2024-02-05',
            cancelAtPeriodEnd: true,
            createdAt: '2024-01-05',
            lastPayment: { amount: 39.99, date: '2024-01-05', status: 'succeeded' }
          },
          // Additional mock subscriptions for pagination demo
          ...Array.from({ length: 20 }, (_, i) => ({
            _id: `${i + 6}`,
            user: { 
              name: `User ${i + 6}`, 
              email: `user${i + 6}@example.com` 
            },
            plan: { 
              name: ['Basic', 'Pro', 'Premium', 'Enterprise'][i % 4], 
              price: [9.99, 19.99, 39.99, 99.99][i % 4], 
              interval: Math.random() > 0.7 ? 'yearly' : 'monthly' as 'monthly' | 'yearly',
              features: ['Sample features'] 
            },
            status: ['active', 'trialing', 'past_due', 'cancelled', 'incomplete'][i % 5] as 'active' | 'trialing' | 'past_due' | 'cancelled' | 'incomplete',
            currentPeriodStart: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            currentPeriodEnd: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            cancelAtPeriodEnd: Math.random() > 0.8,
            createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            lastPayment: Math.random() > 0.2 ? {
              amount: [9.99, 19.99, 39.99, 99.99][i % 4],
              date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              status: ['succeeded', 'failed', 'pending'][Math.floor(Math.random() * 3)] as 'succeeded' | 'failed' | 'pending'
            } : undefined
          }))
        ]

        const mockOverview: SubscriptionOverview = {
          totalSubscriptions: 1247,
          activeSubscriptions: 1089,
          monthlyRevenue: 28456.78,
          churnRate: 3.2,
          subscriptionTrend: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            active: Math.floor(Math.random() * 50) + 1000,
            cancelled: Math.floor(Math.random() * 10) + 5,
            new: Math.floor(Math.random() * 20) + 10
          })),
          planDistribution: [
            { name: 'Basic', value: 456, color: '#3B82F6' },
            { name: 'Pro', value: 678, color: '#10B981' },
            { name: 'Premium', value: 234, color: '#F59E0B' },
            { name: 'Enterprise', value: 89, color: '#8B5CF6' }
          ],
          recentSubscriptions: mockSubscriptions
        }

        setSubscriptions(mockSubscriptions)
        setOverview(mockOverview)
      } catch (error) {
        console.error('Error fetching subscriptions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptions()
  }, [])

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

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (filters.status && sub.status !== filters.status) return false
    if (filters.plan && sub.plan.name !== filters.plan) return false
    if (filters.search && !sub.user.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !sub.user.email.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex)

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

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
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
            />
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
            Subscriptions ({filteredSubscriptions.length})
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
                              {subscription.user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-accent-silver">
                              {subscription.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {subscription.plan.name}
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
                          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          {hasPermission('subscriptions.write') && (
                            <>
                              <button className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300">
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
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
          {filteredSubscriptions.length > 0 && (
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
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-accent-silver bg-white dark:bg-accent-obsidian border border-gray-300 dark:border-accent-silver/20 rounded-md hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredSubscriptions.length)} of {filteredSubscriptions.length} results
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-accent-silver bg-white dark:bg-accent-obsidian border border-gray-300 dark:border-accent-silver/20 rounded-md hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                        onClick={() => setCurrentPage(pageNum)}
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
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-accent-silver bg-white dark:bg-accent-obsidian border border-gray-300 dark:border-accent-silver/20 rounded-md hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
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
    </div>
  )
}
