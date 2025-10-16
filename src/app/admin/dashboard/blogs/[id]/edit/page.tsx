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
import { useAdminApi } from '@/hooks/useAdminApi'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: {
    url: string
    alt?: string
  }
  categories: Array<{
    _id: string
    name: string
    slug: string
    color?: string
  }>
  tags: Array<{
    _id: string
    name: string
    slug: string
    color?: string
  }>
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  publishedAt?: string
  scheduledAt?: string
  seo: {
    title: string
    description: string
    keywords?: string[]
  }
  settings: {
    allowComments: boolean
    featured: boolean
  }
  views: number
  likes: number
  comments: number
  readingTime: number
  author: {
    adminId: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface Category {
  _id: string
  name: string
  slug: string
  color?: string
}

interface Tag {
  _id: string
  name: string
  slug: string
  color?: string
}

export default function EditBlogPostPage() {
  const { hasPermission } = useAdminAuth()
  const { get, put, delete: deleteRequest } = useAdminApi()
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content')
  const [selectedTagId, setSelectedTagId] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch blog post, categories, and tags in parallel
        const [blogResponse, categoriesResponse, tagsResponse] = await Promise.all([
          get(`/api/admin/blogs/${postId}`),
          get('/api/admin/blogs/categories'),
          get('/api/admin/blogs/tags')
        ])

        if (blogResponse.success) {
          // Map backend data structure to frontend interface
          const postData = {
            ...blogResponse.data,
            settings: {
              allowComments: blogResponse.data.allowComments ?? true,
              featured: blogResponse.data.isSticky ?? false
            }
          }
          setPost(postData)
        } else {
          setError(blogResponse.message || 'Failed to fetch blog post')
        }

        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data)
        }

        if (tagsResponse.success) {
          setAvailableTags(tagsResponse.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load blog post data')
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      fetchData()
    }
  }, [postId, get])

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
      seo: {
        ...prev.seo,
        title: title || prev.seo.title
      }
    }) : null)
  }

  const handleAddTag = () => {
    if (!post || !selectedTagId) return
    
    // Find the selected tag from available tags
    const selectedTag = availableTags.find(tag => tag._id === selectedTagId)
    if (!selectedTag) return
    
    // Check if tag is already added
    if (post.tags.some(tag => tag._id === selectedTag._id)) return
    
    setPost(prev => prev ? ({
      ...prev,
      tags: [...prev.tags, selectedTag]
    }) : null)
    setSelectedTagId('')
  }

  const handleRemoveTag = (tagToRemove: Tag) => {
    if (!post) return
    setPost(prev => prev ? ({
      ...prev,
      tags: prev.tags.filter(tag => tag._id !== tagToRemove._id)
    }) : null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !post) return

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('image', file)

      // Upload to S3 via admin API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/blogs/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPost(prev => prev ? ({ 
            ...prev, 
            featuredImage: { url: data.imageUrl, alt: file.name }
          }) : null)
        } else {
          setError(data.message || 'Failed to upload image')
        }
      } else {
        setError('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setError('Failed to upload image')
    }
  }

  const handleSave = async () => {
    if (!post) return
    setSaving(true)
    setError(null)

    try {
      const response = await put(`/api/admin/blogs/${post._id}`, {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage,
        categories: post.categories.map(cat => cat._id),
        tags: post.tags.map(tag => tag._id),
        status: post.status,
        publishedAt: post.publishedAt,
        scheduledAt: post.scheduledAt,
        seo: post.seo,
        // Map frontend settings object to backend fields
        allowComments: post.settings?.allowComments ?? true,
        isSticky: post.settings?.featured ?? false
      })

      if (response.success) {
        setPost(prev => prev ? ({ ...prev, updatedAt: new Date().toISOString() }) : null)
        // Show success message (you might want to add a toast notification)
        console.log('Blog post updated successfully')
      } else {
        setError(response.message || 'Failed to update blog post')
      }
    } catch (error) {
      console.error('Error updating blog post:', error)
      setError('Failed to update blog post')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!post || !confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return

    try {
      const response = await deleteRequest(`/api/admin/blogs/${post._id}`)
      
      if (response.success) {
        router.push('/admin/dashboard/blogs')
      } else {
        setError(response.message || 'Failed to delete blog post')
      }
    } catch (error) {
      console.error('Error deleting blog post:', error)
      setError('Failed to delete blog post')
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error Loading Post</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-accent-neon text-black rounded-lg font-medium hover:bg-accent-neon/90 transition-colors"
          >
            Try Again
          </button>
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
                    {post.featuredImage?.url ? (
                      <div className="relative">
                        <div className="w-full h-48 bg-gray-200 dark:bg-accent-silver/20 rounded-lg overflow-hidden">
                          <img 
                            src={post.featuredImage.url} 
                            alt={post.featuredImage.alt || post.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/blog/default-featured.jpg';
                            }}
                          />
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
                      value={post.seo.title}
                      onChange={(e) => setPost(prev => prev ? ({ 
                        ...prev, 
                        seo: { ...prev.seo, title: e.target.value }
                      }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
                      {post.seo.title.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SEO Description
                    </label>
                    <textarea
                      value={post.seo.description}
                      onChange={(e) => setPost(prev => prev ? ({ 
                        ...prev, 
                        seo: { ...prev.seo, description: e.target.value }
                      }) : null)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
                      {post.seo.description.length}/160 characters
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
                        value={post.categories[0]?._id || ''}
                        onChange={(e) => {
                          const selectedCategory = categories.find(cat => cat._id === e.target.value)
                          if (selectedCategory) {
                            setPost(prev => prev ? ({ 
                              ...prev, 
                              categories: [selectedCategory]
                            }) : null)
                          }
                        }}
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
                    {availableTags.length > 0 ? (
                      <div className="flex items-center space-x-2 mb-2">
                        <select
                          value={selectedTagId}
                          onChange={(e) => setSelectedTagId(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        >
                          <option value="">Select a tag...</option>
                          {availableTags
                            .filter(tag => !post.tags.some(existingTag => existingTag._id === tag._id))
                            .map(tag => (
                              <option key={tag._id} value={tag._id}>
                                {tag.name}
                              </option>
                            ))
                          }
                        </select>
                        <button
                          onClick={handleAddTag}
                          disabled={!selectedTagId}
                          className="px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <div className="mb-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          No tags available. 
                          <Link 
                            href="/admin/dashboard/blogs/tags" 
                            className="ml-1 font-medium underline hover:no-underline"
                            target="_blank"
                          >
                            Create tags first
                          </Link>
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag._id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                        >
                          {tag.name}
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
                        checked={post.settings?.allowComments ?? true}
                        onChange={(e) => setPost(prev => prev ? ({ 
                          ...prev, 
                          settings: { ...prev.settings, allowComments: e.target.checked }
                        }) : null)}
                        className="rounded border-gray-300 dark:border-accent-silver/20 text-accent-neon focus:ring-accent-neon"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Allow comments</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={post.settings?.featured ?? false}
                        onChange={(e) => setPost(prev => prev ? ({ 
                          ...prev, 
                          settings: { ...prev.settings, featured: e.target.checked }
                        }) : null)}
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
                    {post.readingTime || Math.ceil(post.content.split(/\s+/).length / 200)} min
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Author:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {post.author.name}
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
