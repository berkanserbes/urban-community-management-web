import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getReportComments,
  createReportComment,
  deleteReportComment,
  getSuggestionComments,
  createSuggestionComment,
  deleteSuggestionComment,
} from '@/features/comments/api/commentsApi'
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination'
import { unwrapApiResult } from '@/lib/api/result'
import type { PagedResult } from '@/types/api.types'

// Comments load oldest first; "load more" appends the next page.
const nextPageParam = (lastPage: PagedResult<unknown>) =>
  lastPage.hasNextPage ? lastPage.pageIndex + 1 : undefined

export function useReportCommentsQuery(reportId: string | null) {
  return useInfiniteQuery({
    queryKey: ['comments', 'report', reportId],
    queryFn: async ({ pageParam }) => {
      if (!reportId) throw new Error('Rapor seçilmedi')
      return unwrapApiResult(
        await getReportComments(reportId, { pageIndex: pageParam, pageSize: DEFAULT_PAGE_SIZE }),
      )
    },
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled: Boolean(reportId),
  })
}

export function useCreateReportCommentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ reportId, content }: { reportId: string; content: string }) =>
      unwrapApiResult(await createReportComment(reportId, content)),
    onSuccess: async (_data, { reportId }) => {
      await queryClient.invalidateQueries({ queryKey: ['comments', 'report', reportId] })
    },
  })
}

export function useDeleteReportCommentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ reportId, commentId }: { reportId: string; commentId: string }) => {
      await deleteReportComment(commentId)
      return reportId
    },
    onSuccess: async (reportId) => {
      await queryClient.invalidateQueries({ queryKey: ['comments', 'report', reportId] })
    },
  })
}

export function useSuggestionCommentsQuery(suggestionId: string | null) {
  return useInfiniteQuery({
    queryKey: ['comments', 'suggestion', suggestionId],
    queryFn: async ({ pageParam }) => {
      if (!suggestionId) throw new Error('Öneri seçilmedi')
      return unwrapApiResult(
        await getSuggestionComments(suggestionId, { pageIndex: pageParam, pageSize: DEFAULT_PAGE_SIZE }),
      )
    },
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled: Boolean(suggestionId),
  })
}

export function useCreateSuggestionCommentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ suggestionId, content }: { suggestionId: string; content: string }) =>
      unwrapApiResult(await createSuggestionComment(suggestionId, content)),
    onSuccess: async (_data, { suggestionId }) => {
      await queryClient.invalidateQueries({ queryKey: ['comments', 'suggestion', suggestionId] })
    },
  })
}

export function useDeleteSuggestionCommentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ suggestionId, commentId }: { suggestionId: string; commentId: string }) => {
      await deleteSuggestionComment(commentId)
      return suggestionId
    },
    onSuccess: async (suggestionId) => {
      await queryClient.invalidateQueries({ queryKey: ['comments', 'suggestion', suggestionId] })
    },
  })
}
