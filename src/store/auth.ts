import { create } from 'zustand'
import { api, setTokens, clearTokens, getAccessToken, getRefreshToken } from '../api/client'
import type { AuthResponse, LoginResponse, MultiAccountResponse } from '../types'

interface AuthUser {
  id: string
  email: string | null
  name: string | null
  role: 'ADMIN' | 'CLIENT'
}

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  login: (identifier: string, password: string, selectedUserId?: string) => Promise<LoginResponse>
  logout: (pushToken?: string) => Promise<void>
  restoreSession: () => Promise<void>
  setUser: (user: AuthUser) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (identifier, password, selectedUserId) => {
    const { data } = await api.post<LoginResponse>('/auth/mobile/login', {
      identifier,
      password,
      selectedUserId,
    })

    if ('token' in data) {
      // Direct login success
      const authData = data as AuthResponse
      await setTokens(authData.token, authData.refreshToken)
      set({
        user: authData.user as AuthUser,
        isAuthenticated: true,
      })
    }

    return data
  },

  logout: async (pushToken) => {
    try {
      await api.post('/auth/mobile/logout', { pushToken })
    } catch {
      // Ignore errors on logout
    }
    await clearTokens()
    set({ user: null, isAuthenticated: false })
  },

  restoreSession: async () => {
    set({ isLoading: true })
    try {
      const accessToken = await getAccessToken()
      const refreshToken = await getRefreshToken()

      if (!accessToken && !refreshToken) {
        set({ isLoading: false })
        return
      }

      // Try to get profile to verify token is valid
      const { data } = await api.get('/user/profile')
      set({
        user: {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
        },
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      // Token expired or invalid
      await clearTokens()
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: true })
  },
}))
