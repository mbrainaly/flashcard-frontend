import { useState } from 'react'

export default function useAuthModals() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  const openLogin = () => {
    setIsLoginOpen(true)
    setIsRegisterOpen(false)
  }

  const openRegister = () => {
    setIsRegisterOpen(true)
    setIsLoginOpen(false)
  }

  const closeLogin = () => {
    setIsLoginOpen(false)
  }

  const closeRegister = () => {
    setIsRegisterOpen(false)
  }

  return {
    isLoginOpen,
    isRegisterOpen,
    openLogin,
    openRegister,
    closeLogin,
    closeRegister,
  }
} 