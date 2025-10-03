'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  ArrowLeftIcon,
  FolderIcon,
  AcademicCapIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import Link from 'next/link'
import StatsCard from '@/components/admin/analytics/StatsCard'
import LineChart from '@/components/admin/analytics/LineChart'
import BarChart from '@/components/admin/analytics/BarChart'

interface PerformanceData {
  overview: {
    totalEngagement: number
    avgCompletionRate: number
    totalStudyTime: number
    contentEffectiveness: number
  }
  engagementTrend: {
    date: string
    engagement: number
    completionRate: number
    studyTime: number
  }[]
  topPerformingContent: {
    id: string
    title: string
    type: 'deck' | 'quiz' | 'note'
    views: number
    engagement: number
    completionRate: number
    avgRating: number
  }[]
  contentPerformance: {
    category: string
    engagement: number
    completionRate: number
    studyTime: number
  }[]
  userRetention: {
    day: number
    retention: number
  }[]
  difficultyAnalysis: {
    difficulty: string
    count: number
    avgScore: number
    completionRate: number
  }[]
}

export default function PerformanceMetricsPage() {
  const { hasPermission } = useAdminAuth()
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true)
        // Mock data for now
        const mockData: PerformanceData = {
          overview: {
            totalEngagement: 87.5,
            avgCompletionRate: 73.2,
            totalStudyTime: 12847,
            contentEffectiveness: 91.3
          },
          engagementTrend: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            engagement: Math.floor(Math.random() * 20) + 75,
            completionRate: Math.floor(Math.random() * 25) + 65,
            studyTime: Math.floor(Math.random() * 200) + 300
          })),
          topPerformingContent: [
            {
              id: '1',
              title: 'JavaScript Fundamentals',
              type: 'deck',
              views: 15420,
              engagement: 92.5,
              completionRate: 87.3,
              avgRating: 4.8
            },
            {
              id: '2',
              title: 'React Components Quiz',
              type: 'quiz',
              views: 12890,
              engagement: 89.7,
              completionRate: 82.1,
              avgRating: 4.6
            },
            {
              id: '3',
              title: 'Python Basics Notes',
              type: 'note',
              views: 11234,
              engagement: 85.2,
              completionRate: 78.9,
              avgRating: 4.5
            },
            {
              id: '4',
              title: 'Data Structures Deck',
              type: 'deck',
              views: 9876,
              engagement: 88.4,
              completionRate: 81.7,
              avgRating: 4.7
            },
            {
              id: '5',
              title: 'Machine Learning Quiz',
              type: 'quiz',
              views: 8765,
              engagement: 86.9,
              completionRate: 79.3,
              avgRating: 4.4
            }
          ],
          contentPerformance: [
            { category: 'Programming', engagement: 89.2, completionRate: 82.1, studyTime: 45.6 },
            { category: 'Mathematics', engagement: 85.7, completionRate: 78.3, studyTime: 52.3 },
            { category: 'Science', engagement: 87.1, completionRate: 80.5, studyTime: 41.2 },
            { category: 'Languages', engagement: 83.4, completionRate: 75.8, studyTime: 38.9 },
            { category: 'History', engagement: 81.9, completionRate: 74.2, studyTime: 35.7 }
          ],
          userRetention: [
            { day: 1, retention: 100 },
            { day: 7, retention: 68.5 },
            { day: 14, retention: 52.3 },
            { day: 30, retention: 41.7 },
            { day: 60, retention: 35.2 },
            { day: 90, retention: 28.9 }
          ],
          difficultyAnalysis: [
            { difficulty: 'Beginner', count: 1247, avgScore: 87.3, completionRate: 92.1 },
            { difficulty: 'Intermediate', count: 892, avgScore: 76.8, completionRate: 78.5 },
            { difficulty: 'Advanced', count: 456, avgScore: 68.2, completionRate: 65.3 },
            { difficulty: 'Expert', count: 123, avgScore: 59.7, completionRate: 52.8 }
          ]
        }
        setPerformanceData(mockData)
      } catch (error) {
        console.error('Error fetching performance data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPerformanceData()
  }, [timeRange])

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'deck': return <FolderIcon className="w-4 h-4" />
      case 'quiz': return <AcademicCapIcon className="w-4 h-4" />
      case 'note': return <BookOpenIcon className="w-4 h-4" />
      default: return <ChartBarIcon className="w-4 h-4" />
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
            You don't have permission to view performance metrics.
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Metrics</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
              Content performance and learning effectiveness analytics
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
      {performanceData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard
            title="Total Engagement"
            value={`${performanceData.overview.totalEngagement}%`}
            change="+5.2%"
            trend="up"
            icon={<HeartIcon className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="Avg. Completion Rate"
            value={`${performanceData.overview.avgCompletionRate}%`}
            change="+3.8%"
            trend="up"
            icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
            color="green"
          />
          <StatsCard
            title="Total Study Time"
            value={`${performanceData.overview.totalStudyTime.toLocaleString()} hrs`}
            change="+12.1%"
            trend="up"
            icon={<ClockIcon className="w-6 h-6" />}
            color="purple"
          />
          <StatsCard
            title="Content Effectiveness"
            value={`${performanceData.overview.contentEffectiveness}%`}
            change="+2.3%"
            trend="up"
            icon={<ChartBarIcon className="w-6 h-6" />}
            color="orange"
          />
        </motion.div>
      )}

      {/* Engagement Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Engagement Trends</h3>
        {performanceData && (
          <LineChart
            data={performanceData.engagementTrend}
            xKey="date"
            yKeys={['engagement', 'completionRate']}
            colors={['#3B82F6', '#10B981']}
            height={400}
          />
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Performance by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Performance by Category</h3>
          {performanceData && (
            <BarChart
              data={performanceData.contentPerformance}
              xKey="category"
              yKey="engagement"
              color="#8B5CF6"
              height={300}
            />
          )}
        </motion.div>

        {/* User Retention */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">User Retention</h3>
          {performanceData && (
            <LineChart
              data={performanceData.userRetention}
              xKey="day"
              yKeys={['retention']}
              colors={['#F59E0B']}
              height={300}
            />
          )}
        </motion.div>

        {/* Top Performing Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top Performing Content</h3>
          <div className="space-y-4">
            {performanceData?.topPerformingContent.map((content, index) => (
              <div key={content.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-accent-silver/5">
                <div className="flex items-center space-x-3">
                  <div className={`${getContentColor(content.type)}`}>
                    {getContentIcon(content.type)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {content.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-accent-silver capitalize">
                      {content.type} • {content.views.toLocaleString()} views
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {content.engagement}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-accent-silver">
                    ⭐ {content.avgRating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Difficulty Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Difficulty Analysis</h3>
          <div className="space-y-4">
            {performanceData?.difficultyAnalysis.map((difficulty, index) => (
              <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-accent-silver/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {difficulty.difficulty}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-accent-silver">
                    {difficulty.count} items
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-accent-silver">Avg Score:</span>
                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                      {difficulty.avgScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-accent-silver">Completion:</span>
                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                      {difficulty.completionRate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
