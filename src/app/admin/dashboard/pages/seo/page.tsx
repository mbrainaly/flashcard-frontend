'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  Cog6ToothIcon,
  EyeIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import Link from 'next/link'

interface SEOSettings {
  _id: string
  siteName: string
  siteDescription: string
  defaultTitle: string
  titleSeparator: string
  defaultKeywords: string[]
  ogImage: string
  twitterHandle: string
  googleAnalyticsId: string
  googleSearchConsoleId: string
  bingWebmasterToolsId: string
  robotsTxt: string
  sitemapUrl: string
  canonicalUrl: string
  hreflangSettings: {
    enabled: boolean
    defaultLanguage: string
    languages: {
      code: string
      name: string
      url: string
    }[]
  }
  structuredData: {
    organization: {
      name: string
      url: string
      logo: string
      contactPoint: {
        telephone: string
        contactType: string
      }
    }
    website: {
      name: string
      url: string
      description: string
    }
  }
  lastModified: string
  lastModifiedBy: {
    name: string
    email: string
  }
}

export default function SEOManagementPage() {
  const { hasPermission } = useAdminAuth()
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'analytics' | 'technical'>('general')

  useEffect(() => {
    const fetchSEOSettings = async () => {
      try {
        setLoading(true)
        // Mock data for now
        const mockSettings: SEOSettings = {
          _id: 'seo-settings',
          siteName: 'FlashCard App',
          siteDescription: 'The ultimate flashcard application for effective learning with spaced repetition, AI-powered content generation, and collaborative study tools.',
          defaultTitle: 'FlashCard App - Smart Learning with Spaced Repetition',
          titleSeparator: ' | ',
          defaultKeywords: ['flashcards', 'spaced repetition', 'learning', 'study app', 'memory', 'education'],
          ogImage: '/images/og-default.jpg',
          twitterHandle: '@FlashCardApp',
          googleAnalyticsId: 'GA-XXXXXXXXX',
          googleSearchConsoleId: 'GSC-XXXXXXXXX',
          bingWebmasterToolsId: 'BING-XXXXXXXXX',
          robotsTxt: `User-agent: *
Allow: /

Sitemap: https://flashcardapp.com/sitemap.xml`,
          sitemapUrl: 'https://flashcardapp.com/sitemap.xml',
          canonicalUrl: 'https://flashcardapp.com',
          hreflangSettings: {
            enabled: true,
            defaultLanguage: 'en',
            languages: [
              { code: 'en', name: 'English', url: 'https://flashcardapp.com' },
              { code: 'es', name: 'Spanish', url: 'https://es.flashcardapp.com' },
              { code: 'fr', name: 'French', url: 'https://fr.flashcardapp.com' }
            ]
          },
          structuredData: {
            organization: {
              name: 'FlashCard App',
              url: 'https://flashcardapp.com',
              logo: 'https://flashcardapp.com/logo.png',
              contactPoint: {
                telephone: '+1-555-123-4567',
                contactType: 'customer service'
              }
            },
            website: {
              name: 'FlashCard App',
              url: 'https://flashcardapp.com',
              description: 'Smart learning platform with spaced repetition and AI-powered flashcards'
            }
          },
          lastModified: '2024-01-17T13:30:00Z',
          lastModifiedBy: { name: 'SEO Specialist', email: 'seo@flashcardapp.com' }
        }
        setSeoSettings(mockSettings)
      } catch (error) {
        console.error('Error fetching SEO settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSEOSettings()
  }, [])

  const handleSave = async () => {
    if (!seoSettings) return
    setSaving(true)

    try {
      console.log('Updating SEO settings:', seoSettings)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSeoSettings(prev => prev ? ({ 
        ...prev, 
        lastModified: new Date().toISOString(),
        lastModifiedBy: { name: 'Current Admin', email: 'admin@flashcardapp.com' }
      }) : null)
    } catch (error) {
      console.error('Error updating SEO settings:', error)
    } finally {
      setSaving(false)
    }
  }

  if (!hasPermission('pages.write')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to manage SEO settings.
          </p>
        </div>
      </div>
    )
  }

  if (loading || !seoSettings) {
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
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
              <Cog6ToothIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SEO Management</h1>
              <p className="text-sm text-gray-500 dark:text-accent-silver">
                Last updated: {new Date(seoSettings.lastModified).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <button className="inline-flex items-center px-4 py-2 border border-accent-silver/30 text-accent-silver/80 rounded-lg hover:bg-accent-silver/10 hover:text-white transition-colors">
            <ChartBarIcon className="w-4 h-4 mr-2" />
            SEO Audit
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
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
                  { id: 'general', name: 'General', icon: DocumentTextIcon },
                  { id: 'social', name: 'Social Media', icon: GlobeAltIcon },
                  { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
                  { id: 'technical', name: 'Technical', icon: Cog6ToothIcon }
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
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={seoSettings.siteName}
                      onChange={(e) => setSeoSettings(prev => prev ? ({ ...prev, siteName: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Site Description
                    </label>
                    <textarea
                      value={seoSettings.siteDescription}
                      onChange={(e) => setSeoSettings(prev => prev ? ({ ...prev, siteDescription: e.target.value }) : null)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
                      {seoSettings.siteDescription.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Title
                    </label>
                    <input
                      type="text"
                      value={seoSettings.defaultTitle}
                      onChange={(e) => setSeoSettings(prev => prev ? ({ ...prev, defaultTitle: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={seoSettings.defaultKeywords.join(', ')}
                      onChange={(e) => setSeoSettings(prev => prev ? ({ 
                        ...prev, 
                        defaultKeywords: e.target.value.split(',').map(k => k.trim()) 
                      }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      value={seoSettings.canonicalUrl}
                      onChange={(e) => setSeoSettings(prev => prev ? ({ ...prev, canonicalUrl: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Open Graph Image
                    </label>
                    <input
                      type="url"
                      value={seoSettings.ogImage}
                      onChange={(e) => setSeoSettings(prev => prev ? ({ ...prev, ogImage: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      placeholder="https://example.com/og-image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Twitter Handle
                    </label>
                    <input
                      type="text"
                      value={seoSettings.twitterHandle}
                      onChange={(e) => setSeoSettings(prev => prev ? ({ ...prev, twitterHandle: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      placeholder="@YourHandle"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Organization Schema</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Organization Name
                        </label>
                        <input
                          type="text"
                          value={seoSettings.structuredData.organization.name}
                          onChange={(e) => setSeoSettings(prev => prev ? ({ 
                            ...prev, 
                            structuredData: { 
                              ...prev.structuredData, 
                              organization: { ...prev.structuredData.organization, name: e.target.value }
                            }
                          }) : null)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Organization Logo URL
                        </label>
                        <input
                          type="url"
                          value={seoSettings.structuredData.organization.logo}
                          onChange={(e) => setSeoSettings(prev => prev ? ({ 
                            ...prev, 
                            structuredData: { 
                              ...prev.structuredData, 
                              organization: { ...prev.structuredData.organization, logo: e.target.value }
                            }
                          }) : null)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Google Analytics ID
                    </label>
                    <input
                      type="text"
                      value={seoSettings.googleAnalyticsId}
                      onChange={(e) => setSeoSettings(prev => prev ? ({ ...prev, googleAnalyticsId: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      placeholder="GA-XXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Google Search Console ID
                    </label>
                    <input
                      type="text"
                      value={seoSettings.googleSearchConsoleId}
                      onChange={(e) => setSeoSettings(prev => prev ? ({ ...prev, googleSearchConsoleId: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      placeholder="GSC-XXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bing Webmaster Tools ID
                    </label>
                    <input
                      type="text"
                      value={seoSettings.bingWebmasterToolsId}
                      onChange={(e) => setSeoSettings(prev => prev ? ({ ...prev, bingWebmasterToolsId: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      placeholder="BING-XXXXXXXXX"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'technical' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sitemap URL
                    </label>
                    <input
                      type="url"
                      value={seoSettings.sitemapUrl}
                      onChange={(e) => setSeoSettings(prev => prev ? ({ ...prev, sitemapUrl: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Robots.txt Content
                    </label>
                    <textarea
                      value={seoSettings.robotsTxt}
                      onChange={(e) => setSeoSettings(prev => prev ? ({ ...prev, robotsTxt: e.target.value }) : null)}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent font-mono text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Hreflang Settings</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={seoSettings.hreflangSettings.enabled}
                          onChange={(e) => setSeoSettings(prev => prev ? ({ 
                            ...prev, 
                            hreflangSettings: { ...prev.hreflangSettings, enabled: e.target.checked }
                          }) : null)}
                          className="rounded border-gray-300 dark:border-accent-silver/20 text-accent-neon focus:ring-accent-neon"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable hreflang</span>
                      </label>
                    </div>

                    {seoSettings.hreflangSettings.enabled && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Default Language
                          </label>
                          <select
                            value={seoSettings.hreflangSettings.defaultLanguage}
                            onChange={(e) => setSeoSettings(prev => prev ? ({ 
                              ...prev, 
                              hreflangSettings: { ...prev.hreflangSettings, defaultLanguage: e.target.value }
                            }) : null)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                          >
                            {seoSettings.hreflangSettings.languages.map(lang => (
                              <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                          </select>
                        </div>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6 space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SEO Health</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Site Name:</span>
                  <span className={`font-medium ${seoSettings.siteName ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {seoSettings.siteName ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Description:</span>
                  <span className={`font-medium ${seoSettings.siteDescription ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {seoSettings.siteDescription ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Analytics:</span>
                  <span className={`font-medium ${seoSettings.googleAnalyticsId ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {seoSettings.googleAnalyticsId ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-accent-silver">Sitemap:</span>
                  <span className={`font-medium ${seoSettings.sitemapUrl ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {seoSettings.sitemapUrl ? '✓' : '✗'}
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
                    {new Date(seoSettings.lastModified).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="block">By:</span>
                  <span className="text-gray-900 dark:text-white">
                    {seoSettings.lastModifiedBy.name}
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
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
                <button className="w-full px-4 py-2 border border-accent-silver/30 text-accent-silver/80 rounded-lg hover:bg-accent-silver/10 hover:text-white transition-colors">
                  Run SEO Audit
                </button>
                <button className="w-full px-4 py-2 border border-accent-silver/30 text-accent-silver/80 rounded-lg hover:bg-accent-silver/10 hover:text-white transition-colors">
                  Generate Sitemap
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
