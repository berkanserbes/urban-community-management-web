import axios, { type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import type { RefreshTokenResponse } from '@/types/api.types'

interface RequestConfigWithRetry extends InternalAxiosRequestConfig {
  _retryCount?: number
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RequestConfigWithRetry | undefined
    if (!originalRequest) return Promise.reject(error)

    // Only handle 401 errors and avoid retrying the refresh endpoint itself
    if (error.response?.status !== 401 || originalRequest.url?.includes('/api/auth/refresh-token')) {
      const data = error.response?.data
      if (data?.errors?.length) {
        return Promise.reject(new Error(data.errors[0]))
      }
      return Promise.reject(error)
    }

    // Prevent infinite retry loops
    originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1
    if (originalRequest._retryCount > 1) {
      const data = error.response?.data
      if (data?.errors?.length) {
        return Promise.reject(new Error(data.errors[0]))
      }
      return Promise.reject(error)
    }

    // Skip retry for profile endpoint if user data is already available in store
    if (originalRequest.url?.includes('/api/users/me') && useAuthStore.getState().user) {
      const data = error.response?.data
      if (data?.errors?.length) {
        return Promise.reject(new Error(data.errors[0]))
      }
      return Promise.reject(error)
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    const { refreshToken } = useAuthStore.getState()
    if (!refreshToken) {
      useAuthStore.getState().logout()
      sessionStorage.setItem('auth_error', 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.')
      return Promise.reject(error)
    }

    isRefreshing = true

    try {
      const response = await axios.post<RefreshTokenResponse>(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh-token`,
        {
          accessToken: useAuthStore.getState().accessToken,
          refreshToken,
        },
      )

      const payload = response.data
      if (!payload.isSuccess || !payload.data) {
        const errorMsg = payload.errors[0] ?? 'Refresh failed'
        throw new Error(errorMsg)
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = payload.data
      useAuthStore.getState().setTokens(newAccessToken, newRefreshToken)
      useAuthStore.getState().updateUser({
        mustChangePassword: payload.data.mustChangePassword,
      })

      processQueue(null, newAccessToken)

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      useAuthStore.getState().logout()
      sessionStorage.setItem('auth_error', 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.')
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
