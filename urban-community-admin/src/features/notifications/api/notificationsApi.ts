import api from '@/lib/api/axios'
import type { ApiResult, NotificationDto } from '@/types/api.types'

type NotificationsResponse = ApiResult<NotificationDto[]>
type NotificationResponse = ApiResult<NotificationDto>
type UnreadCountResponse = ApiResult<number>

export async function getNotifications() {
  const response = await api.get<NotificationsResponse>('/api/notifications')
  return response.data
}

export async function getUnreadCount() {
  const response = await api.get<UnreadCountResponse>('/api/notifications/unread-count')
  return response.data
}

export async function markAsRead(id: string) {
  const response = await api.patch<NotificationResponse>(`/api/notifications/${id}/read`)
  return response.data
}

export async function markAllAsRead() {
  const response = await api.patch<NotificationResponse>('/api/notifications/read-all')
  return response.data
}

export async function markAsUnread(id: string) {
  const response = await api.patch<NotificationResponse>(`/api/notifications/${id}/unread`)
  return response.data
}

export async function deleteNotification(id: string) {
  const response = await api.delete<ApiResult<{ id: string }>>(`/api/notifications/${id}`)
  return response.data
}

export async function deleteAllNotifications() {
  const response = await api.delete<ApiResult<{ message: string }>>('/api/notifications')
  return response.data
}
