'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  Bars3BottomLeftIcon,
  EyeIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  XMarkIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import Link from 'next/link'

interface FooterLink {
  id: string
  title: string
  url: string
  order: number
}

interface SocialLink {
  id: string
  platform: string
  url: string
  icon: string
  order: number
}

interface FooterData {
  _id: string
  links: FooterLink[]
  socialLinks: SocialLink[]
  bottomText: string
  lastModified: string
  lastModifiedBy: {
    name: string
    email: string
  }
}

export default function FooterManagementPage() {
  const { hasPermission } = useAdminAuth()
  const { get, post, put } = useAdminApi()
  const [footerData, setFooterData] = useState<FooterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'links' | 'social' | 'settings'>('links')

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await get('/api/admin/footer')
        
        if (response.success) {
          setFooterData(response.data)
        } else {
          setError(response.message || 'Failed to fetch footer data')
        }
      } catch (error) {
        console.error('Error fetching footer data:', error)
        setError('Failed to load footer data')
      } finally {
        setLoading(false)
      }
    }

    fetchFooterData()
  }, [get])

  const handleSave = async () => {
    if (!footerData) return

    try {
      setSaving(true)
      setError(null)

      const response = await put('/api/admin/footer', footerData)
      
      if (response.success) {
        setFooterData(response.data)
        // Show success message
        alert('Footer updated successfully!')
      } else {
        setError(response.message || 'Failed to save footer data')
      }
    } catch (error) {
      console.error('Error saving footer data:', error)
      setError('Failed to save footer data')
    } finally {
      setSaving(false)
    }
  }

  const addFooterLink = () => {
    if (!footerData) return

    const newLink: FooterLink = {
      id: `link_${Date.now()}`,
      title: 'New Link',
      url: '',
      order: footerData.links.length
    }

    setFooterData(prev => prev ? {
      ...prev,
      links: [...prev.links, newLink]
    } : null)
  }

  const removeFooterLink = (linkId: string) => {
    if (!footerData) return

    setFooterData(prev => prev ? {
      ...prev,
      links: prev.links.filter(link => link.id !== linkId)
    } : null)
  }

  const updateFooterLink = (linkId: string, field: keyof FooterLink, value: any) => {
    if (!footerData) return

    setFooterData(prev => prev ? {
      ...prev,
      links: prev.links.map(link => 
        link.id === linkId ? { ...link, [field]: value } : link
      )
    } : null)
  }

  const addSocialLink = () => {
    if (!footerData) return

    const newSocialLink: SocialLink = {
      id: `social_${Date.now()}`,
      platform: 'Facebook',
      url: '',
      icon: 'facebook',
      order: footerData.socialLinks.length
    }

    setFooterData(prev => prev ? {
      ...prev,
      socialLinks: [...prev.socialLinks, newSocialLink]
    } : null)
  }

  const removeSocialLink = (socialId: string) => {
    if (!footerData) return

    setFooterData(prev => prev ? {
      ...prev,
      socialLinks: prev.socialLinks.filter(social => social.id !== socialId)
    } : null)
  }

  const updateSocialLink = (socialId: string, field: keyof SocialLink, value: any) => {
    if (!footerData) return

    setFooterData(prev => prev ? {
      ...prev,
      socialLinks: prev.socialLinks.map(social => 
        social.id === socialId ? { ...social, [field]: value } : social
      )
    } : null)
  }

  const updateSocialPlatform = (socialId: string, platform: string) => {
    if (!footerData) return

    // Map platform names to icon names
    const platformToIcon: { [key: string]: string } = {
      'Facebook': 'facebook',
      'Twitter': 'twitter',
      'Instagram': 'instagram',
      'LinkedIn': 'linkedin',
      'YouTube': 'youtube',
      'GitHub': 'github'
    }

    setFooterData(prev => prev ? {
      ...prev,
      socialLinks: prev.socialLinks.map(social => 
        social.id === socialId ? { 
          ...social, 
          platform: platform,
          icon: platformToIcon[platform] || platform.toLowerCase()
        } : social
      )
    } : null)
  }

  if (!hasPermission('pages.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bars3BottomLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to manage footer settings.
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

  if (error || !footerData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error Loading Footer</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            {error || 'Footer data not found'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
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
            href="/admin/dashboard"
            className="p-2 rounded-lg hover:bg-accent-silver/10 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-accent-silver" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent-neon/10 rounded-lg">
                <Bars3BottomLeftIcon className="w-6 h-6 text-accent-neon" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Footer Management</h1>
                <p className="text-sm text-gray-500 dark:text-accent-silver">
                  Manage footer content, links, and social media
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <button
            onClick={() => window.open('/', '_blank')}
            className="inline-flex items-center px-4 py-2 border border-accent-silver/30 text-accent-silver/80 rounded-lg hover:bg-accent-silver/10 hover:text-white transition-colors"
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-accent-silver/10">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'links', name: 'Footer Links', icon: LinkIcon },
              { id: 'social', name: 'Social Media', icon: GlobeAltIcon },
              { id: 'settings', name: 'Copyright', icon: CheckCircleIcon }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-accent-neon text-accent-neon'
                      : 'border-transparent text-gray-500 dark:text-accent-silver hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-accent-silver/30'
                    }
                  `}
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
          {activeTab === 'links' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Footer Links</h3>
                <button
                  onClick={addFooterLink}
                  className="inline-flex items-center px-3 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black text-sm font-medium rounded-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Link
                </button>
              </div>

              <div className="space-y-4">
                {footerData.links.map((link, index) => (
                  <div key={link.id} className="flex items-center space-x-4 p-4 bg-accent-silver/5 rounded-lg">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => updateFooterLink(link.id, 'title', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      placeholder="Link Name (e.g., About Us)"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateFooterLink(link.id, 'url', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      placeholder="https://example.com/about"
                    />
                    <button
                      onClick={() => removeFooterLink(link.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                
                {footerData.links.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-accent-silver">
                    No footer links added yet. Click "Add Link" to get started.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'social' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Social Media Links</h3>
                <button
                  onClick={addSocialLink}
                  className="inline-flex items-center px-3 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black text-sm font-medium rounded-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Social Link
                </button>
              </div>

              <div className="space-y-4">
                {footerData.socialLinks.map((social, index) => (
                  <div key={social.id} className="flex items-center space-x-4 p-4 bg-accent-silver/5 rounded-lg">
                    <select
                      value={social.platform}
                      onChange={(e) => updateSocialPlatform(social.id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    >
                      <option value="Facebook">Facebook</option>
                      <option value="Twitter">Twitter</option>
                      <option value="Instagram">Instagram</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="YouTube">YouTube</option>
                      <option value="GitHub">GitHub</option>
                    </select>
                    
                    <input
                      type="url"
                      value={social.url}
                      onChange={(e) => updateSocialLink(social.id, 'url', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                      placeholder="https://facebook.com/yourpage"
                    />
                    
                    <button
                      onClick={() => removeSocialLink(social.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Copyright Text</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Footer Copyright Text
                  </label>
                  <textarea
                    value={footerData.bottomText}
                    onChange={(e) => setFooterData(prev => prev ? {
                      ...prev,
                      bottomText: e.target.value
                    } : null)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    placeholder="© 2024 Your Company. All rights reserved."
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-accent-silver">
                    This text will appear at the bottom of your website footer.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
