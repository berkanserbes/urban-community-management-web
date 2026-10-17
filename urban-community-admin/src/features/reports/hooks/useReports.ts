import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignReport,
  getManageableReports,
  getManageableReportStats,
  getReportAssignmentOptions,
  type ManageableReportsParams,
} from '@/features/reports/api/reportsApi'
import { unwrapApiResult } from '@/lib/api/result'

const reportsKey = ['reports', 'manageable']

export function useManageableReportsQuery(params: ManageableReportsParams) {
  return useQuery({
    queryKey: [...reportsKey, 'list', params],
    queryFn: async () => unwrapApiResult(await getManageableReports(params)),
    placeholderData: keepPreviousData,
  })
}

export function useManageableReportStatsQuery() {
  return useQuery({
    queryKey: [...reportsKey, 'stats'],
    queryFn: async () => unwrapApiResult(await getManageableReportStats()),
  })
}

export function useReportAssignmentOptionsQuery(reportId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['reports', reportId, 'assignment-options'],
    queryFn: async () => {
      if (!reportId) throw new Error('Rapor seçilmedi')
      return unwrapApiResult(await getReportAssignmentOptions(reportId))
    },
    enabled: Boolean(reportId) && enabled,
  })
}

export function useAssignReportMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      reportId,
      organizationDepartmentId,
    }: {
      reportId: string
      organizationDepartmentId: string | null
    }) => assignReport(reportId, organizationDepartmentId).then(unwrapApiResult),
    onSuccess: async (_data, { reportId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: reportsKey }),
        queryClient.invalidateQueries({ queryKey: ['reports', 'detail', reportId] }),
        queryClient.invalidateQueries({ queryKey: ['reports', reportId, 'assignment-options'] }),
      ])
    },
  })
}
