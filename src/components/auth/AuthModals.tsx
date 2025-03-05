import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Modal from '../ui/Modal'
import { motion } from 'framer-motion'
import { LockClosedIcon, KeyIcon, EnvelopeIcon, UserIcon } from '@heroicons/react/24/outline'

// Login Schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// Register Schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

interface AuthModalsProps {
  isLoginOpen: boolean
  isRegisterOpen: boolean
  onLoginClose: () => void
  onRegisterClose: () => void
  onSwitchToRegister: () => void
  onSwitchToLogin: () => void
}

export default function AuthModals({
  isLoginOpen,
  isRegisterOpen,
  onLoginClose,
  onRegisterClose,
  onSwitchToRegister,
  onSwitchToLogin,
}: AuthModalsProps) {
  const [error, setError] = useState('')
  const router = useRouter()

  // Login form
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Register form
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onLogin = async (data: LoginFormData) => {
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        return
      }

      onLoginClose()
      router.push('/dashboard')
    } catch (error) {
      setError('An error occurred. Please try again.')
    }
  }

  const onRegister = async (data: RegisterFormData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.message || 'Registration failed')
        return
      }

      // Sign in after registration
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        setError('Registration successful but login failed')
        return
      }

      onRegisterClose()
      router.push('/dashboard')
    } catch (error) {
      setError('An error occurred. Please try again.')
    }
  }

  return (
    <>
      {/* Login Modal */}
      <Modal isOpen={isLoginOpen} onClose={onLoginClose} title="Welcome back">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side - Form */}
          <div className="flex-1">
            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-accent-silver">
                  Email
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-accent-silver" aria-hidden="true" />
                  </div>
                  <input
                    {...loginRegister('email')}
                    type="email"
                    className="block w-full rounded-md border-0 bg-glass pl-10 px-3.5 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-accent-silver/50 focus:ring-2 focus:ring-inset focus:ring-accent-neon backdrop-blur-sm sm:text-sm sm:leading-6 transition-all duration-300"
                    placeholder="Enter your email"
                  />
                  {loginErrors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-500"
                    >
                      {loginErrors.email.message}
                    </motion.p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-accent-silver">
                  Password
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-accent-silver" aria-hidden="true" />
                  </div>
                  <input
                    {...loginRegister('password')}
                    type="password"
                    className="block w-full rounded-md border-0 bg-glass pl-10 px-3.5 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-accent-silver/50 focus:ring-2 focus:ring-inset focus:ring-accent-neon backdrop-blur-sm sm:text-sm sm:leading-6 transition-all duration-300"
                    placeholder="Enter your password"
                  />
                  {loginErrors.password && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-500"
                    >
                      {loginErrors.password.message}
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
                  disabled={isLoginSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group flex w-full justify-center rounded-full bg-accent-neon px-5 py-3 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white disabled:opacity-50"
                >
                  {isLoginSubmitting ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LockClosedIcon className="h-5 w-5" />
                      <span>Sign in</span>
                    </div>
                  )}
                </motion.button>
              </div>

              <p className="text-center text-sm text-accent-silver">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="font-semibold text-accent-neon hover:text-white transition-colors"
                >
                  Sign up
                </button>
              </p>
            </form>
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
      </Modal>

      {/* Register Modal */}
      <Modal isOpen={isRegisterOpen} onClose={onRegisterClose} title="Create an account">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side - Form */}
          <div className="flex-1">
            <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-accent-silver">
                  Full name
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-accent-silver" aria-hidden="true" />
                  </div>
                  <input
                    {...registerRegister('name')}
                    type="text"
                    className="block w-full rounded-md border-0 bg-glass pl-10 px-3.5 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-accent-silver/50 focus:ring-2 focus:ring-inset focus:ring-accent-neon backdrop-blur-sm sm:text-sm sm:leading-6 transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                  {registerErrors.name && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-500"
                    >
                      {registerErrors.name.message}
                    </motion.p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-accent-silver">
                  Email
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-accent-silver" aria-hidden="true" />
                  </div>
                  <input
                    {...registerRegister('email')}
                    type="email"
                    className="block w-full rounded-md border-0 bg-glass pl-10 px-3.5 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-accent-silver/50 focus:ring-2 focus:ring-inset focus:ring-accent-neon backdrop-blur-sm sm:text-sm sm:leading-6 transition-all duration-300"
                    placeholder="Enter your email"
                  />
                  {registerErrors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-500"
                    >
                      {registerErrors.email.message}
                    </motion.p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-accent-silver">
                  Password
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-accent-silver" aria-hidden="true" />
                  </div>
                  <input
                    {...registerRegister('password')}
                    type="password"
                    className="block w-full rounded-md border-0 bg-glass pl-10 px-3.5 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-accent-silver/50 focus:ring-2 focus:ring-inset focus:ring-accent-neon backdrop-blur-sm sm:text-sm sm:leading-6 transition-all duration-300"
                    placeholder="Create a password"
                  />
                  {registerErrors.password && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-500"
                    >
                      {registerErrors.password.message}
                    </motion.p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-accent-silver">
                  Confirm password
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-accent-silver" aria-hidden="true" />
                  </div>
                  <input
                    {...registerRegister('confirmPassword')}
                    type="password"
                    className="block w-full rounded-md border-0 bg-glass pl-10 px-3.5 py-2 text-black shadow-sm ring-1 ring-inset ring-accent-silver/10 placeholder:text-accent-silver/50 focus:ring-2 focus:ring-inset focus:ring-accent-neon backdrop-blur-sm sm:text-sm sm:leading-6 transition-all duration-300"
                    placeholder="Confirm your password"
                  />
                  {registerErrors.confirmPassword && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-500"
                    >
                      {registerErrors.confirmPassword.message}
                    </motion.p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 rounded border-accent-silver/10 bg-glass text-accent-neon focus:ring-accent-neon"
                />
                <label htmlFor="terms" className="ml-3 block text-sm text-accent-silver">
                  I agree to the{' '}
                  <a href="/terms" className="font-semibold text-accent-neon hover:text-white transition-colors">
                    terms and conditions
                  </a>
                </label>
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
                  disabled={isRegisterSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group flex w-full justify-center rounded-full bg-accent-neon px-5 py-3 text-sm font-semibold text-accent-obsidian shadow-neon transition-all duration-300 hover:shadow-none hover:bg-white disabled:opacity-50"
                >
                  {isRegisterSubmitting ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5" />
                      <span>Create account</span>
                    </div>
                  )}
                </motion.button>
              </div>

              <p className="text-center text-sm text-accent-silver">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="font-semibold text-accent-neon hover:text-white transition-colors"
                >
                  Sign in
                </button>
              </p>
            </form>
          </div>

          {/* Right side - Illustration */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-2">
                <div className="w-full h-full mx-auto rotate-[10deg] rounded-3xl bg-gradient-to-r from-accent-gold to-accent-neon opacity-30 blur-2xl" />
              </div>
              <img
                src="/register-illustration.svg"
                alt="Registration illustration"
                className="relative rounded-2xl"
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
} 