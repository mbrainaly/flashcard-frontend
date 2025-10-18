'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface AdminLayoutProps {
  children: React.ReactNode
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { admin, isLoading, isAuthenticated } = useAdminAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin')
    }
  }, [isLoading, isAuthenticated, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-accent-obsidian flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated || !admin) {
    return null
  }

  // Get page title from pathname
  const getPageTitle = () => {
    const segments = pathname?.split('/').filter(Boolean) || []
    if (segments.length <= 2) return 'Dashboard' // /admin/dashboard
    
    const lastSegment = segments[segments.length - 1]
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Get page subtitle
  const getPageSubtitle = () => {
    const title = getPageTitle()
    switch (title.toLowerCase()) {
      case 'dashboard':
        return 'Overview of your admin panel'
      case 'users':
        return 'Manage user accounts and permissions'
      case 'content':
        return 'Manage flashcards, decks, and quizzes'
      case 'analytics':
        return 'View detailed analytics and reports'
      case 'subscriptions':
        return 'Manage user subscriptions and billing'
      case 'blogs':
        return 'Create and manage blog posts'
      case 'pages':
        return 'Manage static pages and content'
      case 'settings':
        return 'Configure system settings'
      default:
        return ''
    }
  }

  return (
    <div className="admin-layout min-h-screen bg-gray-50 dark:bg-accent-obsidian flex">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <AdminSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Fixed at top */}
        <div className="sticky top-0 z-40">
          <AdminHeader 
            title={getPageTitle()}
            subtitle={getPageSubtitle()}
          />
        </div>
        
        {/* Page Content */}
        <main className="admin-scrollable flex-1 overflow-x-hidden overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AdminAuthProvider>
    </ThemeProvider>
  )
}
