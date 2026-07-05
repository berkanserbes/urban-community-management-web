import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getManageableAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  activateAnnouncement,
  deactivateAnnouncement,
  deleteAnnouncement,
  type CreateAnnouncementPayload,
  type UpdateAnnouncementPayload,
} from '@/features/announcements/api/announcementsApi'
import { unwrapApiResult } from '@/lib/api/result'

const announcementsQueryKey = ['announcements', 'manageable'] as const

export function useManageableAnnouncementsQuery() {
  return useQuery({
    queryKey: announcementsQueryKey,
    queryFn: async () => {
      const result = await getManageableAnnouncements()
      return unwrapApiResult(result)
    },
  })
}

export function useCreateAnnouncementMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateAnnouncementPayload) => {
      const result = await createAnnouncement(payload)
      return unwrapApiResult(result)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: announcementsQueryKey })
      toast.success('Duyuru oluşturuldu')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Duyuru oluşturulamadı')
    },
  })
}

export function useUpdateAnnouncementMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateAnnouncementPayload) => {
      const result = await updateAnnouncement(payload)
      return unwrapApiResult(result)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: announcementsQueryKey })
      toast.success('Duyuru güncellendi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Duyuru güncellenemedi')
    },
  })
}

export function useActivateAnnouncementMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await activateAnnouncement(id)
      return unwrapApiResult(result)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: announcementsQueryKey })
      toast.success('Duyuru aktifleştirildi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Duyuru aktifleştirilemedi')
    },
  })
}

export function useDeactivateAnnouncementMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deactivateAnnouncement(id)
      return unwrapApiResult(result)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: announcementsQueryKey })
      toast.success('Duyuru pasifleştirildi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Duyuru pasifleştirilemedi')
    },
  })
}

export function useDeleteAnnouncementMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteAnnouncement(id)
      return unwrapApiResult(result)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: announcementsQueryKey })
      toast.success('Duyuru silindi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Duyuru silinemedi')
    },
  })
}
