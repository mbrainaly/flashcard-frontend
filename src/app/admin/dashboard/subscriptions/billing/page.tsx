'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import { showToast } from '@/components/ui/Toast'
import Link from 'next/link'
import StatsCard from '@/components/admin/analytics/StatsCard'
import LineChart from '@/components/admin/analytics/LineChart'
import BarChart from '@/components/admin/analytics/BarChart'

interface Transaction {
  _id: string
  user: {
    name: string
    email: string
  }
  subscription: {
    plan: string
    interval: 'monthly' | 'yearly'
  }
  amount: number
  currency: string
  status: 'succeeded' | 'failed' | 'pending' | 'refunded'
  paymentMethod: {
    type: 'card' | 'bank_transfer' | 'paypal'
    last4?: string
    brand?: string
  }
  stripeTransactionId?: string
  failureReason?: string
  createdAt: string
  processedAt?: string
}

interface BillingOverview {
  totalRevenue: number
  monthlyRecurringRevenue: number
  failedPayments: number
  refundedAmount: number
  revenueGrowth: {
    date: string
    revenue: number
    transactions: number
    failed: number
  }[]
  paymentMethods: {
    method: string
    count: number
    amount: number
  }[]
  recentTransactions: Transaction[]
}

export default function BillingOverviewPage() {
  const { hasPermission } = useAdminAuth()
  const adminApi = useAdminApi()
  const [billingData, setBillingData] = useState<BillingOverview | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    dateRange: '30d',
    search: ''
  })

  // Fetch billing overview data from API
  const fetchBillingData = async () => {
    try {
      setLoading(true)
      const response = await adminApi.get(`/api/admin/billing/overview?dateRange=${filters.dateRange}`)
      
      if (response.success) {
        setBillingData(response.data)
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: response.error || 'Failed to fetch billing data'
        })
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch billing data'
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch transactions data from API
  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true)
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        dateRange: filters.dateRange,
        limit: '50' // Show more transactions in the detailed view
      })

      if (filters.status) queryParams.append('status', filters.status)
      if (filters.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod)
      if (filters.search) queryParams.append('search', filters.search)

      const response = await adminApi.get(`/api/admin/billing/transactions?${queryParams}`)
      
      if (response.success) {
        setTransactions(response.data || [])
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: response.error || 'Failed to fetch transactions'
        })
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch transactions'
      })
    } finally {
      setTransactionsLoading(false)
    }
  }

  useEffect(() => {
    fetchBillingData()
  }, [filters.dateRange])

  useEffect(() => {
    fetchTransactions()
  }, [filters])

  // Handle refund processing
  const handleRefund = async (transactionId: string, amount: number, reason: string) => {
    try {
      const response = await adminApi.post('/api/admin/billing/refund', {
        transactionId,
        amount,
        reason
      })
      
      if (response.success) {
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Refund processed successfully'
        })
        // Refresh data
        fetchBillingData()
        fetchTransactions()
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: response.error || 'Failed to process refund'
        })
      }
    } catch (error) {
      console.error('Error processing refund:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to process refund'
      })
    }
  }

  const getStatusBadge = (status: Transaction['status']) => {
    const statusConfig = {
      succeeded: { color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300', icon: CheckCircleIcon },
      failed: { color: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300', icon: XCircleIcon },
      pending: { color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300', icon: ClockIcon },
      refunded: { color: 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300', icon: ExclamationTriangleIcon }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.toUpperCase()}
      </span>
    )
  }

  const getPaymentMethodDisplay = (paymentMethod: Transaction['paymentMethod']) => {
    if (paymentMethod.type === 'card') {
      return `${paymentMethod.brand} •••• ${paymentMethod.last4}`
    }
    return paymentMethod.type.charAt(0).toUpperCase() + paymentMethod.type.slice(1)
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (filters.status && transaction.status !== filters.status) return false
    if (filters.paymentMethod && transaction.paymentMethod.type !== filters.paymentMethod) return false
    if (filters.search && !transaction.user.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !transaction.user.email.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  if (!hasPermission('subscriptions.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to view billing information.
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
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/dashboard/subscriptions"
            className="p-2 rounded-lg border border-gray-300 dark:border-accent-silver/20 hover:bg-gray-50 dark:hover:bg-accent-silver/10 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-accent-silver" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing Overview</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
              Monitor payments, transactions, and billing analytics
            </p>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      {billingData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard
            title="Total Revenue"
            value={`$${billingData.totalRevenue.toLocaleString()}`}
            change="+15.3%"
            trend="up"
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="Monthly Recurring"
            value={`$${billingData.monthlyRecurringRevenue.toLocaleString()}`}
            change="+12.8%"
            trend="up"
            icon={<BanknotesIcon className="w-6 h-6" />}
            color="green"
          />
          <StatsCard
            title="Failed Payments"
            value={billingData.failedPayments.toLocaleString()}
            change="-5.2%"
            trend="down"
            icon={<ExclamationTriangleIcon className="w-6 h-6" />}
            color="red"
          />
          <StatsCard
            title="Refunded Amount"
            value={`$${billingData.refundedAmount.toLocaleString()}`}
            change="-8.1%"
            trend="down"
            icon={<DocumentTextIcon className="w-6 h-6" />}
            color="orange"
          />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Revenue & Transactions</h3>
          {billingData && (
            <LineChart
              data={billingData.revenueGrowth}
              xKey="date"
              yKeys={['revenue', 'transactions']}
              colors={['#10B981', '#3B82F6']}
              height={300}
            />
          )}
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Payment Methods</h3>
          {billingData && (
            <BarChart
              data={billingData.paymentMethods.map(method => ({ method: method.method, amount: method.amount }))}
              xKey="method"
              yKey="amount"
              color="#8B5CF6"
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
              placeholder="Search by user..."
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
              <option value="succeeded">Succeeded</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Method
            </label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
            >
              <option value="">All Methods</option>
              <option value="card">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', paymentMethod: '', dateRange: '30d', search: '' })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-accent-silver/10 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-accent-silver/10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions ({filteredTransactions.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-accent-silver/10">
            <thead className="bg-gray-50 dark:bg-accent-silver/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-accent-obsidian divide-y divide-gray-200 dark:divide-accent-silver/10">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-accent-silver/5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {transaction.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-accent-silver">
                          {transaction.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.subscription.plan}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-accent-silver">
                      {transaction.subscription.interval}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ${transaction.amount} {transaction.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {getPaymentMethodDisplay(transaction.paymentMethod)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transaction.status)}
                    {transaction.failureReason && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {transaction.failureReason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                    <div className="text-xs text-gray-500 dark:text-accent-silver">
                      {new Date(transaction.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
