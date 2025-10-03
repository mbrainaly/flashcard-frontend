'use client'

import { motion } from 'framer-motion'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

interface StatsCardProps {
  title: string
  value: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  trend = 'neutral', 
  icon, 
  color 
}: StatsCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-500',
          text: 'text-blue-600 dark:text-blue-400',
          light: 'bg-blue-50 dark:bg-blue-900/20'
        }
      case 'green':
        return {
          bg: 'bg-green-500',
          text: 'text-green-600 dark:text-green-400',
          light: 'bg-green-50 dark:bg-green-900/20'
        }
      case 'purple':
        return {
          bg: 'bg-purple-500',
          text: 'text-purple-600 dark:text-purple-400',
          light: 'bg-purple-50 dark:bg-purple-900/20'
        }
      case 'orange':
        return {
          bg: 'bg-orange-500',
          text: 'text-orange-600 dark:text-orange-400',
          light: 'bg-orange-50 dark:bg-orange-900/20'
        }
      case 'red':
        return {
          bg: 'bg-red-500',
          text: 'text-red-600 dark:text-red-400',
          light: 'bg-red-50 dark:bg-red-900/20'
        }
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-gray-600 dark:text-gray-400',
          light: 'bg-gray-50 dark:bg-gray-900/20'
        }
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400'
      case 'down':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const colorClasses = getColorClasses(color)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-accent-obsidian rounded-xl shadow-sm border border-gray-200 dark:border-accent-silver/10 p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-accent-silver">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
          {change && (
            <div className="flex items-center mt-2">
              {trend === 'up' && <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />}
              {trend === 'down' && <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />}
              <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
                {change}
              </span>
              <span className="text-sm text-gray-500 dark:text-accent-silver ml-1">
                vs last period
              </span>
            </div>
          )}
        </div>
        <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses.light}`}>
          <div className={colorClasses.text}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
