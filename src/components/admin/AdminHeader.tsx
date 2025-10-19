'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useAdminTheme } from '@/components/providers/AdminThemeProvider'

interface AdminHeaderProps {
  title?: string
  subtitle?: string
}

export default function AdminHeader({ title = 'Dashboard', subtitle }: AdminHeaderProps) {
  const router = useRouter()
  const { admin, logout } = useAdminAuth()
  const { theme, toggleTheme, mounted } = useAdminTheme()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/admin')
    } catch (error) {
      console.error('Logout error:', error)
    }
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
          {mounted && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-accent-silver/60 font-mono">
                {theme}
              </span>
              <button
                onClick={() => {
                  console.log('Theme toggle clicked, current theme:', theme)
                  console.log('Document classes before:', document.documentElement.className)
                  toggleTheme()
                  setTimeout(() => {
                    console.log('Document classes after:', document.documentElement.className)
                  }, 100)
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-accent-silver/10 transition-colors border border-gray-200 dark:border-accent-silver/20"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5 text-yellow-500 dark:text-accent-neon" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-gray-700 dark:text-accent-silver" />
                )}
              </button>
            </div>
          )}
          
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
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileMenu(false)
          }}
        />
      )}
    </header>
  )
}
