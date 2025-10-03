'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Cog6ToothIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

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
  lastModified: string
  lastModifiedBy: {
    name: string
    email: string
  }
}

export default function AdminSettingsPage() {
  const { hasPermission } = useAdminAuth()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general'>('general')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        // Mock data for now
        const mockSettings: SystemSettings = {
          _id: 'system-settings',
          general: {
            siteName: 'FlashCard App',
            siteUrl: 'https://flashcardapp.com',
            adminEmail: 'admin@flashcardapp.com',
            timezone: 'America/Los_Angeles',
            dateFormat: 'MM/DD/YYYY',
            language: 'en',
            maintenanceMode: false,
            registrationEnabled: true,
            emailVerificationRequired: true
          },
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            newUserRegistration: true,
            paymentAlerts: true,
            systemAlerts: true,
            securityAlerts: true
          },
          security: {
            sessionTimeout: 1440, // 24 hours in minutes
            maxLoginAttempts: 5,
            passwordMinLength: 8,
            requireStrongPasswords: true,
            twoFactorRequired: false,
            ipWhitelist: [],
            allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'],
            maxFileSize: 10 // MB
          },
          email: {
            provider: 'smtp',
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            smtpUsername: 'noreply@flashcardapp.com',
            smtpPassword: '••••••••',
            fromEmail: 'noreply@flashcardapp.com',
            fromName: 'FlashCard App',
            encryption: 'tls'
          },
          storage: {
            provider: 'aws',
            awsAccessKey: 'AKIA••••••••••••••••',
            awsSecretKey: '••••••••••••••••••••••••••••••••••••••••',
            awsBucket: 'flashcard-app-storage',
            awsRegion: 'us-west-2',
            maxStorageSize: 1000, // GB
            compressionEnabled: true
          },
          analytics: {
            googleAnalyticsEnabled: true,
            googleAnalyticsId: 'GA-XXXXXXXXX',
            hotjarEnabled: false,
            hotjarId: '',
            customAnalytics: false
          },
          backup: {
            enabled: true,
            frequency: 'daily',
            retention: 30, // days
            location: 'aws-s3',
            lastBackup: new Date().toISOString()
          },
          performance: {
            cacheEnabled: true,
            cacheTtl: 3600, // seconds
            compressionEnabled: true,
            cdnEnabled: true,
            cdnUrl: 'https://cdn.flashcardapp.com'
          },
          lastModified: new Date().toISOString(),
          lastModifiedBy: {
            name: 'System Administrator',
            email: 'admin@flashcardapp.com'
          }
        }
        setSettings(mockSettings)
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)

    try {
      // Here you would make the API call to update settings
      console.log('Updating settings:', settings)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSettings(prev => prev ? ({
        ...prev,
        lastModified: new Date().toISOString(),
        lastModifiedBy: {
          name: 'Current Admin',
          email: 'admin@flashcardapp.com'
        }
      }) : null)
    } catch (error) {
      console.error('Error updating settings:', error)
    } finally {
      setSaving(false)
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

  if (loading || !settings) {
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            Configure system-wide settings and preferences
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

      {/* Settings Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
      >
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    />
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
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={settings.general.adminEmail}
                      onChange={(e) => setSettings(prev => prev ? ({
                        ...prev,
                        general: { ...prev.general, adminEmail: e.target.value }
                      }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => setSettings(prev => prev ? ({
                        ...prev,
                        general: { ...prev.general, timezone: e.target.value }
                      }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                    >
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.general.maintenanceMode}
                      onChange={(e) => setSettings(prev => prev ? ({
                        ...prev,
                        general: { ...prev.general, maintenanceMode: e.target.checked }
                      }) : null)}
                      className="rounded border-gray-300 dark:border-accent-silver/20 text-accent-neon focus:ring-accent-neon"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Maintenance Mode</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.general.registrationEnabled}
                      onChange={(e) => setSettings(prev => prev ? ({
                        ...prev,
                        general: { ...prev.general, registrationEnabled: e.target.checked }
                      }) : null)}
                      className="rounded border-gray-300 dark:border-accent-silver/20 text-accent-neon focus:ring-accent-neon"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Allow User Registration</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.general.emailVerificationRequired}
                      onChange={(e) => setSettings(prev => prev ? ({
                        ...prev,
                        general: { ...prev.general, emailVerificationRequired: e.target.checked }
                      }) : null)}
                      className="rounded border-gray-300 dark:border-accent-silver/20 text-accent-neon focus:ring-accent-neon"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Require Email Verification</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
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
      </motion.div>
    </div>
  )
}
