'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  ChartBarIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminApi } from '@/hooks/useAdminApi'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'
import UserTable from '@/components/admin/users/UserTable'
import UserFilters from '@/components/admin/users/UserFilters'
import UserModal from '@/components/admin/users/UserModal'

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

interface UserFilters {
  search: string
  role: string
  status: string
  subscription: string
  dateRange: {
    from: string
    to: string
  }
}

export default function UsersPage() {
  const { hasPermission } = useAdminAuth()
  const adminApi = useAdminApi()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    status: '',
    subscription: '',
    dateRange: {
      from: '',
      to: ''
    }
  })

  // Debounce search to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(filters.search, 500)

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      })
      
        // Add filters to query params
        if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm)
      if (filters.role) {
        // Map frontend role to backend subscription plan
        queryParams.append('subscriptionPlan', filters.role)
      }
      if (filters.status) {
        if (filters.status === 'active') queryParams.append('isActive', 'true')
        else if (filters.status === 'inactive') queryParams.append('isActive', 'false')
      }
      if (filters.subscription) {
        if (filters.subscription === 'subscribed') queryParams.append('subscriptionStatus', 'active')
        else if (filters.subscription === 'free') queryParams.append('subscriptionStatus', 'inactive')
      }
      if (filters.dateRange.from) queryParams.append('dateFrom', filters.dateRange.from)
      if (filters.dateRange.to) queryParams.append('dateTo', filters.dateRange.to)

      const response = await adminApi.get(`/api/admin/users?${queryParams.toString()}`)
      
      if (response.success && response.data) {
        setUsers(response.data)
        setFilteredUsers(response.data)
        setTotalUsers((response as any).pagination?.total || 0)
        setTotalPages((response as any).pagination?.pages || 0)
      } else {
        throw new Error(response.error || 'Failed to fetch users')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  // Memoize non-search filters to avoid unnecessary re-renders
  const nonSearchFilters = useMemo(() => ({
    role: filters.role,
    status: filters.status,
    subscription: filters.subscription,
    dateRange: filters.dateRange
  }), [filters.role, filters.status, filters.subscription, filters.dateRange])

  useEffect(() => {
    fetchUsers()
  }, [currentPage, itemsPerPage, debouncedSearchTerm, nonSearchFilters])

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when items per page changes
  }

  const handleUserAction = async (action: string, user: User) => {
    switch (action) {
      case 'view':
        router.push(`/admin/dashboard/users/${user._id}`)
        break
      case 'edit':
        setSelectedUser(user)
        setShowUserModal(true)
        break
      case 'delete':
        if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
          try {
            const response = await adminApi.delete(`/api/admin/users/${user._id}`)
            if (response.success) {
              // Refresh the users list
              fetchUsers()
            } else {
              alert(response.error || 'Failed to delete user')
            }
          } catch (error) {
            console.error('Error deleting user:', error)
            alert('Failed to delete user')
          }
        }
        break
      case 'toggle-status':
        try {
          const response = await adminApi.put(`/api/admin/users/${user._id}`, {
            isActive: !user.isActive
          })
          if (response.success) {
            // Refresh the users list
            fetchUsers()
          } else {
            alert(response.error || 'Failed to update user status')
          }
        } catch (error) {
          console.error('Error updating user status:', error)
          alert('Failed to update user status')
        }
        break
    }
  }

  const handleCreateUser = () => {
    setSelectedUser(null)
    setShowUserModal(true)
  }

  const handleUserSave = async (userData: any) => {
    try {
      let response
      
      if (userData._id) {
        // Update existing user
        response = await adminApi.put(`/api/admin/users/${userData._id}`, userData)
      } else {
        // Create new user
        response = await adminApi.post('/api/admin/users', userData)
      }
      
      if (response.success) {
        // Refresh the users list
        fetchUsers()
        setShowUserModal(false)
        setSelectedUser(null)
      } else {
        throw new Error(response.error || 'Failed to save user')
      }
    } catch (error) {
      console.error('Error saving user:', error)
      // The error will be handled by the modal component
      throw error
    }
  }

  // Pagination is handled by backend, so we use the users directly
  const paginatedUsers = users
  

  // Stats - use totalUsers from API response for accurate count
  const stats = {
    total: totalUsers,
    active: users.filter(u => u.isActive).length,
    pro: users.filter(u => u.role === 'pro').length,
    team: users.filter(u => u.role === 'team').length,
    inactive: users.filter(u => !u.isActive).length
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
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage user accounts and permissions
            </p>
          </div>
        </div>

        {hasPermission('users.write') && (
          <button
            onClick={handleCreateUser}
            className="inline-flex items-center px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-black font-medium rounded-lg transition-colors"
          >
            <UserPlusIcon className="w-5 h-5 mr-2" />
            Add User
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats.total, color: 'blue', icon: UsersIcon },
          { label: 'Active Users', value: stats.active, color: 'green', icon: ChartBarIcon },
          { label: 'Pro Users', value: stats.pro, color: 'purple', icon: StarIcon },
          { label: 'Team Users', value: stats.team, color: 'blue', icon: UserPlusIcon }
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
                  {stat.value}
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
              placeholder="Search users by name or email..."
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
            <UserFilters filters={filters} onFiltersChange={setFilters} />
          </motion.div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 flex flex-col" style={{ height: '600px' }}>
        <UserTable
          users={paginatedUsers}
          onUserAction={handleUserAction}
          currentPage={currentPage}
          totalPages={totalPages}
          totalUsers={totalUsers}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          hasWritePermission={hasPermission('users.write')}
          hasDeletePermission={hasPermission('users.delete')}
        />
      </div>

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={selectedUser}
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false)
            setSelectedUser(null)
          }}
          onSave={handleUserSave}
        />
      )}
    </div>
  )
}
