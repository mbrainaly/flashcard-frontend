'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import Link from 'next/link'

interface Testimonial {
  _id: string
  name: string
  role: string
  text: string
  image?: string
  time: string
  likes: number
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

interface TestimonialFormData {
  name: string
  role: string
  text: string
  image: string
  time: string
  likes: number
  isActive: boolean
  order: number
}

export default function TestimonialsManagementPage() {
  const { hasPermission, accessToken } = useAdminAuth()
  const { get, post, put, delete: deleteRequest } = useAdminApi()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  })
  const [formData, setFormData] = useState<TestimonialFormData>({
    name: '',
    role: '',
    text: '',
    image: '',
    time: '0d',
    likes: 0,
    isActive: true,
    order: 0
  })

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await get('/api/admin/testimonials/all')
        
        if (response.success) {
          setTestimonials(response.data)
        } else {
          setError(response.message || 'Failed to fetch testimonials')
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error)
        setError('Failed to load testimonials')
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [get])

  const handleCreateTestimonial = () => {
    setEditingTestimonial(null)
    setFormData({
      name: '',
      role: '',
      text: '',
      image: '',
      time: '0d',
      likes: 0,
      isActive: true,
      order: testimonials.length
    })
    setShowModal(true)
  }

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      text: testimonial.text,
      image: testimonial.image || '',
      time: testimonial.time,
      likes: testimonial.likes,
      isActive: testimonial.isActive,
      order: testimonial.order
    })
    setShowModal(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/testimonials/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.data.url }))
      } else {
        setError(data.message || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setError('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError(null)
      
      if (editingTestimonial) {
        const response = await put(`/api/admin/testimonials/${editingTestimonial._id}`, formData)
        
        if (response.success) {
          setTestimonials(prev => prev.map(testimonial => 
            testimonial._id === editingTestimonial._id 
              ? { ...testimonial, ...formData, updatedAt: new Date().toISOString() }
              : testimonial
          ))
          setShowModal(false)
        } else {
          setError(response.message || 'Failed to update testimonial')
        }
      } else {
        const response = await post('/api/admin/testimonials', formData)
        
        if (response.success) {
          setTestimonials(prev => [...prev, response.data])
          setShowModal(false)
        } else {
          setError(response.message || 'Failed to create testimonial')
        }
      }
    } catch (error) {
      console.error('Error saving testimonial:', error)
      setError('Failed to save testimonial')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (testimonialId: string) => {
    const testimonial = testimonials.find(t => t._id === testimonialId)
    if (!testimonial) return

    if (!confirm(`Are you sure you want to delete the testimonial from "${testimonial.name}"?`)) return

    try {
      const response = await deleteRequest(`/api/admin/testimonials/${testimonialId}`)
      
      if (response.success) {
        setTestimonials(prev => prev.filter(testimonial => testimonial._id !== testimonialId))
      } else {
        setError(response.message || 'Failed to delete testimonial')
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      setError('Failed to delete testimonial')
    }
  }

  const handleOrderChange = async (testimonialId: string, direction: 'up' | 'down') => {
    const testimonial = testimonials.find(t => t._id === testimonialId)
    if (!testimonial) return

    const currentIndex = testimonials.findIndex(t => t._id === testimonialId)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0 || newIndex >= testimonials.length) return

    const swappedTestimonial = testimonials[newIndex]
    const newOrder = swappedTestimonial.order
    const oldOrder = testimonial.order

    try {
      const response = await put('/api/admin/testimonials/order', {
        testimonials: [
          { id: testimonialId, order: newOrder },
          { id: swappedTestimonial._id, order: oldOrder }
        ]
      })

      if (response.success) {
        setTestimonials(prev => {
          const updated = [...prev]
          const temp = updated[currentIndex].order
          updated[currentIndex].order = updated[newIndex].order
          updated[newIndex].order = temp
          return updated.sort((a, b) => a.order - b.order)
        })
      } else {
        setError(response.message || 'Failed to update order')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      setError('Failed to update order')
    }
  }

  const filteredTestimonials = testimonials.filter(testimonial => {
    if (filters.search && !testimonial.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !testimonial.role.toLowerCase().includes(filters.search.toLowerCase()) &&
        !testimonial.text.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.status === 'active' && !testimonial.isActive) return false
    if (filters.status === 'inactive' && testimonial.isActive) return false
    return true
  }).sort((a, b) => a.order - b.order)

  if (!hasPermission('pages.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to manage testimonials.
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
            href="/admin/dashboard/pages"
            className="p-2 rounded-lg border border-gray-300 dark:border-accent-silver/20 hover:bg-gray-50 dark:hover:bg-accent-silver/10 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-accent-silver" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Testimonials</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
              Manage testimonials displayed on the landing page
            </p>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleCreateTestimonial}
            className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Testimonial
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
              Search Testimonials
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search by name, role, or text..."
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

      {/* Testimonials Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-accent-silver/10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Testimonials ({filteredTestimonials.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-accent-silver/10">
            <thead className="bg-gray-50 dark:bg-accent-silver/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                  Testimonial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                  Text
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                  Likes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                  Status
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-accent-obsidian divide-y divide-gray-200 dark:divide-accent-silver/10">
              {filteredTestimonials.map((testimonial, index) => (
                <tr key={testimonial._id} className="hover:bg-gray-50 dark:hover:bg-accent-silver/5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOrderChange(testimonial._id, 'up')}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowUpIcon className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {testimonial.order}
                      </span>
                      <button
                        onClick={() => handleOrderChange(testimonial._id, 'down')}
                        disabled={index === filteredTestimonials.length - 1}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowDownIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {testimonial.image && (
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=111111&color=80E9FF`;
                          }}
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-accent-silver">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {testimonial.text}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {testimonial.likes}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      testimonial.isActive 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300'
                    }`}>
                      {testimonial.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditTestimonial(testimonial)}
                        className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
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

        {filteredTestimonials.length === 0 && (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No testimonials found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
              {filters.search || filters.status 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first testimonial to get started.'
              }
            </p>
            {!filters.search && !filters.status && (
              <div className="mt-6">
                <button
                  onClick={handleCreateTestimonial}
                  className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Testimonial
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Testimonial Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-gradient-to-br from-accent-obsidian via-accent-obsidian to-gray-900 rounded-xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl transform transition-all sm:max-w-2xl sm:w-full border border-accent-silver/20 relative z-10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingTestimonial ? 'Edit Testimonial' : 'Create New Testimonial'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent-silver mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent-silver mb-2">
                    Role/University *
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                    placeholder="e.g., Harvard University"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-silver mb-2">
                  Testimonial Text *
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                  placeholder="Enter the testimonial text..."
                  required
                  maxLength={500}
                />
                <p className="mt-1 text-xs text-accent-silver/70">
                  {formData.text.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-silver mb-2">
                  Image URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                    placeholder="Image URL or upload below"
                  />
                  <label className="px-4 py-2 border border-accent-silver/30 text-accent-silver/80 rounded-lg hover:bg-accent-silver/10 hover:text-white transition-colors cursor-pointer">
                    <PhotoIcon className="w-5 h-5 inline mr-2" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                {uploadingImage && (
                  <p className="mt-1 text-xs text-accent-silver/70">Uploading image...</p>
                )}
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-20 w-20 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent-silver mb-2">
                    Time Display *
                  </label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                    placeholder="e.g., 9d, 12d"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent-silver mb-2">
                    Likes
                  </label>
                  <input
                    type="number"
                    value={formData.likes}
                    onChange={(e) => setFormData(prev => ({ ...prev, likes: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent-silver mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-accent-silver/5 border border-accent-silver/20 rounded-lg text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
                    placeholder="0"
                    min="0"
                  />
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
                  <span className="ml-2 text-sm text-accent-silver">Active testimonial</span>
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
                    ? (editingTestimonial ? 'Updating...' : 'Creating...') 
                    : (editingTestimonial ? 'Update Testimonial' : 'Create Testimonial')
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

