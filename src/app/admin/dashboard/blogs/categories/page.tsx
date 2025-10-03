'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
  ArrowLeftIcon,
  XMarkIcon,
  SwatchIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import Link from 'next/link'

interface BlogCategory {
  _id: string
  name: string
  slug: string
  description: string
  color: string
  postCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CategoryFormData {
  name: string
  slug: string
  description: string
  color: string
  isActive: boolean
}

export default function CategoriesManagementPage() {
  const { hasPermission } = useAdminAuth()
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6',
    isActive: true
  })

  const colorOptions = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ]

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        // Mock data for now
        const mockCategories: BlogCategory[] = [
          {
            _id: '1',
            name: 'Study Tips',
            slug: 'study-tips',
            description: 'Effective techniques and strategies for better learning',
            color: '#3B82F6',
            postCount: 15,
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-15T10:30:00Z'
          },
          {
            _id: '2',
            name: 'Learning Science',
            slug: 'learning-science',
            description: 'Research-backed insights into how we learn and remember',
            color: '#10B981',
            postCount: 8,
            isActive: true,
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-12T14:20:00Z'
          },
          {
            _id: '3',
            name: 'Productivity',
            slug: 'productivity',
            description: 'Tools and methods to maximize your learning efficiency',
            color: '#F59E0B',
            postCount: 12,
            isActive: true,
            createdAt: '2024-01-03T00:00:00Z',
            updatedAt: '2024-01-18T09:15:00Z'
          },
          {
            _id: '4',
            name: 'Technology',
            slug: 'technology',
            description: 'Latest tech trends and tools for modern learning',
            color: '#8B5CF6',
            postCount: 6,
            isActive: true,
            createdAt: '2024-01-04T00:00:00Z',
            updatedAt: '2024-01-10T16:45:00Z'
          },
          {
            _id: '5',
            name: 'Archived Category',
            slug: 'archived-category',
            description: 'This category is no longer active',
            color: '#6B7280',
            postCount: 3,
            isActive: false,
            createdAt: '2023-12-01T00:00:00Z',
            updatedAt: '2024-01-05T12:00:00Z'
          }
        ]
        setCategories(mockCategories)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleCreateCategory = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#3B82F6',
      isActive: true
    })
    setShowModal(true)
  }

  const handleEditCategory = (category: BlogCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      isActive: category.isActive
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
      if (editingCategory) {
        // Update existing category
        console.log('Updating category:', editingCategory._id, formData)
        setCategories(prev => prev.map(cat => 
          cat._id === editingCategory._id 
            ? { ...cat, ...formData, updatedAt: new Date().toISOString() }
            : cat
        ))
      } else {
        // Create new category
        console.log('Creating category:', formData)
        const newCategory: BlogCategory = {
          _id: Date.now().toString(),
          ...formData,
          postCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setCategories(prev => [...prev, newCategory])
      }
      
      setShowModal(false)
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleDelete = async (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId)
    if (!category) return

    if (category.postCount > 0) {
      alert(`Cannot delete category "${category.name}" because it has ${category.postCount} posts. Please move or delete the posts first.`)
      return
    }

    if (!confirm(`Are you sure you want to delete the category "${category.name}"?`)) return

    try {
      console.log('Deleting category:', categoryId)
      setCategories(prev => prev.filter(cat => cat._id !== categoryId))
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  if (!hasPermission('blogs.write')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to manage blog categories.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
            href="/admin/dashboard/blogs"
            className="p-2 rounded-lg border border-gray-300 dark:border-accent-silver/20 hover:bg-gray-50 dark:hover:bg-accent-silver/10 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-accent-silver" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Categories</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
              Organize your blog posts with categories
            </p>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleCreateCategory}
            className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Category
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <motion.div
            key={category._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6 ${
              !category.isActive ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {category.name}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                  disabled={category.postCount > 0}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-accent-silver mb-4">
              {category.description}
            </p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-gray-500 dark:text-accent-silver">
                  {category.postCount} posts
                </span>
                <span className="text-gray-500 dark:text-accent-silver">
                  /{category.slug}
                </span>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                category.isActive 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300'
              }`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-accent-silver/10">
              <div className="text-xs text-gray-500 dark:text-accent-silver">
                Created: {new Date(category.createdAt).toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No categories found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            Create your first blog category to get started.
          </p>
          <div className="mt-6">
            <button
              onClick={handleCreateCategory}
              className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Category
            </button>
          </div>
        </div>
      )}

      {/* Category Modal */}
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
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-accent-silver hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-accent-silver mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                  placeholder="e.g., Study Tips"
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
                  placeholder="study-tips"
                />
                <p className="mt-1 text-xs text-accent-silver/70">
                  URL: /blog/category/{formData.slug || 'category-slug'}
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
                  placeholder="Brief description of this category..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-silver mb-2">
                  Color
                </label>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white"
                    style={{ backgroundColor: formData.color }}
                  />
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-6 h-6 rounded-full border-2 ${
                          formData.color === color ? 'border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-accent-silver/20 text-accent-neon focus:ring-accent-neon"
                  />
                  <span className="ml-2 text-sm text-accent-silver">Active category</span>
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
                  className="px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
