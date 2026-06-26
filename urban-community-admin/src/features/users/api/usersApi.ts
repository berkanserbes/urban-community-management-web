import api from '@/lib/api/axios'
import type { ApiResult, UserDto } from '@/types/api.types'

export type GetUsersResponse = ApiResult<UserDto[]>

export type GetUserByIdResponse = ApiResult<UserDto>

export type AssignRolePayload = {
  id: string
  role: UserDto['role']
  organizationDepartmentId?: string | null
  officialJurisdictionLevel?: string | null
  officialJurisdictionId?: string | null
}

export type AssignRoleResponse = ApiResult<{
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserDto['role']
  organizationDepartmentId?: string | null
}>

export type ToggleUserResponse = ApiResult<{
  id: string
  isActive: boolean
  message: string
}>

export async function getUsers() {
  const response = await api.get<GetUsersResponse>('/api/users')
  return response.data
}

export async function getUserById(id: string) {
  const response = await api.get<GetUserByIdResponse>(`/api/users/${id}`)
  return response.data
}

export async function assignUserRole(payload: AssignRolePayload) {
  const response = await api.put<AssignRoleResponse>(`/api/users/${payload.id}/access`, {
    role: payload.role,
    organizationDepartmentId: payload.organizationDepartmentId ?? null,
    officialJurisdictionLevel: payload.officialJurisdictionLevel ?? null,
    officialJurisdictionId: payload.officialJurisdictionId ?? null,
  })
  return response.data
}

export type CreateOfficialPayload = {
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string | null
  organizationDepartmentId: string
  officialJurisdictionLevel: 'Province' | 'District' | 'Neighborhood'
  officialJurisdictionId: string
}

export type CreateOfficialResult = ApiResult<{
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'Official'
  organizationDepartmentId: string
  organizationName: string
  departmentName: string
  officialJurisdictionLevel: 'Province' | 'District' | 'Neighborhood'
  officialJurisdictionId: string
  officialJurisdictionName: string
  temporaryPassword: string
  mustChangePassword: boolean
}>

export async function createOfficial(payload: CreateOfficialPayload) {
  return (await api.post<CreateOfficialResult>('/api/users/officials', payload)).data
}

export async function deactivateUser(id: string) {
  const response = await api.delete<ToggleUserResponse>(`/api/users/${id}`)
  return response.data
}

export async function activateUser(id: string) {
  const response = await api.patch<ToggleUserResponse>(`/api/users/${id}/activate`)
  return response.data
}

export type AdminUpdateUserPayload = {
  id: string
  firstName: string
  lastName: string
  bio?: string | null
  phoneNumber?: string | null
  neighborhoodId?: string | null
}

export type AdminUpdateUserResult = ApiResult<{
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string | null
  role: UserDto['role']
  isActive: boolean
  neighborhoodId?: string | null
  organizationDepartmentId?: string | null
  bio?: string | null
  profileImageUrl?: string | null
}>

export async function adminUpdateUser(payload: AdminUpdateUserPayload) {
  const { id, ...body } = payload
  const response = await api.put<AdminUpdateUserResult>(`/api/users/${id}`, body)
  return response.data
}
