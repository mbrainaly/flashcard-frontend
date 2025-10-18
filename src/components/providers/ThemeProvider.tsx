'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
    console.log('Applied theme:', newTheme, 'Classes:', root.className)
  }

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true)
    
    // Check localStorage first, then system preference, default to dark
    const savedTheme = localStorage.getItem('theme') as Theme
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    
    const initialTheme = savedTheme || systemTheme || 'dark'
    setThemeState(initialTheme)
    
    console.log('Theme initialized:', initialTheme)
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
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme)
    
    console.log('Theme toggled to:', newTheme)
  }

  const setTheme = (newTheme: Theme) => {
    if (!mounted) return
    
    setThemeState(newTheme)
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme)
    
    console.log('Theme set to:', newTheme)
  }

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
    mounted
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
