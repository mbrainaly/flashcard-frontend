'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  SparklesIcon,
  EyeIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import Link from 'next/link'

interface Feature {
  id: string
  title: string
  description: string
  icon: string
  category: string
  isPremium: boolean
  order: number
}

interface FeaturesPageData {
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
  features: Feature[]
  categories: string[]
}

export default function FeaturesPage() {
  const { hasPermission } = useAdminAuth()
  const [pageData, setPageData] = useState<FeaturesPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'features' | 'seo' | 'settings'>('content')

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true)
        const mockData: FeaturesPageData = {
          _id: '5',
          title: 'Features',
          slug: 'features',
          content: `# FlashCard App Features

Discover the powerful features that make FlashCard App the ultimate learning companion for students, professionals, and lifelong learners.

## Core Learning Features

### Smart Spaced Repetition
Our scientifically-proven spaced repetition algorithm ensures you review cards at optimal intervals for maximum retention.

### Active Recall Testing
Transform passive reading into active learning with our interactive flashcard system designed to strengthen memory pathways.

### Progress Tracking
Monitor your learning journey with detailed analytics and progress reports that show your improvement over time.

## Advanced Study Tools

### AI-Powered Content Generation
Let our AI help you create comprehensive flashcards from your notes, textbooks, or any learning material.

### Multimedia Support
Enhance your learning with images, audio, and rich text formatting in your flashcards.

### Collaborative Learning
Share decks with classmates, join study groups, and learn together with our collaborative features.

## Productivity Features

### Offline Access
Study anywhere, anytime with full offline support for all your flashcard decks.

### Cross-Platform Sync
Seamlessly sync your progress across all devices - mobile, tablet, and desktop.

### Custom Study Sessions
Create personalized study sessions with custom time limits, card counts, and difficulty settings.

## Premium Features

### Advanced Analytics
Get detailed insights into your learning patterns, weak areas, and optimal study times.

### Unlimited Decks
Create unlimited flashcard decks with no restrictions on content or complexity.

### Priority Support
Get fast, personalized support from our learning experts whenever you need help.

Ready to supercharge your learning? [Start your free trial today!](/signup)`,
          status: 'draft',
          lastModified: '2024-01-19T11:20:00Z',
          lastModifiedBy: { name: 'Product Team', email: 'product@flashcardapp.com' },
          seo: {
            title: 'Features | FlashCard App - Powerful Learning Tools',
            description: 'Discover FlashCard App\'s powerful features including spaced repetition, AI content generation, progress tracking, and collaborative learning tools.',
            keywords: ['features', 'spaced repetition', 'flashcards', 'learning tools', 'study app', 'AI learning']
          },
          views: 567,
          features: [
            {
              id: '1',
              title: 'Spaced Repetition',
              description: 'Scientifically-proven algorithm for optimal learning retention',
              icon: '🧠',
              category: 'Core Learning',
              isPremium: false,
              order: 1
            },
            {
              id: '2',
              title: 'AI Content Generation',
              description: 'Automatically generate flashcards from your study materials',
              icon: '🤖',
              category: 'AI Features',
              isPremium: true,
              order: 2
            },
            {
              id: '3',
              title: 'Progress Analytics',
              description: 'Detailed insights into your learning progress and patterns',
              icon: '📊',
              category: 'Analytics',
              isPremium: true,
              order: 3
            },
            {
              id: '4',
              title: 'Offline Access',
              description: 'Study anywhere without internet connection',
              icon: '📱',
              category: 'Productivity',
              isPremium: false,
              order: 4
            },
            {
              id: '5',
              title: 'Collaborative Learning',
              description: 'Share decks and study with friends and classmates',
              icon: '👥',
              category: 'Social',
              isPremium: false,
              order: 5
            }
          ],
          categories: ['Core Learning', 'AI Features', 'Analytics', 'Productivity', 'Social']
        }
        setPageData(mockData)
      } catch (error) {
        console.error('Error fetching features page:', error)
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
      console.log('Updating features page:', pageData)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPageData(prev => prev ? ({ 
        ...prev, 
        lastModified: new Date().toISOString(),
        lastModifiedBy: { name: 'Current Admin', email: 'admin@flashcardapp.com' }
      }) : null)
    } catch (error) {
      console.error('Error updating features page:', error)
    } finally {
      setSaving(false)
    }
  }

  const addFeature = () => {
    if (!pageData) return
    const newFeature: Feature = {
      id: Date.now().toString(),
      title: '',
      description: '',
      icon: '✨',
      category: pageData.categories[0] || 'General',
      isPremium: false,
      order: pageData.features.length + 1
    }
    setPageData(prev => prev ? ({
      ...prev,
      features: [...prev.features, newFeature]
    }) : null)
  }

  const removeFeature = (id: string) => {
    if (!pageData) return
    setPageData(prev => prev ? ({
      ...prev,
      features: prev.features.filter(feature => feature.id !== id)
    }) : null)
  }

  const updateFeature = (id: string, field: keyof Feature, value: any) => {
    if (!pageData) return
    setPageData(prev => prev ? ({
      ...prev,
      features: prev.features.map(feature => 
        feature.id === id ? { ...feature, [field]: value } : feature
      )
    }) : null)
  }

  const getStatusBadge = (status: FeaturesPageData['status']) => {
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
          <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to edit the features page.
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
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Features Page</h1>
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
                  { id: 'features', name: 'Features List', icon: SparklesIcon },
                  { id: 'seo', name: 'SEO', icon: GlobeAltIcon },
                  { id: 'settings', name: 'Settings', icon: CheckCircleIcon }
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
                      placeholder="Enter features page content (Markdown supported)..."
                    />
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Feature List</h3>
                    <button
                      onClick={addFeature}
                      className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add Feature
                    </button>
                  </div>

                  <div className="space-y-4">
                    {pageData.features.map((feature, index) => (
                      <div key={feature.id} className="border border-gray-200 dark:border-accent-silver/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-medium text-gray-900 dark:text-white">
                            Feature #{index + 1}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {feature.isPremium && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300">
                                Premium
                              </span>
                            )}
                            <button
                              onClick={() => removeFeature(feature.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={feature.title}
                              onChange={(e) => updateFeature(feature.id, 'title', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Icon
                            </label>
                            <input
                              type="text"
                              value={feature.icon}
                              onChange={(e) => updateFeature(feature.id, 'icon', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                              placeholder="🚀"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Category
                            </label>
                            <select
                              value={feature.category}
                              onChange={(e) => updateFeature(feature.id, 'category', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                            >
                              {pageData.categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                          </label>
                          <textarea
                            value={feature.description}
                            onChange={(e) => updateFeature(feature.id, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                          />
                        </div>

                        <div className="mt-4 flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={feature.isPremium}
                              onChange={(e) => updateFeature(feature.id, 'isPremium', e.target.checked)}
                              className="rounded border-gray-300 dark:border-accent-silver/20 text-accent-neon focus:ring-accent-neon"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Premium feature</span>
                          </label>
                        </div>
                      </div>
                    ))}
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
                  <span className="text-gray-500 dark:text-accent-silver">Features:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{pageData.features.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Premium Features:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {pageData.features.filter(f => f.isPremium).length}
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
                  onClick={addFeature}
                  className="w-full px-4 py-2 border border-accent-silver/30 text-accent-silver/80 rounded-lg hover:bg-accent-silver/10 hover:text-white transition-colors"
                >
                  Add Feature
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
