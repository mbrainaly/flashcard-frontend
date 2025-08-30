'use client'

import { SessionProvider } from 'next-auth/react'
import ToastContainer from '@/components/ui/Toast'
import { useEffect } from 'react'
import { showToast } from '@/components/ui/Toast'
import { fetchWithAuth } from '@/utils/fetchWithAuth'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // No-op: placeholder for future global side effects if needed
  }, [])

  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0} refetchWhenOffline={false}>
      {children}
      <ToastContainer />
    </SessionProvider>
  )
}