'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  ChartBarIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  TrophyIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import UserModal from '@/components/admin/users/UserModal'

interface User {
  _id: string
  name: string
  email: string
  role: 'user' | 'premium'
  isActive: boolean
  lastLogin?: string
  createdAt: string
  subscription?: {
    plan: string
    status: 'active' | 'inactive' | 'cancelled'
    expiresAt?: string
    startedAt?: string
  }
  stats: {
    totalDecks: number
    totalCards: number
    studySessions: number
    totalStudyTime: number
    averageScore: number
    streak: number
  }
  recentActivity: Array<{
    id: string
    type: 'study' | 'create' | 'login'
    description: string
    timestamp: string
  }>
}

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { hasPermission } = useAdminAuth()
  const adminApi = useAdminApi()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const userId = params.id as string

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await adminApi.get(`/api/admin/users/${userId}`)
      
      if (response.success && response.data) {
        setUser(response.data)
      } else {
        throw new Error(response.error || 'Failed to fetch user details')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user details')
      console.error('Error fetching user:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchUser()
    }
  }, [userId])

  const handleUserUpdate = async (userData: any) => {
    try {
      const response = await adminApi.put(`/api/admin/users/${userId}`, userData)
      
      if (response.success) {
        // Refresh user data
        fetchUser()
        setShowEditModal(false)
      } else {
        throw new Error(response.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      // The error will be handled by the modal component
      throw error
    }
  }

  const handleDeleteUser = async () => {
    if (confirm(`Are you sure you want to delete user ${user?.name}?`)) {
      try {
        const response = await adminApi.delete(`/api/admin/users/${userId}`)
        
        if (response.success) {
          router.push('/admin/dashboard/users')
        } else {
          alert(response.error || 'Failed to delete user')
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Failed to delete user')
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-neon"></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error || 'User not found'}</p>
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
              User Details
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detailed information and activity for {user.name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push(`/admin/dashboard/users/${userId}/activity`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-accent-silver/10 transition-colors"
          >
            <EyeIcon className="w-5 h-5 mr-2" />
            View Activity
          </button>
          
          {hasPermission('users.write') && (
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <PencilIcon className="w-5 h-5 mr-2" />
              Edit User
            </button>
          )}
          
          {hasPermission('users.delete') && (
            <button
              onClick={handleDeleteUser}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <TrashIcon className="w-5 h-5 mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* User Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10"
      >
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-accent-neon to-accent-gold flex items-center justify-center">
              <span className="text-2xl font-bold text-black">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user.name}
              </h2>
              {user.role === 'premium' || user.subscription?.status === 'active' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">
                  <StarIcon className="w-3 h-3 mr-1" />
                  Premium
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                  <UserIcon className="w-3 h-3 mr-1" />
                  Free
                </span>
              )}
              {user.isActive ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                  <XCircleIcon className="w-3 h-3 mr-1" />
                  Inactive
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <EnvelopeIcon className="w-4 h-4 mr-2" />
                {user.email}
              </div>
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Joined {formatDate(user.createdAt)}
              </div>
              {user.lastLogin && (
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Last login {formatDate(user.lastLogin)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        {user.subscription && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-accent-silver/10">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Subscription Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {user.subscription.plan}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`ml-2 font-medium ${
                  user.subscription.status === 'active' 
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {user.subscription.status}
                </span>
              </div>
              {user.subscription.expiresAt && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {formatDate(user.subscription.expiresAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Decks',
            value: user.stats.totalDecks,
            icon: DocumentTextIcon,
            color: 'blue'
          },
          {
            label: 'Total Cards',
            value: user.stats.totalCards,
            icon: AcademicCapIcon,
            color: 'green'
          },
          {
            label: 'Study Sessions',
            value: user.stats.studySessions,
            icon: ChartBarIcon,
            color: 'purple'
          },
          {
            label: 'Current Streak',
            value: `${user.stats.streak} days`,
            icon: TrophyIcon,
            color: 'orange'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-accent-silver">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-500 rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Study Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Study Time</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDuration(user.stats.totalStudyTime)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Average Score</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {user.stats.averageScore}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Sessions per Week</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.round(user.stats.studySessions / 12)} avg
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {user.recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'study' ? 'bg-green-100 dark:bg-green-900/20' :
                  activity.type === 'create' ? 'bg-blue-100 dark:bg-blue-900/20' :
                  'bg-gray-100 dark:bg-gray-800'
                }`}>
                  {activity.type === 'study' ? (
                    <AcademicCapIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : activity.type === 'create' ? (
                    <DocumentTextIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-accent-silver">
                    {formatDate(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <UserModal
          user={user}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleUserUpdate}
        />
      )}
    </div>
  )
}
