import api from '@/lib/api/axios'
import type { ApiResult, SuggestionDto, SuggestionStatus } from '@/types/api.types'

export type GetSuggestionsParams = {
  status?: SuggestionStatus
  userId?: string
}

type SuggestionsResponse = ApiResult<SuggestionDto[]>
type ChangeSuggestionStatusResponse = ApiResult<{ id: string; status: SuggestionStatus }>
type DeleteSuggestionResponse = ApiResult<{ id: string }>
type UpdateSuggestionOfficialResponseResponse = ApiResult<{
  id: string
  officialResponse: string | null
}>

export async function getSuggestions(params?: GetSuggestionsParams) {
  const response = await api.get<SuggestionsResponse>('/api/suggestions', { params })
  return response.data
}

export async function changeSuggestionStatus(id: string, newStatus: SuggestionStatus) {
  const response = await api.patch<ChangeSuggestionStatusResponse>(
    `/api/suggestions/${id}/status`,
    { newStatus },
  )
  return response.data
}

export async function updateSuggestionOfficialResponse(id: string, officialResponse: string) {
  const response = await api.patch<UpdateSuggestionOfficialResponseResponse>(
    `/api/suggestions/${id}/official-response`,
    { officialResponse },
  )
  return response.data
}

export async function deleteSuggestion(id: string) {
  const response = await api.delete<DeleteSuggestionResponse>(`/api/suggestions/${id}`)
  return response.data
}
