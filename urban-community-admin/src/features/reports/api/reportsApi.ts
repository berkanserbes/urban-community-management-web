import api from '@/lib/api/axios'
import type {
  ApiResult,
  PagedResult,
  PaginationParams,
  ReportDto,
  ReportPriority,
  ReportStatus,
} from '@/types/api.types'

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

export type ReportAssignmentFilter = 'Unassigned' | 'NeedsReview'

export type ManageableReportsParams = PaginationParams & {
  search?: string
  status?: ReportStatus
  priority?: ReportPriority
  assignment?: ReportAssignmentFilter
}

export type ManageableReportStats = {
  total: number
  pendingReview: number
  aiReview: number
  confirmed: number
  inProgress: number
  resolved: number
  rejected: number
  urgent: number
  unassigned: number
  needsReview: number
}

export async function getManageableReports(params: ManageableReportsParams) {
  return (
    await api.get<ApiResult<PagedResult<ReportDto>>>('/api/reports/manageable', { params })
  ).data
}

export async function getManageableReportStats() {
  return (await api.get<ApiResult<ManageableReportStats>>('/api/reports/manageable/stats')).data
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
