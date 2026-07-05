import { useMemo, useState } from 'react'
import type { AnnouncementDto, AnnouncementScope } from '@/types/api.types'

export function useAnnouncementFilters(announcements: AnnouncementDto[]) {
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<'all' | AnnouncementScope>('all')
  const [activeOnly, setActiveOnly] = useState<'all' | 'active' | 'inactive'>('all')

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => {
      const matchesQuery = [announcement.title, announcement.content]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase())
      const matchesScope = scope === 'all' || announcement.scope === scope
      const matchesActive =
        activeOnly === 'all' ||
        (activeOnly === 'active' && announcement.isActive) ||
        (activeOnly === 'inactive' && !announcement.isActive)

      return matchesQuery && matchesScope && matchesActive
    })
  }, [activeOnly, announcements, query, scope])

  const resetFilters = () => {
    setQuery('')
    setScope('all')
    setActiveOnly('all')
  }

  return {
    query,
    setQuery,
    scope,
    setScope,
    activeOnly,
    setActiveOnly,
    filteredAnnouncements,
    resetFilters,
  }
}
