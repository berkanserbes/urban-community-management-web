import api from '@/lib/api/axios'
import type { ApiResult, ProvinceDto } from '@/types/api.types'

type ProvincesResponse = ApiResult<ProvinceDto[]>

export async function getProvinces() {
  const response = await api.get<ProvincesResponse>('/api/provinces')
  return response.data
}