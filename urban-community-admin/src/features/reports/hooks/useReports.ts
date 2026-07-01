import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignReport,
  getManageableReports,
  getReportAssignmentOptions,
} from '@/features/reports/api/reportsApi'
import { unwrapApiResult } from '@/lib/api/result'

const reportsKey = ['reports', 'manageable']

export function useManageableReportsQuery() {
  return useQuery({
    queryKey: reportsKey,
    queryFn: async () => unwrapApiResult(await getManageableReports()),
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: reportsKey })
    },
  })
}
