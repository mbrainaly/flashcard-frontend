'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  ClockIcon, 
  BookOpenIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { 
  getDashboardStats, 
  getRecentActivities, 
  getDailyActivityStats,
  getStudyProgress,
  getLearningStats,
  type DailyActivity,
  type StudyProgress,
  type LearningStats 
} from '@/services/dashboard.service'
import ActivityChart from '@/components/dashboard/ActivityChart'
import StudyTimeChart from '@/components/dashboard/StudyTimeChart'
import SubjectRadarChart from '@/components/dashboard/SubjectRadarChart'
import ProgressLineChart from '@/components/dashboard/ProgressLineChart'
import { DashboardStats, RecentActivity } from '@/types/dashboard'
import { LearningStats as LearningStatsService } from '@/services/dashboard.service'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [showAllActivities, setShowAllActivities] = useState(false)
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [studyProgress, setStudyProgress] = useState<StudyProgress | null>(null)
  const [learningStats, setLearningStats] = useState<StudyProgress | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.accessToken) return

      try {
        setIsLoading(true)
        
        // Fetch real stats, activities, and daily activity in parallel
        const [dashboardStats, activities, dailyStats, progress, learningStatsData] = await Promise.all([
          getDashboardStats(),
          getRecentActivities(),
          getDailyActivityStats(7),
          getStudyProgress(),
          getLearningStats()
        ]);

        setStats(dashboardStats);
        setRecentActivity(activities);
        setDailyActivity(dailyStats);
        setStudyProgress(progress);
        setLearningStats(learningStatsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [session])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-obsidian flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-accent-obsidian py-8">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-accent-neon/10 via-transparent to-transparent" />
      
      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Overview Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white"
          >
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {session?.user?.name}!
            </h1>
            <p className="text-accent-silver">
              Your study streak: {stats?.studyStreak || 0} days 🔥
            </p>
          </motion.div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Flashcards', value: stats?.totalFlashcards || 0, icon: BookOpenIcon },
            { label: 'Notes', value: stats?.totalNotes || 0, icon: DocumentTextIcon },
            { label: 'Quizzes', value: stats?.totalQuizzes || 0, icon: AcademicCapIcon }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-accent-silver text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-accent-neon" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10"
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-accent-neon" />
            Activity Overview
          </h2>
          <ActivityChart data={dailyActivity} />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-accent-neon" />
                Recent Activity
              </h2>
              <button
                onClick={() => setShowAllActivities(!showAllActivities)}
                className="text-sm text-accent-neon hover:text-accent-gold transition-colors"
              >
                {showAllActivities ? 'Show Less' : 'View All'}
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity
                .slice(0, showAllActivities ? undefined : 4)
                .map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {activity.type === 'flashcard' && <BookOpenIcon className="h-5 w-5 text-accent-gold" />}
                  {activity.type === 'quiz' && <AcademicCapIcon className="h-5 w-5 text-accent-neon" />}
                  {activity.type === 'note' && <DocumentTextIcon className="h-5 w-5 text-accent-silver" />}
                  <div>
                    <p className="text-white font-medium">{activity.title}</p>
                    <p className="text-sm text-accent-silver">
                      {new Date(activity.date).toLocaleDateString()} {activity.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Study Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-accent-neon" />
              Study Progress
            </h2>
            <div className="space-y-4">
              {studyProgress?.subjectProgress.map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-accent-silver">{subject.subject}</span>
                    <span className="text-white">{subject.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-neon rounded-full transition-all duration-500"
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Learning Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Performance Overview */}
          <div className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-accent-neon" />
              Performance Overview
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-accent-silver text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-white">{learningStats?.quizSuccessRate}%</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-accent-silver text-sm">Average Score</p>
                <p className="text-2xl font-bold text-white">{learningStats?.averageScore}%</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-accent-silver text-sm">Study Hours</p>
                <p className="text-2xl font-bold text-white">{learningStats?.totalStudyHours}h</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-accent-silver text-sm">Mastered Topics</p>
                <p className="text-2xl font-bold text-white">{learningStats?.masteredTopics}</p>
              </div>
            </div>
          </div>

          {/* Areas for Improvement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-accent-gold" />
              Areas for Improvement
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-accent-silver mb-2">Needs Work</h3>
                {learningStats?.weakAreas.map((area, index) => (
                  <div key={index} className="flex items-center justify-between mb-2 p-2 bg-white/5 rounded-lg">
                    <span className="text-white">{area.subject}</span>
                    <span className="text-accent-gold">{area.score}%</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-medium text-accent-silver mb-2">Strong Areas</h3>
                {learningStats?.strongAreas.map((area, index) => (
                  <div key={index} className="flex items-center justify-between mb-2 p-2 bg-white/5 rounded-lg">
                    <span className="text-white">{area.subject}</span>
                    <span className="text-accent-neon">{area.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Subject Performance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-accent-neon" />
              Subject Performance
            </h3>
            {learningStats && <SubjectRadarChart data={learningStats} />}
          </motion.div>

          {/* Learning Progress */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10 lg:col-span-1"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-accent-neon" />
              Learning Progress
            </h3>
            {learningStats && <ProgressLineChart data={learningStats} />}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Create Flashcards', icon: BookOpenIcon, href: '/decks/create' },
            { label: 'Take Quiz', icon: AcademicCapIcon, href: '/quizzes' },
            { label: 'Write Notes', icon: DocumentTextIcon, href: '/notes' },
            { label: 'Study Assistant', icon: BoltIcon, href: '/study' }
          ].map((action) => (
            <motion.a
              key={action.label}
              href={action.href}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-glass backdrop-blur-sm
                ring-1 ring-accent-silver/10 hover:ring-accent-neon/30 transition-all text-center"
            >
              <action.icon className="h-6 w-6 text-accent-neon" />
              <span className="text-sm text-white">{action.label}</span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </div>
  )
} 