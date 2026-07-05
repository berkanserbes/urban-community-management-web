import api from '@/lib/api/axios'
import type { ApiResult, ReportPriority, ReportStatus } from '@/types/api.types'

export interface ReportDetailMediaDto {
  id: string
  url: string
  thumbnailUrl?: string | null
  originalFileName?: string | null
  contentType?: string | null
  fileSizeBytes?: number | null
  displayOrder: number
  mediaType: 'Image' | 'Video'
}

export interface ReportDetailHistoryDto {
  id: string
  fromStatus: ReportStatus | null
  toStatus: ReportStatus
  changedByUserFullName: string | null
  note?: string | null
  changedAt: string
}

export interface SimilarReportDto {
  reportId: string
  title: string
  status: ReportStatus
  similarityScore: number
  reasoning: string
}

export interface ReportDetailDto {
  id: string
  title: string
  description: string
  status: ReportStatus
  priority: ReportPriority
  categoryId: string
  categoryName: string
  neighborhoodId: string
  neighborhoodName: string
  latitude?: number | null
  longitude?: number | null
  createdAt: string
  updatedAt?: string
  resolvedAt?: string | null
  userFullName: string
  userId: string
  assignedOrganizationDepartmentId?: string | null
  assignedOrganizationId?: string | null
  assignedOrganizationName?: string | null
  assignedDepartmentId?: string | null
  assignedDepartmentName?: string | null
  assignedDepartmentContactEmail?: string | null
  assignedDepartmentContactPhone?: string | null
  assignmentNeedsReview?: boolean
  media: ReportDetailMediaDto[]
  history: ReportDetailHistoryDto[]
  similarReports: SimilarReportDto[]
}

export type AllowedTransition = {
  newStatus: ReportStatus
  label: string
}

export type AllowedTransitionsResponse = {
  reportId: string
  currentStatus: ReportStatus
  allowedNextStatuses: ReportStatus[]
}

export async function getAllowedTransitions(id: string) {
  const response = await api.get<ApiResult<AllowedTransitionsResponse>>(
    `/api/reports/${id}/allowed-status-transitions`,
  )
  return response.data
}

export async function getReportDetail(id: string) {
  const response = await api.get<ApiResult<ReportDetailDto>>(`/api/reports/${id}`)
  return response.data
}

export async function changeReportStatus(id: string, newStatus: ReportStatus) {
  const response = await api.patch<ApiResult<{ id: string; status: ReportStatus }>>(
    `/api/reports/${id}/status`,
    { newStatus },
  )
  return response.data
}

export async function changeReportPriority(id: string, newPriority: ReportPriority) {
  const response = await api.patch<ApiResult<{ id: string; priority: ReportPriority }>>(
    `/api/reports/${id}/priority`,
    { priority: newPriority },
  )
  return response.data
}
