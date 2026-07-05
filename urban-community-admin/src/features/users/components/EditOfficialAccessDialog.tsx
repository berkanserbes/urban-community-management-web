import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useDistrictsQuery } from '@/features/locations/hooks/useDistricts'
import { useNeighborhoodsQuery } from '@/features/neighborhoods/hooks/useNeighborhoods'
import {
  useOrganizationDepartmentsQuery,
  useOrganizationsQuery,
} from '@/features/organizations/hooks/useOrganizations'
import type { AssignRolePayload } from '@/features/users/api/usersApi'
import type { UserDto } from '@/types/api.types'

type Level = 'Province' | 'District' | 'Neighborhood'

type Props = {
  user: UserDto
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: AssignRolePayload) => void
}

export function EditOfficialAccessDialog({
  user,
  isSaving,
  onOpenChange,
  onSubmit,
}: Props) {
  const organizationsQuery = useOrganizationsQuery(true)
  const [organizationId, setOrganizationId] = useState(user.organizationId ?? '')
  const [organizationDepartmentId, setOrganizationDepartmentId] = useState(
    user.organizationDepartmentId ?? '',
  )
  const [level, setLevel] = useState<Level>(
    user.officialJurisdictionLevel ?? 'Province',
  )
  const [districtId, setDistrictId] = useState(
    user.officialJurisdictionLevel === 'District'
      ? user.officialJurisdictionId ?? ''
      : '',
  )
  const [neighborhoodId, setNeighborhoodId] = useState(
    user.officialJurisdictionLevel === 'Neighborhood'
      ? user.officialJurisdictionId ?? ''
      : '',
  )

  const organization = (organizationsQuery.data ?? []).find(
    (item) => item.id === organizationId,
  )
  const localDepartmentsQuery = useOrganizationDepartmentsQuery(organizationId || null, true)
  const districtsQuery = useDistrictsQuery(organization?.provinceId)
  const effectiveDistrictId =
    organization && organization.jurisdictionLevel !== 'Province'
      ? organization.districtId ?? ''
      : districtId
  const effectiveNeighborhoodId =
    organization?.jurisdictionLevel === 'Neighborhood'
      ? organization?.neighborhoodId ?? ''
      : neighborhoodId
  const neighborhoodsQuery = useNeighborhoodsQuery({
    provinceId: organization?.provinceId,
    districtId: effectiveDistrictId,
  })
  const levels = useMemo<Level[]>(
    () =>
      organization?.jurisdictionLevel === 'Neighborhood'
        ? ['Neighborhood']
        : organization?.jurisdictionLevel === 'District'
          ? ['District', 'Neighborhood']
          : ['Province', 'District', 'Neighborhood'],
    [organization?.jurisdictionLevel],
  )
  const jurisdictionId =
    level === 'Province'
      ? organization?.provinceId ?? ''
      : level === 'District'
        ? effectiveDistrictId
        : effectiveNeighborhoodId

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yetkili Erişimini Düzenle</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {user.firstName} {user.lastName} · {user.email}
          </p>
          <select
            className="w-full rounded-md border bg-background p-2 text-sm"
            value={organizationId}
            onChange={(event) => {
              const nextId = event.target.value
              const next = (organizationsQuery.data ?? []).find((item) => item.id === nextId)
              setOrganizationId(nextId)
              setOrganizationDepartmentId('')
              setLevel(
                next?.jurisdictionLevel === 'Neighborhood'
                  ? 'Neighborhood'
                  : next?.jurisdictionLevel === 'District'
                    ? 'District'
                    : 'Province',
              )
              setDistrictId(next?.districtId ?? '')
              setNeighborhoodId(next?.neighborhoodId ?? '')
            }}
          >
            <option value="">Kurum seçin</option>
            {(organizationsQuery.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <select
            className="w-full rounded-md border bg-background p-2 text-sm"
            value={organizationDepartmentId}
            onChange={(event) => setOrganizationDepartmentId(event.target.value)}
            disabled={!organizationId}
          >
            <option value="">Yerel birim seçin</option>
            {(localDepartmentsQuery.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>{item.displayName}</option>
            ))}
          </select>
          <select
            className="w-full rounded-md border bg-background p-2 text-sm"
            value={level}
            onChange={(event) => {
              setLevel(event.target.value as Level)
              setNeighborhoodId('')
            }}
            disabled={!organization}
          >
            {levels.map((item) => (
              <option key={item} value={item}>
                {item === 'Province' ? 'İl' : item === 'District' ? 'İlçe' : 'Mahalle'}
              </option>
            ))}
          </select>
          {(level === 'District' || level === 'Neighborhood') &&
          organization?.jurisdictionLevel === 'Province' ? (
            <select
              className="w-full rounded-md border bg-background p-2 text-sm"
              value={districtId}
              onChange={(event) => {
                setDistrictId(event.target.value)
                setNeighborhoodId('')
              }}
            >
              <option value="">İlçe seçin</option>
              {(districtsQuery.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          ) : null}
          {level === 'Neighborhood' && organization?.jurisdictionLevel !== 'Neighborhood' ? (
            <select
              className="w-full rounded-md border bg-background p-2 text-sm"
              value={neighborhoodId}
              onChange={(event) => setNeighborhoodId(event.target.value)}
              disabled={!effectiveDistrictId}
            >
              <option value="">Mahalle seçin</option>
              {(neighborhoodsQuery.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          ) : null}
          <Button
            className="w-full"
            disabled={!organizationDepartmentId || !jurisdictionId || isSaving}
            onClick={() =>
              onSubmit({
                id: user.id,
                role: 'Official',
                organizationDepartmentId,
                officialJurisdictionLevel: level,
                officialJurisdictionId: jurisdictionId,
              })
            }
          >
            {isSaving ? 'Kaydediliyor...' : 'Erişimi Kaydet'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
