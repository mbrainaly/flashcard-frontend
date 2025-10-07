'use client'

import React from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface SmartSearchBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  placeholder?: string
  filteredCount: number
  totalCount: number
  onReset?: () => void
  className?: string
}

export default function SmartSearchBar({
  searchTerm,
  onSearchChange,
  placeholder = "Search...",
  filteredCount,
  totalCount,
  onReset,
  className = ""
}: SmartSearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-accent-silver/60" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-accent-silver/20 rounded-lg bg-white dark:bg-accent-obsidian text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-accent-silver/50 focus:ring-2 focus:ring-accent-neon focus:border-accent-neon transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => {
              onSearchChange('')
              onReset?.()
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-accent-silver/60 hover:text-gray-600 dark:hover:text-accent-silver transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Search Results Counter */}
      {searchTerm.trim() && (
        <div className="mt-2 text-xs text-gray-500 dark:text-accent-silver/70">
          <span className="font-medium">{filteredCount}</span> result{filteredCount !== 1 ? 's' : ''} found
          {filteredCount !== totalCount && (
            <span> out of <span className="font-medium">{totalCount}</span> total</span>
          )}
        </div>
      )}
    </div>
  )
}
