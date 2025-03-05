'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import DashboardNavbar from './DashboardNavbar'
import Footer from './Footer'

interface MainLayoutProps {
  children: ReactNode
}

const protectedRoutes = ['/dashboard', '/decks', '/generate', '/study', '/profile', '/quizzes', '/notes', '/billing']

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  
  const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route))

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="sticky top-0 z-50">
        {isProtectedRoute ? <DashboardNavbar /> : <Navbar />}
      </div>
      <main className="flex-grow relative">{children}</main>
      {!isProtectedRoute && <Footer />}
    </div>
  )
} 