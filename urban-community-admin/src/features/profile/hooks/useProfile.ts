import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  changePassword,
  deleteProfileImage,
  getCurrentUser,
  updateProfile,
  updateProfileImage,
  type ChangePasswordPayload,
  type UpdateProfilePayload,
} from '@/features/profile/api/profileApi'
import { unwrapApiResult } from '@/lib/api/result'
import type { AuthUser } from '@/types/api.types'

const currentUserQueryKey = ['current-user']

export function useCurrentUserQuery(enabled: boolean) {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: async (): Promise<AuthUser> => {
      const result = await getCurrentUser()
      return unwrapApiResult(result)
    },
    enabled,
    retry: false,
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const result = await updateProfile(payload)
      return unwrapApiResult(result)
    },
    onSuccess: async (updatedUser) => {
      const currentUser = queryClient.getQueryData<AuthUser>(currentUserQueryKey)
      if (currentUser) {
        await queryClient.setQueryData(currentUserQueryKey, {
          ...currentUser,
          ...updatedUser,
        })
      }
    },
  })
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const result = await changePassword(payload)
      return unwrapApiResult(result)
    },
  })
}

export function useUpdateProfileImageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (image: File) => {
      const result = await updateProfileImage(image)
      return unwrapApiResult(result)
    },
    onSuccess: async (payload) => {
      const currentUser = queryClient.getQueryData<AuthUser>(currentUserQueryKey)
      if (currentUser) {
        await queryClient.setQueryData(currentUserQueryKey, {
          ...currentUser,
          profileImageUrl: payload.profileImageUrl,
        })
      }
    },
  })
}

export function useDeleteProfileImageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const result = await deleteProfileImage()
      return unwrapApiResult(result)
    },
    onSuccess: async () => {
      const currentUser = queryClient.getQueryData<AuthUser>(currentUserQueryKey)
      if (currentUser) {
        await queryClient.setQueryData(currentUserQueryKey, {
          ...currentUser,
          profileImageUrl: null,
        })
      }
    },
  })
}
