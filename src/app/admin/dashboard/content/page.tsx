'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FolderIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  EyeIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import Link from 'next/link'

interface ContentStats {
  totalDecks: number
  totalCards: number
  totalQuizzes: number
  totalNotes: number
  recentActivity: {
    decksCreated: number
    cardsAdded: number
    quizzesCompleted: number
    notesGenerated: number
  }
}

interface RecentContent {
  id: string
  type: 'deck' | 'card' | 'quiz' | 'note'
  title: string
  author: string
  createdAt: string
  status: 'active' | 'draft' | 'archived'
}

export default function ContentOverviewPage() {
  const { hasPermission } = useAdminAuth()
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [recentContent, setRecentContent] = useState<RecentContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContentData = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API calls
        // const [statsResponse, recentResponse] = await Promise.all([
        //   fetch('/api/admin/content/stats'),
        //   fetch('/api/admin/content/recent')
        // ])

        // Mock data
        const mockStats: ContentStats = {
          totalDecks: 1247,
          totalCards: 15632,
          totalQuizzes: 892,
          totalNotes: 3456,
          recentActivity: {
            decksCreated: 23,
            cardsAdded: 156,
            quizzesCompleted: 89,
            notesGenerated: 45
          }
        }

        const mockRecentContent: RecentContent[] = [
          {
            id: '1',
            type: 'deck',
            title: 'Advanced JavaScript Concepts',
            author: 'John Doe',
            createdAt: '2024-01-15T10:30:00Z',
            status: 'active'
          },
          {
            id: '2',
            type: 'quiz',
            title: 'React Hooks Assessment',
            author: 'Jane Smith',
            createdAt: '2024-01-14T15:45:00Z',
            status: 'active'
          },
          {
            id: '3',
            type: 'note',
            title: 'Machine Learning Fundamentals',
            author: 'Mike Johnson',
            createdAt: '2024-01-13T09:20:00Z',
            status: 'draft'
          },
          {
            id: '4',
            type: 'card',
            title: 'Python Data Structures',
            author: 'Sarah Wilson',
            createdAt: '2024-01-12T14:10:00Z',
            status: 'active'
          }
        ]

        setStats(mockStats)
        setRecentContent(mockRecentContent)
      } catch (err) {
        setError('Failed to fetch content data')
        console.error('Error fetching content data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchContentData()
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deck': return FolderIcon
      case 'card': return DocumentTextIcon
      case 'quiz': return AcademicCapIcon
      case 'note': return BookOpenIcon
      default: return DocumentTextIcon
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300`
      case 'draft':
        return `${baseClasses} bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300`
      case 'archived':
        return `${baseClasses} bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300`
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-neon"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <FolderIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Content Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage decks, cards, quizzes, and notes
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Decks', 
            value: stats?.totalDecks || 0, 
            change: `+${stats?.recentActivity.decksCreated || 0} this week`,
            color: 'blue', 
            icon: FolderIcon,
            href: '/admin/dashboard/content/decks'
          },
          { 
            label: 'Total Cards', 
            value: stats?.totalCards || 0, 
            change: `+${stats?.recentActivity.cardsAdded || 0} this week`,
            color: 'green', 
            icon: DocumentTextIcon,
            href: '/admin/dashboard/content/cards'
          },
          { 
            label: 'Total Quizzes', 
            value: stats?.totalQuizzes || 0, 
            change: `+${stats?.recentActivity.quizzesCompleted || 0} completed`,
            color: 'purple', 
            icon: AcademicCapIcon,
            href: '/admin/dashboard/content/quizzes'
          },
          { 
            label: 'Total Notes', 
            value: stats?.totalNotes || 0, 
            change: `+${stats?.recentActivity.notesGenerated || 0} generated`,
            color: 'orange', 
            icon: BookOpenIcon,
            href: '/admin/dashboard/content/notes'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link href={stat.href}>
              <div className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-accent-silver">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-accent-silver/70 mt-1 flex items-center">
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 bg-${stat.color}-500 rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Create Deck', href: '/admin/dashboard/content/decks?action=create', icon: FolderIcon, color: 'blue' },
          { label: 'Add Cards', href: '/admin/dashboard/content/cards?action=create', icon: DocumentTextIcon, color: 'green' },
          { label: 'New Quiz', href: '/admin/dashboard/content/quizzes?action=create', icon: AcademicCapIcon, color: 'purple' },
          { label: 'Generate Notes', href: '/admin/dashboard/content/notes?action=create', icon: BookOpenIcon, color: 'orange' }
        ].map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
          >
            <Link href={action.href}>
              <div className="bg-white dark:bg-accent-obsidian rounded-lg p-4 shadow-sm border border-gray-200 dark:border-accent-silver/10 hover:bg-gray-50 dark:hover:bg-accent-silver/5 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-${action.color}-500 rounded-lg flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {action.label}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-accent-silver/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <Link 
              href="/admin/dashboard/analytics"
              className="text-sm text-accent-neon hover:text-accent-neon/80 transition-colors"
            >
              View all activity
            </Link>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-accent-silver/10">
          {recentContent.map((item, index) => {
            const IconComponent = getTypeIcon(item.type)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-accent-silver/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-accent-silver/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-gray-600 dark:text-accent-silver" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <UserIcon className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-accent-silver/70">
                          {item.author}
                        </span>
                        <span className="text-gray-300 dark:text-accent-silver/30">•</span>
                        <ClockIcon className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-accent-silver/70">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={getStatusBadge(item.status)}>
                      {item.status}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
