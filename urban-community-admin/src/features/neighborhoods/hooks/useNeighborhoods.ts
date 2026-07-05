import { useQuery } from '@tanstack/react-query'
import { getNeighborhoods, type GetNeighborhoodsParams } from '@/features/neighborhoods/api/neighborhoodsApi'
import { unwrapApiResult } from '@/lib/api/result'

export function useNeighborhoodsQuery(params?: GetNeighborhoodsParams) {
  return useQuery({
    queryKey: ['neighborhoods', params?.provinceId ?? '', params?.districtId ?? ''],
    queryFn: async () => {
      const result = await getNeighborhoods(params)
      return unwrapApiResult(result)
    },
    enabled: !!params?.provinceId && !!params?.districtId,
  })
}
