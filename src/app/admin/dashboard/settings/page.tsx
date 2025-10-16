'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Cog6ToothIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'

interface SystemSettings {
  _id: string
  general: {
    siteName: string
    siteUrl: string
    adminEmail: string
    timezone: string
    dateFormat: string
    language: string
    maintenanceMode: boolean
    registrationEnabled: boolean
    emailVerificationRequired: boolean
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    smsNotifications: boolean
    newUserRegistration: boolean
    paymentAlerts: boolean
    systemAlerts: boolean
    securityAlerts: boolean
  }
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
    passwordMinLength: number
    requireStrongPasswords: boolean
    twoFactorRequired: boolean
    ipWhitelist: string[]
    allowedFileTypes: string[]
    maxFileSize: number
  }
  email: {
    provider: string
    smtpHost: string
    smtpPort: number
    smtpUsername: string
    smtpPassword: string
    fromEmail: string
    fromName: string
    encryption: string
  }
  storage: {
    provider: string
    awsAccessKey: string
    awsSecretKey: string
    awsBucket: string
    awsRegion: string
    maxStorageSize: number
    compressionEnabled: boolean
  }
  analytics: {
    googleAnalyticsEnabled: boolean
    googleAnalyticsId: string
    hotjarEnabled: boolean
    hotjarId: string
    customAnalytics: boolean
  }
  backup: {
    enabled: boolean
    frequency: string
    retention: number
    location: string
    lastBackup: string
  }
  performance: {
    cacheEnabled: boolean
    cacheTtl: number
    compressionEnabled: boolean
    cdnEnabled: boolean
    cdnUrl: string
  }
  seo: {
    metaTitle: string
    metaDescription: string
    metaKeywords: string
    ogTitle: string
    ogDescription: string
    ogImage: string
    twitterTitle: string
    twitterDescription: string
    twitterImage: string
    favicon: string
    robotsTxt: string
  }
  lastModified: string
  lastModifiedBy: {
    name: string
    email: string
  }
}

