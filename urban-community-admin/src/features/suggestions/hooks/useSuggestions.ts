import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  changeSuggestionStatus,
  deleteSuggestion,
  getSuggestions,
  updateSuggestionOfficialResponse,
  type GetSuggestionsParams,
} from '@/features/suggestions/api/suggestionsApi'
import { unwrapApiResult } from '@/lib/api/result'
import type { SuggestionStatus } from '@/types/api.types'

const suggestionsQueryKey = ['suggestions'] as const

export function useSuggestionsQuery(params?: GetSuggestionsParams, enabled = true) {
  return useQuery({
    queryKey: [...suggestionsQueryKey, params?.status ?? 'all', params?.userId ?? ''],
    queryFn: async () => {
      const result = await getSuggestions(params)
      return unwrapApiResult(result)
    },
    enabled,
  })
}

export function useChangeSuggestionStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SuggestionStatus }) => {
      const result = await changeSuggestionStatus(id, status)
      return unwrapApiResult(result)
    },
    onSuccess: async (_data, { id }) => {
      await queryClient.invalidateQueries({ queryKey: suggestionsQueryKey })
      await queryClient.invalidateQueries({ queryKey: ['suggestions', 'detail', id] })
      await queryClient.invalidateQueries({ queryKey: ['suggestions', id, 'allowed-transitions'] })
    },
  })
}

export function useUpdateSuggestionOfficialResponseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, officialResponse }: { id: string; officialResponse: string }) => {
      const result = await updateSuggestionOfficialResponse(id, officialResponse)
      return unwrapApiResult(result)
    },
    onSuccess: async (_data, { id }) => {
      await queryClient.invalidateQueries({ queryKey: suggestionsQueryKey })
      await queryClient.invalidateQueries({ queryKey: ['suggestions', 'detail', id] })
    },
  })
}

export function useDeleteSuggestionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteSuggestion(id)
      return unwrapApiResult(result)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: suggestionsQueryKey })
    },
  })
}
