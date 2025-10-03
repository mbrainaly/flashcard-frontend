'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  UsersIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BookOpenIcon,
  FolderIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import Link from 'next/link'
import StatsCard from '@/components/admin/analytics/StatsCard'
import LineChart from '@/components/admin/analytics/LineChart'
import BarChart from '@/components/admin/analytics/BarChart'
import PieChart from '@/components/admin/analytics/PieChart'

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    totalRevenue: number
    monthlyGrowth: number
  }
  userActivity: {
    date: string
    users: number
    sessions: number
  }[]
  contentStats: {
    decks: number
    cards: number
    quizzes: number
    notes: number
  }
  revenueData: {
    month: string
    revenue: number
    subscriptions: number
  }[]
  topContent: {
    name: string
    type: 'deck' | 'quiz' | 'note'
    views: number
    engagement: number
  }[]
}

export default function AnalyticsDashboardPage() {
  const { hasPermission } = useAdminAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        // Mock data for now
        const mockData: AnalyticsData = {
          overview: {
            totalUsers: 12847,
            activeUsers: 8932,
            totalRevenue: 45678.90,
            monthlyGrowth: 12.5
          },
          userActivity: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            users: Math.floor(Math.random() * 500) + 200,
            sessions: Math.floor(Math.random() * 800) + 400
          })),
          contentStats: {
            decks: 1247,
            cards: 15678,
            quizzes: 892,
            notes: 2341
          },
          revenueData: Array.from({ length: 12 }, (_, i) => ({
            month: new Date(2024, i, 1).toLocaleDateString('en', { month: 'short' }),
            revenue: Math.floor(Math.random() * 10000) + 5000,
            subscriptions: Math.floor(Math.random() * 100) + 50
          })),
          topContent: [
            { name: 'JavaScript Fundamentals', type: 'deck', views: 15420, engagement: 87.5 },
            { name: 'React Components Quiz', type: 'quiz', views: 12890, engagement: 92.1 },
            { name: 'Python Basics Notes', type: 'note', views: 11234, engagement: 78.9 },
            { name: 'Data Structures Deck', type: 'deck', views: 9876, engagement: 85.2 },
            { name: 'Machine Learning Quiz', type: 'quiz', views: 8765, engagement: 89.7 }
          ]
        }
        setAnalyticsData(mockData)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange])

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'deck': return <FolderIcon className="w-4 h-4" />
      case 'quiz': return <AcademicCapIcon className="w-4 h-4" />
      case 'note': return <BookOpenIcon className="w-4 h-4" />
      default: return <DocumentTextIcon className="w-4 h-4" />
    }
  }

  const getContentColor = (type: string) => {
    switch (type) {
      case 'deck': return 'text-blue-600 dark:text-blue-400'
      case 'quiz': return 'text-purple-600 dark:text-purple-400'
      case 'note': return 'text-orange-600 dark:text-orange-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  if (!hasPermission('analytics.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to view analytics.
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 dark:bg-accent-silver/20 rounded-xl"></div>
            <div className="h-80 bg-gray-200 dark:bg-accent-silver/20 rounded-xl"></div>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            Monitor platform performance and user engagement
          </p>
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
      {analyticsData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard
            title="Total Users"
            value={analyticsData.overview.totalUsers.toLocaleString()}
            change={`+${analyticsData.overview.monthlyGrowth}%`}
            trend="up"
            icon={<UsersIcon className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="Active Users"
            value={analyticsData.overview.activeUsers.toLocaleString()}
            change="+8.2%"
            trend="up"
            icon={<EyeIcon className="w-6 h-6" />}
            color="green"
          />
          <StatsCard
            title="Total Revenue"
            value={`$${analyticsData.overview.totalRevenue.toLocaleString()}`}
            change="+15.3%"
            trend="up"
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
            color="purple"
          />
          <StatsCard
            title="Avg. Session"
            value="24.5 min"
            change="-2.1%"
            trend="down"
            icon={<ClockIcon className="w-6 h-6" />}
            color="orange"
          />
        </motion.div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Activity</h3>
            <Link
              href="/admin/dashboard/analytics/usage"
              className="text-sm text-accent-neon hover:text-accent-neon/80 font-medium"
            >
              View Details →
            </Link>
          </div>
          {analyticsData && (
            <LineChart
              data={analyticsData.userActivity}
              xKey="date"
              yKeys={['users', 'sessions']}
              colors={['#3B82F6', '#10B981']}
              height={300}
            />
          )}
        </motion.div>

        {/* Content Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Content Distribution</h3>
            <Link
              href="/admin/dashboard/content"
              className="text-sm text-accent-neon hover:text-accent-neon/80 font-medium"
            >
              Manage Content →
            </Link>
          </div>
          {analyticsData && (
            <PieChart
              data={[
                { name: 'Cards', value: analyticsData.contentStats.cards, color: '#3B82F6' },
                { name: 'Notes', value: analyticsData.contentStats.notes, color: '#F59E0B' },
                { name: 'Decks', value: analyticsData.contentStats.decks, color: '#10B981' },
                { name: 'Quizzes', value: analyticsData.contentStats.quizzes, color: '#8B5CF6' }
              ]}
              height={300}
            />
          )}
        </motion.div>

        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h3>
            <Link
              href="/admin/dashboard/analytics/revenue"
              className="text-sm text-accent-neon hover:text-accent-neon/80 font-medium"
            >
              View Details →
            </Link>
          </div>
          {analyticsData && (
            <BarChart
              data={analyticsData.revenueData}
              xKey="month"
              yKey="revenue"
              color="#8B5CF6"
              height={300}
            />
          )}
        </motion.div>

        {/* Top Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Content</h3>
            <Link
              href="/admin/dashboard/analytics/performance"
              className="text-sm text-accent-neon hover:text-accent-neon/80 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {analyticsData?.topContent.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-accent-silver/5">
                <div className="flex items-center space-x-3">
                  <div className={`${getContentColor(item.type)}`}>
                    {getContentIcon(item.type)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-accent-silver capitalize">
                      {item.type}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.views.toLocaleString()} views
                  </div>
                  <div className="text-xs text-gray-500 dark:text-accent-silver">
                    {item.engagement}% engagement
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/dashboard/analytics/usage"
            className="flex items-center p-4 rounded-lg border border-gray-200 dark:border-accent-silver/20 hover:bg-gray-50 dark:hover:bg-accent-silver/5 transition-colors"
          >
            <UsersIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Usage Analytics</div>
              <div className="text-xs text-gray-500 dark:text-accent-silver">User behavior insights</div>
            </div>
          </Link>
          
          <Link
            href="/admin/dashboard/analytics/performance"
            className="flex items-center p-4 rounded-lg border border-gray-200 dark:border-accent-silver/20 hover:bg-gray-50 dark:hover:bg-accent-silver/5 transition-colors"
          >
            <ArrowTrendingUpIcon className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Performance</div>
              <div className="text-xs text-gray-500 dark:text-accent-silver">Content metrics</div>
            </div>
          </Link>
          
          <Link
            href="/admin/dashboard/analytics/revenue"
            className="flex items-center p-4 rounded-lg border border-gray-200 dark:border-accent-silver/20 hover:bg-gray-50 dark:hover:bg-accent-silver/5 transition-colors"
          >
            <CurrencyDollarIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Revenue</div>
              <div className="text-xs text-gray-500 dark:text-accent-silver">Financial insights</div>
            </div>
          </Link>
          
          <Link
            href="/admin/dashboard/users"
            className="flex items-center p-4 rounded-lg border border-gray-200 dark:border-accent-silver/20 hover:bg-gray-50 dark:hover:bg-accent-silver/5 transition-colors"
          >
            <ChartBarIcon className="w-8 h-8 text-orange-600 dark:text-orange-400 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">User Management</div>
              <div className="text-xs text-gray-500 dark:text-accent-silver">Manage users</div>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
