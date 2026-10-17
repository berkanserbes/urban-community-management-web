import { useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination'
import type { ManageableReportsParams } from '@/features/reports/api/reportsApi'
import type { ReportPriority, ReportStatus } from '@/types/api.types'

type AssignmentFilter = 'all' | 'unassigned' | 'review'

/** Holds the report list filters and turns them into server query parameters. */
export function useReportFilters() {
  const [query, setQueryState] = useState('')
  const [status, setStatusState] = useState<'all' | ReportStatus>('all')
  const [priority, setPriorityState] = useState<'all' | ReportPriority>('all')
  const [assignment, setAssignmentState] = useState<AssignmentFilter>('all')
  const [pageIndex, setPageIndex] = useState(1)
  const search = useDebouncedValue(query.trim())

  // Any filter change starts again from the first page.
  const withPageReset = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value)
    setPageIndex(1)
  }

  const params = useMemo<ManageableReportsParams>(
    () => ({
      pageIndex,
      pageSize: DEFAULT_PAGE_SIZE,
      search: search || undefined,
      status: status === 'all' ? undefined : status,
      priority: priority === 'all' ? undefined : priority,
      assignment:
        assignment === 'unassigned' ? 'Unassigned' : assignment === 'review' ? 'NeedsReview' : undefined,
    }),
    [assignment, pageIndex, priority, search, status],
  )

  const resetFilters = () => {
    setQueryState('')
    setStatusState('all')
    setPriorityState('all')
    setAssignmentState('all')
    setPageIndex(1)
  }

  return {
    query,
    setQuery: withPageReset(setQueryState),
    status,
    setStatus: withPageReset(setStatusState),
    priority,
    setPriority: withPageReset(setPriorityState),
    assignment,
    setAssignment: withPageReset(setAssignmentState),
    setPageIndex,
    params,
    resetFilters,
  }
}
