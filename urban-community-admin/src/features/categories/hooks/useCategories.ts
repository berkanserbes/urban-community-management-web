import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCategory,
  deleteCategory,
  getCategoriesWithReportCount,
  updateCategory,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from '@/features/categories/api/categoriesApi'
import { unwrapApiResult } from '@/lib/api/result'

const categoriesQueryKey = ['categories'] as const

export function useCategoriesQuery(enabled = true) {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: async () => {
      const result = await getCategoriesWithReportCount()
      return unwrapApiResult(result)
    },
    enabled,
  })
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      const result = await createCategory(payload)
      return unwrapApiResult(result)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey })
    },
  })
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateCategoryPayload) => {
      const result = await updateCategory(payload)
      return unwrapApiResult(result)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey })
    },
  })
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCategory(id)
      return unwrapApiResult(result)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey })
    },
  })
}
