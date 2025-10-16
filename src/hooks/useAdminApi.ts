'use client'

import { useCallback } from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const useAdminApi = () => {
  const { accessToken, refreshAccessToken, logout } = useAdminAuth()
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const makeRequest = useCallback(async <T = any>(
    endpoint: string, 
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> => {
    const { method = 'GET', body, headers = {} } = options

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    }

    // Add authorization header if token exists
    if (accessToken) {
      requestHeaders['Authorization'] = `Bearer ${accessToken}`
    }

    // Prepare request config
    const config: RequestInit = {
      method,
      headers: requestHeaders
    }

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      config.body = typeof body === 'string' ? body : JSON.stringify(body)
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config)
      const data = await response.json()

      // Handle token expiration
      if (response.status === 401 && data.message?.includes('token')) {
        // Try to refresh token
        const refreshSuccess = await refreshAccessToken()
        
        if (refreshSuccess) {
          // Retry the original request with new token
          const newToken = localStorage.getItem('adminToken')
          if (newToken) {
            requestHeaders['Authorization'] = `Bearer ${newToken}`
            const retryResponse = await fetch(`${API_URL}${endpoint}`, {
              ...config,
              headers: requestHeaders
            })
            return await retryResponse.json()
          }
        } else {
          // Refresh failed, logout user
          logout()
          throw new Error('Session expired. Please login again.')
        }
      }

      return data

    } catch (error) {
      console.error('API request failed:', error)
      
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message
        }
      }
      
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  }, [accessToken, refreshAccessToken, logout, API_URL])

  // Convenience methods
  const get = useCallback(<T = any>(endpoint: string, headers?: Record<string, string>) => 
    makeRequest<T>(endpoint, { method: 'GET', headers }), [makeRequest])

  const post = useCallback(<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) => 
    makeRequest<T>(endpoint, { method: 'POST', body, headers }), [makeRequest])

  const put = useCallback(<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) => 
    makeRequest<T>(endpoint, { method: 'PUT', body, headers }), [makeRequest])

  const del = useCallback(<T = any>(endpoint: string, headers?: Record<string, string>) => 
    makeRequest<T>(endpoint, { method: 'DELETE', headers }), [makeRequest])

  const patch = useCallback(<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) => 
    makeRequest<T>(endpoint, { method: 'PATCH', body, headers }), [makeRequest])

  return {
    makeRequest,
    get,
    post,
    put,
    delete: del,
    patch
  }
}

// Hook for handling file uploads
export const useAdminFileUpload = () => {
  const { accessToken, refreshAccessToken, logout } = useAdminAuth()
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const uploadFile = useCallback(async (
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    
    // Add additional data if provided
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key])
      })
    }

    // Prepare headers (don't set Content-Type for FormData)
    const requestHeaders: Record<string, string> = {}
    
    if (accessToken) {
      requestHeaders['Authorization'] = `Bearer ${accessToken}`
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: requestHeaders,
        body: formData
      })

      const data = await response.json()

      // Handle token expiration
      if (response.status === 401 && data.message?.includes('token')) {
        const refreshSuccess = await refreshAccessToken()
        
        if (refreshSuccess) {
          const newToken = localStorage.getItem('adminToken')
          if (newToken) {
            requestHeaders['Authorization'] = `Bearer ${newToken}`
            const retryResponse = await fetch(`${API_URL}${endpoint}`, {
              method: 'POST',
              headers: requestHeaders,
              body: formData
            })
            return await retryResponse.json()
          }
        } else {
          logout()
          throw new Error('Session expired. Please login again.')
        }
      }

      return data

    } catch (error) {
      console.error('File upload failed:', error)
      
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message
        }
      }
      
      return {
        success: false,
        error: 'File upload failed'
      }
    }
  }, [accessToken, refreshAccessToken, logout, API_URL])

  return { uploadFile }
}
