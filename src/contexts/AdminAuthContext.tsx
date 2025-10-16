'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

// Types
interface Admin {
  _id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'moderator' | 'analyst'
  permissions: string[]
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

interface AuthState {
  admin: Admin | null
  isLoading: boolean
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => void
  refreshAccessToken: () => Promise<boolean>
  clearError: () => void
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasRole: (role: string) => boolean
}

// Action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { admin: Admin; accessToken: string; refreshToken: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: { accessToken: string; refreshToken: string } }
  | { type: 'REFRESH_TOKEN_FAILURE' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESTORE_SESSION'; payload: { admin: Admin; accessToken: string; refreshToken: string } }

// Initial state
const initialState: AuthState = {
  admin: null,
  isLoading: true,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  error: null
}

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        admin: action.payload.admin,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        error: null
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        admin: null,
        accessToken: null,
        refreshToken: null,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false
      }
    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        error: null
      }
    case 'REFRESH_TOKEN_FAILURE':
      return {
        ...initialState,
        isLoading: false
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    case 'RESTORE_SESSION':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        admin: action.payload.admin,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        error: null
      }
    default:
      return state
  }
}

// Create context
const AdminAuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
interface AdminAuthProviderProps {
  children: ReactNode
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const router = useRouter()

  // API base URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL 

  // Restore session on mount
  useEffect(() => {
    const restoreSession = () => {
      try {
        const accessToken = localStorage.getItem('adminToken')
        const refreshToken = localStorage.getItem('adminRefreshToken')
        const adminData = localStorage.getItem('adminData')

        if (accessToken && refreshToken && adminData) {
          const admin = JSON.parse(adminData)
          dispatch({
            type: 'RESTORE_SESSION',
            payload: { admin, accessToken, refreshToken }
          })
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Error restoring session:', error)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    restoreSession()
  }, [])

  // Auto refresh token
  useEffect(() => {
    if (!state.accessToken || !state.refreshToken) return

    const refreshInterval = setInterval(() => {
      refreshAccessToken()
    }, 10 * 60 * 1000) // Refresh every 10 minutes

    return () => clearInterval(refreshInterval)
  }, [state.accessToken, state.refreshToken])

  // Login function
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    dispatch({ type: 'LOGIN_START' })

    try {
      const response = await fetch(`${API_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Store tokens and admin data
      localStorage.setItem('adminToken', data.data.accessToken)
      localStorage.setItem('adminRefreshToken', data.data.refreshToken)
      localStorage.setItem('adminData', JSON.stringify(data.data.admin))

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          admin: data.data.admin,
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken
        }
      })

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      dispatch({ type: 'LOGIN_FAILURE', payload: message })
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint if we have a token
      if (state.accessToken) {
        await fetch(`${API_URL}/api/admin/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${state.accessToken}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Clear local storage and state regardless of API call result
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminRefreshToken')
      localStorage.removeItem('adminData')
      
      dispatch({ type: 'LOGOUT' })
      
      // Redirect to login page
      router.push('/admin')
    }
  }

  // Refresh access token
  const refreshAccessToken = async (): Promise<boolean> => {
    if (!state.refreshToken) {
      dispatch({ type: 'REFRESH_TOKEN_FAILURE' })
      return false
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: state.refreshToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed')
      }

      // Update tokens
      localStorage.setItem('adminToken', data.data.accessToken)
      localStorage.setItem('adminRefreshToken', data.data.refreshToken)

      dispatch({
        type: 'REFRESH_TOKEN_SUCCESS',
        payload: {
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken
        }
      })

      return true

    } catch (error) {
      console.error('Token refresh failed:', error)
      dispatch({ type: 'REFRESH_TOKEN_FAILURE' })
      
      // Clear storage and redirect to login
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminRefreshToken')
      localStorage.removeItem('adminData')
      
      router.push('/admin')
      return false
    }
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Permission helpers
  const hasPermission = (permission: string): boolean => {
    if (!state.admin) return false
    if (state.admin.role === 'super_admin') return true
    return state.admin.permissions.includes(permission)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!state.admin) return false
    if (state.admin.role === 'super_admin') return true
    return permissions.some(permission => state.admin!.permissions.includes(permission))
  }

  const hasRole = (role: string): boolean => {
    if (!state.admin) return false
    return state.admin.role === role
  }

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshAccessToken,
    clearError,
    hasPermission,
    hasAnyPermission,
    hasRole
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

// Hook to use admin auth context
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

// HOC for protected admin routes
export const withAdminAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions?: string[],
  requiredRoles?: string[]
) => {
  const ProtectedComponent: React.FC<P> = (props) => {
    const { admin, isLoading, isAuthenticated, hasPermission, hasAnyPermission, hasRole } = useAdminAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/admin')
          return
        }

        // Check permissions
        if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
          router.push('/admin/unauthorized')
          return
        }

        // Check roles
        if (requiredRoles && !requiredRoles.some(role => hasRole(role))) {
          router.push('/admin/unauthorized')
          return
        }
      }
    }, [isLoading, isAuthenticated, admin, router])

    if (isLoading) {
      return (
        <div className="min-h-screen bg-accent-obsidian">
          {/* Admin Layout Skeleton */}
          <div className="flex h-screen">
            {/* Sidebar Skeleton */}
            <div className="w-64 bg-accent-obsidian border-r border-accent-silver/10 p-4">
              <div className="space-y-4">
                <div className="h-8 bg-accent-silver/10 rounded animate-pulse"></div>
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-10 bg-accent-silver/5 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Main Content Skeleton */}
            <div className="flex-1 flex flex-col">
              {/* Header Skeleton */}
              <div className="h-16 bg-accent-obsidian border-b border-accent-silver/10 px-6 flex items-center justify-between">
                <div className="h-6 w-48 bg-accent-silver/10 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-accent-silver/10 rounded-full animate-pulse"></div>
              </div>
              
              {/* Content Skeleton */}
              <div className="flex-1 p-6 space-y-6">
                <div className="h-8 w-64 bg-accent-silver/10 rounded animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-32 bg-accent-silver/5 rounded-xl animate-pulse"></div>
                  <div className="h-32 bg-accent-silver/5 rounded-xl animate-pulse"></div>
                </div>
                <div className="h-96 bg-accent-silver/5 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null // Will redirect to login
    }

    return <Component {...props} />
  }

  ProtectedComponent.displayName = `withAdminAuth(${Component.displayName || Component.name})`
  return ProtectedComponent
}
