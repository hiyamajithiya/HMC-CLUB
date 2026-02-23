import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import * as SecureStore from 'expo-secure-store'

const API_BASE_URL = 'https://himanshumajithiya.com'

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Token storage keys
const ACCESS_TOKEN_KEY = 'hmc_access_token'
const REFRESH_TOKEN_KEY = 'hmc_refresh_token'

// Token management
export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken)
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken)
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
}

// Flag to prevent multiple concurrent refresh attempts
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach(cb => cb(newToken))
  refreshSubscribers = []
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

// Request interceptor — attach Bearer token
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle 401 with token refresh
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Only handle 401 for authenticated requests
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Don't try to refresh for auth routes
    if (originalRequest.url?.includes('/auth/mobile/')) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Wait for the ongoing refresh to complete
      return new Promise(resolve => {
        addRefreshSubscriber((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          originalRequest._retry = true
          resolve(api(originalRequest))
        })
      })
    }

    isRefreshing = true
    originalRequest._retry = true

    try {
      const refreshToken = await getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const { data } = await axios.post(`${API_BASE_URL}/api/auth/mobile/refresh`, {
        refreshToken,
      })

      await setTokens(data.token, data.refreshToken)
      onTokenRefreshed(data.token)

      originalRequest.headers.Authorization = `Bearer ${data.token}`
      return api(originalRequest)
    } catch (refreshError) {
      // Refresh failed — clear tokens, user needs to log in again
      await clearTokens()
      // The auth store will detect this and redirect to login
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export { API_BASE_URL }
