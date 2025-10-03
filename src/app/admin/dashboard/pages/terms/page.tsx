'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  EyeIcon,
  GlobeAltIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ScaleIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import Link from 'next/link'

interface TermsPageData {
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
  jurisdiction: string
  governingLaw: string
}

export default function TermsOfServicePage() {
  const { hasPermission } = useAdminAuth()
  const [pageData, setPageData] = useState<TermsPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content')
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true)
        // Mock data for now
        const mockData: TermsPageData = {
          _id: '2',
          title: 'Terms of Service',
          slug: 'terms',
          content: `# Terms of Service

## Acceptance of Terms

By accessing and using FlashCard App, you accept and agree to be bound by the terms and provision of this agreement.

## Description of Service

FlashCard App is a digital learning platform that provides flashcard creation, study tools, and spaced repetition algorithms to enhance learning and memory retention.

## User Accounts

### Account Creation
- You must provide accurate and complete information when creating an account
- You are responsible for maintaining the confidentiality of your account credentials
- You must notify us immediately of any unauthorized use of your account

### Account Responsibilities
- You are solely responsible for all activities that occur under your account
- You must not share your account with others
- You must keep your contact information up to date

## Acceptable Use Policy

You agree not to use the service to:
- Violate any applicable laws or regulations
- Infringe on intellectual property rights
- Upload malicious content or spam
- Attempt to gain unauthorized access to our systems
- Interfere with the proper functioning of the service

## Subscription and Payment Terms

### Premium Subscriptions
- Subscription fees are billed in advance on a monthly or annual basis
- All fees are non-refundable except as required by law
- We reserve the right to change subscription prices with 30 days notice

### Free Trial
- Free trials are available for new users only
- Trials automatically convert to paid subscriptions unless cancelled
- You may cancel your trial at any time before it expires

## Intellectual Property Rights

### Your Content
- You retain ownership of the content you create using our service
- You grant us a license to use your content to provide and improve our service
- You are responsible for ensuring you have the right to use any content you upload

### Our Content
- FlashCard App and its original content are protected by copyright and other intellectual property laws
- You may not reproduce, distribute, or create derivative works without permission

## Privacy and Data Protection

Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.

## Service Availability

### Uptime
- We strive to maintain high service availability but do not guarantee 100% uptime
- Scheduled maintenance will be announced in advance when possible
- We are not liable for service interruptions beyond our control

### Service Changes
- We reserve the right to modify or discontinue features with reasonable notice
- We will provide migration tools when possible for discontinued features

## Limitation of Liability

To the maximum extent permitted by law:
- Our liability is limited to the amount you paid for the service in the past 12 months
- We are not liable for indirect, incidental, or consequential damages
- Some jurisdictions do not allow liability limitations, so these may not apply to you

## Indemnification

You agree to indemnify and hold harmless FlashCard App from any claims, damages, or expenses arising from your use of the service or violation of these terms.

## Termination

### By You
- You may terminate your account at any time through your account settings
- Upon termination, your access to the service will cease immediately
- You may request deletion of your data in accordance with our Privacy Policy

### By Us
- We may terminate accounts that violate these terms
- We will provide reasonable notice except in cases of serious violations
- Upon termination, all rights and licenses granted to you will cease

## Dispute Resolution

### Governing Law
These terms are governed by the laws of [Jurisdiction], without regard to conflict of law principles.

### Arbitration
Any disputes will be resolved through binding arbitration in accordance with the rules of [Arbitration Organization].

## Changes to Terms

We may update these terms from time to time. We will notify you of significant changes by email or through our service. Continued use after changes constitutes acceptance of the new terms.

## Contact Information

If you have questions about these Terms of Service, please contact us at:
- Email: legal@flashcardapp.com
- Address: [Company Address]

Last updated: January 12, 2024`,
          status: 'published',
          lastModified: '2024-01-12T14:20:00Z',
          lastModifiedBy: { name: 'Legal Team', email: 'legal@flashcardapp.com' },
          seo: {
            title: 'Terms of Service | FlashCard App',
            description: 'Read our terms and conditions for using FlashCard App services, including user responsibilities, payment terms, and legal agreements.',
            keywords: ['terms of service', 'user agreement', 'legal terms', 'conditions', 'subscription terms']
          },
          views: 892,
          version: '3.0',
          effectiveDate: '2024-01-12',
          jurisdiction: 'Delaware, USA',
          governingLaw: 'Delaware State Law'
        }
        setPageData(mockData)
      } catch (error) {
        console.error('Error fetching terms of service:', error)
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
      // Here you would make the API call to update the terms of service
      console.log('Updating terms of service:', pageData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update the lastModified timestamp
      setPageData(prev => prev ? ({ 
        ...prev, 
        lastModified: new Date().toISOString(),
        lastModifiedBy: { name: 'Current Admin', email: 'admin@flashcardapp.com' }
      }) : null)
    } catch (error) {
      console.error('Error updating terms of service:', error)
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (status: TermsPageData['status']) => {
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
          <ScaleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to edit the terms of service.
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
            The terms of service page could not be loaded.
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
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <ScaleIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
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
                  { id: 'settings', name: 'Legal Settings', icon: ScaleIcon }
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
                      placeholder="Enter terms of service content (Markdown supported)..."
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
                      placeholder="terms, conditions, legal, agreement..."
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Jurisdiction
                      </label>
                      <input
                        type="text"
                        value={pageData.jurisdiction}
                        onChange={(e) => setPageData(prev => prev ? ({ 
                          ...prev, 
                          jurisdiction: e.target.value 
                        }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        placeholder="e.g., Delaware, USA"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Governing Law
                      </label>
                      <input
                        type="text"
                        value={pageData.governingLaw}
                        onChange={(e) => setPageData(prev => prev ? ({ 
                          ...prev, 
                          governingLaw: e.target.value 
                        }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        placeholder="e.g., Delaware State Law"
                      />
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                          Legal Review Required
                        </h4>
                        <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                          Terms of Service must be reviewed by qualified legal counsel before publication. Ensure compliance with applicable laws and regulations in your jurisdiction.
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
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Legal Information</h4>
              <div className="space-y-2 text-sm text-gray-500 dark:text-accent-silver">
                <div>
                  <span className="block">Jurisdiction:</span>
                  <span className="text-gray-900 dark:text-white">
                    {pageData.jurisdiction}
                  </span>
                </div>
                <div>
                  <span className="block">Governing Law:</span>
                  <span className="text-gray-900 dark:text-white">
                    {pageData.governingLaw}
                  </span>
                </div>
                <div>
                  <span className="block">Effective Date:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(pageData.effectiveDate).toLocaleDateString()}
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
