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
  const [pageData, setPageData] = useState<AboutPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'team' | 'seo' | 'settings'>('content')
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true)
        // Mock data for now
        const mockData: AboutPageData = {
          _id: '3',
          title: 'About FlashCard App',
          slug: 'about',
          content: `# About FlashCard App

## Our Story

FlashCard App was born from a simple observation: traditional studying methods weren't keeping up with how our brains actually learn. Founded in 2023 by a team of educators, cognitive scientists, and technologists, we set out to create a learning platform that harnesses the power of spaced repetition and active recall.

## Our Mission

We believe that everyone deserves access to effective learning tools. Our mission is to make studying more efficient, engaging, and scientifically-backed, helping millions of learners around the world achieve their educational goals.

## What Makes Us Different

### Science-Based Learning
Our algorithms are built on decades of cognitive science research, implementing proven techniques like spaced repetition and active recall to maximize retention.

### User-Centric Design
Every feature is designed with the learner in mind, from intuitive interfaces to personalized study schedules that adapt to your learning patterns.

### Community-Driven
We believe learning is better together. Our platform fosters collaboration and knowledge sharing among learners worldwide.

## Our Impact

Since our launch, FlashCard App has helped:
- Over 100,000 students improve their study efficiency
- Educators create more engaging learning materials
- Professionals master new skills and advance their careers

## Looking Forward

We're constantly innovating to bring you the latest in learning technology. From AI-powered content generation to advanced analytics, we're committed to staying at the forefront of educational technology.

Join us on our mission to revolutionize learning, one flashcard at a time.`,
          status: 'published',
          lastModified: '2024-01-18T09:15:00Z',
          lastModifiedBy: { name: 'Marketing Team', email: 'marketing@flashcardapp.com' },
          seo: {
            title: 'About Us | FlashCard App - Revolutionizing Learning',
            description: 'Discover the story behind FlashCard App and our mission to improve learning through science-backed study methods and innovative technology.',
            keywords: ['about us', 'company story', 'mission', 'learning technology', 'education', 'spaced repetition']
          },
          views: 2156,
          sections: [
            {
              id: '1',
              title: 'Our Story',
              content: 'The founding story of FlashCard App...',
              order: 1
            },
            {
              id: '2',
              title: 'Our Mission',
              content: 'Our mission and values...',
              order: 2
            },
            {
              id: '3',
              title: 'What Makes Us Different',
              content: 'Our unique approach to learning...',
              order: 3
            }
          ],
          teamMembers: [
            {
              id: '1',
              name: 'Sarah Chen',
              role: 'CEO & Co-Founder',
              bio: 'Former educator with 10+ years of experience in cognitive science and learning technology.',
              socialLinks: {
                linkedin: 'https://linkedin.com/in/sarahchen',
                twitter: 'https://twitter.com/sarahchen'
              }
            },
            {
              id: '2',
              name: 'Michael Rodriguez',
              role: 'CTO & Co-Founder',
              bio: 'Software engineer passionate about using technology to improve education and learning outcomes.',
              socialLinks: {
                linkedin: 'https://linkedin.com/in/michaelrodriguez',
                github: 'https://github.com/michaelrodriguez'
              }
            },
            {
              id: '3',
              name: 'Dr. Emily Watson',
              role: 'Head of Learning Science',
              bio: 'PhD in Cognitive Psychology with expertise in memory, learning, and educational technology.',
              socialLinks: {
                linkedin: 'https://linkedin.com/in/emilywatson'
              }
            },
            {
              id: '4',
              name: 'David Kim',
              role: 'Head of Product',
              bio: 'Product leader with experience building user-centric educational platforms and learning tools.',
              socialLinks: {
                linkedin: 'https://linkedin.com/in/davidkim',
                twitter: 'https://twitter.com/davidkim'
              }
            }
          ],
          companyInfo: {
            founded: '2023',
            mission: 'To make studying more efficient, engaging, and scientifically-backed for learners worldwide.',
            vision: 'A world where everyone has access to personalized, effective learning tools.',
            values: [
              'Evidence-based learning',
              'User-centric design',
              'Accessibility for all',
              'Continuous innovation',
              'Community collaboration'
            ]
          }
        }
        setPageData(mockData)
      } catch (error) {
        console.error('Error fetching about page:', error)
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
      // Here you would make the API call to update the about page
      console.log('Updating about page:', pageData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update the lastModified timestamp
      setPageData(prev => prev ? ({ 
        ...prev, 
        lastModified: new Date().toISOString(),
        lastModifiedBy: { name: 'Current Admin', email: 'admin@flashcardapp.com' }
      }) : null)
    } catch (error) {
      console.error('Error updating about page:', error)
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
                      placeholder="Enter about page content (Markdown supported)..."
                    />
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
