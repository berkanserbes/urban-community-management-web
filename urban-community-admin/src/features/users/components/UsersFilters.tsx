import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UserRole } from '@/types/api.types'

type UsersFiltersProps = {
  query: string
  onQueryChange: (value: string) => void
  role: 'all' | UserRole
  onRoleChange: (value: 'all' | UserRole) => void
  status: 'all' | 'active' | 'inactive'
  onStatusChange: (value: 'all' | 'active' | 'inactive') => void
  onReset: () => void
}

export function UsersFilters({
  query,
  onQueryChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  onReset,
}: UsersFiltersProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_160px_160px_auto]">
      <Input
        placeholder="İsim, e-posta veya mahalle ara..."
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />

      <Select value={role} onValueChange={(value) => onRoleChange(value as 'all' | UserRole)}>
        <SelectTrigger>
          <SelectValue placeholder="Rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm roller</SelectItem>
          <SelectItem value="Admin">Admin</SelectItem>
          <SelectItem value="Official">Yetkili</SelectItem>
          <SelectItem value="Citizen">Vatandaş</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={status}
        onValueChange={(value) => onStatusChange(value as 'all' | 'active' | 'inactive')}
      >
        <SelectTrigger>
          <SelectValue placeholder="Durum" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm durumlar</SelectItem>
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
