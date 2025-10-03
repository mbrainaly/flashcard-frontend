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
import Link from 'next/link'
import StatsCard from '@/components/admin/analytics/StatsCard'

interface PageInfo {
  _id: string
  name: string
  slug: string
  title: string
  description: string
  content: string
  status: 'published' | 'draft' | 'review'
  lastModified: string
  lastModifiedBy: {
    name: string
    email: string
  }
  seo: {
    title: string
    description: string
    keywords: string[]
  }
  views: number
  isSystem: boolean
  icon: any
  route: string
}

interface PageOverview {
  totalPages: number
  publishedPages: number
  draftPages: number
  totalViews: number
}

export default function PagesOverviewPage() {
  const { hasPermission } = useAdminAuth()
  const [pages, setPages] = useState<PageInfo[]>([])
  const [overview, setOverview] = useState<PageOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true)
        // Mock data for now
        const mockPages: PageInfo[] = [
          {
            _id: '1',
            name: 'Privacy Policy',
            slug: 'privacy',
            title: 'Privacy Policy - FlashCard App',
            description: 'Our commitment to protecting your privacy and personal data',
            content: 'Privacy policy content...',
            status: 'published',
            lastModified: '2024-01-15T10:30:00Z',
            lastModifiedBy: { name: 'Admin User', email: 'admin@flashcardapp.com' },
            seo: {
              title: 'Privacy Policy | FlashCard App',
              description: 'Learn how FlashCard App protects your privacy and handles your personal data.',
              keywords: ['privacy', 'data protection', 'GDPR', 'personal information']
            },
            views: 1247,
            isSystem: true,
            icon: ShieldCheckIcon,
            route: '/admin/dashboard/pages/privacy'
          },
          {
            _id: '2',
            name: 'Terms of Service',
            slug: 'terms',
            title: 'Terms of Service - FlashCard App',
            description: 'Terms and conditions for using our flashcard application',
            content: 'Terms of service content...',
            status: 'published',
            lastModified: '2024-01-12T14:20:00Z',
            lastModifiedBy: { name: 'Legal Team', email: 'legal@flashcardapp.com' },
            seo: {
              title: 'Terms of Service | FlashCard App',
              description: 'Read our terms and conditions for using FlashCard App services.',
              keywords: ['terms', 'conditions', 'legal', 'agreement']
            },
            views: 892,
            isSystem: true,
            icon: DocumentTextIcon,
            route: '/admin/dashboard/pages/terms'
          },
          {
            _id: '3',
            name: 'About Us',
            slug: 'about',
            title: 'About FlashCard App',
            description: 'Learn about our mission to revolutionize learning through flashcards',
            content: 'About us content...',
            status: 'published',
            lastModified: '2024-01-18T09:15:00Z',
            lastModifiedBy: { name: 'Marketing Team', email: 'marketing@flashcardapp.com' },
            seo: {
              title: 'About Us | FlashCard App',
              description: 'Discover the story behind FlashCard App and our mission to improve learning.',
              keywords: ['about', 'company', 'mission', 'team', 'learning']
            },
            views: 2156,
            isSystem: false,
            icon: InformationCircleIcon,
            route: '/admin/dashboard/pages/about'
          },
          {
            _id: '4',
            name: 'Contact Us',
            slug: 'contact',
            title: 'Contact FlashCard App',
            description: 'Get in touch with our support team and find answers to your questions',
            content: 'Contact information and form...',
            status: 'published',
            lastModified: '2024-01-10T16:45:00Z',
            lastModifiedBy: { name: 'Support Team', email: 'support@flashcardapp.com' },
            seo: {
              title: 'Contact Us | FlashCard App',
              description: 'Contact FlashCard App support team for help, questions, or feedback.',
              keywords: ['contact', 'support', 'help', 'customer service']
            },
            views: 3421,
            isSystem: false,
            icon: PhoneIcon,
            route: '/admin/dashboard/pages/contact'
          },
          {
            _id: '5',
            name: 'Features',
            slug: 'features',
            title: 'FlashCard App Features',
            description: 'Explore all the powerful features that make learning effective and fun',
            content: 'Features overview and details...',
            status: 'draft',
            lastModified: '2024-01-19T11:20:00Z',
            lastModifiedBy: { name: 'Product Team', email: 'product@flashcardapp.com' },
            seo: {
              title: 'Features | FlashCard App',
              description: 'Discover powerful features of FlashCard App for effective learning.',
              keywords: ['features', 'flashcards', 'learning', 'study tools', 'spaced repetition']
            },
            views: 567,
            isSystem: false,
            icon: SparklesIcon,
            route: '/admin/dashboard/pages/features'
          },
          {
            _id: '6',
            name: 'SEO Settings',
            slug: 'seo',
            title: 'SEO Configuration',
            description: 'Global SEO settings and meta configurations for the application',
            content: 'SEO configuration data...',
            status: 'review',
            lastModified: '2024-01-17T13:30:00Z',
            lastModifiedBy: { name: 'SEO Specialist', email: 'seo@flashcardapp.com' },
            seo: {
              title: 'SEO Management | Admin Panel',
              description: 'Manage global SEO settings and meta configurations.',
              keywords: ['SEO', 'meta tags', 'search optimization', 'configuration']
            },
            views: 89,
            isSystem: true,
            icon: Cog6ToothIcon,
            route: '/admin/dashboard/pages/seo'
          }
        ]

        const mockOverview: PageOverview = {
          totalPages: 6,
          publishedPages: 4,
          draftPages: 1,
          totalViews: 8372
        }

        setPages(mockPages)
        setOverview(mockOverview)
      } catch (error) {
        console.error('Error fetching pages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPages()
  }, [])

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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
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
          const Icon = page.icon
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
                      {page.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-accent-silver">
                      /{page.slug}
                    </p>
                  </div>
                </div>
                {getStatusBadge(page.status)}
              </div>

              <p className="text-sm text-gray-600 dark:text-accent-silver mb-4 line-clamp-2">
                {page.description}
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
                      href={page.route}
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
