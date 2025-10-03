'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  TagIcon,
  FolderIcon,
  CalendarIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import Link from 'next/link'
import StatsCard from '@/components/admin/analytics/StatsCard'

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  author: {
    name: string
    email: string
    avatar?: string
  }
  category: {
    name: string
    slug: string
    color: string
  }
  tags: {
    name: string
    slug: string
  }[]
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  publishedAt?: string
  scheduledAt?: string
  views: number
  likes: number
  comments: number
  seoTitle?: string
  seoDescription?: string
  createdAt: string
  updatedAt: string
}

interface BlogOverview {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalViews: number
}

export default function BlogManagementPage() {
  const { hasPermission } = useAdminAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [overview, setOverview] = useState<BlogOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    author: ''
  })

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        setLoading(true)
        // Mock data for now
        const mockPosts: BlogPost[] = [
          {
            _id: '1',
            title: 'How to Create Effective Flashcards for Better Learning',
            slug: 'effective-flashcards-better-learning',
            excerpt: 'Discover the science-backed techniques for creating flashcards that actually help you remember information long-term.',
            content: 'Full blog post content here...',
            featuredImage: '/images/blog/flashcards-guide.jpg',
            author: { name: 'Sarah Johnson', email: 'sarah@example.com' },
            category: { name: 'Study Tips', slug: 'study-tips', color: '#3B82F6' },
            tags: [
              { name: 'Learning', slug: 'learning' },
              { name: 'Memory', slug: 'memory' },
              { name: 'Study Techniques', slug: 'study-techniques' }
            ],
            status: 'published',
            publishedAt: '2024-01-15T10:00:00Z',
            views: 2847,
            likes: 156,
            comments: 23,
            seoTitle: 'How to Create Effective Flashcards - Complete Guide',
            seoDescription: 'Learn proven techniques for creating flashcards that improve retention and accelerate learning.',
            createdAt: '2024-01-10T09:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
          },
          {
            _id: '2',
            title: 'The Science of Spaced Repetition: Why It Works',
            slug: 'science-spaced-repetition',
            excerpt: 'Understanding the psychological principles behind spaced repetition and how it can transform your learning.',
            content: 'Full blog post content here...',
            author: { name: 'Dr. Michael Chen', email: 'michael@example.com' },
            category: { name: 'Learning Science', slug: 'learning-science', color: '#10B981' },
            tags: [
              { name: 'Spaced Repetition', slug: 'spaced-repetition' },
              { name: 'Psychology', slug: 'psychology' },
              { name: 'Research', slug: 'research' }
            ],
            status: 'published',
            publishedAt: '2024-01-12T14:30:00Z',
            views: 1923,
            likes: 89,
            comments: 15,
            createdAt: '2024-01-08T11:00:00Z',
            updatedAt: '2024-01-12T14:30:00Z'
          },
          {
            _id: '3',
            title: '10 Best Practices for Digital Note-Taking',
            slug: 'digital-note-taking-best-practices',
            excerpt: 'Maximize your productivity with these proven digital note-taking strategies and tools.',
            content: 'Full blog post content here...',
            author: { name: 'Emily Rodriguez', email: 'emily@example.com' },
            category: { name: 'Productivity', slug: 'productivity', color: '#F59E0B' },
            tags: [
              { name: 'Note-taking', slug: 'note-taking' },
              { name: 'Productivity', slug: 'productivity' },
              { name: 'Digital Tools', slug: 'digital-tools' }
            ],
            status: 'draft',
            views: 0,
            likes: 0,
            comments: 0,
            createdAt: '2024-01-18T16:00:00Z',
            updatedAt: '2024-01-19T10:30:00Z'
          },
          {
            _id: '4',
            title: 'AI-Powered Learning: The Future of Education',
            slug: 'ai-powered-learning-future-education',
            excerpt: 'Explore how artificial intelligence is revolutionizing the way we learn and study.',
            content: 'Full blog post content here...',
            author: { name: 'Alex Thompson', email: 'alex@example.com' },
            category: { name: 'Technology', slug: 'technology', color: '#8B5CF6' },
            tags: [
              { name: 'AI', slug: 'ai' },
              { name: 'Education', slug: 'education' },
              { name: 'Future', slug: 'future' }
            ],
            status: 'scheduled',
            scheduledAt: '2024-01-25T09:00:00Z',
            views: 0,
            likes: 0,
            comments: 0,
            createdAt: '2024-01-16T13:00:00Z',
            updatedAt: '2024-01-17T15:45:00Z'
          },
          {
            _id: '5',
            title: 'Building a Sustainable Study Routine',
            slug: 'sustainable-study-routine',
            excerpt: 'Create a study routine that you can maintain long-term for consistent learning progress.',
            content: 'Full blog post content here...',
            author: { name: 'Sarah Johnson', email: 'sarah@example.com' },
            category: { name: 'Study Tips', slug: 'study-tips', color: '#3B82F6' },
            tags: [
              { name: 'Study Routine', slug: 'study-routine' },
              { name: 'Habits', slug: 'habits' },
              { name: 'Consistency', slug: 'consistency' }
            ],
            status: 'archived',
            publishedAt: '2023-12-20T08:00:00Z',
            views: 1456,
            likes: 67,
            comments: 12,
            createdAt: '2023-12-15T10:00:00Z',
            updatedAt: '2024-01-05T14:20:00Z'
          },
          // Additional mock posts for pagination demo
          ...Array.from({ length: 20 }, (_, i) => ({
            _id: `${i + 6}`,
            title: `Blog Post ${i + 6}: Advanced Learning Techniques`,
            slug: `blog-post-${i + 6}-advanced-learning`,
            excerpt: `This is a sample blog post excerpt for post number ${i + 6}.`,
            content: 'Sample blog post content...',
            author: { 
              name: ['Sarah Johnson', 'Dr. Michael Chen', 'Emily Rodriguez', 'Alex Thompson'][i % 4], 
              email: `author${i + 6}@example.com` 
            },
            category: { 
              name: ['Study Tips', 'Learning Science', 'Productivity', 'Technology'][i % 4], 
              slug: ['study-tips', 'learning-science', 'productivity', 'technology'][i % 4], 
              color: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][i % 4] 
            },
            tags: [
              { name: 'Learning', slug: 'learning' },
              { name: 'Tips', slug: 'tips' }
            ],
            status: ['published', 'draft', 'scheduled'][i % 3] as 'published' | 'draft' | 'scheduled',
            publishedAt: i % 3 === 0 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
            views: Math.floor(Math.random() * 5000) + 100,
            likes: Math.floor(Math.random() * 200) + 10,
            comments: Math.floor(Math.random() * 50) + 1,
            seoTitle: `Blog Post ${i + 6} SEO Title`,
            seoDescription: `SEO description for blog post ${i + 6}`,
            createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          }))
        ]

        const mockOverview: BlogOverview = {
          totalPosts: 45,
          publishedPosts: 32,
          draftPosts: 8,
          totalViews: 125847
        }

        setPosts(mockPosts)
        setOverview(mockOverview)
      } catch (error) {
        console.error('Error fetching blog data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogData()
  }, [])

  const getStatusBadge = (status: BlogPost['status']) => {
    const statusConfig = {
      published: { color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300', icon: CheckCircleIcon },
      draft: { color: 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300', icon: PencilIcon },
      scheduled: { color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300', icon: ClockIcon },
      archived: { color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300', icon: EyeSlashIcon }
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

  const filteredPosts = posts.filter(post => {
    if (filters.search && !post.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !post.excerpt.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.status && post.status !== filters.status) return false
    if (filters.category && post.category.slug !== filters.category) return false
    if (filters.author && post.author.name !== filters.author) return false
    return true
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  if (!hasPermission('blogs.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to manage blog posts.
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            Create, edit, and manage your blog content
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Link
            href="/admin/dashboard/blogs/categories"
            className="inline-flex items-center px-4 py-2 border border-accent-silver/30 text-accent-silver/80 rounded-lg hover:bg-accent-silver/10 hover:text-white transition-colors"
          >
            <FolderIcon className="w-4 h-4 mr-2" />
            Categories
          </Link>
          <Link
            href="/admin/dashboard/blogs/tags"
            className="inline-flex items-center px-4 py-2 border border-accent-silver/30 text-accent-silver/80 rounded-lg hover:bg-accent-silver/10 hover:text-white transition-colors"
          >
            <TagIcon className="w-4 h-4 mr-2" />
            Tags
          </Link>
          {hasPermission('blogs.write') && (
            <Link
              href="/admin/dashboard/blogs/create"
              className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Post
            </Link>
          )}
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
            title="Total Posts"
            value={overview.totalPosts.toLocaleString()}
            change="+12.5%"
            trend="up"
            icon={<DocumentTextIcon className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="Published Posts"
            value={overview.publishedPosts.toLocaleString()}
            change="+8.2%"
            trend="up"
            icon={<CheckCircleIcon className="w-6 h-6" />}
            color="green"
          />
          <StatsCard
            title="Draft Posts"
            value={overview.draftPosts.toLocaleString()}
            change="+3.1%"
            trend="up"
            icon={<PencilIcon className="w-6 h-6" />}
            color="orange"
          />
          <StatsCard
            title="Total Views"
            value={overview.totalViews.toLocaleString()}
            change="+25.3%"
            trend="up"
            icon={<EyeIcon className="w-6 h-6" />}
            color="purple"
          />
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search posts..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="study-tips">Study Tips</option>
              <option value="learning-science">Learning Science</option>
              <option value="productivity">Productivity</option>
              <option value="technology">Technology</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Author
            </label>
            <select
              value={filters.author}
              onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
            >
              <option value="">All Authors</option>
              <option value="Sarah Johnson">Sarah Johnson</option>
              <option value="Dr. Michael Chen">Dr. Michael Chen</option>
              <option value="Emily Rodriguez">Emily Rodriguez</option>
              <option value="Alex Thompson">Alex Thompson</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ search: '', status: '', category: '', author: '' })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-accent-silver/10 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Blog Posts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 flex flex-col"
        style={{ height: '600px' }}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-accent-silver/10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Blog Posts ({filteredPosts.length})
          </h3>
        </div>
        
        <div className="flex flex-col h-full">
          {/* Table Container with Fixed Height */}
          <div className="flex-1 overflow-auto">
            <div className="min-h-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-accent-silver/10">
                <thead className="bg-gray-50 dark:bg-accent-silver/5 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Date
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-accent-obsidian divide-y divide-gray-200 dark:divide-accent-silver/10">
                  {paginatedPosts.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50 dark:hover:bg-accent-silver/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <DocumentTextIcon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4 min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {post.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-accent-neon to-accent-gold flex items-center justify-center">
                              <span className="text-xs font-medium text-black">
                                {post.author.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {post.author.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${post.category.color}20`,
                            color: post.category.color
                          }}
                        >
                          {post.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(post.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <EyeIcon className="w-4 h-4 text-gray-400 mr-1" />
                            {post.views.toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <span className="text-red-500 mr-1">♥</span>
                            {post.likes}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>
                          {post.status === 'published' && post.publishedAt && (
                            <>
                              <div>Published</div>
                              <div className="text-xs text-gray-500 dark:text-accent-silver">
                                {new Date(post.publishedAt).toLocaleDateString()}
                              </div>
                            </>
                          )}
                          {post.status === 'scheduled' && post.scheduledAt && (
                            <>
                              <div>Scheduled</div>
                              <div className="text-xs text-gray-500 dark:text-accent-silver">
                                {new Date(post.scheduledAt).toLocaleDateString()}
                              </div>
                            </>
                          )}
                          {(post.status === 'draft' || post.status === 'archived') && (
                            <>
                              <div>Updated</div>
                              <div className="text-xs text-gray-500 dark:text-accent-silver">
                                {new Date(post.updatedAt).toLocaleDateString()}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          {hasPermission('blogs.write') && (
                            <>
                              <Link
                                href={`/admin/dashboard/blogs/${post._id}/edit`}
                                className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </Link>
                              <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {paginatedPosts.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No blog posts found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            </div>
          )}

          {/* Enhanced Pagination - Fixed at bottom */}
          {filteredPosts.length > 0 && (
            <div className="flex-shrink-0 bg-white dark:bg-accent-obsidian px-4 py-4 border-t border-gray-200 dark:border-accent-silver/10">
              {/* Mobile pagination */}
              <div className="flex items-center justify-between sm:hidden">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 dark:border-accent-silver/20 rounded bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-accent-silver bg-white dark:bg-accent-obsidian border border-gray-300 dark:border-accent-silver/20 rounded-md hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-accent-silver bg-white dark:bg-accent-obsidian border border-gray-300 dark:border-accent-silver/20 rounded-md hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Desktop pagination */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="px-3 py-1 border border-gray-300 dark:border-accent-silver/20 rounded bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-700 dark:text-gray-300">entries</span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredPosts.length)} of {filteredPosts.length} results
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-accent-silver bg-white dark:bg-accent-obsidian border border-gray-300 dark:border-accent-silver/20 rounded-md hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-accent-silver bg-white dark:bg-accent-obsidian border border-gray-300 dark:border-accent-silver/20 rounded-md hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {/* Page numbers with smart ellipsis */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                          currentPage === pageNum
                            ? 'bg-accent-neon text-black'
                            : 'text-gray-500 dark:text-accent-silver bg-white dark:bg-accent-obsidian border border-gray-300 dark:border-accent-silver/20 hover:bg-gray-50 dark:hover:bg-accent-silver/10'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-accent-silver bg-white dark:bg-accent-obsidian border border-gray-300 dark:border-accent-silver/20 rounded-md hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-accent-silver bg-white dark:bg-accent-obsidian border border-gray-300 dark:border-accent-silver/20 rounded-md hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
