'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  SparklesIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import Link from 'next/link'

interface Note {
  _id: string
  title: string
  content: string
  summary: string
  author: {
    name: string
    email: string
  }
  source: {
    type: 'pdf' | 'text' | 'url' | 'manual'
    name: string
  }
  category: string
  isActive: boolean
  isPublic: boolean
  wordCount: number
  readingTime: number // in minutes
  generatedAt?: string
  viewCount: number
  downloadCount: number
  createdAt: string
  updatedAt: string
  tags: string[]
}

interface NoteFilters {
  search: string
  category: string
  status: string
  author: string
  dateRange: {
    from: string
    to: string
  }
}

export default function NotesManagementPage() {
  const { hasPermission } = useAdminAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const [filters, setFilters] = useState<NoteFilters>({
    search: '',
    category: '',
    status: '',
    author: '',
    dateRange: {
      from: '',
      to: ''
    }
  })

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API call
        // const response = await fetch('/api/admin/content/notes')
        // const data = await response.json()
        
        // Mock data
        const mockNotes: Note[] = Array.from({ length: 35 }, (_, i) => ({
          _id: `note-${i + 1}`,
          title: `Note ${i + 1}: ${[
            'JavaScript ES6 Features Overview',
            'React Hooks Deep Dive',
            'Python Data Analysis Guide',
            'Machine Learning Fundamentals',
            'Database Design Principles'
          ][i % 5]}`,
          content: `This is a comprehensive note covering ${[
            'modern JavaScript features including arrow functions, destructuring, and async/await patterns',
            'React Hooks including useState, useEffect, useContext, and custom hooks with practical examples',
            'Python libraries for data analysis including pandas, numpy, and matplotlib with code samples',
            'machine learning concepts including supervised learning, unsupervised learning, and neural networks',
            'database design principles including normalization, indexing, and query optimization techniques'
          ][i % 5]}. The content includes detailed explanations, code examples, and best practices for implementation.`,
          summary: `A detailed guide on ${[
            'JavaScript ES6 features and modern development practices',
            'React Hooks and state management patterns',
            'Python data analysis tools and techniques',
            'Machine learning algorithms and applications',
            'Database design and optimization strategies'
          ][i % 5]}.`,
          author: {
            name: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Alex Brown'][i % 5],
            email: ['john@example.com', 'jane@example.com', 'mike@example.com', 'sarah@example.com', 'alex@example.com'][i % 5]
          },
          source: {
            type: ['pdf', 'text', 'url', 'manual'][i % 4] as 'pdf' | 'text' | 'url' | 'manual',
            name: [
              'JavaScript_Guide.pdf',
              'React_Documentation.txt',
              'https://python-guide.org',
              'Manual Entry'
            ][i % 4]
          },
          category: ['Programming', 'Web Development', 'Data Science', 'Machine Learning', 'Database'][i % 5],
          isActive: Math.random() > 0.1,
          isPublic: Math.random() > 0.3,
          wordCount: Math.floor(Math.random() * 2000) + 500,
          readingTime: Math.floor(Math.random() * 15) + 3,
          generatedAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          viewCount: Math.floor(Math.random() * 500) + 10,
          downloadCount: Math.floor(Math.random() * 100) + 5,
          createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          tags: ['study', 'reference', 'tutorial', 'guide', 'documentation'].slice(0, Math.floor(Math.random() * 3) + 1)
        }))
        
        setNotes(mockNotes)
        setFilteredNotes(mockNotes)
      } catch (err) {
        setError('Failed to fetch notes')
        console.error('Error fetching notes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = notes

    if (filters.search) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        note.content.toLowerCase().includes(filters.search.toLowerCase()) ||
        note.summary.toLowerCase().includes(filters.search.toLowerCase()) ||
        note.author.name.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.category) {
      filtered = filtered.filter(note => note.category === filters.category)
    }

    if (filters.source) {
      filtered = filtered.filter(note => note.source.type === filters.source)
    }

    if (filters.status) {
      if (filters.status === 'active') {
        filtered = filtered.filter(note => note.isActive)
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(note => !note.isActive)
      } else if (filters.status === 'public') {
        filtered = filtered.filter(note => note.isPublic)
      } else if (filters.status === 'private') {
        filtered = filtered.filter(note => !note.isPublic)
      } else if (filters.status === 'generated') {
        filtered = filtered.filter(note => note.generatedAt)
      }
    }

    setFilteredNotes(filtered)
    setCurrentPage(1)
  }, [filters, notes])

  const handleNoteAction = (action: string, note: Note) => {
    switch (action) {
      case 'view':
        setSelectedNote(note)
        setShowPreview(true)
        break
      case 'edit':
        // TODO: Implement edit functionality
        console.log('Edit note:', note._id)
        break
      case 'delete':
        if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
          // TODO: Implement delete functionality
          console.log('Delete note:', note._id)
        }
        break
    }
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  // Pagination
  const totalPages = Math.ceil(filteredNotes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedNotes = filteredNotes.slice(startIndex, startIndex + itemsPerPage)

  const getSourceBadge = (source: Note['source']) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    switch (source.type) {
      case 'pdf':
        return `${baseClasses} bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300`
      case 'text':
        return `${baseClasses} bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300`
      case 'url':
        return `${baseClasses} bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300`
      case 'manual':
        return `${baseClasses} bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300`
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300`
    }
  }

  const getStatusBadge = (isActive: boolean, isPublic: boolean) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
          <XCircleIcon className="w-3 h-3 mr-1" />
          Inactive
        </span>
      )
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isPublic 
          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
      }`}>
        <CheckCircleIcon className="w-3 h-3 mr-1" />
        {isPublic ? 'Public' : 'Private'}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-neon"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <BookOpenIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notes Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage AI-generated and manual notes
            </p>
          </div>
        </div>

        {hasPermission('content.write') && (
          <Link href="/admin/dashboard/content/notes/create">
            <button className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors">
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Note
            </button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Notes', 
            value: notes.length, 
            color: 'orange', 
            icon: BookOpenIcon 
          },
          { 
            label: 'AI Generated', 
            value: notes.filter(n => n.generatedAt).length, 
            color: 'purple', 
            icon: SparklesIcon 
          },
          { 
            label: 'Total Views', 
            value: notes.reduce((sum, n) => sum + n.viewCount, 0), 
            color: 'blue', 
            icon: EyeIcon 
          },
          { 
            label: 'Downloads', 
            value: notes.reduce((sum, n) => sum + n.downloadCount, 0), 
            color: 'green', 
            icon: DocumentTextIcon 
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-accent-silver">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-500 rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes by title, content, or author..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-neon focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg font-medium transition-colors ${
              showFilters
                ? 'bg-accent-neon text-black'
                : 'bg-white dark:bg-accent-obsidian text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-accent-silver/10'
            }`}
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-accent-silver/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="Programming">Programming</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Database">Database</option>
                </select>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="generated">AI Generated</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    search: '',
                    category: '',
                    status: '',
                    author: '',
                    dateRange: { from: '', to: '' }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-accent-silver/10 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Notes Table */}
      <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 flex flex-col" style={{ height: '600px' }}>
        <div className="flex flex-col h-full">
          {/* Table Container with Fixed Height */}
          <div className="flex-1 overflow-auto">
            <div className="min-h-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-accent-silver/10">
                <thead className="bg-gray-50 dark:bg-accent-silver/5 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Note
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Analytics
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Created
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-accent-obsidian divide-y divide-gray-200 dark:divide-accent-silver/10">
                  {paginatedNotes.map((note, index) => (
                    <motion.tr
                      key={note._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-accent-silver/5 transition-colors"
                    >
                      {/* Note Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                              <BookOpenIcon className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {note.title}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-accent-neon to-accent-gold flex items-center justify-center">
                              <span className="text-xs font-medium text-black">
                                {note.author.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {note.author.name}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500 dark:text-accent-silver">
                                {note.category}
                              </span>
                              {note.generatedAt && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">
                                  <SparklesIcon className="w-3 h-3 mr-1" />
                                  AI
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>


                      {/* Analytics */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center space-x-3 mb-1">
                            <div className="flex items-center">
                              <EyeIcon className="w-3 h-3 text-gray-400 mr-1" />
                              <span className="text-xs">{note.viewCount}</span>
                            </div>
                            <div className="flex items-center">
                              <DocumentTextIcon className="w-3 h-3 text-gray-400 mr-1" />
                              <span className="text-xs">{note.downloadCount}</span>
                            </div>
                          </div>
                          {note.tags.length > 0 && (
                            <div className="flex items-center">
                              <TagIcon className="w-3 h-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500 dark:text-accent-silver/70">
                                {note.tags.slice(0, 2).join(', ')}
                                {note.tags.length > 2 && '...'}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(note.isActive, note.isPublic)}
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500 dark:text-accent-silver">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {formatDate(note.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleNoteAction('view', note)}
                            className="text-gray-400 hover:text-accent-neon transition-colors"
                            title="Preview note"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          
                          {hasPermission('content.write') && (
                            <button
                              onClick={() => handleNoteAction('edit', note)}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit note"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                          )}
                          
                          {hasPermission('content.delete') && (
                            <button
                              onClick={() => handleNoteAction('delete', note)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete note"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Pagination - Fixed at bottom */}
          {filteredNotes.length > 0 && (
            <div className="flex-shrink-0 bg-white dark:bg-accent-obsidian px-4 py-4 border-t border-gray-200 dark:border-accent-silver/10">
              {/* Desktop Pagination */}
              <div className="flex items-center justify-between">
                {/* Left side - Items per page and info */}
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="text-sm border border-gray-300 dark:border-accent-silver/20 rounded-md bg-white dark:bg-accent-obsidian text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon px-3 py-1"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-700 dark:text-gray-300">entries</span>
                  </div>
                  
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing{' '}
                    <span className="font-medium">
                      {Math.min((currentPage - 1) * itemsPerPage + 1, filteredNotes.length)}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredNotes.length)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{filteredNotes.length}</span>{' '}
                    results
                  </div>
                </div>

                {/* Right side - Page navigation */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  {totalPages > 1 && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-accent-silver/20 bg-white dark:bg-accent-obsidian text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-accent-silver/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-accent-silver/20 bg-white dark:bg-accent-obsidian text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-accent-silver/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Note Preview Modal */}
      {showPreview && selectedNote && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
              onClick={() => setShowPreview(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block align-bottom bg-white dark:bg-accent-obsidian rounded-xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedNote.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-accent-silver/70 mt-1">
                    {selectedNote.summary}
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-96 overflow-y-auto">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedNote.content}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-accent-silver/10">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-accent-silver/70">
                  <span>{selectedNote.wordCount.toLocaleString()} words</span>
                  <span>•</span>
                  <span>{selectedNote.readingTime}min read</span>
                  <span>•</span>
                  <span>{selectedNote.viewCount} views</span>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedNote.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}
