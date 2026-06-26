import { useQuery } from '@tanstack/react-query'
import { getDistrictsByProvince } from '@/features/locations/api/districtsApi'
import { unwrapApiResult } from '@/lib/api/result'

export function useDistrictsQuery(provinceId?: string) {
  return useQuery({
    queryKey: ['districts', provinceId ?? 'all'],
    queryFn: async () => {
      if (!provinceId) return []
      const result = await getDistrictsByProvince(provinceId)
      return unwrapApiResult(result)
    },
    enabled: !!provinceId,
  })
}