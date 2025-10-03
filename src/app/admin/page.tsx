'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  LockClosedIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      router.push('/admin/dashboard')
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          rememberMe: form.rememberMe
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Store tokens
      localStorage.setItem('adminToken', data.data.accessToken)
      localStorage.setItem('adminRefreshToken', data.data.refreshToken)
      localStorage.setItem('adminData', JSON.stringify(data.data.admin))

      // Redirect to dashboard
      router.push('/admin/dashboard')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-obsidian via-accent-obsidian/95 to-accent-obsidian/90 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto h-16 w-16 bg-accent-neon/20 rounded-full flex items-center justify-center mb-6"
            >
              <ShieldCheckIcon className="h-8 w-8 text-accent-neon" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white">Admin Portal</h2>
            <p className="mt-2 text-sm text-accent-silver">
              Sign in to access the admin dashboard
            </p>
          </div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-accent-silver" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 bg-white/5 border border-accent-silver/20 placeholder-accent-silver/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-neon focus:border-accent-neon focus:z-10 sm:text-sm transition-colors"
                    placeholder="Email address"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-accent-silver" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-10 py-3 bg-white/5 border border-accent-silver/20 placeholder-accent-silver/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-neon focus:border-accent-neon focus:z-10 sm:text-sm transition-colors"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-accent-silver hover:text-accent-neon transition-colors" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-accent-silver hover:text-accent-neon transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-accent-neon focus:ring-accent-neon border-accent-silver/20 rounded bg-white/5"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-accent-silver">
                  Remember me for 30 days
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
              >
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <div>
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-accent-neon hover:bg-accent-neon/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-neon disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <LockClosedIcon className="h-5 w-5 text-black/60 group-hover:text-black/80" />
                    </span>
                    Sign in
                  </>
                )}
              </motion.button>
            </div>
          </motion.form>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-accent-silver/70">
              This is a secure admin portal. All activities are logged and monitored.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
