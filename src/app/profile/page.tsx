'use client'

import { useState, useEffect } from 'react'
import { useSession, getSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  UserCircleIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { fetchWithAuth } from '@/utils/fetchWithAuth'
import { showToast } from '@/components/ui/Toast'
import { getSessionCoalesced } from '@/utils/fetchWithAuth'

interface UserProfile {
  name: string
  email: string
  image?: string
  joinedDate: string
  role: string
  provider?: string
}


export default function ProfilePage() {
  const { data: session } = useSession()
  const accessToken = (session?.user as Record<string, unknown> | undefined)?.['accessToken'] as string | undefined
  const [isLoading, setIsLoading] = useState(true)
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
      const response = await fetchWithAuth('/api/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      // Update local state with the returned user data
      setUserProfile(prev => prev ? {
        ...prev,
        name: data.user.name,
        email: data.user.email,
      } : null)

      setIsEditMode(false)
      setError('')
      
      // Directly update the profile UI with the new data
      setUserProfile(prev => ({
        ...prev!,
        name: data.user.name,
        email: data.user.email
      }))
      
      showToast({ 
        type: 'success', 
        title: 'Success', 
        message: 'Profile updated successfully' 
      });
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
    console.log('Change password clicked, user provider:', userProfile?.provider)
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

    // For Google users, don't require current password
    if (!userProfile?.provider || userProfile.provider !== 'google') {
      if (!passwordForm.currentPassword) {
        setError('Current password is required')
        return
      }
    }

    try {
      const response = await fetchWithAuth('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: userProfile?.provider === 'google' ? undefined : passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          isGoogleUser: userProfile?.provider === 'google'
        }),
      })

      const data = await response.json()

      setIsChangePasswordMode(false)
      setError('')
      
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Password changed successfully'
      })
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
      // Wait for accessToken to be available
      if (!accessToken) return

      try {
        setIsLoading(true)
        
        // Fetch user data
        const userData = await fetchWithAuth('/api/auth/me').then(res => res.json())

        // Set user profile from backend data (most up-to-date)
        setUserProfile({
          name: userData.user.name || session?.user?.name || '',
          email: userData.user.email || session?.user?.email || '',
          image: session?.user?.image || undefined,
          joinedDate: new Date().toLocaleDateString(),
          role: 'Student',
          provider: userData.user.provider || undefined
        })
        
        console.log('User provider:', userData.user.provider)
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (accessToken) {
      fetchProfileData()
    }
    // Only run this effect when accessToken changes
  }, [accessToken])


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

        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
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
                  {userProfile?.provider !== 'google' && (
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
                  )}
                  {userProfile?.provider === 'google' && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm mb-2">
                      You're using Google to sign in. You can set a password to also sign in with email.
                    </div>
                  )}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-accent-silver mb-1">
                      {userProfile?.provider === 'google' ? 'Set Password' : 'New Password'}
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
                      Confirm {userProfile?.provider === 'google' ? 'Password' : 'New Password'}
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
        </motion.div>
      </div>
    </div>
  )
}