import api from '@/lib/api/axios'
import type { AnnouncementDto, AnnouncementScope, ApiResult } from '@/types/api.types'

export type CreateAnnouncementPayload = {
  title: string
  content: string
  scope: AnnouncementScope
  provinceId?: string | null
  districtId?: string | null
  neighborhoodId?: string | null
  expiresAt?: string | null
}

export type UpdateAnnouncementPayload = {
  id: string
  title: string
  content: string
  expiresAt?: string | null
}

type AnnouncementsResponse = ApiResult<AnnouncementDto[]>
type MutationResponse = ApiResult<{
  id: string
  title: string
  content: string
  scope?: AnnouncementScope
  isActive?: boolean
  expiresAt?: string | null
  createdAt?: string
  updatedAt?: string
  message?: string
}>
type IdMessageResponse = ApiResult<{ id: string; message: string }>

export async function getManageableAnnouncements() {
  const response = await api.get<AnnouncementsResponse>('/api/announcements/manageable')
  return response.data
}

export async function createAnnouncement(payload: CreateAnnouncementPayload) {
  const response = await api.post<MutationResponse>('/api/announcements', payload)
  return response.data
}

export async function updateAnnouncement(payload: UpdateAnnouncementPayload) {
  const { id, ...body } = payload
  const response = await api.put<MutationResponse>(`/api/announcements/${id}`, body)
  return response.data
}

export async function activateAnnouncement(id: string) {
  const response = await api.patch<MutationResponse>(`/api/announcements/${id}/activate`)
  return response.data
}

export async function deactivateAnnouncement(id: string) {
  const response = await api.patch<MutationResponse>(`/api/announcements/${id}/deactivate`)
  return response.data
}

export async function deleteAnnouncement(id: string) {
  const response = await api.delete<IdMessageResponse>(`/api/announcements/${id}`)
  return response.data
}
