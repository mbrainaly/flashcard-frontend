'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  animate?: boolean
}

export const Skeleton = ({ className = '', animate = true }: SkeletonProps) => {
  const baseClasses = 'bg-gray-200 dark:bg-accent-silver/10 rounded'
  
  if (animate) {
    return (
      <motion.div
        className={`${baseClasses} ${className}`}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    )
  }

  return <div className={`${baseClasses} ${className}`} />
}

// Specific skeleton components for common use cases
export const TableRowSkeleton = () => (
  <tr className="hover:bg-gray-50 dark:hover:bg-accent-silver/5 transition-colors">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="ml-4">
          <Skeleton className="h-4 w-32 mb-1" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <Skeleton className="h-6 w-24 rounded-full" />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <Skeleton className="h-4 w-4 mr-2" />
        <Skeleton className="h-4 w-16" />
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="ml-3">
          <Skeleton className="h-4 w-24 mb-1" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="space-y-1">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Skeleton className="h-3 w-12 mr-1" />
            <Skeleton className="h-3 w-6" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-3 w-16 mr-1" />
            <Skeleton className="h-3 w-6" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Skeleton className="h-3 w-14 mr-1" />
            <Skeleton className="h-3 w-8" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-3 w-18 mr-1" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <Skeleton className="h-4 w-4 mr-1" />
        <Skeleton className="h-4 w-20" />
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right">
      <div className="flex items-center justify-end space-x-1">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </td>
  </tr>
)

export const StatsCardSkeleton = () => (
  <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-8 w-12" />
      </div>
      <Skeleton className="h-12 w-12 rounded-xl" />
    </div>
  </div>
)

export const QuickFilterButtonsSkeleton = () => (
  <div className="flex flex-wrap gap-2 mt-4">
    <Skeleton className="h-6 w-16 rounded-full" />
    <Skeleton className="h-6 w-20 rounded-full" />
    <Skeleton className="h-6 w-16 rounded-full" />
    <Skeleton className="h-6 w-16 rounded-full" />
  </div>
)

export const SearchFiltersSkeleton = () => (
  <div className="bg-white dark:bg-accent-obsidian rounded-xl p-6 shadow-sm border border-gray-200 dark:border-accent-silver/10">
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="flex-1 relative">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      {/* Filter Toggle */}
      <Skeleton className="h-10 w-24 rounded-lg" />
    </div>
    {/* Quick Filter Buttons */}
    <QuickFilterButtonsSkeleton />
  </div>
)

export const DeckDetailsSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    </div>

    {/* Main Card */}
    <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 dark:bg-accent-silver/5 rounded-lg">
          <Skeleton className="h-6 w-6 mx-auto mb-2" />
          <Skeleton className="h-8 w-8 mx-auto mb-1" />
          <Skeleton className="h-4 w-12 mx-auto" />
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-accent-silver/10">
        <div>
          <Skeleton className="h-4 w-32 mb-3" />
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </div>
    </div>

    {/* Cards Section */}
    <div className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 bg-gray-50 dark:bg-accent-silver/5 rounded-lg">
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  </div>
)
