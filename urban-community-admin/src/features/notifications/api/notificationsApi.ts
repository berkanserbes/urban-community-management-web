import api from '@/lib/api/axios'
import type { ApiResult, NotificationDto, PagedResult, PaginationParams } from '@/types/api.types'

type NotificationsResponse = ApiResult<PagedResult<NotificationDto>>
type UnreadCountResponse = ApiResult<{ unreadCount: number }>
type IdMessageResponse = ApiResult<{ id: string; message: string }>
type CountMessageResponse = ApiResult<{ markedCount?: number; deletedCount?: number; message: string }>

export async function getNotifications(params: PaginationParams) {
  const response = await api.get<NotificationsResponse>('/api/notifications', { params })
  return response.data
}

export async function getUnreadCount() {
  const response = await api.get<UnreadCountResponse>('/api/notifications/unread-count')
  return response.data
}

export async function markAsRead(id: string) {
  const response = await api.patch<IdMessageResponse>(`/api/notifications/${id}/read`)
  return response.data
}

export async function markAllAsRead() {
  const response = await api.patch<CountMessageResponse>('/api/notifications/read-all')
  return response.data
}

export async function markAsUnread(id: string) {
  const response = await api.patch<IdMessageResponse>(`/api/notifications/${id}/unread`)
  return response.data
}

export async function deleteNotification(id: string) {
  const response = await api.delete<ApiResult<{ message: string }>>(`/api/notifications/${id}`)
  return response.data
}

export async function deleteAllNotifications() {
  const response = await api.delete<CountMessageResponse>('/api/notifications')
  return response.data
}
