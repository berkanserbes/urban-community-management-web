import api from '@/lib/api/axios'
import type { ApiResult, CategoryDto } from '@/types/api.types'

export type CategoryWithReportCountDto = CategoryDto

export type CreateCategoryPayload = {
  name: string
  description?: string | null
  iconUrl?: string | null
}

export type UpdateCategoryPayload = {
  id: string
  name: string
  description?: string | null
  iconUrl?: string | null
}

type CategoriesResponse = ApiResult<CategoryDto[]>
type CategoryWithCountResponse = ApiResult<CategoryWithReportCountDto[]>
type CategoryMutationResponse = ApiResult<{
  id: string
  name: string
  description?: string | null
  iconUrl?: string | null
}>
type DeleteResponse = ApiResult<{ id: string }>

export async function getCategories() {
  const response = await api.get<CategoriesResponse>('/api/categories')
  return response.data
}

export async function getCategoriesWithReportCount() {
  const response = await api.get<CategoryWithCountResponse>('/api/categories/with-report-count')
  return response.data
}

export async function createCategory(payload: CreateCategoryPayload) {
  const response = await api.post<CategoryMutationResponse>('/api/categories', payload)
  return response.data
}

export async function updateCategory(payload: UpdateCategoryPayload) {
  const { id, ...body } = payload
  const response = await api.put<CategoryMutationResponse>(`/api/categories/${id}`, { id, ...body })
  return response.data
}

export async function deleteCategory(id: string) {
  const response = await api.delete<DeleteResponse>(`/api/categories/${id}`)
  return response.data
}