export default function AdminSettingsPage() {
  const { hasPermission, accessToken } = useAdminAuth()
  const { get, put } = useAdminApi()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'seo'>('seo')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await get('/api/admin/settings')
        
        if (response.success) {
          setSettings(response.data)
        } else {
          setError('Failed to fetch system settings')
        }
      } catch (err) {
        console.error('Error fetching settings:', err)
        setError('Failed to load system settings')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    setError(null)

    try {
      const response = await put('/api/admin/settings', settings)
      
      if (response.success) {
        setSettings(response.data)
        // Show success message (you could add a toast notification here)
        console.log('Settings updated successfully')
      } else {
        setError(response.message || 'Failed to update settings')
      }
    } catch (err) {
      console.error('Error updating settings:', err)
      setError('Failed to update system settings')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setSaving(true)
      setError(null)

      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', type)

      if (!accessToken) {
        throw new Error('No authentication token available')
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
      const response = await fetch(`${apiUrl}/api/admin/settings/upload-branding`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
        // Note: Don't set Content-Type header when using FormData, let the browser set it
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        // Update settings with new image URL
        setSettings(prev => prev ? ({
          ...prev,
          seo: {
            ...prev.seo,
            [type === 'logo' ? 'logoUrl' : 'favicon']: result.data.imageUrl
          }
        }) : null)
        console.log(`${type} uploaded successfully`)
      } else {
        setError(result.message || `Failed to upload ${type}`)
      }
    } catch (err) {
      console.error(`Error uploading ${type}:`, err)
      setError(`Failed to upload ${type}`)
    } finally {
      setSaving(false)
      // Reset file input
      event.target.value = ''
    }
  }



  if (!hasPermission('system.write')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to access system settings.
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <div className="text-red-500 text-lg font-medium mb-2">Error Loading Settings</div>
          <div className="text-gray-600 dark:text-accent-silver mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-accent-neon hover:bg-accent-neon/90 text-black font-medium px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="text-gray-500 dark:text-accent-silver text-lg font-medium">No Settings Found</div>
          <div className="text-gray-400 dark:text-accent-silver/70 mt-2">Settings will be created automatically.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Website Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            Configure your website branding and SEO meta tags
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
            <div className="text-red-700 dark:text-red-400 font-medium">Error</div>
          </div>
          <div className="text-red-600 dark:text-red-300 mt-1">{error}</div>
        </div>
      )}

      {/* Settings Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10"
      >
        <div className="p-6">
          {/* SEO & Meta Tags Content */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Website Settings</h3>
              <p className="text-sm text-gray-600 dark:text-accent-silver mb-6">
                Configure your website's branding and basic SEO meta tags.
              </p>
              
              {/* Website Branding */}
              <div className="space-y-6">
                <div className="bg-accent-silver/5 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Website Branding</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={settings.general.siteName}
                        onChange={(e) => setSettings(prev => prev ? ({
                          ...prev,
                          general: { ...prev.general, siteName: e.target.value }
                        }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        placeholder="Your website name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Website Logo
                      </label>
                      <div className="space-y-3">
                        <input
                          type="url"
                          value={settings.seo.logoUrl}
                          onChange={(e) => setSettings(prev => prev ? ({
                            ...prev,
                            seo: { ...prev.seo, logoUrl: e.target.value }
                          }) : null)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                          placeholder="/images/logo.png"
                        />
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-accent-silver/70">or</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'logo')}
                            className="hidden"
                            id="logo-upload"
                          />
                          <label
                            htmlFor="logo-upload"
                            className="inline-flex items-center px-3 py-1.5 bg-gray-100 dark:bg-accent-silver/10 hover:bg-gray-200 dark:hover:bg-accent-silver/20 text-gray-700 dark:text-accent-silver text-sm font-medium rounded-md cursor-pointer transition-colors"
                          >
                            Upload Logo
                          </label>
                        </div>
                        {settings.seo.logoUrl && (
                          <div className="mt-2">
                            <img
                              src={settings.seo.logoUrl}
                              alt="Logo Preview"
                              className="h-12 w-auto object-contain border border-gray-200 dark:border-accent-silver/20 rounded"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Favicon
                      </label>
                      <div className="space-y-3">
                        <input
                          type="url"
                          value={settings.seo.favicon}
                          onChange={(e) => setSettings(prev => prev ? ({
                            ...prev,
                            seo: { ...prev.seo, favicon: e.target.value }
                          }) : null)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                          placeholder="/favicon.ico"
                        />
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-accent-silver/70">or</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'favicon')}
                            className="hidden"
                            id="favicon-upload"
                          />
                          <label
                            htmlFor="favicon-upload"
                            className="inline-flex items-center px-3 py-1.5 bg-gray-100 dark:bg-accent-silver/10 hover:bg-gray-200 dark:hover:bg-accent-silver/20 text-gray-700 dark:text-accent-silver text-sm font-medium rounded-md cursor-pointer transition-colors"
                          >
                            Upload Favicon
                          </label>
                        </div>
                        {settings.seo.favicon && (
                          <div className="mt-2">
                            <img
                              src={settings.seo.favicon}
                              alt="Favicon Preview"
                              className="h-8 w-8 object-contain border border-gray-200 dark:border-accent-silver/20 rounded"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Site URL
                      </label>
                      <input
                        type="url"
                        value={settings.general.siteUrl}
                        onChange={(e) => setSettings(prev => prev ? ({
                          ...prev,
                          general: { ...prev.general, siteUrl: e.target.value }
                        }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Basic Meta Tags */}
                <div className="bg-accent-silver/5 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Basic Meta Tags</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={settings.seo.metaTitle}
                        onChange={(e) => setSettings(prev => prev ? ({
                          ...prev,
                          seo: { ...prev.seo, metaTitle: e.target.value }
                        }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        placeholder="Your site's main title for search engines"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Meta Description
                      </label>
                      <textarea
                        value={settings.seo.metaDescription}
                        onChange={(e) => setSettings(prev => prev ? ({
                          ...prev,
                          seo: { ...prev.seo, metaDescription: e.target.value }
                        }) : null)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        placeholder="Brief description of your site for search results"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        value={settings.seo.metaKeywords}
                        onChange={(e) => setSettings(prev => prev ? ({
                          ...prev,
                          seo: { ...prev.seo, metaKeywords: e.target.value }
                        }) : null)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        placeholder="Comma-separated keywords"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 pb-6">
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-accent-silver/10">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 dark:text-accent-silver">
                Last modified: {new Date(settings.lastModified).toLocaleString()}
              </p>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-6 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save All Settings'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
