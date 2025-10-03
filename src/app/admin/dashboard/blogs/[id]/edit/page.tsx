'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  PhotoIcon,
  EyeIcon,
  DocumentTextIcon,
  TagIcon,
  FolderIcon,
  CalendarIcon,
  GlobeAltIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  categoryId: string
  tags: string[]
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  publishedAt?: string
  scheduledAt?: string
  seoTitle: string
  seoDescription: string
  allowComments: boolean
  featured: boolean
  views: number
  likes: number
  comments: number
  createdAt: string
  updatedAt: string
}

export default function EditBlogPostPage() {
  const { hasPermission } = useAdminAuth()
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content')
  const [newTag, setNewTag] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  // Mock categories
  const categories = [
    { _id: '1', name: 'Study Tips', slug: 'study-tips' },
    { _id: '2', name: 'Learning Science', slug: 'learning-science' },
    { _id: '3', name: 'Productivity', slug: 'productivity' },
    { _id: '4', name: 'Technology', slug: 'technology' }
  ]

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        // Mock data for now - in real app, fetch by postId
        const mockPost: BlogPost = {
          _id: postId,
          title: 'How to Create Effective Flashcards for Better Learning',
          slug: 'effective-flashcards-better-learning',
          excerpt: 'Discover the science-backed techniques for creating flashcards that actually help you remember information long-term.',
          content: `# How to Create Effective Flashcards for Better Learning

Flashcards have been a staple of learning for decades, but not all flashcards are created equal. In this comprehensive guide, we'll explore the science-backed techniques that make flashcards truly effective for long-term retention.

## The Science Behind Effective Flashcards

Research in cognitive psychology has shown that certain principles can dramatically improve the effectiveness of flashcards:

### 1. Active Recall
Active recall is the practice of actively stimulating memory during the learning process. Instead of simply re-reading information, flashcards force you to retrieve information from memory.

### 2. Spaced Repetition
Spaced repetition involves reviewing information at increasing intervals. This technique leverages the psychological spacing effect to improve long-term retention.

## Best Practices for Creating Flashcards

### Keep It Simple
Each flashcard should focus on a single concept or fact. Avoid cramming multiple pieces of information onto one card.

### Use Images When Possible
Visual memory is powerful. Including relevant images can significantly improve recall.

### Write Clear Questions
Make sure your questions are unambiguous and have clear, specific answers.

## Conclusion

By following these evidence-based principles, you can create flashcards that truly enhance your learning and retention. Remember, the key is consistency and proper implementation of these techniques.`,
          featuredImage: '/images/blog/flashcards-guide.jpg',
          categoryId: '1',
          tags: ['Learning', 'Memory', 'Study Techniques'],
          status: 'published',
          publishedAt: '2024-01-15T10:00:00Z',
          seoTitle: 'How to Create Effective Flashcards - Complete Guide',
          seoDescription: 'Learn proven techniques for creating flashcards that improve retention and accelerate learning.',
          allowComments: true,
          featured: false,
          views: 2847,
          likes: 156,
          comments: 23,
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        }
        setPost(mockPost)
      } catch (error) {
        console.error('Error fetching post:', error)
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      fetchPost()
    }
  }, [postId])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    if (!post) return
    setPost(prev => prev ? ({
      ...prev,
      title,
      slug: generateSlug(title),
      seoTitle: title || prev.seoTitle
    }) : null)
  }

  const handleAddTag = () => {
    if (!post) return
    if (newTag.trim() && !post.tags.includes(newTag.trim())) {
      setPost(prev => prev ? ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }) : null)
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    if (!post) return
    setPost(prev => prev ? ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }) : null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && post) {
      // In a real app, you'd upload the file and get a URL
      const imageUrl = URL.createObjectURL(file)
      setPost(prev => prev ? ({ ...prev, featuredImage: imageUrl }) : null)
    }
  }

  const handleSave = async () => {
    if (!post) return
    setSaving(true)

    try {
      // Here you would make the API call to update the blog post
      console.log('Updating blog post:', post)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update the updatedAt timestamp
      setPost(prev => prev ? ({ ...prev, updatedAt: new Date().toISOString() }) : null)
    } catch (error) {
      console.error('Error updating blog post:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!post || !confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return

    try {
      // Here you would make the API call to delete the blog post
      console.log('Deleting blog post:', post._id)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Redirect to blog management page
      router.push('/admin/dashboard/blogs')
    } catch (error) {
      console.error('Error deleting blog post:', error)
    }
  }

  if (!hasPermission('blogs.write')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to edit blog posts.
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
          <div className="h-96 bg-gray-200 dark:bg-accent-silver/20 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Post Not Found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            The blog post you're looking for doesn't exist.
          </p>
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
            href="/admin/dashboard/blogs"
            className="p-2 rounded-lg border border-gray-300 dark:border-accent-silver/20 hover:bg-gray-50 dark:hover:bg-accent-silver/10 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-accent-silver" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Blog Post</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
              Last updated: {new Date(post.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center px-4 py-2 border border-accent-silver/30 text-accent-silver/80 rounded-lg hover:bg-accent-silver/10 hover:text-white transition-colors"
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10"
          >
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-accent-silver/10">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'content', name: 'Content', icon: DocumentTextIcon },
                  { id: 'seo', name: 'SEO', icon: GlobeAltIcon },
                  { id: 'settings', name: 'Settings', icon: TagIcon }
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-accent-neon text-accent-neon'
                          : 'border-transparent text-gray-500 dark:text-accent-silver hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-accent-silver/30'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'content' && (
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={post.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={post.slug}
                      onChange={(e) => setPost(prev => prev ? ({ ...prev, slug: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
                      URL: /blog/{post.slug}
                    </p>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Excerpt
                    </label>
                    <textarea
                      value={post.excerpt}
                      onChange={(e) => setPost(prev => prev ? ({ ...prev, excerpt: e.target.value }) : null)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                  </div>

                  {/* Featured Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Featured Image
                    </label>
                    {post.featuredImage ? (
                      <div className="relative">
                        <div className="w-full h-48 bg-gray-200 dark:bg-accent-silver/20 rounded-lg overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500"></div>
                        </div>
                        <button
                          onClick={() => setPost(prev => prev ? ({ ...prev, featuredImage: undefined }) : null)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 dark:border-accent-silver/20 rounded-lg p-6">
                        <div className="text-center">
                          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <label className="cursor-pointer">
                              <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                                Upload an image
                              </span>
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleImageUpload}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content *
                    </label>
                    <textarea
                      value={post.content}
                      onChange={(e) => setPost(prev => prev ? ({ ...prev, content: e.target.value }) : null)}
                      rows={20}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent font-mono text-sm"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={post.seoTitle}
                      onChange={(e) => setPost(prev => prev ? ({ ...prev, seoTitle: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
                      {post.seoTitle.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SEO Description
                    </label>
                    <textarea
                      value={post.seoDescription}
                      onChange={(e) => setPost(prev => prev ? ({ ...prev, seoDescription: e.target.value }) : null)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
                      {post.seoDescription.length}/160 characters
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                      </label>
                      <select
                        value={post.categoryId}
                        onChange={(e) => setPost(prev => prev ? ({ ...prev, categoryId: e.target.value }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={post.status}
                        onChange={(e) => setPost(prev => prev ? ({ ...prev, status: e.target.value as any }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  {post.status === 'scheduled' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Scheduled Date
                      </label>
                      <input
                        type="datetime-local"
                        value={post.scheduledAt}
                        onChange={(e) => setPost(prev => prev ? ({ ...prev, scheduledAt: e.target.value }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags
                    </label>
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        placeholder="Add a tag..."
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={post.allowComments}
                        onChange={(e) => setPost(prev => prev ? ({ ...prev, allowComments: e.target.checked }) : null)}
                        className="rounded border-gray-300 dark:border-accent-silver/20 text-accent-neon focus:ring-accent-neon"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Allow comments</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={post.featured}
                        onChange={(e) => setPost(prev => prev ? ({ ...prev, featured: e.target.checked }) : null)}
                        className="rounded border-gray-300 dark:border-accent-silver/20 text-accent-neon focus:ring-accent-neon"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured post</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6 space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Post Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Views:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{post.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Likes:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{post.likes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Comments:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{post.comments}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Words:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {post.content.split(/\s+/).filter(word => word.length > 0).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Reading time:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.ceil(post.content.split(/\s+/).length / 200)} min
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Publication Info</h4>
              <div className="space-y-2 text-sm text-gray-500 dark:text-accent-silver">
                <div>
                  <span className="block">Created:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {post.publishedAt && (
                  <div>
                    <span className="block">Published:</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div>
                  <span className="block">Last updated:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(post.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete Post
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
