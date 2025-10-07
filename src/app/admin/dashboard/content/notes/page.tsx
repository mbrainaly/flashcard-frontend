'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import { useDebounce } from '@/hooks/useDebounce'
import { showToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'
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
}

// Skeleton component for loading state
const NotesTableSkeleton = () => (
  <tbody className="bg-white dark:bg-accent-obsidian divide-y divide-gray-200 dark:divide-accent-silver/10">
    {Array.from({ length: 10 }).map((_, index) => (
      <tr key={index} className="animate-pulse">
        {/* Checkbox */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 w-4 bg-accent-silver/10 rounded"></div>
        </td>
        
        {/* Note */}
        <td className="px-6 py-4">
          <div className="space-y-2">
            <div className="h-5 bg-accent-silver/10 rounded w-3/4"></div>
            <div className="h-4 bg-accent-silver/10 rounded w-full"></div>
            <div className="h-4 bg-accent-silver/10 rounded w-5/6"></div>
          </div>
        </td>
        
        {/* Author */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-accent-silver/10 rounded-full"></div>
            <div className="space-y-1">
              <div className="h-4 bg-accent-silver/10 rounded w-24"></div>
              <div className="h-3 bg-accent-silver/10 rounded w-32"></div>
            </div>
          </div>
        </td>
        
        {/* Created */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="space-y-1">
            <div className="h-4 bg-accent-silver/10 rounded w-20"></div>
            <div className="h-3 bg-accent-silver/10 rounded w-16"></div>
          </div>
        </td>
        
        {/* Actions */}
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end space-x-2">
            <div className="h-8 w-8 bg-accent-silver/10 rounded"></div>
            <div className="h-8 w-8 bg-accent-silver/10 rounded"></div>
            <div className="h-8 w-8 bg-accent-silver/10 rounded"></div>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
)

// Stats cards skeleton
const StatsCardsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {Array.from({ length: 2 }).map((_, index) => (
      <div key={index} className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-accent-silver/10 rounded w-20"></div>
            <div className="h-8 bg-accent-silver/10 rounded w-16"></div>
          </div>
          <div className="w-12 h-12 bg-accent-silver/10 rounded-lg"></div>
        </div>
      </div>
    ))}
  </div>
)

// Search and actions skeleton
const SearchSkeleton = () => (
  <div className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10 animate-pulse">
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="flex-1 h-10 bg-accent-silver/10 rounded-lg"></div>
      <div className="h-10 w-32 bg-accent-silver/10 rounded-lg"></div>
    </div>
  </div>
)

// Edit form skeleton
const EditFormSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Title */}
      <div>
        <div className="h-4 bg-accent-silver/10 rounded w-20 mb-2"></div>
        <div className="h-12 bg-accent-silver/10 rounded-lg"></div>
      </div>
      
      {/* Category */}
      <div>
        <div className="h-4 bg-accent-silver/10 rounded w-16 mb-2"></div>
        <div className="h-12 bg-accent-silver/10 rounded-lg"></div>
      </div>
    </div>

    {/* Summary */}
    <div>
      <div className="h-4 bg-accent-silver/10 rounded w-16 mb-2"></div>
      <div className="h-24 bg-accent-silver/10 rounded-lg"></div>
    </div>

    {/* Content */}
    <div>
      <div className="h-4 bg-accent-silver/10 rounded w-14 mb-2"></div>
      <div className="h-64 bg-accent-silver/10 rounded-lg"></div>
    </div>

    {/* Tags */}
    <div>
      <div className="h-4 bg-accent-silver/10 rounded w-32 mb-2"></div>
      <div className="h-12 bg-accent-silver/10 rounded-lg"></div>
    </div>

    {/* Buttons */}
    <div className="flex justify-end space-x-3">
      <div className="h-12 w-20 bg-accent-silver/10 rounded-lg"></div>
      <div className="h-12 w-32 bg-accent-silver/10 rounded-lg"></div>
    </div>
  </div>
)

export default function NotesManagementPage() {
  const { hasPermission } = useAdminAuth()
  const adminApi = useAdminApi()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalNotes, setTotalNotes] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [loadingNoteDetails, setLoadingNoteDetails] = useState(false)
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)

  const [filters, setFilters] = useState<NoteFilters>({
    search: ''
  })

  // Debounce search term
  const debouncedSearchTerm = useDebounce(filters.search, 500)

  const fetchNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      })
      
      // Add search filter to query params
      if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm)

      const response = await adminApi.get(`/api/admin/content/notes?${queryParams.toString()}`)
      
      if (response.success && response.data) {
        setNotes(response.data)
        setTotalNotes(response.pagination?.total || 0)
        setTotalPages(response.pagination?.pages || 0)
      } else {
        throw new Error(response.error || 'Failed to fetch notes')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes')
      console.error('Error fetching notes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [currentPage, itemsPerPage, debouncedSearchTerm])

  const fetchFullNoteForEdit = async (noteId: string) => {
    try {
      // Open modal instantly with loading state
      setSelectedNote(null)
      setShowEditModal(true)
      setLoadingNoteDetails(true)
      
      const response = await adminApi.get(`/api/admin/content/notes/${noteId}`)
      
      if (response.success && response.data) {
        // Backend returns { note: {...}, associatedQuizzes: [...] }
        const { note: fullNote } = response.data
        setSelectedNote(fullNote)
      } else {
        showToast({
          type: 'error',
          title: 'Failed to Load Note',
          message: response.error || 'Failed to load note details for editing.'
        })
        // Close modal on error
        setShowEditModal(false)
      }
    } catch (error) {
      console.error('Error fetching note for edit:', error)
      showToast({
        type: 'error',
        title: 'Failed to Load Note',
        message: 'Failed to load note details for editing.'
      })
      // Close modal on error
      setShowEditModal(false)
    } finally {
      setLoadingNoteDetails(false)
    }
  }

  const handleEditNote = async (noteData: any) => {
    if (!selectedNote) return

    try {
      setEditLoading(true)
      const response = await adminApi.put(`/api/admin/content/notes/${selectedNote._id}`, {
        title: noteData.title,
        summary: noteData.summary,
        content: noteData.content,
        category: noteData.category,
        tags: noteData.tags?.filter(Boolean) || []
      })
      
      if (response.success) {
        showToast({
          type: 'success',
          title: 'Note Updated',
          message: 'Note has been updated successfully.'
        })
        // Refresh the notes list
        fetchNotes()
        // Close modal
        setShowEditModal(false)
        setSelectedNote(null)
        setLoadingNoteDetails(false)
      } else {
        showToast({
          type: 'error',
          title: 'Update Failed',
          message: response.error || 'Failed to update note. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error updating note:', error)
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update note. Please try again.'
      })
    } finally {
      setEditLoading(false)
    }
  }

  const handleNoteAction = async (action: string, note: Note) => {
    switch (action) {
      case 'view':
        // Navigate to note details page
        router.push(`/admin/dashboard/content/notes/${note._id}`)
        break
      case 'edit':
        // Fetch full note details for editing
        await fetchFullNoteForEdit(note._id)
        break
      case 'delete':
        if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
          try {
            const response = await adminApi.delete(`/api/admin/content/notes/${note._id}`)
            if (response.success) {
              showToast({
                type: 'success',
                title: 'Note Deleted',
                message: `"${note.title}" has been deleted successfully.`
              })
              // Refresh the notes list
              fetchNotes()
            } else {
              showToast({
                type: 'error',
                title: 'Delete Failed',
                message: response.error || 'Failed to delete note. Please try again.'
              })
            }
          } catch (error) {
            console.error('Error deleting note:', error)
            showToast({
              type: 'error',
              title: 'Delete Failed',
              message: 'Failed to delete note. Please try again.'
            })
          }
        }
        break
    }
  }

  const handleBulkDelete = async () => {
    if (selectedNotes.length === 0) return

    try {
      setBulkDeleteLoading(true)
      
      // Delete notes one by one (or implement bulk delete endpoint)
      const deletePromises = selectedNotes.map(noteId => 
        adminApi.delete(`/api/admin/content/notes/${noteId}`)
      )
      
      const results = await Promise.all(deletePromises)
      const successCount = results.filter(result => result.success).length
      const failCount = results.length - successCount
      
      if (successCount > 0) {
        showToast({
          type: 'success',
          title: 'Bulk Delete Completed',
          message: `${successCount} note(s) deleted successfully${failCount > 0 ? `, ${failCount} failed` : ''}.`
        })
        // Refresh the notes list
        fetchNotes()
        // Clear selection
        setSelectedNotes([])
      } else {
        showToast({
          type: 'error',
          title: 'Bulk Delete Failed',
          message: 'Failed to delete any notes. Please try again.'
        })
      }
      
      // Close modal
      setShowBulkDeleteModal(false)
    } catch (error) {
      console.error('Error in bulk delete:', error)
      showToast({
        type: 'error',
        title: 'Bulk Delete Failed',
        message: 'Failed to delete notes. Please try again.'
      })
    } finally {
      setBulkDeleteLoading(false)
    }
  }

  const handleSelectNote = (noteId: string) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    )
  }

  const handleSelectAll = () => {
    if (selectedNotes.length === notes.length) {
      setSelectedNotes([])
    } else {
      setSelectedNotes(notes.map(note => note._id))
    }
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  // Pagination is now handled server-side
  const paginatedNotes = notes


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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

        {/* Create button removed as requested */}
      </div>

      {/* Stats Cards */}
      {loading ? (
        <StatsCardsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              label: 'Total Notes',
              value: totalNotes,
              color: 'orange',
              icon: BookOpenIcon
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
      )}

      {/* Search and Bulk Actions */}
      {loading ? (
        <SearchSkeleton />
      ) : (
        <div className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
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

            {/* Bulk Delete Button */}
            {selectedNotes.length > 0 && (
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                <TrashIcon className="w-5 h-5 mr-2" />
                Delete Selected ({selectedNotes.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notes Table */}
      <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 flex flex-col" style={{ height: '600px' }}>
        <div className="flex flex-col h-full">
          {/* Table Container with Fixed Height */}
          <div className="flex-1 overflow-auto">
            <div className="min-h-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-accent-silver/10">
                <thead className="bg-gray-50 dark:bg-accent-silver/5 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedNotes.length === notes.length && notes.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-accent-neon focus:ring-accent-neon border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Note
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                      Created
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                {loading ? (
                  <NotesTableSkeleton />
                ) : (
                  <tbody className="bg-white dark:bg-accent-obsidian divide-y divide-gray-200 dark:divide-accent-silver/10">
                    {paginatedNotes.map((note, index) => (
                    <motion.tr
                      key={note._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-accent-silver/5 transition-colors"
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedNotes.includes(note._id)}
                          onChange={() => handleSelectNote(note._id)}
                          className="h-4 w-4 text-accent-neon focus:ring-accent-neon border-gray-300 rounded"
                        />
                      </td>

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
                )}
              </table>
            </div>
          </div>

          {/* Enhanced Pagination - Fixed at bottom */}
          {totalNotes > 0 && (
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
                      {Math.min((currentPage - 1) * itemsPerPage + 1, totalNotes)}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalNotes)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{totalNotes}</span>{' '}
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

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => setShowBulkDeleteModal(false)} />
            
            <div className="inline-block transform overflow-hidden rounded-xl bg-gradient-to-br from-accent-obsidian to-accent-obsidian/95 shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:align-middle border border-accent-silver/20">
              <div className="bg-gradient-to-r from-accent-obsidian to-accent-obsidian/90 px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <TrashIcon className="w-6 h-6 mr-2 text-red-400" />
                    Confirm Bulk Delete
                  </h3>
                  <button
                    onClick={() => setShowBulkDeleteModal(false)}
                    className="text-accent-silver hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-accent-silver/80 mb-4">
                    Are you sure you want to delete <span className="font-semibold text-white">{selectedNotes.length}</span> selected note(s)?
                  </p>
                  <p className="text-sm text-red-400">
                    This action cannot be undone. All associated quizzes will also be deleted.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowBulkDeleteModal(false)}
                    className="px-6 py-3 border border-accent-silver/30 text-accent-silver/80 hover:bg-accent-silver/10 hover:text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkDeleteLoading}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {bulkDeleteLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <TrashIcon className="w-4 h-4" />
                        <span>Delete {selectedNotes.length} Note(s)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity" onClick={() => {
              setShowEditModal(false)
              setSelectedNote(null)
              setLoadingNoteDetails(false)
            }} />
            
            <div className="inline-block transform overflow-hidden rounded-xl bg-gradient-to-br from-accent-obsidian to-accent-obsidian/95 shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle border border-accent-silver/20">
              <div className="bg-gradient-to-r from-accent-obsidian to-accent-obsidian/90 px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <PencilIcon className="w-6 h-6 mr-2 text-accent-neon" />
                    Edit Note
                  </h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedNote(null)
                      setLoadingNoteDetails(false)
                    }}
                    className="text-accent-silver hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Loading state while fetching full note details */}
                {loadingNoteDetails || !selectedNote ? (
                  <EditFormSkeleton />
                ) : (

                <form onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  await handleEditNote({
                    title: formData.get('title'),
                    summary: formData.get('summary'),
                    content: formData.get('content'),
                    category: formData.get('category'),
                    tags: formData.get('tags') ? formData.get('tags').toString().split(',').map(t => t.trim()) : []
                  })
                }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Note Title
                      </label>
                      <input
                        name="title"
                        type="text"
                        defaultValue={selectedNote.title}
                        className="w-full px-4 py-3 border border-accent-silver/20 rounded-lg bg-accent-silver/5 text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all"
                        placeholder="Enter note title"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        defaultValue={selectedNote.category}
                        className="w-full px-4 py-3 border border-accent-silver/20 rounded-lg bg-accent-silver/5 text-white focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all"
                      >
                        <option value="General" className="bg-accent-obsidian text-white">General</option>
                        <option value="Programming" className="bg-accent-obsidian text-white">Programming</option>
                        <option value="Web Development" className="bg-accent-obsidian text-white">Web Development</option>
                        <option value="Data Science" className="bg-accent-obsidian text-white">Data Science</option>
                        <option value="Machine Learning" className="bg-accent-obsidian text-white">Machine Learning</option>
                        <option value="Database" className="bg-accent-obsidian text-white">Database</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Summary
                    </label>
                    <textarea
                      name="summary"
                      defaultValue={selectedNote.summary}
                      rows={2}
                      className="w-full px-4 py-3 border border-accent-silver/20 rounded-lg bg-accent-silver/5 text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all resize-none"
                      placeholder="Enter a brief summary"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Content
                    </label>
                    <textarea
                      name="content"
                      defaultValue={selectedNote.content}
                      rows={8}
                      className="w-full px-4 py-3 border border-accent-silver/20 rounded-lg bg-accent-silver/5 text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all resize-none"
                      placeholder="Enter note content"
                      required
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      name="tags"
                      type="text"
                      defaultValue={selectedNote.tags?.join(', ') || ''}
                      className="w-full px-4 py-3 border border-accent-silver/20 rounded-lg bg-accent-silver/5 text-white placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-all"
                      placeholder="Enter tags separated by commas"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false)
                        setSelectedNote(null)
                        setLoadingNoteDetails(false)
                      }}
                      className="px-6 py-3 border border-accent-silver/30 text-accent-silver/80 hover:bg-accent-silver/10 hover:text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="px-6 py-3 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {editLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
