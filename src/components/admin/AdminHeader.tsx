'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface AdminHeaderProps {
  title?: string
  subtitle?: string
}

export default function AdminHeader({ title = 'Dashboard', subtitle }: AdminHeaderProps) {
  const router = useRouter()
  const { admin, logout } = useAdminAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: 'New user registration',
      message: 'John Doe has created a new account',
      time: '2 minutes ago',
      unread: true
    },
    {
      id: 2,
      title: 'System maintenance',
      message: 'Scheduled maintenance will begin at 2:00 AM',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      title: 'Payment processed',
      message: 'Subscription payment of $29.99 received',
      time: '3 hours ago',
      unread: false
    }
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/admin')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // Here you would implement actual theme switching logic
  }

  return (
    <header className="bg-white dark:bg-accent-obsidian border-b border-gray-200 dark:border-accent-silver/10 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-accent-silver mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-accent-silver/10 transition-colors"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <SunIcon className="w-5 h-5 text-gray-600 dark:text-accent-silver" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-600 dark:text-accent-silver" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-accent-silver/10 transition-colors"
            >
              <BellIcon className="w-5 h-5 text-gray-600 dark:text-accent-silver" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-accent-obsidian border border-gray-200 dark:border-accent-silver/20 rounded-lg shadow-lg z-50"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-accent-silver/10">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 dark:border-accent-silver/5 hover:bg-gray-50 dark:hover:bg-accent-silver/5 transition-colors ${
                          notification.unread ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-accent-silver mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-accent-silver/70 mt-2">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 border-t border-gray-200 dark:border-accent-silver/10">
                    <button className="w-full text-sm text-blue-600 dark:text-accent-neon hover:text-blue-700 dark:hover:text-accent-neon/80 font-medium">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-accent-silver/10 transition-colors"
            >
              <div className="w-8 h-8 bg-accent-neon/20 rounded-full flex items-center justify-center">
                <span className="text-accent-neon font-medium text-sm">
                  {admin?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {admin?.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-accent-silver">
                  {admin?.role.replace('_', ' ').toUpperCase()}
                </p>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-gray-600 dark:text-accent-silver" />
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-accent-obsidian border border-gray-200 dark:border-accent-silver/20 rounded-lg shadow-lg z-50"
                >
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        router.push('/admin/dashboard/profile')
                      }}
                      className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-accent-silver hover:bg-gray-100 dark:hover:bg-accent-silver/10 rounded-lg transition-colors"
                    >
                      <UserCircleIcon className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        router.push('/admin/dashboard/settings')
                      }}
                      className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-accent-silver hover:bg-gray-100 dark:hover:bg-accent-silver/10 rounded-lg transition-colors"
                    >
                      <Cog6ToothIcon className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    
                    <hr className="my-2 border-gray-200 dark:border-accent-silver/20" />
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showProfileMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileMenu(false)
            setShowNotifications(false)
          }}
        />
      )}
    </header>
  )
}
