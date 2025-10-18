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
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/ui/Toast'

interface Tag {
  _id: string
  name: string
  slug: string
}

interface BlogFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: File
  categoryId: string
  tags: Tag[]
  status: 'draft' | 'published' | 'scheduled'
  publishedAt?: string
  scheduledAt?: string
  seoTitle: string
  seoDescription: string
  allowComments: boolean
  featured: boolean
}

export default function CreateBlogPostPage() {
  const { hasPermission } = useAdminAuth()
  const adminApi = useAdminApi()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content')
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    categoryId: '',
    tags: [],
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    allowComments: true,
    featured: false
  })
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTagId, setSelectedTagId] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [categories, setCategories] = useState<Array<{_id: string, name: string, slug: string}>>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  // Fetch categories and tags from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, tagsResponse] = await Promise.all([
          adminApi.get('/api/admin/blogs/categories'),
          adminApi.get('/api/admin/blogs/tags')
        ])
        
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data.filter((cat: any) => cat.isActive))
        }
        
        if (tagsResponse.success) {
          setAvailableTags(tagsResponse.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [adminApi])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
      seoTitle: title || prev.seoTitle
    }))
  }

  const handleAddTag = () => {
    if (!selectedTagId) return
    
    // Find the selected tag from available tags
    const selectedTag = availableTags.find(tag => tag._id === selectedTagId)
    if (!selectedTag) return
    
    // Check if tag is already added
    if (formData.tags.some(tag => tag._id === selectedTag._id)) return
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, selectedTag]
    }))
    setSelectedTagId('')
  }

  const handleRemoveTag = (tagToRemove: Tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag._id !== tagToRemove._id)
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      
      // Create FormData for file upload
      const uploadFormData = new FormData()
      uploadFormData.append('image', file)

      // Upload to S3 via admin API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/blogs/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: uploadFormData
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setFormData(prev => ({ ...prev, featuredImage: file }))
          showToast({
            type: 'success',
            title: 'Success',
            message: 'Image uploaded successfully'
          })
        } else {
          throw new Error(data.message || 'Failed to upload image')
        }
      } else {
        throw new Error('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to upload image'
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Title is required'
      })
      return
    }

    if (!formData.content.trim()) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Content is required'
      })
      return
    }

    try {
      setLoading(true)
      
      const blogData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt,
        status: isDraft ? 'draft' : formData.status,
        categories: formData.categoryId ? [formData.categoryId] : [],
        tags: formData.tags.map(tag => tag._id),
        publishedAt: formData.publishedAt,
        scheduledAt: formData.scheduledAt,
        allowComments: formData.allowComments,
        featured: formData.featured,
        seo: {
          title: formData.seoTitle,
          description: formData.seoDescription,
          keywords: []
        }
      }

      const response = await adminApi.post('/api/admin/blogs', blogData)
      
      if (response.success) {
        showToast({
          type: 'success',
          title: 'Success',
          message: `Blog post ${isDraft ? 'saved as draft' : 'created'} successfully`
        })
        router.push('/admin/dashboard/blogs')
      } else {
        throw new Error(response.error || 'Failed to create blog post')
      }
    } catch (error) {
      console.error('Error creating blog post:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create blog post'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAsDraft = (e: React.FormEvent) => {
    handleSubmit(e, true)
  }

  if (!hasPermission('blogs.write')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to create blog posts.
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Blog Post</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
              Write and publish engaging content for your audience
            </p>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-accent-silver/30 text-gray-700 dark:text-accent-silver/80 rounded-lg hover:bg-gray-50 dark:hover:bg-accent-silver/10 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleSaveAsDraft}
            disabled={loading || !formData.title.trim()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-accent-silver/30 text-gray-700 dark:text-accent-silver/80 rounded-lg hover:bg-gray-50 dark:hover:bg-accent-silver/10 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title.trim()}
            className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Post'}
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
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      placeholder="Enter your blog post title..."
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      placeholder="url-friendly-slug"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
                      URL: /blog/{formData.slug || 'your-post-slug'}
                    </p>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Excerpt
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      placeholder="Brief description of your post..."
                    />
                  </div>

                  {/* Featured Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Featured Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-accent-silver/20 rounded-lg p-6">
                      <div className="text-center">
                        {uploadingImage ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-neon"></div>
                            <p className="mt-2 text-sm text-gray-600 dark:text-accent-silver">Uploading...</p>
                          </div>
                        ) : formData.featuredImage ? (
                          <div className="flex flex-col items-center">
                            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                            <p className="mt-2 text-sm text-gray-900 dark:text-white">
                              {formData.featuredImage.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, featuredImage: undefined }))}
                              className="mt-2 text-xs text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <>
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
                                  disabled={uploadingImage}
                                />
                              </label>
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-accent-silver">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={20}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent font-mono text-sm"
                      placeholder="Write your blog post content here... (Markdown supported)"
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
                      value={formData.seoTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      placeholder="SEO optimized title..."
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
                      {formData.seoTitle.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SEO Description
                    </label>
                    <textarea
                      value={formData.seoDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      placeholder="SEO meta description..."
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
                      {formData.seoDescription.length}/160 characters
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
                        value={formData.categoryId}
                        onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
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
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                    </div>
                  </div>

                  {formData.status === 'scheduled' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Scheduled Date
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
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
                            .filter(tag => !formData.tags.some(existingTag => existingTag._id === tag._id))
                            .map((tag) => (
                              <option key={tag._id} value={tag._id} className="bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white">
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
                      {formData.tags.map((tag) => (
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
                        checked={formData.allowComments}
                        onChange={(e) => setFormData(prev => ({ ...prev, allowComments: e.target.checked }))}
                        className="rounded border-gray-300 dark:border-accent-silver/20 text-accent-neon focus:ring-accent-neon"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Allow comments</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-accent-silver/30 text-gray-700 dark:text-accent-silver/80 rounded-lg hover:bg-gray-50 dark:hover:bg-accent-silver/10 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <EyeIcon className="w-4 h-4 mr-2 inline" />
                  {previewMode ? 'Edit Mode' : 'Preview'}
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Post Statistics</h4>
              <div className="space-y-2 text-sm text-gray-500 dark:text-accent-silver">
                <div className="flex justify-between">
                  <span>Words:</span>
                  <span>{formData.content.split(/\s+/).filter(word => word.length > 0).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Characters:</span>
                  <span>{formData.content.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reading time:</span>
                  <span>{Math.ceil(formData.content.split(/\s+/).length / 200)} min</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">SEO Score</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Title</span>
                  <span className={formData.title ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {formData.title ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Description</span>
                  <span className={formData.seoDescription ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {formData.seoDescription ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Category</span>
                  <span className={formData.categoryId ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {formData.categoryId ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
