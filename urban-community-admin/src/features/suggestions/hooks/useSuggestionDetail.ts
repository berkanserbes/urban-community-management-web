import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getSuggestionDetail,
  getAllowedSuggestionTransitions,
  getVoteSummary,
  setVote,
  removeVote,
} from '@/features/suggestions/api/suggestionDetailApi'
import { unwrapApiResult } from '@/lib/api/result'

export function useSuggestionDetailQuery(id: string | null) {
  return useQuery({
    queryKey: ['suggestions', 'detail', id],
    queryFn: async () => {
      if (!id) throw new Error('Öneri seçilmedi')
      return unwrapApiResult(await getSuggestionDetail(id))
    },
    enabled: Boolean(id),
  })
}

export function useAllowedSuggestionTransitionsQuery(id: string | null) {
  return useQuery({
    queryKey: ['suggestions', id, 'allowed-transitions'],
    queryFn: async () => {
      if (!id) throw new Error('Öneri seçilmedi')
      return unwrapApiResult(await getAllowedSuggestionTransitions(id))
    },
    enabled: Boolean(id),
  })
}

export function useVoteSummaryQuery(suggestionId: string | null) {
  return useQuery({
    queryKey: ['suggestions', suggestionId, 'votes', 'summary'],
    queryFn: async () => {
      if (!suggestionId) throw new Error('Öneri seçilmedi')
      return unwrapApiResult(await getVoteSummary(suggestionId))
    },
    enabled: Boolean(suggestionId),
  })
}

export function useSetVoteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ suggestionId, voteType }: { suggestionId: string; voteType: 'Upvote' | 'Downvote' }) =>
      unwrapApiResult(await setVote(suggestionId, voteType)),
    onSuccess: async (_data, { suggestionId }) => {
      await queryClient.invalidateQueries({ queryKey: ['suggestions', suggestionId, 'votes'] })
      await queryClient.invalidateQueries({ queryKey: ['suggestions', 'detail', suggestionId] })
    },
  })
}

export function useRemoveVoteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (suggestionId: string) => unwrapApiResult(await removeVote(suggestionId)),
    onSuccess: async (_data, suggestionId) => {
      await queryClient.invalidateQueries({ queryKey: ['suggestions', suggestionId, 'votes'] })
      await queryClient.invalidateQueries({ queryKey: ['suggestions', 'detail', suggestionId] })
    },
  })
}
