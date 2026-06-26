import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  activateUser,
  adminUpdateUser,
  assignUserRole,
  createOfficial,
  deactivateUser,
  getUserById,
  getUsers,
  type AdminUpdateUserPayload,
  type AssignRolePayload,
  type CreateOfficialPayload,
} from '@/features/users/api/usersApi'
import { unwrapApiResult } from '@/lib/api/result'
import type { UserDto } from '@/types/api.types'

const usersQueryKey = ['users']
const userQueryKey = (id: string) => ['users', id]

export function useUsersQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: usersQueryKey,
    queryFn: async (): Promise<UserDto[]> => {
      const result = await getUsers()
      return unwrapApiResult(result)
    },
    enabled,
  })
}

export function useUserQuery(id: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: id ? userQueryKey(id) : ['users', 'detail', 'empty'],
    queryFn: async (): Promise<UserDto> => {
      if (!id) {
        throw new Error('Kullanıcı seçilmedi')
      }

      const result = await getUserById(id)
      return unwrapApiResult(result)
    },
    enabled: Boolean(id) && enabled,
  })
}

export function useAssignUserRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: AssignRolePayload) => {
      const result = await assignUserRole(payload)
      return unwrapApiResult(result)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey })
    },
  })
}

export function useCreateOfficialMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateOfficialPayload) =>
      unwrapApiResult(await createOfficial(payload)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey })
    },
  })
}

export function useDeactivateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deactivateUser(id)
      return unwrapApiResult(result)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey })
    },
  })
}

export function useActivateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await activateUser(id)
      return unwrapApiResult(result)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey })
    },
  })
}

export function useAdminUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: AdminUpdateUserPayload) => {
      const result = await adminUpdateUser(payload)
      return unwrapApiResult(result)
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey })
      await queryClient.invalidateQueries({ queryKey: userQueryKey(variables.id) })
    },
  })
}
