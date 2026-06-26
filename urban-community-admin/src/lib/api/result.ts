import type { ApiResult } from '@/types/api.types'

export function unwrapApiResult<T>(result: ApiResult<T>): T {
  if (!result.isSuccess || result.data == null) {
    const message = result.errors[0] ?? 'İşlem başarısız oldu.'
    throw new Error(message)
  }

  return result.data
}
