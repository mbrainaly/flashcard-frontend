'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  UserCircleIcon,
  AcademicCapIcon,
  ClockIcon,
  ChartBarIcon,
  CogIcon,
  CreditCardIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { StudyProgress } from '@/types/study'
import { getStudyProgress } from '@/services/dashboard.service'
import { getSubscription } from '@/services/subscription.service'

interface UserProfile {
  name: string
  email: string
  image?: string
  joinedDate: string
  role: string
}

interface SubscriptionPlan {
  id: string
  name: string
  price: string
  credits: number
  nextRenewal?: string
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [studyProgress, setStudyProgress] = useState<StudyProgress | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isChangePasswordMode, setIsChangePasswordMode] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [subscription, setSubscription] = useState<SubscriptionPlan>({
    id: 'basic',
    name: 'Basic',
    price: '$0',
    credits: 50,
    nextRenewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
  })

  const handleEditProfile = () => {
    if (userProfile) {
      setEditForm({
        name: userProfile.name,
        email: userProfile.email,
      })
      setIsEditMode(true)
      setIsChangePasswordMode(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile')
      }

      // Update local state with the returned user data
      setUserProfile(prev => prev ? {
        ...prev,
        name: data.user.name,
        email: data.user.email,
      } : null)

      setIsEditMode(false)
      setError('')
    } catch (err) {
      console.error('Profile update error:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    }
  }

  const handleChangePassword = () => {
    setIsChangePasswordMode(true)
    setIsEditMode(false)
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
  }

  const handleSavePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long')
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password')
      }

      setIsChangePasswordMode(false)
      setError('')
      // Show success message
      alert('Password changed successfully')
    } catch (err) {
      console.error('Password change error:', err)
      setError(err instanceof Error ? err.message : 'Failed to change password')
    }
  }

  const handleCancel = () => {
    setIsEditMode(false)
    setIsChangePasswordMode(false)
    setError('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (isEditMode) {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }))
    } else if (isChangePasswordMode) {
      setPasswordForm(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user?.accessToken) return

      try {
        setIsLoading(true)
        
        // Fetch study progress
        const progress = await getStudyProgress()
        setStudyProgress(progress)

        // Set user profile from session data
        setUserProfile({
          name: session.user.name || '',
          email: session.user.email || '',
          image: session.user.image || undefined,
          joinedDate: new Date().toLocaleDateString(),
          role: 'Student'
        })

        // Fetch subscription data from the backend
        try {
          const subscriptionData = await getSubscription()
          setSubscription({
            id: subscriptionData.plan,
            name: subscriptionData.plan.charAt(0).toUpperCase() + subscriptionData.plan.slice(1),
            price: subscriptionData.plan === 'basic' ? '$0' : subscriptionData.plan === 'pro' ? '$15' : '$49',
            credits: subscriptionData.credits,
            nextRenewal: subscriptionData.currentPeriodEnd ? new Date(subscriptionData.currentPeriodEnd).toLocaleDateString() : undefined
          })
        } catch (error) {
          console.error('Error fetching subscription:', error)
          // Fallback to basic plan if there's an error
          setSubscription({
            id: 'basic',
            name: 'Basic',
            price: '$0',
            credits: 50,
            nextRenewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
          })
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [session])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-obsidian flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-accent-obsidian py-8">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-accent-neon/10 via-transparent to-transparent" />
      
      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-neon/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 -left-40 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10"
        >
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {userProfile?.image ? (
                <img
                  src={userProfile.image}
                  alt={userProfile.name}
                  className="h-24 w-24 rounded-full ring-2 ring-accent-neon"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-accent-neon/20 flex items-center justify-center ring-2 ring-accent-neon">
                  <UserCircleIcon className="h-12 w-12 text-accent-neon" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{userProfile?.name}</h1>
              <p className="text-accent-silver">{userProfile?.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-accent-silver">Joined {userProfile?.joinedDate}</span>
                <span className="text-sm text-accent-neon">{userProfile?.role}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              label: 'Quiz Average',
              value: `${studyProgress?.quizAverage || 0}%`,
              icon: AcademicCapIcon,
              color: 'text-accent-neon'
            },
            {
              label: 'Flashcard Mastery',
              value: `${studyProgress?.flashcardMastery || 0}%`,
              icon: ChartBarIcon,
              color: 'text-accent-gold'
            },
            {
              label: 'Study Time',
              value: `${Math.round((studyProgress?.totalStudyTime || 0) / 3600)}h`,
              icon: ClockIcon,
              color: 'text-accent-silver'
            },
            {
              label: 'Subjects',
              value: studyProgress?.subjectProgress.length || 0,
              icon: AcademicCapIcon,
              color: 'text-accent-neon'
            }
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-accent-silver text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Settings and Subscription Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Account Settings */}
          <div className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <CogIcon className="h-5 w-5 text-accent-neon" />
              Account Settings
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {isEditMode ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-accent-silver mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/5 rounded-lg text-white focus:ring-2 focus:ring-accent-neon focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-accent-silver mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/5 rounded-lg text-white focus:ring-2 focus:ring-accent-neon focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 px-4 py-2 bg-accent-neon text-black rounded-lg hover:bg-accent-neon/90 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2 bg-white/10 text-accent-silver rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : isChangePasswordMode ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-accent-silver mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/5 rounded-lg text-white focus:ring-2 focus:ring-accent-neon focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-accent-silver mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/5 rounded-lg text-white focus:ring-2 focus:ring-accent-neon focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-accent-silver mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/5 rounded-lg text-white focus:ring-2 focus:ring-accent-neon focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSavePassword}
                      className="flex-1 px-4 py-2 bg-accent-neon text-black rounded-lg hover:bg-accent-neon/90 transition-colors"
                    >
                      Change Password
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2 bg-white/10 text-accent-silver rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleEditProfile}
                    className="w-full text-left px-4 py-3 bg-white/5 rounded-lg text-accent-silver hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="w-full text-left px-4 py-3 bg-white/5 rounded-lg text-accent-silver hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Change Password
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Subscription Details */}
          <div className="bg-glass backdrop-blur-sm rounded-xl p-6 ring-1 ring-accent-silver/10">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5 text-accent-neon" />
              Subscription & Credits
            </h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-white">{subscription.name} Plan</h3>
                  <p className="text-accent-silver text-sm">{subscription.price}/month</p>
                </div>
                <div className="bg-accent-neon/10 px-3 py-1 rounded-full">
                  <span className="text-accent-neon text-sm font-medium">Active</span>
                </div>
              </div>
              
              {subscription.nextRenewal && (
                <p className="text-sm text-accent-silver mb-4">
                  Next renewal: {subscription.nextRenewal}
                </p>
              )}
              
              <Link 
                href="/billing" 
                className="inline-flex items-center gap-1 text-accent-neon hover:text-white transition-colors text-sm"
              >
                Manage subscription <ArrowTopRightOnSquareIcon className="h-3 w-3" />
              </Link>
            </div>

            <div className="border-t border-accent-silver/10 pt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-accent-gold" />
                  AI Credits
                </h3>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-neon">
                  {subscription.credits}
                </span>
              </div>
              
              <div className="bg-white/5 h-2 rounded-full overflow-hidden mb-2">
                <div 
                  className="bg-gradient-to-r from-accent-gold to-accent-neon h-full rounded-full" 
                  style={{ width: `${(subscription.credits / 50) * 100}%` }}
                />
              </div>
              
              <p className="text-sm text-accent-silver mb-4">
                {subscription.credits} credits remaining this month
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-accent-silver">Flashcard generation</span>
                  <span className="text-white">1 credit</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-accent-silver">Quiz generation</span>
                  <span className="text-white">2 credits</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-accent-silver">Notes analysis</span>
                  <span className="text-white">3 credits</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 