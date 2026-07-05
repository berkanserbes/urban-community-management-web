import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AnnouncementScope } from '@/types/api.types'

type AnnouncementFiltersProps = {
  query: string
  onQueryChange: (value: string) => void
  scope: 'all' | AnnouncementScope
  onScopeChange: (value: 'all' | AnnouncementScope) => void
  activeOnly: 'all' | 'active' | 'inactive'
  onActiveOnlyChange: (value: 'all' | 'active' | 'inactive') => void
  onReset: () => void
}

export function AnnouncementFilters({
  query,
  onQueryChange,
  scope,
  onScopeChange,
  activeOnly,
  onActiveOnlyChange,
  onReset,
}: AnnouncementFiltersProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
      <Input
        placeholder="Baslik veya icerik ara..."
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />

      <Select value={scope} onValueChange={(value) => onScopeChange(value as 'all' | AnnouncementScope)}>
        <SelectTrigger>
          <SelectValue placeholder="Kapsam" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tum kapsamlar</SelectItem>
          <SelectItem value="All">Tümü</SelectItem>
          <SelectItem value="Province">Il</SelectItem>
          <SelectItem value="District">Ilce</SelectItem>
          <SelectItem value="Neighborhood">Mahalle</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={activeOnly}
        onValueChange={(value) => onActiveOnlyChange(value as 'all' | 'active' | 'inactive')}
      >
        <SelectTrigger>
          <SelectValue placeholder="Durum" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tum durumlar</SelectItem>
          <SelectItem value="active">Aktif</SelectItem>
          <SelectItem value="inactive">Pasif</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onReset}>
        Temizle
      </Button>
    </div>
  )
}
