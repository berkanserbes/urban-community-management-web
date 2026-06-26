import api from '@/lib/api/axios'
import type { ApiResult, AuthUser } from '@/types/api.types'

export type UpdateProfilePayload = {
  firstName: string
  lastName: string
  bio?: string | null
  neighborhoodId?: string | null
  phoneNumber?: string | null
}

export type ChangePasswordPayload = {
  userId: string
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export type UpdateProfileResponse = {
  id: string
  firstName: string
  lastName: string
  bio?: string | null
  phoneNumber?: string | null
  neighborhoodId?: string | null
  profileImageUrl?: string | null
  updatedAt: string
}

export type ChangePasswordResponse = {
  userId: string
  message: string
}

export type UpdateProfileImageResponse = {
  userId: string
  profileImageUrl: string
  message: string
}

export type DeleteProfileImageResponse = {
  userId: string
  message: string
}

export async function getCurrentUser() {
  const response = await api.get<ApiResult<AuthUser>>('/api/users/me')
  return response.data
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await api.put<ApiResult<UpdateProfileResponse>>('/api/users/me/profile', payload)
  return response.data
}

export async function changePassword(payload: ChangePasswordPayload) {
  const response = await api.put<ApiResult<ChangePasswordResponse>>('/api/users/me/password', payload)
  return response.data
}

export async function updateProfileImage(image: File) {
  const formData = new FormData()
  formData.append('image', image)

  const response = await api.post<ApiResult<UpdateProfileImageResponse>>('/api/users/me/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export async function deleteProfileImage() {
  const response = await api.delete<ApiResult<DeleteProfileImageResponse>>('/api/users/me/profile-image')
  return response.data
}
