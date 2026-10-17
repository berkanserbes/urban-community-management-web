import { useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination'
import type { ManageableAnnouncementsParams } from '@/features/announcements/api/announcementsApi'
import type { AnnouncementScope } from '@/types/api.types'

/** Holds the announcement list filters and turns them into server query parameters. */
export function useAnnouncementFilters() {
  const [query, setQueryState] = useState('')
  const [scope, setScopeState] = useState<'all' | AnnouncementScope>('all')
  const [activeOnly, setActiveOnlyState] = useState<'all' | 'active' | 'inactive'>('all')
  const [pageIndex, setPageIndex] = useState(1)
  const search = useDebouncedValue(query.trim())

  // Any filter change starts again from the first page.
  const withPageReset = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value)
    setPageIndex(1)
  }

  const params = useMemo<ManageableAnnouncementsParams>(
    () => ({
      pageIndex,
      pageSize: DEFAULT_PAGE_SIZE,
      search: search || undefined,
      scope: scope === 'all' ? undefined : scope,
      isActive: activeOnly === 'all' ? undefined : activeOnly === 'active',
    }),
    [activeOnly, pageIndex, scope, search],
  )

  const resetFilters = () => {
    setQueryState('')
    setScopeState('all')
    setActiveOnlyState('all')
    setPageIndex(1)
  }

  return {
    query,
    setQuery: withPageReset(setQueryState),
    scope,
    setScope: withPageReset(setScopeState),
    activeOnly,
    setActiveOnly: withPageReset(setActiveOnlyState),
    setPageIndex,
    params,
    resetFilters,
  }
}
