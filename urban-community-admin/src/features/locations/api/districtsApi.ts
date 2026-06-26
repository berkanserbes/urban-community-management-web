import api from '@/lib/api/axios'
import type { ApiResult, DistrictDto } from '@/types/api.types'

type DistrictsResponse = ApiResult<DistrictDto[]>

export async function getDistrictsByProvince(provinceId: string) {
  const response = await api.get<DistrictsResponse>(`/api/provinces/${provinceId}/districts`)
  return response.data
}