import api from '@/lib/api/axios'
import type { ApiResult, NeighborhoodDto } from '@/types/api.types'

export type GetNeighborhoodsParams = {
  provinceId?: string
  districtId?: string
}

type NeighborhoodsResponse = ApiResult<NeighborhoodDto[]>

export async function getNeighborhoods(params?: GetNeighborhoodsParams) {
  const response = await api.get<NeighborhoodsResponse>('/api/neighborhoods', { params })
  return response.data
}
