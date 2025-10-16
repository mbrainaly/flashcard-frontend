'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  PhoneIcon,
  SparklesIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import Link from 'next/link'
import StatsCard from '@/components/admin/analytics/StatsCard'

interface PageInfo {
  _id: string
  title: string
  slug: string
  content: string
  status: 'published' | 'draft' | 'review'
  lastModified: string
  lastModifiedBy: {
    adminId: string
    name: string
    email: string
  }
  seo: {
    title: string
    description: string
    keywords: string[]
    ogImage?: string
    canonicalUrl?: string
  }
  views: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

interface PageOverview {
  totalPages: number
  publishedPages: number
  draftPages: number
  reviewPages: number
  totalViews: number
}

export default function PagesOverviewPage() {
  const { hasPermission } = useAdminAuth()
  const { get } = useAdminApi()
  const [pages, setPages] = useState<PageInfo[]>([])
  const [overview, setOverview] = useState<PageOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch pages and overview in parallel
        const [pagesResponse, overviewResponse] = await Promise.all([
          get('/api/admin/pages'),
          get('/api/admin/pages/overview')
        ])

        if (pagesResponse.success) {
          setPages(pagesResponse.data)
        } else {
          setError(pagesResponse.message || 'Failed to fetch pages')
        }

        if (overviewResponse.success) {
          setOverview(overviewResponse.data)
        } else {
          setError(overviewResponse.message || 'Failed to fetch overview')
        }
      } catch (error) {
        console.error('Error fetching pages:', error)
        setError('Failed to load pages data')
      } finally {
        setLoading(false)
      }
    }

    fetchPages()
  }, [get])

  const getPageIcon = (slug: string) => {
    const iconMap: { [key: string]: any } = {
      'privacy': ShieldCheckIcon,
      'terms': DocumentTextIcon,
      'about': InformationCircleIcon,
      'contact': PhoneIcon,
      'features': SparklesIcon,
      'seo': Cog6ToothIcon
    }
    return iconMap[slug] || DocumentTextIcon
  }

  const getPageRoute = (slug: string) => {
    return `/admin/dashboard/pages/${slug}`
  }

  const getStatusBadge = (status: PageInfo['status']) => {
    const statusConfig = {
      published: { color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300', icon: CheckCircleIcon },
      draft: { color: 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300', icon: PencilIcon },
      review: { color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300', icon: ClockIcon }
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

  if (!hasPermission('pages.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to manage pages.
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error Loading Pages</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Page Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            Manage website pages, content, and SEO settings
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Link
            href="/admin/dashboard/pages/seo"
            className="inline-flex items-center px-4 py-2 border border-accent-silver/30 text-accent-silver/80 rounded-lg hover:bg-accent-silver/10 hover:text-white transition-colors"
          >
            <Cog6ToothIcon className="w-4 h-4 mr-2" />
            SEO Settings
          </Link>
          <button className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors">
            <GlobeAltIcon className="w-4 h-4 mr-2" />
            Preview Site
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      {overview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          <StatsCard
            title="Total Pages"
            value={overview.totalPages.toString()}
            change="+2"
            trend="up"
            icon={<DocumentTextIcon className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="Published Pages"
            value={overview.publishedPages.toString()}
            change="+1"
            trend="up"
            icon={<CheckCircleIcon className="w-6 h-6" />}
            color="green"
          />
          <StatsCard
            title="Draft Pages"
            value={overview.draftPages.toString()}
            change="0"
            trend="neutral"
            icon={<PencilIcon className="w-6 h-6" />}
            color="orange"
          />
          <StatsCard
            title="Review Pages"
            value={overview.reviewPages.toString()}
            change="0"
            trend="neutral"
            icon={<ClockIcon className="w-6 h-6" />}
            color="yellow"
          />
          <StatsCard
            title="Total Views"
            value={overview.totalViews.toLocaleString()}
            change="+15.3%"
            trend="up"
            icon={<EyeIcon className="w-6 h-6" />}
            color="purple"
          />
        </motion.div>
      )}

      {/* Pages Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {pages.map((page, index) => {
          const Icon = getPageIcon(page.slug)
          return (
            <motion.div
              key={page._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-accent-neon/10 rounded-lg">
                    <Icon className="w-6 h-6 text-accent-neon" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {page.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-accent-silver">
                      /{page.slug}
                    </p>
                  </div>
                </div>
                {getStatusBadge(page.status)}
              </div>

              <p className="text-sm text-gray-600 dark:text-accent-silver mb-4 line-clamp-2">
                {page.seo.description}
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Views:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {page.views.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Last Modified:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(page.lastModified).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Modified By:</span>
                  <span className="font-medium text-gray-900 dark:text-white truncate ml-2">
                    {page.lastModifiedBy.name}
                  </span>
                </div>

                {page.isSystem && (
                  <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                    <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                    System Page
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-accent-silver/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">
                      <GlobeAltIcon className="w-4 h-4" />
                    </button>
                  </div>
                  {hasPermission('pages.write') && (
                    <Link
                      href={getPageRoute(page.slug)}
                      className="inline-flex items-center px-3 py-1 bg-accent-neon hover:bg-accent-neon/90 text-black text-sm font-medium rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-3 h-3 mr-1" />
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border border-gray-200 dark:border-accent-silver/20 rounded-lg hover:bg-gray-50 dark:hover:bg-accent-silver/5 transition-colors">
            <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3" />
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Bulk Update</div>
              <div className="text-xs text-gray-500 dark:text-accent-silver">Update multiple pages</div>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 dark:border-accent-silver/20 rounded-lg hover:bg-gray-50 dark:hover:bg-accent-silver/5 transition-colors">
            <GlobeAltIcon className="w-5 h-5 text-gray-400 mr-3" />
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-white">SEO Audit</div>
              <div className="text-xs text-gray-500 dark:text-accent-silver">Check SEO health</div>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 dark:border-accent-silver/20 rounded-lg hover:bg-gray-50 dark:hover:bg-accent-silver/5 transition-colors">
            <EyeIcon className="w-5 h-5 text-gray-400 mr-3" />
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Analytics</div>
              <div className="text-xs text-gray-500 dark:text-accent-silver">View page analytics</div>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
