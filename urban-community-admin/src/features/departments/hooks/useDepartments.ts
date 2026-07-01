import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createDepartment,
  deleteDepartment,
  getDepartmentsWithStats,
  updateDepartment,
  type CreateDepartmentPayload,
  type UpdateDepartmentPayload,
} from '@/features/departments/api/departmentsApi'
import { unwrapApiResult } from '@/lib/api/result'

const departmentsQueryKey = ['departments'] as const

export function useDepartmentsQuery(enabled = true) {
  return useQuery({
    queryKey: departmentsQueryKey,
    queryFn: async () => {
      const result = await getDepartmentsWithStats()
      return unwrapApiResult(result)
    },
    enabled,
  })
}

export function useCreateDepartmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateDepartmentPayload) => {
      const result = await createDepartment(payload)
      return unwrapApiResult(result)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: departmentsQueryKey })
    },
  })
}

export function useUpdateDepartmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateDepartmentPayload) => {
      const result = await updateDepartment(payload)
      return unwrapApiResult(result)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: departmentsQueryKey })
    },
  })
}

export function useDeleteDepartmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteDepartment(id)
      return unwrapApiResult(result)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: departmentsQueryKey })
    },
  })
}
