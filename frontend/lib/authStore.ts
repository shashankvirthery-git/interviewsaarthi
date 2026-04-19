import { create } from 'zustand'
import { authAPI } from '@/services/api'

interface User {
  id: string
  name: string
  email: string
  role: string
  experienceLevel: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login:  (email: string, password: string) => Promise<void>
  signup: (data: any) => Promise<void>
  logout: () => void
  loadFromStorage: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user:            null,
  token:           null,
  isLoading:       false,
  isAuthenticated: false,

  loadFromStorage: () => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('token')
    const user  = localStorage.getItem('user')
    if (token && user) {
      set({ token, user: JSON.parse(user), isAuthenticated: true })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const res = await authAPI.login({ email, password })
      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ token, user, isAuthenticated: true, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  signup: async (data) => {
    set({ isLoading: true })
    try {
      const res = await authAPI.signup(data)
      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ token, user, isAuthenticated: true, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
