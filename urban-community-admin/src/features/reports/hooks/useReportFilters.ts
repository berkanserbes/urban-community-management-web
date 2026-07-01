import { useMemo, useState } from 'react'
import type { ReportDto, ReportPriority, ReportStatus } from '@/types/api.types'

export function useReportFilters(reports: ReportDto[]) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | ReportStatus>('all')
  const [priority, setPriority] = useState<'all' | ReportPriority>('all')
  const [assignment, setAssignment] = useState<'all' | 'unassigned' | 'review'>('all')

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesQuery = [report.title, report.categoryName, report.neighborhoodName]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase())

      const matchesStatus = status === 'all' || report.status === status
      const matchesPriority = priority === 'all' || report.priority === priority
      const matchesAssignment =
        assignment === 'all' ||
        (assignment === 'unassigned' && !report.assignedOrganizationDepartmentId) ||
        (assignment === 'review' && report.assignmentNeedsReview)

      return matchesQuery && matchesStatus && matchesPriority && matchesAssignment
    })
  }, [assignment, priority, query, reports, status])

  const resetFilters = () => {
    setQuery('')
    setStatus('all')
    setPriority('all')
    setAssignment('all')
  }

  return {
    query,
    setQuery,
    status,
    setStatus,
    priority,
    setPriority,
    assignment,
    setAssignment,
    filteredReports,
    resetFilters,
  }
}
