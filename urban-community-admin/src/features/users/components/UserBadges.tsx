import { Badge } from '@/components/ui/badge'
import type { UserRole } from '@/types/api.types'

const roleLabelMap: Record<UserRole, string> = {
  Admin: 'Admin',
  Official: 'Yetkili',
  Citizen: 'Vatandaş',
}

const roleVariantMap: Record<UserRole, 'default' | 'secondary' | 'outline'> = {
  Admin: 'default',
  Official: 'secondary',
  Citizen: 'outline',
}

export function UserRoleBadge({ role }: { role: UserRole }) {
  return <Badge variant={roleVariantMap[role]}>{roleLabelMap[role]}</Badge>
}

export function UserStatusBadge({ isActive }: { isActive: boolean }) {
  return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Aktif' : 'Pasif'}</Badge>
}
