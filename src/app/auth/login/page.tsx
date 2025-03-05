'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { UserIcon, LockClosedIcon } from '@heroicons/react/24/solid'
import SocialLoginButton from '@/components/auth/SocialLoginButton'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [error, setError] = useState('')
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('Attempting sign in...');
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      console.log('Sign in result:', result);

      if (result?.error) {
        setError('Invalid email or password');
        return;
      }

      if (result?.ok) {
        console.log('Sign in successful, redirecting to dashboard...');
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      setError('An error occurred. Please try again.');
    }
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
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-4xl">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left side - Form */}
            <div className="flex-1">
              <div className="space-y-4">
                <SocialLoginButton provider="google" />
                <SocialLoginButton provider="github" />
              </div>

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-accent-silver/10" />
                </div>
                <div className="relative flex justify-center text-sm font-medium leading-6">
                  <span className="bg-accent-obsidian px-6 text-accent-silver">Or continue with</span>
                </div>
              </div>

              <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-accent-silver">
                    Email address
                  </label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-black" aria-hidden="true" />
                    </div>
                    <input
                      {...register('email')}
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full rounded-md border-0 bg-white/90 pl-10 px-3.5 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-accent-neon sm:text-sm sm:leading-6 transition-all duration-300"
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-500"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-accent-silver">
                      Password
                    </label>
                    <div className="text-sm">
                      <Link
                        href="/auth/forgot-password"
                        className="font-semibold text-accent-neon hover:text-white transition-colors relative z-10"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-black" aria-hidden="true" />
                    </div>
                    <input
                      {...register('password')}
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="block w-full rounded-md border-0 bg-white/90 pl-10 px-3.5 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-accent-neon sm:text-sm sm:leading-6 transition-all duration-300"
                      placeholder="Enter your password"
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
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <span>Sign in</span>
                    )}
                  </motion.button>
                </div>
              </form>

              <p className="mt-10 text-center text-sm text-accent-silver">
                Not a member?{' '}
                <Link
                  href="/auth/register"
                  className="font-semibold text-accent-neon hover:text-white transition-colors relative z-10"
                >
                  Start your free trial today
                </Link>
              </p>
            </div>

            {/* Right side - Illustration */}
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="relative w-full max-w-sm">
                <div className="absolute -inset-2">
                  <div className="w-full h-full mx-auto rotate-[-10deg] rounded-3xl bg-gradient-to-r from-accent-neon to-accent-gold opacity-30 blur-2xl" />
                </div>
                <img
                  src="/login-illustration.svg"
                  alt="Login illustration"
                  className="relative rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 