import api from '@/lib/api/axios'
import type { ApiResult, DepartmentWithStatsDto } from '@/types/api.types'

export type CreateDepartmentPayload = {
  name: string
  description?: string | null
}

export type UpdateDepartmentPayload = {
  id: string
  name: string
  description?: string | null
}

type DepartmentsWithStatsResponse = ApiResult<DepartmentWithStatsDto[]>
type DepartmentMutationResponse = ApiResult<{
  id: string
  name: string
  description?: string | null
}>
type DeleteResponse = ApiResult<{ id: string }>

export async function getDepartmentsWithStats() {
  const response = await api.get<DepartmentsWithStatsResponse>('/api/departments/with-stats')
  return response.data
}

export async function createDepartment(payload: CreateDepartmentPayload) {
  const response = await api.post<DepartmentMutationResponse>('/api/departments', payload)
  return response.data
}

export async function updateDepartment(payload: UpdateDepartmentPayload) {
  const { id, ...body } = payload
  const response = await api.put<DepartmentMutationResponse>(`/api/departments/${id}`, { id, ...body })
  return response.data
}

export async function deleteDepartment(id: string) {
  const response = await api.delete<DeleteResponse>(`/api/departments/${id}`)
  return response.data
}
