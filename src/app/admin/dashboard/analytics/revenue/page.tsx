'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CreditCardIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowLeftIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import Link from 'next/link'
import StatsCard from '@/components/admin/analytics/StatsCard'
import LineChart from '@/components/admin/analytics/LineChart'
import BarChart from '@/components/admin/analytics/BarChart'
import PieChart from '@/components/admin/analytics/PieChart'

interface RevenueData {
  overview: {
    totalRevenue: number
    monthlyRecurring: number
    averageOrderValue: number
    churnRate: number
  }
  revenueGrowth: {
    date: string
    revenue: number
    subscriptions: number
    oneTime: number
  }[]
  subscriptionPlans: {
    name: string
    value: number
    color: string
    price: number
  }[]
  revenueByMonth: {
    month: string
    revenue: number
    subscriptions: number
    growth: number
  }[]
  customerSegments: {
    segment: string
    customers: number
    revenue: number
    avgValue: number
  }[]
  paymentMethods: {
    method: string
    value: number
    color: string
  }[]
  topCustomers: {
    id: string
    name: string
    email: string
    totalSpent: number
    subscriptionPlan: string
    joinDate: string
  }[]
}

export default function RevenueAnalyticsPage() {
  const { hasPermission } = useAdminAuth()
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true)
        // Mock data for now
        const mockData: RevenueData = {
          overview: {
            totalRevenue: 145678.90,
            monthlyRecurring: 89432.50,
            averageOrderValue: 24.99,
            churnRate: 3.2
          },
          revenueGrowth: Array.from({ length: 12 }, (_, i) => ({
            date: new Date(2024, i, 1).toISOString().split('T')[0],
            revenue: Math.floor(Math.random() * 15000) + 8000,
            subscriptions: Math.floor(Math.random() * 8000) + 5000,
            oneTime: Math.floor(Math.random() * 5000) + 2000
          })),
          subscriptionPlans: [
            { name: 'Basic', value: 3456, color: '#3B82F6', price: 9.99 },
            { name: 'Pro', value: 2890, color: '#10B981', price: 19.99 },
            { name: 'Premium', value: 1234, color: '#F59E0B', price: 39.99 },
            { name: 'Enterprise', value: 456, color: '#8B5CF6', price: 99.99 }
          ],
          revenueByMonth: [
            { month: 'Jan', revenue: 12450, subscriptions: 8900, growth: 12.5 },
            { month: 'Feb', revenue: 13890, subscriptions: 9800, growth: 11.6 },
            { month: 'Mar', revenue: 15234, subscriptions: 10200, growth: 9.7 },
            { month: 'Apr', revenue: 14567, subscriptions: 9950, growth: -4.4 },
            { month: 'May', revenue: 16789, subscriptions: 11200, growth: 15.3 },
            { month: 'Jun', revenue: 18234, subscriptions: 12100, growth: 8.6 }
          ],
          customerSegments: [
            { segment: 'New Users', customers: 1234, revenue: 18456, avgValue: 14.95 },
            { segment: 'Returning Users', customers: 2890, revenue: 67890, avgValue: 23.49 },
            { segment: 'Premium Users', customers: 456, revenue: 45678, avgValue: 100.17 },
            { segment: 'Enterprise', customers: 89, revenue: 23456, avgValue: 263.66 }
          ],
          paymentMethods: [
            { method: 'Credit Card', value: 5678, color: '#3B82F6' },
            { method: 'PayPal', value: 2345, color: '#10B981' },
            { method: 'Bank Transfer', value: 890, color: '#F59E0B' },
            { method: 'Crypto', value: 123, color: '#8B5CF6' }
          ],
          topCustomers: [
            {
              id: '1',
              name: 'Acme Corp',
              email: 'billing@acme.com',
              totalSpent: 2499.99,
              subscriptionPlan: 'Enterprise',
              joinDate: '2024-01-15'
            },
            {
              id: '2',
              name: 'TechStart Inc',
              email: 'admin@techstart.com',
              totalSpent: 1899.99,
              subscriptionPlan: 'Premium',
              joinDate: '2024-02-03'
            },
            {
              id: '3',
              name: 'EduLearn Ltd',
              email: 'finance@edulearn.com',
              totalSpent: 1599.99,
              subscriptionPlan: 'Premium',
              joinDate: '2024-01-28'
            },
            {
              id: '4',
              name: 'StudyGroup Pro',
              email: 'billing@studygroup.com',
              totalSpent: 1299.99,
              subscriptionPlan: 'Pro',
              joinDate: '2024-03-12'
            },
            {
              id: '5',
              name: 'LearnFast Academy',
              email: 'payments@learnfast.edu',
              totalSpent: 999.99,
              subscriptionPlan: 'Pro',
              joinDate: '2024-02-18'
            }
          ]
        }
        setRevenueData(mockData)
      } catch (error) {
        console.error('Error fetching revenue data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
  }, [timeRange])

  if (!hasPermission('analytics.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to view revenue analytics.
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
            href="/admin/dashboard/analytics"
            className="p-2 rounded-lg border border-gray-300 dark:border-accent-silver/20 hover:bg-gray-50 dark:hover:bg-accent-silver/10 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-accent-silver" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue Analytics</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
              Financial performance and subscription insights
            </p>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
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
      {revenueData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard
            title="Total Revenue"
            value={`$${revenueData.overview.totalRevenue.toLocaleString()}`}
            change="+15.3%"
            trend="up"
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="Monthly Recurring"
            value={`$${revenueData.overview.monthlyRecurring.toLocaleString()}`}
            change="+12.8%"
            trend="up"
            icon={<BanknotesIcon className="w-6 h-6" />}
            color="green"
          />
          <StatsCard
            title="Avg. Order Value"
            value={`$${revenueData.overview.averageOrderValue}`}
            change="+3.2%"
            trend="up"
            icon={<CreditCardIcon className="w-6 h-6" />}
            color="purple"
          />
          <StatsCard
            title="Churn Rate"
            value={`${revenueData.overview.churnRate}%`}
            change="-0.8%"
            trend="down"
            icon={<UserGroupIcon className="w-6 h-6" />}
            color="orange"
          />
        </motion.div>
      )}

      {/* Revenue Growth Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Revenue Growth</h3>
        {revenueData && (
          <LineChart
            data={revenueData.revenueGrowth}
            xKey="date"
            yKeys={['revenue', 'subscriptions', 'oneTime']}
            colors={['#3B82F6', '#10B981', '#F59E0B']}
            height={400}
          />
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Plans Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Subscription Plans</h3>
          {revenueData && (
            <PieChart
              data={revenueData.subscriptionPlans}
              height={300}
            />
          )}
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Monthly Revenue</h3>
          {revenueData && (
            <BarChart
              data={revenueData.revenueByMonth}
              xKey="month"
              yKey="revenue"
              color="#8B5CF6"
              height={300}
            />
          )}
        </motion.div>

        {/* Customer Segments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Customer Segments</h3>
          <div className="space-y-4">
            {revenueData?.customerSegments.map((segment, index) => (
              <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-accent-silver/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {segment.segment}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${segment.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-accent-silver">
                  <span>{segment.customers.toLocaleString()} customers</span>
                  <span>Avg: ${segment.avgValue}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top Customers</h3>
          <div className="space-y-4">
            {revenueData?.topCustomers.map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-accent-silver/5">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {customer.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-accent-silver">
                      {customer.subscriptionPlan} • Joined {new Date(customer.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    ${customer.totalSpent.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-accent-silver">
                    Total spent
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Payment Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Payment Methods</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {revenueData?.paymentMethods.map((method, index) => (
            <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-accent-silver/5 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {method.value.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-accent-silver">
                {method.method}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
