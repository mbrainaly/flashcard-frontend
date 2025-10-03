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
  MapPinIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
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
  const [pageData, setPageData] = useState<ContactPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'contact' | 'seo' | 'settings'>('content')

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true)
        // Mock data for now
        const mockData: ContactPageData = {
          _id: '4',
          title: 'Contact Us',
          slug: 'contact',
          content: `# Contact Us

We'd love to hear from you! Whether you have questions about FlashCard App, need technical support, or want to share feedback, our team is here to help.

## Get in Touch

### Support Team
For technical support, account issues, or general questions about using FlashCard App:
- **Email:** support@flashcardapp.com
- **Response Time:** Within 24 hours

### Sales & Business Inquiries
For enterprise solutions, partnerships, or business-related questions:
- **Email:** sales@flashcardapp.com
- **Phone:** +1 (555) 123-4567

### Press & Media
For press inquiries, media kits, or interview requests:
- **Email:** press@flashcardapp.com

## Office Location

**FlashCard App Headquarters**
123 Learning Street, Suite 456
San Francisco, CA 94105
United States

### Business Hours
- **Monday - Friday:** 9:00 AM - 6:00 PM (PST)
- **Saturday:** 10:00 AM - 4:00 PM (PST)
- **Sunday:** Closed

## Frequently Asked Questions

Before reaching out, you might find the answer to your question in our [FAQ section](/faq) or [Help Center](/help).

## Social Media

Stay connected with us on social media for the latest updates, tips, and community discussions:

- **Twitter:** [@FlashCardApp](https://twitter.com/flashcardapp)
- **LinkedIn:** [FlashCard App](https://linkedin.com/company/flashcardapp)
- **Facebook:** [FlashCard App](https://facebook.com/flashcardapp)

## Feedback & Suggestions

We're always looking to improve FlashCard App. If you have suggestions for new features or improvements, we'd love to hear from you at feedback@flashcardapp.com.

Thank you for choosing FlashCard App for your learning journey!`,
          status: 'published',
          lastModified: '2024-01-10T16:45:00Z',
          lastModifiedBy: { name: 'Support Team', email: 'support@flashcardapp.com' },
          seo: {
            title: 'Contact Us | FlashCard App Support',
            description: 'Get in touch with FlashCard App support team. Find our contact information, office hours, and multiple ways to reach us for help and support.',
            keywords: ['contact', 'support', 'help', 'customer service', 'phone', 'email', 'address']
          },
          views: 3421,
          contactInfo: {
            email: 'support@flashcardapp.com',
            phone: '+1 (555) 123-4567',
            address: {
              street: '123 Learning Street, Suite 456',
              city: 'San Francisco',
              state: 'CA',
              zipCode: '94105',
              country: 'United States'
            },
            businessHours: {
              monday: '9:00 AM - 6:00 PM',
              tuesday: '9:00 AM - 6:00 PM',
              wednesday: '9:00 AM - 6:00 PM',
              thursday: '9:00 AM - 6:00 PM',
              friday: '9:00 AM - 6:00 PM',
              saturday: '10:00 AM - 4:00 PM',
              sunday: 'Closed'
            },
            socialMedia: {
              twitter: 'https://twitter.com/flashcardapp',
              linkedin: 'https://linkedin.com/company/flashcardapp',
              facebook: 'https://facebook.com/flashcardapp',
              instagram: 'https://instagram.com/flashcardapp'
            }
          },
          formSettings: {
            enabled: true,
            emailNotifications: true,
            autoReply: true,
            autoReplyMessage: 'Thank you for contacting FlashCard App! We have received your message and will respond within 24 hours.'
          }
        }
        setPageData(mockData)
      } catch (error) {
        console.error('Error fetching contact page:', error)
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
      console.log('Updating contact page:', pageData)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPageData(prev => prev ? ({ 
        ...prev, 
        lastModified: new Date().toISOString(),
        lastModifiedBy: { name: 'Current Admin', email: 'admin@flashcardapp.com' }
      }) : null)
    } catch (error) {
      console.error('Error updating contact page:', error)
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <PhoneIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to edit the contact page.
          </p>
        </div>
      </div>
    )
  }

  if (loading || !pageData) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-accent-silver/20 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 dark:bg-accent-silver/20 rounded-xl"></div>
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
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <PhoneIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Page</h1>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-sm text-gray-500 dark:text-accent-silver">
                  Last updated: {new Date(pageData.lastModified).toLocaleDateString()}
                </p>
                {getStatusBadge(pageData.status)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-accent-silver/30 text-accent-silver/80 rounded-lg hover:bg-accent-silver/10 hover:text-white transition-colors">
            <EyeIcon className="w-4 h-4 mr-2" />
            Preview
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
                  { id: 'contact', name: 'Contact Info', icon: PhoneIcon },
                  { id: 'seo', name: 'SEO', icon: GlobeAltIcon },
                  { id: 'settings', name: 'Form Settings', icon: EnvelopeIcon }
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
                      rows={20}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent font-mono text-sm"
                      placeholder="Enter contact page content (Markdown supported)..."
                    />
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
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
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          City
                        </label>
                        <input
                          type="text"
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
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          State/Province
                        </label>
                        <input
                          type="text"
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
                      </div>
                    </div>
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
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
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

                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={pageData.formSettings.enabled}
                        onChange={(e) => setPageData(prev => prev ? ({ 
                          ...prev, 
                          formSettings: { ...prev.formSettings, enabled: e.target.checked }
                        }) : null)}
                        className="rounded border-gray-300 dark:border-accent-silver/20 text-accent-neon focus:ring-accent-neon"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable contact form</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={pageData.formSettings.emailNotifications}
                        onChange={(e) => setPageData(prev => prev ? ({ 
                          ...prev, 
                          formSettings: { ...prev.formSettings, emailNotifications: e.target.checked }
                        }) : null)}
                        className="rounded border-gray-300 dark:border-accent-silver/20 text-accent-neon focus:ring-accent-neon"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Email notifications</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={pageData.formSettings.autoReply}
                        onChange={(e) => setPageData(prev => prev ? ({ 
                          ...prev, 
                          formSettings: { ...prev.formSettings, autoReply: e.target.checked }
                        }) : null)}
                        className="rounded border-gray-300 dark:border-accent-silver/20 text-accent-neon focus:ring-accent-neon"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Auto-reply message</span>
                    </label>
                  </div>

                  {pageData.formSettings.autoReply && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Auto-reply Message
                      </label>
                      <textarea
                        value={pageData.formSettings.autoReplyMessage}
                        onChange={(e) => setPageData(prev => prev ? ({ 
                          ...prev, 
                          formSettings: { ...prev.formSettings, autoReplyMessage: e.target.value }
                        }) : null)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      />
                    </div>
                  )}
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
                  <span className="text-gray-500 dark:text-accent-silver">Form Status:</span>
                  <span className={`font-medium ${pageData.formSettings.enabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {pageData.formSettings.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Contact Information</h4>
              <div className="space-y-2 text-sm text-gray-500 dark:text-accent-silver">
                <div className="flex items-center">
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  <span className="text-gray-900 dark:text-white truncate">
                    {pageData.contactInfo.email}
                  </span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  <span className="text-gray-900 dark:text-white">
                    {pageData.contactInfo.phone}
                  </span>
                </div>
                <div className="flex items-start">
                  <MapPinIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-900 dark:text-white">
                    {pageData.contactInfo.address.city}, {pageData.contactInfo.address.state}
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
                  Test Contact Form
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
