import api from '@/lib/api/axios'
import type { ApiResult } from '@/types/api.types'

export interface CommentDto {
  id: string
  content: string
  userId: string
  authorName: string
  createdAt: string
  updatedAt?: string | null
}

type CommentsResponse = ApiResult<CommentDto[]>
type CommentResponse = ApiResult<CommentDto>

export async function getReportComments(reportId: string) {
  const response = await api.get<CommentsResponse>(`/api/reports/${reportId}/comments`)
  return response.data
}

export async function createReportComment(reportId: string, content: string) {
  const response = await api.post<CommentResponse>(`/api/reports/${reportId}/comments`, { content })
  return response.data
}

export async function deleteReportComment(commentId: string) {
  const response = await api.delete<ApiResult<{ id: string }>>(`/api/report-comments/${commentId}`)
  return response.data
}

export async function getSuggestionComments(suggestionId: string) {
  const response = await api.get<CommentsResponse>(`/api/suggestions/${suggestionId}/comments`)
  return response.data
}

export async function createSuggestionComment(suggestionId: string, content: string) {
  const response = await api.post<CommentResponse>(`/api/suggestions/${suggestionId}/comments`, { content })
  return response.data
}

export async function deleteSuggestionComment(commentId: string) {
  const response = await api.delete<ApiResult<{ id: string }>>(`/api/suggestion-comments/${commentId}`)
  return response.data
}
