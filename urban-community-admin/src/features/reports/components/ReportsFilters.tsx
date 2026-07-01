import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ReportPriority, ReportStatus } from '@/types/api.types'

type ReportsFiltersProps = {
  query: string
  onQueryChange: (value: string) => void
  status: 'all' | ReportStatus
  onStatusChange: (value: 'all' | ReportStatus) => void
  priority: 'all' | ReportPriority
  onPriorityChange: (value: 'all' | ReportPriority) => void
  assignment: 'all' | 'unassigned' | 'review'
  onAssignmentChange: (value: 'all' | 'unassigned' | 'review') => void
  onReset: () => void
}

export function ReportsFilters({
  query,
  onQueryChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  assignment,
  onAssignmentChange,
  onReset,
}: ReportsFiltersProps) {
  return (
    <div className="grid gap-3 xl:grid-cols-[1fr_180px_180px_180px_auto]">
      <Input
        placeholder="Baslik, kategori veya mahalle ara..."
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />

      <Select value={status} onValueChange={(value) => onStatusChange(value as 'all' | ReportStatus)}>
        <SelectTrigger>
          <SelectValue placeholder="Durum" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm durumlar</SelectItem>
          <SelectItem value="PendingReview">Bekliyor</SelectItem>
          <SelectItem value="AiReview">AI İncelemede</SelectItem>
          <SelectItem value="Confirmed">Onaylandı</SelectItem>
          <SelectItem value="InProgress">İşlemde</SelectItem>
          <SelectItem value="Resolved">Çözüldü</SelectItem>
          <SelectItem value="Rejected">Reddedildi</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={assignment}
        onValueChange={(value) =>
          onAssignmentChange(value as 'all' | 'unassigned' | 'review')
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Atama" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm atamalar</SelectItem>
          <SelectItem value="unassigned">Atanmamış</SelectItem>
          <SelectItem value="review">İnceleme gerekli</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={(value) => onPriorityChange(value as 'all' | ReportPriority)}>
        <SelectTrigger>
          <SelectValue placeholder="Öncelik" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm öncelikler</SelectItem>
          <SelectItem value="Low">Düşük</SelectItem>
          <SelectItem value="Medium">Orta</SelectItem>
          <SelectItem value="High">Yuksek</SelectItem>
          <SelectItem value="Urgent">Acil</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onReset}>Temizle</Button>
    </div>
  )
}
