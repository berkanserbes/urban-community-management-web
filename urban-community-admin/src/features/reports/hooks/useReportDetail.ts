import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getReportDetail,
  getAllowedTransitions,
  changeReportStatus,
  changeReportPriority,
} from '@/features/reports/api/reportDetailApi'
import { unwrapApiResult } from '@/lib/api/result'
import type { ReportPriority, ReportStatus } from '@/types/api.types'

const STATUS_TRANSITION_LABELS: Record<string, string> = {
  PendingReview: 'Beklemede',
  AiReview: 'AI İncelemesinde',
  Confirmed: 'Onaylandı',
  InProgress: 'İşleme Alındı',
  Resolved: 'Çözüldü',
  Rejected: 'Reddedildi',
}

const manageableKey = ['reports', 'manageable']

export function useReportDetailQuery(id: string | null) {
  return useQuery({
    queryKey: ['reports', 'detail', id],
    queryFn: async () => {
      if (!id) throw new Error('Rapor seçilmedi')
      return unwrapApiResult(await getReportDetail(id))
    },
    enabled: Boolean(id),
  })
}

export function useAllowedTransitionsQuery(id: string | null) {
  return useQuery({
    queryKey: ['reports', id, 'allowed-transitions'],
    queryFn: async () => {
      if (!id) throw new Error('Rapor seçilmedi')
      const result = unwrapApiResult(await getAllowedTransitions(id))
      return (result.allowedNextStatuses ?? []).map((status) => ({
        newStatus: status,
        label: STATUS_TRANSITION_LABELS[status] ?? status,
      }))
    },
    enabled: Boolean(id),
  })
}

export function useChangeReportStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: ReportStatus }) =>
      unwrapApiResult(await changeReportStatus(id, newStatus)),
    onSuccess: async (_data, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['reports', 'detail', id] })
      await queryClient.invalidateQueries({ queryKey: manageableKey })
      toast.success('Rapor durumu güncellendi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Durum güncellenemedi')
    },
  })
}

export function useChangeReportPriorityMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, newPriority }: { id: string; newPriority: ReportPriority }) =>
      unwrapApiResult(await changeReportPriority(id, newPriority)),
    onSuccess: async (_data, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['reports', 'detail', id] })
      await queryClient.invalidateQueries({ queryKey: manageableKey })
      toast.success('Rapor önceliği güncellendi')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Öncelik güncellenemedi')
    },
  })
}
