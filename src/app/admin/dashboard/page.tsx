'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UsersIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  AcademicCapIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline'
import { useAdminApi } from '@/hooks/useAdminApi'

interface MetricCard {
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease'
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface ActivityItem {
  id: string
  type: 'user' | 'content' | 'subscription' | 'system'
  message: string
  timestamp: string
  user?: string
}

interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  color: string
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    uptime: '99.9%',
    responseTime: '125ms',
    activeUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { get } = useAdminApi()

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch dashboard stats and recent activity in parallel
        const [statsResponse, activityResponse] = await Promise.all([
          get('/api/admin/analytics/dashboard'),
          get('/api/admin/analytics/activity?limit=5')
        ])
        
        if (statsResponse.success && activityResponse.success) {
          const stats = statsResponse.data
          
          // Transform backend data to frontend format
          const transformedMetrics: MetricCard[] = [
            {
              title: 'Total Users',
              value: stats.overview.totalUsers.toLocaleString(),
              change: stats.overview.userGrowth || 0,
              changeType: (stats.overview.userGrowth || 0) >= 0 ? 'increase' : 'decrease',
              icon: UsersIcon,
              color: 'bg-blue-500'
            },
            {
              title: 'Active Decks',
              value: stats.content.totalDecks.toLocaleString(),
              change: 8.2, // This could be calculated from historical data
              changeType: 'increase',
              icon: DocumentDuplicateIcon,
              color: 'bg-green-500'
            },
            {
              title: 'Monthly Revenue',
              value: `$${(stats.overview.periodRevenue / 100).toLocaleString()}`,
              change: stats.overview.revenueGrowth || 0,
              changeType: (stats.overview.revenueGrowth || 0) >= 0 ? 'increase' : 'decrease',
              icon: CreditCardIcon,
              color: 'bg-purple-500'
            },
            {
              title: 'Total Content',
              value: stats.overview.totalContent.toLocaleString(),
              change: 5.1, // This could be calculated from historical data
              changeType: 'increase',
              icon: AcademicCapIcon,
              color: 'bg-orange-500'
            }
          ]
          
          setMetrics(transformedMetrics)
          setRecentActivity(activityResponse.data)
          setSystemHealth(prev => ({
            ...prev,
            activeUsers: stats.overview.activeUsers
          }))
        } else {
          setError('Failed to fetch dashboard data')
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading skeleton for metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-accent-silver/20 rounded w-24 mb-3"></div>
                  <div className="h-8 bg-gray-200 dark:bg-accent-silver/20 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-accent-silver/20 rounded w-20"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-accent-silver/20 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Loading skeleton for activity */}
          <div className="lg:col-span-2 bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-accent-silver/20 rounded w-32 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-accent-silver/20 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-accent-silver/20 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-accent-silver/20 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Loading skeleton for system health */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-accent-silver/20 rounded w-28 mb-4"></div>
              <div className="space-y-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-accent-silver/20 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 dark:bg-accent-silver/20 rounded w-12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">Error Loading Dashboard</div>
          <div className="text-gray-600 dark:text-accent-silver mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-accent-neon hover:bg-accent-neon/90 text-black font-medium px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }


  const quickActions: QuickAction[] = [
    {
      title: 'Add Blog Post',
      description: 'Create a new blog post',
      icon: NewspaperIcon,
      href: '/admin/dashboard/blogs/create',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'View Analytics',
      description: 'Check detailed analytics reports',
      icon: ChartBarIcon,
      href: '/admin/dashboard/analytics',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: UsersIcon,
      href: '/admin/dashboard/users',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return UsersIcon
      case 'content':
        return DocumentTextIcon
      case 'subscription':
        return CreditCardIcon
      default:
        return ChartBarIcon
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'text-blue-500'
      case 'content':
        return 'text-green-500'
      case 'subscription':
        return 'text-purple-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-accent-silver">
                  {metric.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {metric.value}
                </p>
                <div className="flex items-center mt-2">
                  {metric.changeType === 'increase' ? (
                    <ArrowUpIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ml-1 ${
                      metric.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {Math.abs(metric.change)}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-accent-silver ml-1">
                    from last month
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type)
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full bg-gray-100 dark:bg-accent-silver/10 flex items-center justify-center`}>
                    <ActivityIcon className={`w-4 h-4 ${getActivityColor(activity.type)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500 dark:text-accent-silver">
                        {activity.timestamp}
                      </p>
                      {activity.user && activity.user !== 'System' && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-500 dark:text-accent-silver">
                            by {activity.user}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* System Health & Quick Actions */}
        <div className="space-y-6">
          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              System Health
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-accent-silver">Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-500 capitalize">
                    {systemHealth.status}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-accent-silver">Uptime</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {systemHealth.uptime}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-accent-silver">Response Time</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {systemHealth.responseTime}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-accent-silver">Active Users</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {systemHealth.activeUsers.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.title}
                  onClick={() => window.location.href = action.href}
                  className={`w-full ${action.color} text-white rounded-lg p-4 text-left transition-colors`}
                >
                  <div className="flex items-center space-x-3">
                    <action.icon className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
