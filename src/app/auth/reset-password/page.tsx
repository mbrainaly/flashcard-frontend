'use client'

import { useState, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { KeyIcon } from '@heroicons/react/24/outline'

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// Component that uses useSearchParams
function ResetPasswordContent() {
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Invalid or expired reset token')
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reset password')
      }

      router.push('/auth/login?reset=success')
    } catch (error) {
      setError('An error occurred. Please try again.')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-accent-obsidian flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h2>
          <p className="text-accent-silver mb-8">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            href="/auth/forgot-password"
            className="relative group inline-flex items-center rounded-full bg-accent-neon px-4 py-1.5 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white"
          >
            Request new link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-accent-obsidian min-h-screen">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-accent-neon/10 via-transparent to-transparent" />
      
      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <Link href="/" className="flex justify-center">
            <span className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon">
              AIFlash
            </span>
          </Link>
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
            Set your new password
          </h2>
          <p className="mt-2 text-center text-sm text-accent-silver">
            Please enter and confirm your new password.
          </p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-accent-silver">
                New password
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-accent-silver" aria-hidden="true" />
                </div>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  required
                  className="block w-full rounded-md border-0 bg-glass pl-10 px-3.5 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-accent-silver/50 focus:ring-2 focus:ring-inset focus:ring-accent-neon backdrop-blur-sm sm:text-sm sm:leading-6 transition-all duration-300"
                  placeholder="Enter your new password"
                />
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-500"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-accent-silver">
                Confirm new password
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-accent-silver" aria-hidden="true" />
                </div>
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type="password"
                  required
                  className="block w-full rounded-md border-0 bg-glass pl-10 px-3.5 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-accent-silver/50 focus:ring-2 focus:ring-inset focus:ring-accent-neon backdrop-blur-sm sm:text-sm sm:leading-6 transition-all duration-300"
                  placeholder="Confirm your new password"
                />
                {errors.confirmPassword && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-500"
                  >
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-md bg-red-500/10 p-4"
              >
                <p className="text-sm text-red-500">{error}</p>
              </motion.div>
            )}

            <div>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative group flex w-full justify-center rounded-full bg-accent-neon px-5 py-3 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Resetting password...</span>
                  </div>
                ) : (
                  <span>Reset password</span>
                )}
              </motion.button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-accent-silver">
            Remember your password?{' '}
            <Link href="/auth/login" className="font-semibold text-accent-neon hover:text-white transition-colors">
              Sign in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// Loading fallback for Suspense
function ResetPasswordLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-obsidian">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-accent-neon border-r-2 border-b-2 border-transparent"></div>
        <p className="mt-4 text-accent-silver">Loading reset password form...</p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  )
} 