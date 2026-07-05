import { Badge } from '@/components/ui/badge'
import type { AnnouncementScope } from '@/types/api.types'

const scopeLabelMap: Record<AnnouncementScope, string> = {
  All: 'Tümü',
  Province: 'Il',
  District: 'Ilce',
  Neighborhood: 'Mahalle',
}

const scopeVariantMap: Record<AnnouncementScope, 'default' | 'secondary' | 'outline'> = {
  All: 'default',
  Province: 'secondary',
  District: 'outline',
  Neighborhood: 'outline',
}

export function AnnouncementScopeBadge({ scope }: { scope: AnnouncementScope }) {
  return <Badge variant={scopeVariantMap[scope]}>{scopeLabelMap[scope]}</Badge>
}

export function AnnouncementStatusBadge({ isActive }: { isActive: boolean }) {
  return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Aktif' : 'Pasif'}</Badge>
}
