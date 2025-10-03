'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  EyeIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import Link from 'next/link'

interface PrivacyPageData {
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
  version: string
  effectiveDate: string
  sections: {
    id: string
    title: string
    content: string
    order: number
  }[]
}

export default function PrivacyPolicyPage() {
  const { hasPermission } = useAdminAuth()
  const [pageData, setPageData] = useState<PrivacyPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content')
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true)
        // Mock data for now
        const mockData: PrivacyPageData = {
          _id: '1',
          title: 'Privacy Policy',
          slug: 'privacy',
          content: `# Privacy Policy

## Introduction

At FlashCard App, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our flashcard application.

## Information We Collect

### Personal Information
- Name and email address when you create an account
- Profile information you choose to provide
- Payment information for premium subscriptions

### Usage Data
- Study session data and progress
- Flashcard creation and interaction data
- Application usage analytics

### Technical Information
- Device information and operating system
- IP address and location data
- Browser type and version

## How We Use Your Information

We use your information to:
- Provide and improve our flashcard services
- Personalize your learning experience
- Process payments and manage subscriptions
- Send important updates and notifications
- Analyze usage patterns to enhance our application

## Data Sharing and Disclosure

We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
- With your explicit consent
- To comply with legal obligations
- To protect our rights and prevent fraud
- With trusted service providers who assist in our operations

## Data Security

We implement industry-standard security measures to protect your information:
- Encryption of data in transit and at rest
- Regular security audits and updates
- Access controls and authentication
- Secure payment processing

## Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate data
- Delete your account and data
- Export your data
- Opt-out of marketing communications

## Cookies and Tracking

We use cookies and similar technologies to:
- Remember your preferences
- Analyze site usage
- Provide personalized content
- Improve our services

## Children's Privacy

Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any significant changes by email or through our application.

## Contact Us

If you have any questions about this Privacy Policy, please contact us at privacy@flashcardapp.com.

Last updated: January 15, 2024`,
          status: 'published',
          lastModified: '2024-01-15T10:30:00Z',
          lastModifiedBy: { name: 'Legal Team', email: 'legal@flashcardapp.com' },
          seo: {
            title: 'Privacy Policy | FlashCard App',
            description: 'Learn how FlashCard App protects your privacy and handles your personal data in compliance with GDPR and other privacy regulations.',
            keywords: ['privacy policy', 'data protection', 'GDPR', 'personal information', 'data security']
          },
          views: 1247,
          version: '2.1',
          effectiveDate: '2024-01-15',
          sections: [
            { id: '1', title: 'Introduction', content: 'Privacy policy introduction...', order: 1 },
            { id: '2', title: 'Information We Collect', content: 'Data collection details...', order: 2 },
            { id: '3', title: 'How We Use Your Information', content: 'Data usage explanation...', order: 3 },
            { id: '4', title: 'Data Sharing and Disclosure', content: 'Data sharing policies...', order: 4 },
            { id: '5', title: 'Data Security', content: 'Security measures...', order: 5 },
            { id: '6', title: 'Your Rights', content: 'User rights under GDPR...', order: 6 },
            { id: '7', title: 'Contact Us', content: 'Contact information...', order: 7 }
          ]
        }
        setPageData(mockData)
      } catch (error) {
        console.error('Error fetching privacy policy:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPageData()
  }, [])

  const handleSave = async () => {
    if (!pageData) return
    setSaving(true)

    try {
      // Here you would make the API call to update the privacy policy
      console.log('Updating privacy policy:', pageData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update the lastModified timestamp
      setPageData(prev => prev ? ({ 
        ...prev, 
        lastModified: new Date().toISOString(),
        lastModifiedBy: { name: 'Current Admin', email: 'admin@flashcardapp.com' }
      }) : null)
    } catch (error) {
      console.error('Error updating privacy policy:', error)
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (status: PrivacyPageData['status']) => {
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to edit the privacy policy.
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

  if (!pageData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Page Not Found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            The privacy policy page could not be loaded.
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
            href="/admin/dashboard/pages"
            className="p-2 rounded-lg border border-gray-300 dark:border-accent-silver/20 hover:bg-gray-50 dark:hover:bg-accent-silver/10 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-accent-silver" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-sm text-gray-500 dark:text-accent-silver">
                  Version {pageData.version} • Last updated: {new Date(pageData.lastModified).toLocaleDateString()}
                </p>
                {getStatusBadge(pageData.status)}
              </div>
            </div>
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
                  { id: 'settings', name: 'Settings', icon: ShieldCheckIcon }
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content
                    </label>
                    <textarea
                      value={pageData.content}
                      onChange={(e) => setPageData(prev => prev ? ({ ...prev, content: e.target.value }) : null)}
                      rows={25}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent font-mono text-sm"
                      placeholder="Enter privacy policy content (Markdown supported)..."
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
                      value={pageData.seo.title}
                      onChange={(e) => setPageData(prev => prev ? ({ 
                        ...prev, 
                        seo: { ...prev.seo, title: e.target.value }
                      }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
                      {pageData.seo.title.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SEO Description
                    </label>
                    <textarea
                      value={pageData.seo.description}
                      onChange={(e) => setPageData(prev => prev ? ({ 
                        ...prev, 
                        seo: { ...prev.seo, description: e.target.value }
                      }) : null)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
                      {pageData.seo.description.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Keywords
                    </label>
                    <input
                      type="text"
                      value={pageData.seo.keywords.join(', ')}
                      onChange={(e) => setPageData(prev => prev ? ({ 
                        ...prev, 
                        seo: { ...prev.seo, keywords: e.target.value.split(',').map(k => k.trim()) }
                      }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      placeholder="privacy, data protection, GDPR..."
                    />
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={pageData.status}
                        onChange={(e) => setPageData(prev => prev ? ({ 
                          ...prev, 
                          status: e.target.value as any 
                        }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      >
                        <option value="draft">Draft</option>
                        <option value="review">Under Review</option>
                        <option value="published">Published</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Version
                      </label>
                      <input
                        type="text"
                        value={pageData.version}
                        onChange={(e) => setPageData(prev => prev ? ({ 
                          ...prev, 
                          version: e.target.value 
                        }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Effective Date
                    </label>
                    <input
                      type="date"
                      value={pageData.effectiveDate}
                      onChange={(e) => setPageData(prev => prev ? ({ 
                        ...prev, 
                        effectiveDate: e.target.value 
                      }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Legal Compliance Notice
                        </h4>
                        <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                          Ensure this privacy policy complies with applicable laws (GDPR, CCPA, etc.) and is reviewed by legal counsel before publishing.
                        </p>
                      </div>
                    </div>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Page Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Views:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{pageData.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Word Count:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {pageData.content.split(/\s+/).filter(word => word.length > 0).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Reading Time:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.ceil(pageData.content.split(/\s+/).length / 200)} min
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Last Modified</h4>
              <div className="space-y-2 text-sm text-gray-500 dark:text-accent-silver">
                <div>
                  <span className="block">Date:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(pageData.lastModified).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="block">By:</span>
                  <span className="text-gray-900 dark:text-white">
                    {pageData.lastModifiedBy.name}
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
                <button className="w-full px-4 py-2 border border-accent-silver/30 text-accent-silver/80 rounded-lg hover:bg-accent-silver/10 hover:text-white transition-colors">
                  Export PDF
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
