import api from './axios'
import type { ApiResult } from '@/types/api.types'

export type LogoutResponse = ApiResult<null>

export async function logoutApi() {
  const { refreshToken } = (await import('@/stores/auth.store')).useAuthStore.getState()
  const response = await api.post<LogoutResponse>('/api/auth/logout', {
    refreshToken,
  })
  return response.data
}