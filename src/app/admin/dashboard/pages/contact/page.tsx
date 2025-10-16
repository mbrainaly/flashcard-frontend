'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  PhoneIcon,
  EyeIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  MapPinIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import Link from 'next/link'

interface ContactPageData {
  _id: string
  title: string
  slug: string
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
  contactInfo: {
    email: string
    phone: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    businessHours: {
      monday: string
      tuesday: string
      wednesday: string
      thursday: string
      friday: string
      saturday: string
      sunday: string
    }
    socialMedia: {
      twitter?: string
      facebook?: string
      linkedin?: string
      instagram?: string
    }
  }
  formSettings: {
    enabled: boolean
    emailNotifications: boolean
    autoReply: boolean
    autoReplyMessage: string
  }
}

export default function ContactPage() {
  const { hasPermission } = useAdminAuth()
  const { get, put } = useAdminApi()
  const [pageData, setPageData] = useState<ContactPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'content' | 'contact' | 'seo' | 'settings'>('content')

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await get('/api/admin/pages/contact')
        
        if (response.success) {
          setPageData(response.data)
        } else {
          setError(response.message || 'Failed to fetch page data')
        }
      } catch (error) {
        console.error('Error fetching page data:', error)
        setError('Failed to load page data')
      } finally {
        setLoading(false)
      }
    }

    fetchPageData()
  }, [get])

  const handleSave = async () => {
    if (!pageData) return

    try {
      setSaving(true)
      setError(null)

      const response = await put('/api/admin/pages/contact', {
        title: pageData.title,
        content: pageData.content,
        seo: pageData.seo,
        contactInfo: pageData.contactInfo,
        formSettings: pageData.formSettings,
        status: pageData.status
      })

      if (response.success) {
        setPageData(response.data)
        console.log('Page saved successfully!')
      } else {
        setError(response.message || 'Failed to save page')
      }
    } catch (error) {
      console.error('Error saving page:', error)
      setError('Failed to save page')
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (status: ContactPageData['status']) => {
    const statusConfig = {
      published: { color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300', icon: CheckCircleIcon },
      draft: { color: 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300', icon: DocumentTextIcon },
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

  if (!hasPermission('pages.write')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">You don't have permission to edit pages.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-neon"></div>
      </div>
    )
  }

  if (!pageData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Page Not Found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">The contact page could not be loaded.</p>
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
            className="inline-flex items-center text-accent-silver hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Pages
          </Link>
          <div className="border-l border-accent-silver/20 pl-4">
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="w-6 h-6 text-accent-neon" />
              <div>
                <h1 className="text-2xl font-bold text-white">{pageData.title}</h1>
                <p className="text-sm text-gray-500 dark:text-accent-silver">
                  Last updated: {new Date(pageData.lastModified).toLocaleDateString()}
                </p>
                {getStatusBadge(pageData.status)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 border border-accent-silver/30 text-accent-silver/80 rounded-lg hover:bg-accent-silver/10 hover:text-white transition-colors">
            <EyeIcon className="w-4 h-4 mr-2" />
            Preview
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-accent-silver/30 text-accent-silver/80 rounded-lg hover:bg-accent-silver/10 hover:text-white transition-colors">
            <GlobeAltIcon className="w-4 h-4 mr-2" />
            View Live
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

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

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
                  { id: 'contact', name: 'Contact Info', icon: EnvelopeIcon },
                  { id: 'seo', name: 'SEO', icon: GlobeAltIcon },
                  { id: 'settings', name: 'Settings', icon: ClockIcon }
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

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-2">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={pageData.title}
                      onChange={(e) => setPageData(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-2">
                      Content (Markdown)
                    </label>
                    <textarea
                      value={pageData.content}
                      onChange={(e) => setPageData(prev => prev ? ({ ...prev, content: e.target.value }) : null)}
                      rows={20}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent font-mono text-sm"
                      placeholder="Enter contact page content (Markdown supported)..."
                    />
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={pageData.contactInfo.email}
                        onChange={(e) => setPageData(prev => prev ? ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, email: e.target.value }
                        }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={pageData.contactInfo.phone}
                        onChange={(e) => setPageData(prev => prev ? ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, phone: e.target.value }
                        }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-2">
                      Address
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Street"
                        value={pageData.contactInfo.address.street}
                        onChange={(e) => setPageData(prev => prev ? ({
                          ...prev,
                          contactInfo: {
                            ...prev.contactInfo,
                            address: { ...prev.contactInfo.address, street: e.target.value }
                          }
                        }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={pageData.contactInfo.address.city}
                        onChange={(e) => setPageData(prev => prev ? ({
                          ...prev,
                          contactInfo: {
                            ...prev.contactInfo,
                            address: { ...prev.contactInfo.address, city: e.target.value }
                          }
                        }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={pageData.contactInfo.address.state}
                        onChange={(e) => setPageData(prev => prev ? ({
                          ...prev,
                          contactInfo: {
                            ...prev.contactInfo,
                            address: { ...prev.contactInfo.address, state: e.target.value }
                          }
                        }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="ZIP Code"
                        value={pageData.contactInfo.address.zipCode}
                        onChange={(e) => setPageData(prev => prev ? ({
                          ...prev,
                          contactInfo: {
                            ...prev.contactInfo,
                            address: { ...prev.contactInfo.address, zipCode: e.target.value }
                          }
                        }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={pageData.seo.title}
                      onChange={(e) => setPageData(prev => prev ? ({
                        ...prev,
                        seo: { ...prev.seo, title: e.target.value }
                      }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={pageData.seo.description}
                      onChange={(e) => setPageData(prev => prev ? ({
                        ...prev,
                        seo: { ...prev.seo, description: e.target.value }
                      }) : null)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-2">
                      Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={pageData.seo.keywords.join(', ')}
                      onChange={(e) => setPageData(prev => prev ? ({
                        ...prev,
                        seo: { ...prev.seo, keywords: e.target.value.split(',').map(k => k.trim()) }
                      }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-2">
                      Page Status
                    </label>
                    <select
                      value={pageData.status}
                      onChange={(e) => setPageData(prev => prev ? ({
                        ...prev,
                        status: e.target.value as ContactPageData['status']
                      }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="review">Under Review</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="formEnabled"
                        checked={pageData.formSettings.enabled}
                        onChange={(e) => setPageData(prev => prev ? ({
                          ...prev,
                          formSettings: { ...prev.formSettings, enabled: e.target.checked }
                        }) : null)}
                        className="h-4 w-4 text-accent-neon focus:ring-accent-neon border-gray-300 rounded"
                      />
                      <label htmlFor="formEnabled" className="ml-2 block text-sm text-gray-900 dark:text-white">
                        Enable Contact Form
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={pageData.formSettings.emailNotifications}
                        onChange={(e) => setPageData(prev => prev ? ({
                          ...prev,
                          formSettings: { ...prev.formSettings, emailNotifications: e.target.checked }
                        }) : null)}
                        className="h-4 w-4 text-accent-neon focus:ring-accent-neon border-gray-300 rounded"
                      />
                      <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900 dark:text-white">
                        Email Notifications
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoReply"
                        checked={pageData.formSettings.autoReply}
                        onChange={(e) => setPageData(prev => prev ? ({
                          ...prev,
                          formSettings: { ...prev.formSettings, autoReply: e.target.checked }
                        }) : null)}
                        className="h-4 w-4 text-accent-neon focus:ring-accent-neon border-gray-300 rounded"
                      />
                      <label htmlFor="autoReply" className="ml-2 block text-sm text-gray-900 dark:text-white">
                        Auto Reply
                      </label>
                    </div>

                    {pageData.formSettings.autoReply && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-accent-silver mb-2">
                          Auto Reply Message
                        </label>
                        <textarea
                          value={pageData.formSettings.autoReplyMessage}
                          onChange={(e) => setPageData(prev => prev ? ({
                            ...prev,
                            formSettings: { ...prev.formSettings, autoReplyMessage: e.target.value }
                          }) : null)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Page Info</h3>
            <div className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-accent-silver">Status</dt>
                <dd className="mt-1">{getStatusBadge(pageData.status)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-accent-silver">Views</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{pageData.views.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-accent-silver">Last Modified</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(pageData.lastModified).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-accent-silver">Modified By</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{pageData.lastModifiedBy.name}</dd>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}