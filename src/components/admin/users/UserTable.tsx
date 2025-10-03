'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  UserIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

interface User {
  _id: string
  name: string
  email: string
  role: 'basic' | 'pro' | 'team'
  isActive: boolean
  lastLogin?: string
  createdAt: string
  subscription?: {
    plan: string
    status: 'active' | 'inactive' | 'cancelled'
    expiresAt?: string
  }
  stats: {
    totalDecks: number
    totalCards: number
    studySessions: number
  }
}

interface UserTableProps {
  users: User[]
  onUserAction: (action: string, user: User) => void
  currentPage: number
  totalPages: number
  totalUsers: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
  hasWritePermission: boolean
  hasDeletePermission: boolean
}

export default function UserTable({
  users,
  onUserAction,
  currentPage,
  totalPages,
  totalUsers,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  hasWritePermission,
  hasDeletePermission
}: UserTableProps) {
  const [sortField, setSortField] = useState<keyof User>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return formatDate(dateString)
  }

  const getRoleBadge = (role: string, subscription?: User['subscription']) => {
    // Handle all three subscription plan types
    switch (role) {
      case 'pro':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">
            <StarIcon className="w-3 h-3 mr-1" />
            Pro
          </span>
        )
      case 'team':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
            <UserGroupIcon className="w-3 h-3 mr-1" />
            Team
          </span>
        )
      case 'basic':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
            <UserIcon className="w-3 h-3 mr-1" />
            Basic
          </span>
        )
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    // Ensure we're working with a proper boolean value
    const active = Boolean(isActive)
    
    if (active) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Active
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
        <XCircleIcon className="w-3 h-3 mr-1" />
        Inactive
      </span>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Table Container with Fixed Height */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-0">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-accent-silver/10">
          <thead className="bg-gray-50 dark:bg-accent-silver/5 sticky top-0 z-10">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-accent-silver/10"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>User</span>
                  {sortField === 'name' && (
                    <span className="text-accent-neon">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-accent-silver/10"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center space-x-1">
                  <span>Plan</span>
                  {sortField === 'role' && (
                    <span className="text-accent-neon">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-accent-silver/10"
                onClick={() => handleSort('isActive')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {sortField === 'isActive' && (
                    <span className="text-accent-neon">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider">
                Activity
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-accent-silver uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-accent-silver/10"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center space-x-1">
                  <span>Joined</span>
                  {sortField === 'createdAt' && (
                    <span className="text-accent-neon">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-accent-obsidian divide-y divide-gray-200 dark:divide-accent-silver/10">
            {users.map((user, index) => (
              <motion.tr
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50 dark:hover:bg-accent-silver/5 transition-colors"
              >
                {/* User Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-accent-neon to-accent-gold flex items-center justify-center">
                        <span className="text-sm font-medium text-black">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-accent-silver">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Plan */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.role, user.subscription)}
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user.isActive)}
                </td>

                {/* Activity Stats */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <ChartBarIcon className="w-4 h-4 text-gray-400 mr-1" />
                        <span>{user.stats.totalDecks} decks</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400">•</span>
                        <span className="ml-1">{user.stats.studySessions} sessions</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-accent-silver mt-1">
                      Last login: {formatLastLogin(user.lastLogin)}
                    </div>
                  </div>
                </td>

                {/* Joined Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500 dark:text-accent-silver">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {formatDate(user.createdAt)}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onUserAction('view', user)}
                      className="text-gray-400 hover:text-accent-neon transition-colors"
                      title="View user details"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    
                    {hasWritePermission && (
                      <button
                        onClick={() => onUserAction('edit', user)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit user"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    )}
                    
                    {hasDeletePermission && (
                      <button
                        onClick={() => onUserAction('delete', user)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete user"
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

      {/* Empty State */}
      {users.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-accent-silver">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        </div>
      )}

      {/* Enhanced Pagination - Fixed at bottom */}
      {totalUsers > 0 && (
        <div className="flex-shrink-0 bg-white dark:bg-accent-obsidian px-4 py-4 border-t border-gray-200 dark:border-accent-silver/10">
          {/* Mobile Pagination */}
          <div className="flex items-center justify-between sm:hidden">
            <div className="flex items-center space-x-2">
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="text-sm border border-gray-300 dark:border-accent-silver/20 rounded-md bg-white dark:bg-accent-obsidian text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-accent-silver/20 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-accent-obsidian hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-accent-silver/20 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-accent-obsidian hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>

          {/* Desktop Pagination */}
          <div className="hidden sm:flex sm:items-center sm:justify-between">
            {/* Left side - Items per page and info */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
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
                  {Math.min((currentPage - 1) * itemsPerPage + 1, totalUsers)}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalUsers)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{totalUsers}</span>{' '}
                results
              </div>
            </div>

            {/* Right side - Page navigation */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">
                Page {currentPage} of {totalPages}
              </span>
              {totalPages > 1 ? (
              <div className="flex items-center space-x-2">
                {/* First page button */}
                <button
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-accent-silver/20 bg-white dark:bg-accent-obsidian text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>

                {/* Previous button */}
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 dark:border-accent-silver/20 bg-white dark:bg-accent-obsidian text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {(() => {
                    const pages = []
                    const maxVisiblePages = 5
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
                    
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1)
                    }
                    
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => onPageChange(1)}
                          className="relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-accent-silver/20 bg-white dark:bg-accent-obsidian text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-accent-silver/10 rounded-md"
                        >
                          1
                        </button>
                      )
                      if (startPage > 2) {
                        pages.push(
                          <span key="ellipsis1" className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            ...
                          </span>
                        )
                      }
                    }
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => onPageChange(i)}
                          className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                            i === currentPage
                              ? 'z-10 bg-accent-neon border-accent-neon text-black shadow-sm'
                              : 'bg-white dark:bg-accent-obsidian border-gray-300 dark:border-accent-silver/20 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-accent-silver/10'
                          }`}
                        >
                          {i}
                        </button>
                      )
                    }
                    
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="ellipsis2" className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            ...
                          </span>
                        )
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => onPageChange(totalPages)}
                          className="relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-accent-silver/20 bg-white dark:bg-accent-obsidian text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-accent-silver/10 rounded-md"
                        >
                          {totalPages}
                        </button>
                      )
                    }
                    
                    return pages
                  })()}
                </div>
                
                {/* Next button */}
                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 dark:border-accent-silver/20 bg-white dark:bg-accent-obsidian text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>

                {/* Last page button */}
                <button
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-accent-silver/20 bg-white dark:bg-accent-obsidian text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-accent-silver/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  No additional pages
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
