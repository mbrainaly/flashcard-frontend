'use client'

import { useState } from 'react'
import {
  UserIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

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

interface UserFiltersProps {
  filters: UserFilters
  onFiltersChange: (filters: UserFilters) => void
}

export default function UserFilters({ filters, onFiltersChange }: UserFiltersProps) {
  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const handleDateRangeChange = (key: 'from' | 'to', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [key]: value
      }
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      role: '',
      status: '',
      subscription: '',
      dateRange: {
        from: '',
        to: ''
      }
    })
  }

  const hasActiveFilters = () => {
    return filters.role || filters.status || filters.subscription || filters.dateRange.from || filters.dateRange.to
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Advanced Filters
        </h3>
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 dark:text-accent-silver hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            User Type
          </label>
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
          >
            <option value="">All Users</option>
            <option value="basic">Basic Plan (Free)</option>
            <option value="pro">Pro Plan</option>
            <option value="team">Team Plan</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Account Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Subscription Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subscription
          </label>
          <select
            value={filters.subscription}
            onChange={(e) => handleFilterChange('subscription', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent"
          >
            <option value="">All Subscriptions</option>
            <option value="subscribed">Subscribed</option>
            <option value="free">Free Plan</option>
          </select>
        </div>

        {/* Date Range - Join Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Join Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.dateRange.from}
              onChange={(e) => handleDateRangeChange('from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent text-sm"
              placeholder="From date"
            />
            <input
              type="date"
              value={filters.dateRange.to}
              onChange={(e) => handleDateRangeChange('to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-neon focus:border-transparent text-sm"
              placeholder="To date"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-accent-silver/10">
          <span className="text-sm text-gray-500 dark:text-accent-silver">
            Active filters:
          </span>
          
          {filters.role && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
              {filters.role === 'user' ? (
                <UserIcon className="w-3 h-3 mr-1" />
              ) : (
                <StarIcon className="w-3 h-3 mr-1" />
              )}
              {filters.role === 'user' ? 'Free Users' : 'Premium Users'}
              <button
                onClick={() => handleFilterChange('role', '')}
                className="ml-1 hover:text-blue-600 dark:hover:text-blue-200"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.status && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              filters.status === 'active'
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
            }`}>
              {filters.status === 'active' ? (
                <CheckCircleIcon className="w-3 h-3 mr-1" />
              ) : (
                <XCircleIcon className="w-3 h-3 mr-1" />
              )}
              {filters.status === 'active' ? 'Active' : 'Inactive'}
              <button
                onClick={() => handleFilterChange('status', '')}
                className={`ml-1 ${
                  filters.status === 'active'
                    ? 'hover:text-green-600 dark:hover:text-green-200'
                    : 'hover:text-red-600 dark:hover:text-red-200'
                }`}
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.subscription && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              filters.subscription === 'subscribed'
                ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
            }`}>
              {filters.subscription === 'subscribed' ? (
                <StarIcon className="w-3 h-3 mr-1" />
              ) : (
                <UserIcon className="w-3 h-3 mr-1" />
              )}
              {filters.subscription === 'subscribed' ? 'Subscribed' : 'Free Plan'}
              <button
                onClick={() => handleFilterChange('subscription', '')}
                className={`ml-1 ${
                  filters.subscription === 'subscribed'
                    ? 'hover:text-purple-600 dark:hover:text-purple-200'
                    : 'hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {(filters.dateRange.from || filters.dateRange.to) && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300">
              <CalendarIcon className="w-3 h-3 mr-1" />
              {filters.dateRange.from && filters.dateRange.to
                ? `${filters.dateRange.from} to ${filters.dateRange.to}`
                : filters.dateRange.from
                ? `From ${filters.dateRange.from}`
                : `Until ${filters.dateRange.to}`
              }
              <button
                onClick={() => handleDateRangeChange('from', '') || handleDateRangeChange('to', '')}
                className="ml-1 hover:text-orange-600 dark:hover:text-orange-200"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-accent-silver/10">
        <span className="text-sm text-gray-500 dark:text-accent-silver">
          Quick filters:
        </span>
        
        <button
          onClick={() => handleFilterChange('status', 'active')}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
        >
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Active Users
        </button>
        
        <button
          onClick={() => handleFilterChange('role', 'pro')}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
        >
          <StarIcon className="w-3 h-3 mr-1" />
          Pro Users
        </button>
        
        <button
          onClick={() => handleFilterChange('role', 'team')}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
        >
          <UserIcon className="w-3 h-3 mr-1" />
          Team Users
        </button>
        
        <button
          onClick={() => handleFilterChange('status', 'inactive')}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
        >
          <XCircleIcon className="w-3 h-3 mr-1" />
          Inactive Users
        </button>
        
        <button
          onClick={() => {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            handleDateRangeChange('from', thirtyDaysAgo.toISOString().split('T')[0])
            handleDateRangeChange('to', new Date().toISOString().split('T')[0])
          }}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors"
        >
          <CalendarIcon className="w-3 h-3 mr-1" />
          Last 30 Days
        </button>
      </div>
    </div>
  )
}
