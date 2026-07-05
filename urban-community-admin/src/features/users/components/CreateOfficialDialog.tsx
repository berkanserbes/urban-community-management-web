import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useDistrictsQuery } from '@/features/locations/hooks/useDistricts'
import { useNeighborhoodsQuery } from '@/features/neighborhoods/hooks/useNeighborhoods'
import {
  useOrganizationDepartmentsQuery,
  useOrganizationsQuery,
} from '@/features/organizations/hooks/useOrganizations'
import type { CreateOfficialPayload } from '@/features/users/api/usersApi'

type Props = {
  open: boolean
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: CreateOfficialPayload) => void
}

type Level = CreateOfficialPayload['officialJurisdictionLevel']

export function CreateOfficialDialog({ open, isSaving, onOpenChange, onSubmit }: Props) {
  const organizationsQuery = useOrganizationsQuery(true)
  const [organizationId, setOrganizationId] = useState('')
  const [organizationDepartmentId, setOrganizationDepartmentId] = useState('')
  const [level, setLevel] = useState<Level>('Province')
  const [districtId, setDistrictId] = useState('')
  const [neighborhoodId, setNeighborhoodId] = useState('')
  const [identity, setIdentity] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '' })

  const organization = (organizationsQuery.data ?? []).find((item) => item.id === organizationId)
  const localDepartmentsQuery = useOrganizationDepartmentsQuery(organizationId || null, true)
  const districtsQuery = useDistrictsQuery(organization?.provinceId)
  const effectiveDistrictId = organization && organization.jurisdictionLevel !== 'Province'
    ? organization.districtId ?? ''
    : districtId
  const effectiveNeighborhoodId = organization?.jurisdictionLevel === 'Neighborhood'
    ? organization?.neighborhoodId ?? ''
    : neighborhoodId
  const neighborhoodsQuery = useNeighborhoodsQuery({
    provinceId: organization?.provinceId,
    districtId: effectiveDistrictId,
  })

  const levels = useMemo<Level[]>(
    () => organization?.jurisdictionLevel === 'Neighborhood'
      ? ['Neighborhood']
      : organization?.jurisdictionLevel === 'District'
        ? ['District', 'Neighborhood']
        : ['Province', 'District', 'Neighborhood'],
    [organization?.jurisdictionLevel],
  )

  const reset = () => {
    setOrganizationId('')
    setOrganizationDepartmentId('')
    setLevel('Province')
    setDistrictId('')
    setNeighborhoodId('')
    setIdentity({ firstName: '', lastName: '', email: '', phoneNumber: '' })
  }

  const jurisdictionId =
    level === 'Province'
      ? organization?.provinceId ?? ''
      : level === 'District'
        ? effectiveDistrictId
        : effectiveNeighborhoodId

  const canSubmit = identity.firstName && identity.lastName && identity.email &&
    organizationDepartmentId && jurisdictionId

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen) reset()
      onOpenChange(nextOpen)
    }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Yeni Yetkili</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Ad" value={identity.firstName} onChange={(event) => setIdentity({ ...identity, firstName: event.target.value })} />
            <Input placeholder="Soyad" value={identity.lastName} onChange={(event) => setIdentity({ ...identity, lastName: event.target.value })} />
          </div>
          <Input type="email" placeholder="Kurumsal e-posta" value={identity.email} onChange={(event) => setIdentity({ ...identity, email: event.target.value })} />
          <Input placeholder="Telefon" value={identity.phoneNumber} onChange={(event) => setIdentity({ ...identity, phoneNumber: event.target.value })} />

          <select className="w-full rounded-md border bg-background p-2 text-sm" value={organizationId} onChange={(event) => {
            const nextOrganizationId = event.target.value
            const nextOrganization = (organizationsQuery.data ?? []).find(
              (item) => item.id === nextOrganizationId,
            )
            setOrganizationId(nextOrganizationId)
            setOrganizationDepartmentId('')
            setLevel(
              nextOrganization?.jurisdictionLevel === 'Neighborhood'
                ? 'Neighborhood'
                : nextOrganization?.jurisdictionLevel === 'District'
                  ? 'District'
                  : 'Province',
            )
            setDistrictId(nextOrganization?.districtId ?? '')
            setNeighborhoodId(nextOrganization?.neighborhoodId ?? '')
          }}>
            <option value="">Kurum seçin</option>
            {(organizationsQuery.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>

          <select className="w-full rounded-md border bg-background p-2 text-sm" value={organizationDepartmentId} onChange={(event) => setOrganizationDepartmentId(event.target.value)} disabled={!organizationId}>
            <option value="">Yerel birim seçin</option>
            {(localDepartmentsQuery.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.displayName}</option>)}
          </select>

          <select className="w-full rounded-md border bg-background p-2 text-sm" value={level} onChange={(event) => {
            setLevel(event.target.value as Level)
            setNeighborhoodId('')
          }} disabled={!organization}>
            {levels.map((item) => <option key={item} value={item}>{item === 'Province' ? 'İl' : item === 'District' ? 'İlçe' : 'Mahalle'}</option>)}
          </select>

          {level === 'District' && organization?.jurisdictionLevel === 'Province' && (
            <select className="w-full rounded-md border bg-background p-2 text-sm" value={districtId} onChange={(event) => {
              setDistrictId(event.target.value)
              setNeighborhoodId('')
            }}>
              <option value="">İlçe seçin</option>
              {(districtsQuery.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          )}

          {level === 'Neighborhood' && organization?.jurisdictionLevel === 'Province' && (
            <select className="w-full rounded-md border bg-background p-2 text-sm" value={districtId} onChange={(event) => {
              setDistrictId(event.target.value)
              setNeighborhoodId('')
            }}>
              <option value="">İlçe seçin</option>
              {(districtsQuery.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          )}

          {level === 'Neighborhood' && organization?.jurisdictionLevel !== 'Neighborhood' && (
            <select className="w-full rounded-md border bg-background p-2 text-sm" value={neighborhoodId} onChange={(event) => setNeighborhoodId(event.target.value)} disabled={!effectiveDistrictId}>
              <option value="">Mahalle seçin</option>
              {(neighborhoodsQuery.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          )}

          <Button className="w-full" disabled={!canSubmit || isSaving} onClick={() => onSubmit({
            ...identity,
            phoneNumber: identity.phoneNumber || null,
            organizationDepartmentId,
            officialJurisdictionLevel: level,
            officialJurisdictionId: jurisdictionId,
          })}>
            {isSaving ? 'Oluşturuluyor...' : 'Yetkili Oluştur'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
