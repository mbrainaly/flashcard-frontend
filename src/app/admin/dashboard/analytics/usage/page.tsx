'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UsersIcon,
  EyeIcon,
  ClockIcon,
  DevicePhoneIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import Link from 'next/link'
import StatsCard from '@/components/admin/analytics/StatsCard'
import LineChart from '@/components/admin/analytics/LineChart'
import BarChart from '@/components/admin/analytics/BarChart'
import PieChart from '@/components/admin/analytics/PieChart'

interface UsageData {
  overview: {
    totalSessions: number
    uniqueUsers: number
    avgSessionDuration: number
    bounceRate: number
  }
  userActivity: {
    date: string
    sessions: number
    users: number
    pageViews: number
  }[]
  deviceStats: {
    name: string
    value: number
    color: string
  }[]
  browserStats: {
    name: string
    value: number
    color: string
  }[]
  topPages: {
    page: string
    views: number
    uniqueViews: number
    avgTime: number
  }[]
  userFlow: {
    step: string
    users: number
    dropoff: number
  }[]
}

export default function UsageAnalyticsPage() {
  const { hasPermission } = useAdminAuth()
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        setLoading(true)
        // Mock data for now
        const mockData: UsageData = {
          overview: {
            totalSessions: 45678,
            uniqueUsers: 12847,
            avgSessionDuration: 24.5,
            bounceRate: 32.1
          },
          userActivity: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            sessions: Math.floor(Math.random() * 800) + 400,
            users: Math.floor(Math.random() * 500) + 200,
            pageViews: Math.floor(Math.random() * 1500) + 800
          })),
          deviceStats: [
            { name: 'Desktop', value: 8234, color: '#3B82F6' },
            { name: 'Mobile', value: 3456, color: '#10B981' },
            { name: 'Tablet', value: 1157, color: '#F59E0B' }
          ],
          browserStats: [
            { name: 'Chrome', value: 6789, color: '#3B82F6' },
            { name: 'Safari', value: 3456, color: '#10B981' },
            { name: 'Firefox', value: 1890, color: '#F59E0B' },
            { name: 'Edge', value: 712, color: '#8B5CF6' }
          ],
          topPages: [
            { page: '/dashboard', views: 15420, uniqueViews: 8934, avgTime: 4.2 },
            { page: '/decks', views: 12890, uniqueViews: 7234, avgTime: 6.8 },
            { page: '/study', views: 11234, uniqueViews: 6789, avgTime: 12.5 },
            { page: '/quizzes', views: 9876, uniqueViews: 5432, avgTime: 8.9 },
            { page: '/notes', views: 8765, uniqueViews: 4567, avgTime: 5.7 }
          ],
          userFlow: [
            { step: 'Landing Page', users: 10000, dropoff: 0 },
            { step: 'Sign Up', users: 7500, dropoff: 25 },
            { step: 'Email Verification', users: 6750, dropoff: 10 },
            { step: 'Profile Setup', users: 5400, dropoff: 20 },
            { step: 'First Deck Created', users: 4320, dropoff: 20 },
            { step: 'First Study Session', users: 3456, dropoff: 20 }
          ]
        }
        setUsageData(mockData)
      } catch (error) {
        console.error('Error fetching usage data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsageData()
  }, [timeRange])

  if (!hasPermission('analytics.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to view usage analytics.
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usage Analytics</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
              Detailed user behavior and engagement metrics
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
      {usageData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard
            title="Total Sessions"
            value={usageData.overview.totalSessions.toLocaleString()}
            change="+12.5%"
            trend="up"
            icon={<EyeIcon className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="Unique Users"
            value={usageData.overview.uniqueUsers.toLocaleString()}
            change="+8.2%"
            trend="up"
            icon={<UsersIcon className="w-6 h-6" />}
            color="green"
          />
          <StatsCard
            title="Avg. Session Duration"
            value={`${usageData.overview.avgSessionDuration} min`}
            change="+3.1%"
            trend="up"
            icon={<ClockIcon className="w-6 h-6" />}
            color="purple"
          />
          <StatsCard
            title="Bounce Rate"
            value={`${usageData.overview.bounceRate}%`}
            change="-2.4%"
            trend="down"
            icon={<GlobeAltIcon className="w-6 h-6" />}
            color="orange"
          />
        </motion.div>
      )}

      {/* User Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">User Activity Over Time</h3>
        {usageData && (
          <LineChart
            data={usageData.userActivity}
            xKey="date"
            yKeys={['sessions', 'users', 'pageViews']}
            colors={['#3B82F6', '#10B981', '#F59E0B']}
            height={400}
          />
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Device Distribution</h3>
          {usageData && (
            <PieChart
              data={usageData.deviceStats}
              height={300}
            />
          )}
        </motion.div>

        {/* Browser Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Browser Distribution</h3>
          {usageData && (
            <BarChart
              data={usageData.browserStats.map(item => ({ name: item.name, value: item.value }))}
              xKey="name"
              yKey="value"
              color="#8B5CF6"
              height={300}
            />
          )}
        </motion.div>

        {/* Top Pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top Pages</h3>
          <div className="space-y-4">
            {usageData?.topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-accent-silver/5">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {page.page}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-accent-silver">
                    {page.uniqueViews.toLocaleString()} unique views
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {page.views.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-accent-silver">
                    {page.avgTime} min avg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* User Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">User Flow</h3>
          <div className="space-y-4">
            {usageData?.userFlow.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-accent-silver/5">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {step.step}
                      </div>
                      {step.dropoff > 0 && (
                        <div className="text-xs text-red-600 dark:text-red-400">
                          {step.dropoff}% drop-off
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {step.users.toLocaleString()} users
                  </div>
                </div>
                {index < usageData.userFlow.length - 1 && (
                  <div className="absolute left-7 top-full w-0.5 h-4 bg-gray-300 dark:bg-accent-silver/30"></div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
