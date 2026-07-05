import api from '@/lib/api/axios'
import type {
  ApiResult,
  OrganizationDepartmentDto,
  OrganizationDto,
  OrganizationJurisdictionLevel,
} from '@/types/api.types'

export type OrganizationPayload = {
  name: string
  jurisdictionLevel: OrganizationJurisdictionLevel
  provinceId: string
  districtId?: string | null
  neighborhoodId?: string | null
}

export type OrganizationDepartmentPayload = {
  departmentId: string
  displayName?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
}

type DeleteResponse = {
  message: string
}

export async function getOrganizations(activeOnly?: boolean) {
  return (await api.get<ApiResult<OrganizationDto[]>>('/api/organizations', {
    params: activeOnly ? { isActive: true } : undefined,
  })).data
}

export async function createOrganization(payload: OrganizationPayload) {
  return (await api.post<ApiResult<OrganizationDto>>('/api/organizations', payload)).data
}

export async function updateOrganization(id: string, payload: OrganizationPayload) {
  return (await api.put<ApiResult<OrganizationDto>>(`/api/organizations/${id}`, payload)).data
}

export async function setOrganizationActive(id: string, active: boolean) {
  return active
    ? (await api.patch<ApiResult<OrganizationDto>>(`/api/organizations/${id}/activate`)).data
    : (await api.patch<ApiResult<OrganizationDto>>(`/api/organizations/${id}/deactivate`)).data
}

export async function deleteOrganization(id: string) {
  return (await api.delete<ApiResult<DeleteResponse>>(`/api/organizations/${id}`)).data
}

export async function getOrganizationDepartments(organizationId: string, activeOnly?: boolean) {
  return (await api.get<ApiResult<OrganizationDepartmentDto[]>>(
    `/api/organizations/${organizationId}/departments`,
    { params: activeOnly ? { isActive: true } : undefined },
  )).data
}

export async function createOrganizationDepartment(
  organizationId: string,
  payload: OrganizationDepartmentPayload,
) {
  return (await api.post<ApiResult<OrganizationDepartmentDto>>(
    `/api/organizations/${organizationId}/departments`,
    payload,
  )).data
}

export async function updateOrganizationDepartment(
  id: string,
  payload: Omit<OrganizationDepartmentPayload, 'departmentId'>,
) {
  return (await api.put<ApiResult<OrganizationDepartmentDto>>(
    `/api/organization-departments/${id}`,
    payload,
  )).data
}

export async function setOrganizationDepartmentActive(id: string, active: boolean) {
  return active
    ? (await api.patch<ApiResult<OrganizationDepartmentDto>>(
        `/api/organization-departments/${id}/activate`,
      )).data
    : (await api.patch<ApiResult<OrganizationDepartmentDto>>(
        `/api/organization-departments/${id}/deactivate`,
      )).data
}

export async function deleteOrganizationDepartment(id: string) {
  return (await api.delete<ApiResult<DeleteResponse>>(
    `/api/organization-departments/${id}`,
  )).data
}

export async function setOrganizationDepartmentCategories(id: string, categoryIds: string[]) {
  return (await api.put<ApiResult<OrganizationDepartmentDto>>(
    `/api/organization-departments/${id}/categories`,
    { categoryIds },
  )).data
}
