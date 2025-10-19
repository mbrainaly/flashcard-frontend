'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface AdminThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  mounted: boolean
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined)

export function useAdminTheme() {
  const context = useContext(AdminThemeContext)
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider')
  }
  return context
}

interface AdminThemeProviderProps {
  children: React.ReactNode
}

export function AdminThemeProvider({ children }: AdminThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // Apply theme to document (only affects admin panel)
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
    console.log('Admin theme applied:', newTheme, 'Classes:', root.className)
  }

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true)
    
    // Use admin-specific localStorage key
    const savedTheme = localStorage.getItem('admin-theme') as Theme
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    
    const initialTheme = savedTheme || systemTheme || 'dark'
    setThemeState(initialTheme)
    
    console.log('Admin theme initialized:', initialTheme)
  }, [])

  // Apply theme whenever theme state changes
  useEffect(() => {
    if (mounted) {
      applyTheme(theme)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    if (!mounted) return
    
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setThemeState(newTheme)
    
    // Save to admin-specific localStorage
    localStorage.setItem('admin-theme', newTheme)
    
    console.log('Admin theme toggled to:', newTheme)
  }

  const setTheme = (newTheme: Theme) => {
    if (!mounted) return
    
    setThemeState(newTheme)
    
    // Save to admin-specific localStorage
    localStorage.setItem('admin-theme', newTheme)
    
    console.log('Admin theme set to:', newTheme)
  }

  const value: AdminThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
    mounted
  }

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  )
}
