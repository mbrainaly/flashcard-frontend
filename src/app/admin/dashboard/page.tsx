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
    activeUsers: 1247
  })

  // Mock data - in real app, this would come from API
  useEffect(() => {
    setMetrics([
      {
        title: 'Total Users',
        value: '12,847',
        change: 12.5,
        changeType: 'increase',
        icon: UsersIcon,
        color: 'bg-blue-500'
      },
      {
        title: 'Active Decks',
        value: '3,254',
        change: 8.2,
        changeType: 'increase',
        icon: DocumentDuplicateIcon,
        color: 'bg-green-500'
      },
      {
        title: 'Monthly Revenue',
        value: '$24,890',
        change: 15.3,
        changeType: 'increase',
        icon: CreditCardIcon,
        color: 'bg-purple-500'
      },
      {
        title: 'Study Sessions',
        value: '45,123',
        change: -2.1,
        changeType: 'decrease',
        icon: AcademicCapIcon,
        color: 'bg-orange-500'
      }
    ])

    setRecentActivity([
      {
        id: '1',
        type: 'user',
        message: 'New user registration: john.doe@email.com',
        timestamp: '2 minutes ago',
        user: 'System'
      },
      {
        id: '2',
        type: 'content',
        message: 'New deck created: "Advanced JavaScript Concepts"',
        timestamp: '15 minutes ago',
        user: 'Sarah Wilson'
      },
      {
        id: '3',
        type: 'subscription',
        message: 'Premium subscription activated',
        timestamp: '1 hour ago',
        user: 'Mike Johnson'
      },
      {
        id: '4',
        type: 'content',
        message: 'Quiz completed: "React Fundamentals"',
        timestamp: '2 hours ago',
        user: 'Emily Davis'
      },
      {
        id: '5',
        type: 'system',
        message: 'Database backup completed successfully',
        timestamp: '3 hours ago',
        user: 'System'
      }
    ])
  }, [])

  const quickActions: QuickAction[] = [
    {
      title: 'Create New Deck',
      description: 'Add a new flashcard deck to the system',
      icon: DocumentDuplicateIcon,
      href: '/admin/dashboard/content/decks/create',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
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
            <button className="text-sm text-blue-600 dark:text-accent-neon hover:text-blue-700 dark:hover:text-accent-neon/80 font-medium">
              View all
            </button>
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
