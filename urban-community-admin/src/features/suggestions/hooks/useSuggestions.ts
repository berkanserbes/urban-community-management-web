import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  changeSuggestionStatus,
  deleteSuggestion,
  getSuggestions,
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: suggestionsQueryKey })
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
