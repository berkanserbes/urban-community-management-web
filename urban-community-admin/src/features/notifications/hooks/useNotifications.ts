import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  markAsUnread,
  deleteNotification,
  deleteAllNotifications,
} from '@/features/notifications/api/notificationsApi'
import { unwrapApiResult } from '@/lib/api/result'
import type { PaginationParams } from '@/types/api.types'

const notificationsKey = ['notifications'] as const

export function useNotificationsQuery(params: PaginationParams, enabled = true) {
  return useQuery({
    queryKey: [...notificationsKey, 'list', params],
    queryFn: async () => unwrapApiResult(await getNotifications(params)),
    enabled,
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  })
}

export function useUnreadCountQuery(enabled = true) {
  return useQuery({
    queryKey: [...notificationsKey, 'unread-count'],
    queryFn: async () => unwrapApiResult(await getUnreadCount()).unreadCount,
    enabled,
    refetchInterval: 15_000,
  })
}

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => unwrapApiResult(await markAsRead(id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationsKey })
    },
  })
}

export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => unwrapApiResult(await markAllAsRead()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationsKey })
    },
  })
}

export function useMarkAsUnreadMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => unwrapApiResult(await markAsUnread(id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationsKey })
    },
  })
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => unwrapApiResult(await deleteNotification(id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationsKey })
    },
  })
}

export function useDeleteAllNotificationsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => unwrapApiResult(await deleteAllNotifications()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationsKey })
    },
  })
}
