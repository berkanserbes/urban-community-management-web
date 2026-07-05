import api from '@/lib/api/axios'
import type { ApiResult, ReportDto } from '@/types/api.types'

export type ReportAssignmentOption = {
  organizationDepartmentId: string
  organizationId: string
  organizationName: string
  departmentId: string
  departmentName: string
  contactEmail?: string | null
  contactPhone?: string | null
  handlesReportCategory: boolean
}

export async function getManageableReports() {
  return (await api.get<ApiResult<ReportDto[]>>('/api/reports/manageable')).data
}

export async function getReportAssignmentOptions(reportId: string) {
  return (
    await api.get<ApiResult<ReportAssignmentOption[]>>(
      `/api/reports/${reportId}/assignment-options`,
    )
  ).data
}

export async function assignReport(
  reportId: string,
  organizationDepartmentId: string | null,
) {
  return (
    await api.patch<ApiResult<unknown>>(`/api/reports/${reportId}/assign-department`, {
      organizationDepartmentId,
    })
  ).data
}
