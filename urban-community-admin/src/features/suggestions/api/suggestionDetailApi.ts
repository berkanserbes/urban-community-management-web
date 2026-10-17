import api from '@/lib/api/axios'
import type { ApiResult, SuggestionDto, SuggestionStatus } from '@/types/api.types'

export type AllowedSuggestionTransition = {
  suggestionId: string
  currentStatus: SuggestionStatus
  allowedNextStatuses: SuggestionStatus[]
}

export type VoteSummary = {
  upVotes: number
  downVotes: number
  userVote?: 'Upvote' | 'Downvote' | null
}

export async function getSuggestionDetail(id: string) {
  const response = await api.get<ApiResult<SuggestionDto>>(`/api/suggestions/${id}`)
  return response.data
}

export async function getAllowedSuggestionTransitions(id: string) {
  const response = await api.get<ApiResult<AllowedSuggestionTransition>>(
    `/api/suggestions/${id}/allowed-status-transitions`,
  )
  return response.data
}

export async function getVoteSummary(suggestionId: string) {
  const response = await api.get<ApiResult<VoteSummary>>(
    `/api/suggestions/${suggestionId}/votes/summary`,
  )
  return response.data
}

export async function setVote(suggestionId: string, voteType: 'Upvote' | 'Downvote') {
  const response = await api.put<ApiResult<{ voteType: 'Upvote' | 'Downvote' }>>(
    `/api/suggestions/${suggestionId}/votes`,
    { voteType },
  )
  return response.data
}

export async function removeVote(suggestionId: string) {
  const response = await api.delete<ApiResult<{ message: string }>>(
    `/api/suggestions/${suggestionId}/votes`,
  )
  return response.data
}
