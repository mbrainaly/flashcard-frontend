'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  InformationCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import Link from 'next/link'

interface AboutPageData {
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
  sections: {
    id: string
    title: string
    content: string
    image?: string
    order: number
  }[]
  teamMembers: {
    id: string
    name: string
    role: string
    bio: string
    image?: string
    socialLinks: {
      linkedin?: string
      twitter?: string
      github?: string
    }
  }[]
  companyInfo: {
    founded: string
    mission: string
    vision: string
    values: string[]
  }
}

export default function AboutPage() {
  const { hasPermission } = useAdminAuth()
  const { get, put } = useAdminApi()
  const [pageData, setPageData] = useState<AboutPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'content' | 'team' | 'seo' | 'settings'>('content')

  // Image upload helper function
  const uploadSectionImage = async (file: File, sectionId: string) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/pages/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload image')
      }
      
      const result = await response.json()
      const imageUrl = result.data.url
      
      console.log(`Uploaded ${sectionId} image:`, imageUrl)
      
      // Update sections with S3 URL
      const newSections = pageData?.sections || []
      const sectionIndex = newSections.findIndex(s => s.id === sectionId)
      if (sectionIndex >= 0) {
        newSections[sectionIndex] = { ...newSections[sectionIndex], image: imageUrl }
        console.log(`Updated existing section ${sectionId}:`, newSections[sectionIndex])
      } else {
        const order = sectionId === 'hero' ? 1 : sectionId === 'mission' ? 2 : sectionId === 'values' ? 3 : 4
        const newSection = { id: sectionId, title: '', content: '', image: imageUrl, order, _id: '' }
        newSections.push(newSection)
        console.log(`Created new section ${sectionId}:`, newSection)
      }
      setPageData(prev => prev ? ({ ...prev, sections: newSections }) : null)
      console.log('Updated pageData.sections:', newSections)
      
      return imageUrl
    } catch (error) {
      console.error(`Error uploading ${sectionId} image:`, error)
      alert('Failed to upload image. Please try again.')
      throw error
    }
  }
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await get('/api/admin/pages/about')
        
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

      console.log('Saving pageData.sections:', JSON.stringify(pageData.sections, null, 2))
      
      const response = await put('/api/admin/pages/about', {
        title: pageData.title,
        content: pageData.content,
        seo: pageData.seo,
        sections: pageData.sections,
        teamMembers: pageData.teamMembers,
        companyInfo: pageData.companyInfo,
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


  const getStatusBadge = (status: AboutPageData['status']) => {
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

  const addTeamMember = () => {
    if (!pageData) return
    const newMember = {
      id: Date.now().toString(),
      name: '',
      role: '',
      bio: '',
      socialLinks: {}
    }
    setPageData(prev => prev ? ({
      ...prev,
      teamMembers: [...prev.teamMembers, newMember]
    }) : null)
  }

  const removeTeamMember = (id: string) => {
    if (!pageData) return
    setPageData(prev => prev ? ({
      ...prev,
      teamMembers: prev.teamMembers.filter(member => member.id !== id)
    }) : null)
  }

  const updateTeamMember = (id: string, field: string, value: string) => {
    if (!pageData) return
    setPageData(prev => prev ? ({
      ...prev,
      teamMembers: prev.teamMembers.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      )
    }) : null)
  }

  if (!hasPermission('pages.write')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
            You don't have permission to edit the about page.
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
            The about page could not be loaded.
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
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <InformationCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">About Page</h1>
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

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
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
                  { id: 'team', name: 'Team', icon: UserGroupIcon },
                  { id: 'seo', name: 'SEO', icon: GlobeAltIcon },
                  { id: 'settings', name: 'Settings', icon: InformationCircleIcon }
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
                <div className="space-y-8">
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

                  {/* Hero Section */}
                  <div className="bg-accent-silver/5 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hero Section</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Hero Title
                        </label>
                        <input
                          type="text"
                          value={pageData.sections?.find(s => s.id === 'hero')?.title || ''}
                          onChange={(e) => {
                            const newSections = pageData.sections || []
                            const heroIndex = newSections.findIndex(s => s.id === 'hero')
                            if (heroIndex >= 0) {
                              newSections[heroIndex] = { ...newSections[heroIndex], title: e.target.value }
                            } else {
                              newSections.push({ id: 'hero', title: e.target.value, content: '', order: 1, _id: '' })
                            }
                            setPageData(prev => prev ? ({ ...prev, sections: newSections }) : null)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                          placeholder="Our Story"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Hero Content
                        </label>
                        <textarea
                          value={pageData.sections?.find(s => s.id === 'hero')?.content || ''}
                          onChange={(e) => {
                            const newSections = pageData.sections || []
                            const heroIndex = newSections.findIndex(s => s.id === 'hero')
                            if (heroIndex >= 0) {
                              newSections[heroIndex] = { ...newSections[heroIndex], content: e.target.value }
                            } else {
                              newSections.push({ id: 'hero', title: '', content: e.target.value, order: 1, _id: '' })
                            }
                            setPageData(prev => prev ? ({ ...prev, sections: newSections }) : null)
                          }}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                          placeholder="Brief introduction about your company..."
                        />
                      </div>
                      <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hero Image (Right Side)
                      </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              await uploadSectionImage(file, 'hero')
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        />
                        {pageData.sections?.find(s => s.id === 'hero')?.image && (
                          <div className="mt-2">
                            <img
                              src={pageData.sections.find(s => s.id === 'hero')?.image}
                              alt="Hero preview"
                              className="w-32 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Upload an image for the hero section (displays on the right side)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mission Section */}
                  <div className="bg-accent-silver/5 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mission Section</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Mission Title
                        </label>
                        <input
                          type="text"
                          value={pageData.sections?.find(s => s.id === 'mission')?.title || ''}
                          onChange={(e) => {
                            const newSections = pageData.sections || []
                            const missionIndex = newSections.findIndex(s => s.id === 'mission')
                            if (missionIndex >= 0) {
                              newSections[missionIndex] = { ...newSections[missionIndex], title: e.target.value }
                            } else {
                              newSections.push({ id: 'mission', title: e.target.value, content: '', order: 2, _id: '' })
                            }
                            setPageData(prev => prev ? ({ ...prev, sections: newSections }) : null)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                          placeholder="Transforming education through AI"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Mission Content
                        </label>
                        <textarea
                          value={pageData.sections?.find(s => s.id === 'mission')?.content || ''}
                          onChange={(e) => {
                            const newSections = pageData.sections || []
                            const missionIndex = newSections.findIndex(s => s.id === 'mission')
                            if (missionIndex >= 0) {
                              newSections[missionIndex] = { ...newSections[missionIndex], content: e.target.value }
                            } else {
                              newSections.push({ id: 'mission', title: '', content: e.target.value, order: 2, _id: '' })
                            }
                            setPageData(prev => prev ? ({ ...prev, sections: newSections }) : null)
                          }}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                          placeholder="Detailed mission statement..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Mission Section Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              await uploadSectionImage(file, 'mission')
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        />
                        {pageData.sections?.find(s => s.id === 'mission')?.image && (
                          <div className="mt-2">
                            <img
                              src={pageData.sections.find(s => s.id === 'mission')?.image}
                              alt="Mission preview"
                              className="w-32 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Upload an image for the mission section
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Values Section */}
                  <div className="bg-accent-silver/5 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Our Values</h3>
                      <button
                        onClick={() => {
                          const newValues = [...(pageData.companyInfo?.values || []), { name: '', icon: 'innovation', description: '' }]
                          setPageData(prev => prev ? ({ 
                            ...prev, 
                            companyInfo: { 
                              ...prev.companyInfo, 
                              values: newValues 
                            } 
                          }) : null)
                        }}
                        className="inline-flex items-center px-3 py-1.5 bg-accent-neon hover:bg-accent-neon/90 text-black text-sm font-medium rounded-lg transition-colors"
                      >
                        Add Value
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Values Section Title
                        </label>
                        <input
                          type="text"
                          value={pageData.sections?.find(s => s.id === 'values')?.title || ''}
                          onChange={(e) => {
                            const newSections = pageData.sections || []
                            const valuesIndex = newSections.findIndex(s => s.id === 'values')
                            if (valuesIndex >= 0) {
                              newSections[valuesIndex] = { ...newSections[valuesIndex], title: e.target.value }
                            } else {
                              newSections.push({ id: 'values', title: e.target.value, content: '', order: 3, _id: '' })
                            }
                            setPageData(prev => prev ? ({ ...prev, sections: newSections }) : null)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                          placeholder="What drives us"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Values Description
                        </label>
                        <textarea
                          value={pageData.sections?.find(s => s.id === 'values')?.content || ''}
                          onChange={(e) => {
                            const newSections = pageData.sections || []
                            const valuesIndex = newSections.findIndex(s => s.id === 'values')
                            if (valuesIndex >= 0) {
                              newSections[valuesIndex] = { ...newSections[valuesIndex], content: e.target.value }
                            } else {
                              newSections.push({ id: 'values', title: '', content: e.target.value, order: 3, _id: '' })
                            }
                            setPageData(prev => prev ? ({ ...prev, sections: newSections }) : null)
                          }}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                          placeholder="Our values shape everything we do, from how we build our product to how we interact with our users."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Values Section Background Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              await uploadSectionImage(file, 'values')
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        />
                        {pageData.sections?.find(s => s.id === 'values')?.image && (
                          <div className="mt-2">
                            <img
                              src={pageData.sections.find(s => s.id === 'values')?.image}
                              alt="Values preview"
                              className="w-32 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Upload a background image for the values section
                        </p>
                      </div>

                      {/* Individual Values */}
                      <div className="space-y-4">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white">Individual Values</h4>
                        {(pageData.companyInfo?.values || []).map((value, index) => (
                          <div key={index} className="border border-gray-200 dark:border-accent-silver/20 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-sm font-medium text-gray-900 dark:text-white">Value #{index + 1}</h5>
                              <button
                                onClick={() => {
                                  const newValues = [...(pageData.companyInfo?.values || [])]
                                  newValues.splice(index, 1)
                                  setPageData(prev => prev ? ({ 
                                    ...prev, 
                                    companyInfo: { 
                                      ...prev.companyInfo, 
                                      values: newValues 
                                    } 
                                  }) : null)
                                }}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              >
                                Remove
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Value Name
                                </label>
                                <input
                                  type="text"
                                  value={value.name || ''}
                                  onChange={(e) => {
                                    const newValues = [...(pageData.companyInfo?.values || [])]
                                    newValues[index] = { ...newValues[index], name: e.target.value }
                                    setPageData(prev => prev ? ({ 
                                      ...prev, 
                                      companyInfo: { 
                                        ...prev.companyInfo, 
                                        values: newValues 
                                      } 
                                    }) : null)
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                                  placeholder="Innovation"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Icon
                                </label>
                                <select
                                  value={value.icon || 'innovation'}
                                  onChange={(e) => {
                                    const newValues = [...(pageData.companyInfo?.values || [])]
                                    newValues[index] = { ...newValues[index], icon: e.target.value }
                                    setPageData(prev => prev ? ({ 
                                      ...prev, 
                                      companyInfo: { 
                                        ...prev.companyInfo, 
                                        values: newValues 
                                      } 
                                    }) : null)
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                                >
                                  <option value="innovation">Innovation (Beaker)</option>
                                  <option value="science">Science (Academic Cap)</option>
                                  <option value="user">User Focus (Heart)</option>
                                  <option value="community">Community (User Group)</option>
                                  <option value="excellence">Excellence (Sparkles)</option>
                                  <option value="accessibility">Accessibility (Globe)</option>
                                  <option value="technology">Technology (Rocket)</option>
                                  <option value="learning">Learning (Light Bulb)</option>
                                </select>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                              </label>
                              <textarea
                                value={value.description || ''}
                                onChange={(e) => {
                                  const newValues = [...(pageData.companyInfo?.values || [])]
                                  newValues[index] = { ...newValues[index], description: e.target.value }
                                  setPageData(prev => prev ? ({ 
                                    ...prev, 
                                    companyInfo: { 
                                      ...prev.companyInfo, 
                                      values: newValues 
                                    } 
                                  }) : null)
                                }}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                                placeholder="We embrace cutting-edge technology to create innovative learning experiences..."
                              />
                            </div>
                          </div>
                        ))}
                        
                        {(!pageData.companyInfo?.values || pageData.companyInfo.values.length === 0) && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                            No values added yet. Click "Add Value" to get started.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Looking Forward Section */}
                  <div className="bg-accent-silver/5 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Looking Forward</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Future Vision Title
                        </label>
                        <input
                          type="text"
                          value={pageData.sections?.find(s => s.id === 'future')?.title || ''}
                          onChange={(e) => {
                            const newSections = pageData.sections || []
                            const futureIndex = newSections.findIndex(s => s.id === 'future')
                            if (futureIndex >= 0) {
                              newSections[futureIndex] = { ...newSections[futureIndex], title: e.target.value }
                            } else {
                              newSections.push({ id: 'future', title: e.target.value, content: '', order: 4, _id: '' })
                            }
                            setPageData(prev => prev ? ({ ...prev, sections: newSections }) : null)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                          placeholder="Looking Forward"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Future Vision Content
                        </label>
                        <textarea
                          value={pageData.sections?.find(s => s.id === 'future')?.content || ''}
                          onChange={(e) => {
                            const newSections = pageData.sections || []
                            const futureIndex = newSections.findIndex(s => s.id === 'future')
                            if (futureIndex >= 0) {
                              newSections[futureIndex] = { ...newSections[futureIndex], content: e.target.value }
                            } else {
                              newSections.push({ id: 'future', title: '', content: e.target.value, order: 4, _id: '' })
                            }
                            setPageData(prev => prev ? ({ ...prev, sections: newSections }) : null)
                          }}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                          placeholder="Our future plans and vision..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Future Section Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              await uploadSectionImage(file, 'future')
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        />
                        {pageData.sections?.find(s => s.id === 'future')?.image && (
                          <div className="mt-2">
                            <img
                              src={pageData.sections.find(s => s.id === 'future')?.image}
                              alt="Future preview"
                              className="w-32 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Upload an image for the future vision section
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'team' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
                    <button
                      onClick={addTeamMember}
                      className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
                    >
                      <UserGroupIcon className="w-4 h-4 mr-2" />
                      Add Member
                    </button>
                  </div>

                  <div className="space-y-4">
                    {pageData.teamMembers.map((member, index) => (
                      <div key={member.id} className="border border-gray-200 dark:border-accent-silver/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-medium text-gray-900 dark:text-white">
                            Team Member #{index + 1}
                          </h4>
                          <button
                            onClick={() => removeTeamMember(member.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Role
                            </label>
                            <input
                              type="text"
                              value={member.role}
                              onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Bio
                          </label>
                          <textarea
                            value={member.bio}
                            onChange={(e) => updateTeamMember(member.id, 'bio', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                          />
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
                      placeholder="about us, company, mission, team..."
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

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Company Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Founded Year
                        </label>
                        <input
                          type="text"
                          value={pageData.companyInfo.founded}
                          onChange={(e) => setPageData(prev => prev ? ({ 
                            ...prev, 
                            companyInfo: { ...prev.companyInfo, founded: e.target.value }
                          }) : null)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Mission Statement
                        </label>
                        <textarea
                          value={pageData.companyInfo.mission}
                          onChange={(e) => setPageData(prev => prev ? ({ 
                            ...prev, 
                            companyInfo: { ...prev.companyInfo, mission: e.target.value }
                          }) : null)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Vision Statement
                        </label>
                        <textarea
                          value={pageData.companyInfo.vision}
                          onChange={(e) => setPageData(prev => prev ? ({ 
                            ...prev, 
                            companyInfo: { ...prev.companyInfo, vision: e.target.value }
                          }) : null)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Company Values (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={pageData.companyInfo.values.join(', ')}
                          onChange={(e) => setPageData(prev => prev ? ({ 
                            ...prev, 
                            companyInfo: { 
                              ...prev.companyInfo, 
                              values: e.target.value.split(',').map(v => v.trim()) 
                            }
                          }) : null)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                        />
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
                  <span className="text-gray-500 dark:text-accent-silver">Team Members:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{pageData.teamMembers.length}</span>
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
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Company Info</h4>
              <div className="space-y-2 text-sm text-gray-500 dark:text-accent-silver">
                <div>
                  <span className="block">Founded:</span>
                  <span className="text-gray-900 dark:text-white">
                    {pageData.companyInfo.founded}
                  </span>
                </div>
                <div>
                  <span className="block">Team Size:</span>
                  <span className="text-gray-900 dark:text-white">
                    {pageData.teamMembers.length} members
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
                  Export Team Info
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
