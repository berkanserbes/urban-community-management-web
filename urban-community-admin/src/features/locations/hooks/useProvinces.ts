import { useQuery } from '@tanstack/react-query'
import { getProvinces } from '@/features/locations/api/provincesApi'
import { unwrapApiResult } from '@/lib/api/result'

export function useProvincesQuery() {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const result = await getProvinces()
      return unwrapApiResult(result)
    },
  })
}