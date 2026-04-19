'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/authStore'

export function useAuth(requireAuth = true) {
  const { isAuthenticated, user, token, logout, loadFromStorage } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    loadFromStorage()
  }, [])

  useEffect(() => {
    if (requireAuth && !isAuthenticated && typeof window !== 'undefined') {
      const stored = localStorage.getItem('token')
      if (!stored) router.push('/auth/login')
    }
  }, [isAuthenticated, requireAuth, router])

  return { isAuthenticated, user, token, logout }
}
