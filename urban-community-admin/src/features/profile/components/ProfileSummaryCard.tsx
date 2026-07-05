import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toAbsoluteUrl } from '@/lib/utils'
import type { UserRole } from '@/types/api.types'

type ProfileSummaryCardProps = {
  firstName: string
  lastName: string
  email: string
  role: UserRole
  profileImageUrl?: string | null
  neighborhoodName?: string | null
  departmentName?: string | null
  organizationName?: string | null
  officialJurisdictionLevel?: string | null
  officialJurisdictionName?: string | null
  provinceName?: string | null
  districtName?: string | null
}

const roleLabelMap: Record<UserRole, string> = {
  Admin: 'Yönetici',
  Official: 'Yetkili',
  Citizen: 'Vatandaş',
}

const roleVariantMap: Record<UserRole, 'default' | 'secondary' | 'outline'> = {
  Admin: 'default',
  Official: 'secondary',
  Citizen: 'outline',
}

export function ProfileSummaryCard({
  firstName,
  lastName,
  email,
  role,
  profileImageUrl,
  neighborhoodName,
  departmentName,
  organizationName,
  officialJurisdictionLevel,
  officialJurisdictionName,
  provinceName,
  districtName,
}: ProfileSummaryCardProps) {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
  const profileImageSrc = toAbsoluteUrl(profileImageUrl)

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
        <div className="transition-all duration-500 ease-in-out">
          <Avatar className="size-20">
            {profileImageSrc ? (
              <AvatarImage
                key={profileImageSrc}
                src={profileImageSrc}
                alt={`${firstName} ${lastName}`}
                className="transition-opacity duration-500"
              />
            ) : null}
            <AvatarFallback className="text-lg font-semibold">{initials || 'UC'}</AvatarFallback>
          </Avatar>
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-foreground">{firstName} {lastName}</h3>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
        <Badge variant={roleVariantMap[role]}>{roleLabelMap[role]}</Badge>
        <div className="grid w-full gap-2 text-left text-sm text-muted-foreground">
          <div className="flex items-center justify-between gap-4 rounded-md bg-muted/50 px-3 py-2">
            <span>Mahalle</span>
            <span className="text-foreground">{neighborhoodName ?? 'Belirtilmedi'}</span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-md bg-muted/50 px-3 py-2">
            <span>Departman</span>
            <span className="text-foreground">{departmentName ?? 'Belirtilmedi'}</span>
          </div>
          {organizationName && (
            <div className="flex items-center justify-between gap-4 rounded-md bg-muted/50 px-3 py-2">
              <span>Kurum</span>
              <span className="text-foreground">{organizationName}</span>
            </div>
          )}
          {officialJurisdictionLevel && (
            <div className="flex items-center justify-between gap-4 rounded-md bg-muted/50 px-3 py-2">
              <span>Yetki Alanı</span>
              <span className="text-foreground">
                {officialJurisdictionLevel === 'Province'
                  ? 'İl'
                  : officialJurisdictionLevel === 'District'
                    ? 'İlçe'
                    : 'Mahalle'}
                {officialJurisdictionName ? ` - ${officialJurisdictionName}` : ''}
              </span>
            </div>
          )}
          {provinceName && role === 'Official' && (
            <div className="flex items-center justify-between gap-4 rounded-md bg-muted/50 px-3 py-2">
              <span>İl</span>
              <span className="text-foreground">{provinceName}</span>
            </div>
          )}
          {districtName && role === 'Official' && (
            <div className="flex items-center justify-between gap-4 rounded-md bg-muted/50 px-3 py-2">
              <span>İlçe</span>
              <span className="text-foreground">{districtName}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
