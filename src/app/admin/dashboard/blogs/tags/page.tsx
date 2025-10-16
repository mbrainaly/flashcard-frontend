'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  ArrowLeftIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import Link from 'next/link'

interface BlogTag {
  _id: string
  name: string
  slug: string
  description: string
  postCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface TagFormData {
  name: string
  slug: string
  description: string
  isActive: boolean
}

export default function TagsManagementPage() {
  const { hasPermission } = useAdminAuth()
  const { get, post, put, delete: deleteRequest } = useAdminApi()
  const [tags, setTags] = useState<BlogTag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingTag, setEditingTag] = useState<BlogTag | null>(null)
  const [saving, setSaving] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  })
  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    slug: '',
    description: '',
    isActive: true
  })

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await get('/api/admin/blogs/tags')
        
        if (response.success) {
          setTags(response.data)
        } else {
          setError(response.message || 'Failed to fetch tags')
        }
      } catch (error) {
        console.error('Error fetching tags:', error)
        setError('Failed to load tags')
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [get])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleCreateTag = () => {
    setEditingTag(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      isActive: true
    })
    setShowModal(true)
  }

  const handleEditTag = (tag: BlogTag) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      isActive: tag.isActive
    })
    setShowModal(true)
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError(null)
      
      if (editingTag) {
        // Update existing tag
        const response = await put(`/api/admin/blogs/tags/${editingTag._id}`, formData)
        
        if (response.success) {
          setTags(prev => prev.map(tag => 
            tag._id === editingTag._id 
              ? { ...tag, ...formData, updatedAt: new Date().toISOString() }
              : tag
          ))
          setShowModal(false)
        } else {
          setError(response.message || 'Failed to update tag')
        }
      } else {
        // Create new tag
        const response = await post('/api/admin/blogs/tags', formData)
        
        if (response.success) {
          setTags(prev => [...prev, response.data])
          setShowModal(false)
        } else {
          setError(response.message || 'Failed to create tag')
        }
      }
    } catch (error) {
      console.error('Error saving tag:', error)
      setError('Failed to save tag')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (tagId: string) => {
    const tag = tags.find(t => t._id === tagId)
    if (!tag) return

    if (tag.postCount > 0) {
      alert(`Cannot delete tag "${tag.name}" because it's used in ${tag.postCount} posts. Please remove it from posts first.`)
      return
    }

    if (!confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) return

    try {
      const response = await deleteRequest(`/api/admin/blogs/tags/${tagId}`)
      
      if (response.success) {
        setTags(prev => prev.filter(tag => tag._id !== tagId))
      } else {
        setError(response.message || 'Failed to delete tag')
      }
    } catch (error) {
      console.error('Error deleting tag:', error)
      setError('Failed to delete tag')
    }
  }

  const filteredTags = tags.filter(tag => {
    if (filters.search && !tag.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !tag.description.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.status === 'active' && !tag.isActive) return false
    if (filters.status === 'inactive' && tag.isActive) return false
    return true
  })

  if (!hasPermission('blogs.write')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to manage blog tags.
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
          <div className="h-64 bg-gray-200 dark:bg-accent-silver/20 rounded-xl"></div>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Tags</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
              Manage tags to help organize and categorize your blog content
            </p>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleCreateTag}
            className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Tag
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex bg-red-50 dark:bg-red-900/20 rounded-md p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search Tags
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search by name or description..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ search: '', status: '' })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-accent-silver/10 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tags Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-accent-silver/10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tags ({filteredTags.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-accent-silver/10">
            <thead className="bg-gray-50 dark:bg-accent-silver/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                  Tag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                  Posts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                  Created
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-accent-obsidian divide-y divide-gray-200 dark:divide-accent-silver/10">
              {filteredTags.map((tag) => (
                <tr key={tag._id} className="hover:bg-gray-50 dark:hover:bg-accent-silver/5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TagIcon className="w-4 h-4 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {tag.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-accent-silver">
                          /{tag.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {tag.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {tag.postCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tag.isActive 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300'
                    }`}>
                      {tag.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(tag.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditTag(tag)}
                        className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        disabled={tag.postCount > 0}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTags.length === 0 && (
          <div className="text-center py-12">
            <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tags found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
              {filters.search || filters.status 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first blog tag to get started.'
              }
            </p>
            {!filters.search && !filters.status && (
              <div className="mt-6">
                <button
                  onClick={handleCreateTag}
                  className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Tag
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Tag Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-gradient-to-br from-accent-obsidian via-accent-obsidian to-gray-900 rounded-xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl transform transition-all sm:max-w-lg sm:w-full border border-accent-silver/20 relative z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingTag ? 'Edit Tag' : 'Create New Tag'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-accent-silver hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Error Display */}
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <div className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-accent-silver mb-2">
                  Tag Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                  placeholder="e.g., Learning"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-silver mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                  placeholder="learning"
                />
                <p className="mt-1 text-xs text-accent-silver/70">
                  URL: /blog/tag/{formData.slug || 'tag-slug'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-silver mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                  placeholder="Brief description of this tag..."
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-accent-silver/20 text-accent-neon focus:ring-accent-neon"
                  />
                  <span className="ml-2 text-sm text-accent-silver">Active tag</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-accent-silver/20">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-accent-silver/30 text-accent-silver/80 rounded-lg hover:bg-accent-silver/10 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving 
                    ? (editingTag ? 'Updating...' : 'Creating...') 
                    : (editingTag ? 'Update Tag' : 'Create Tag')
                  }
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
