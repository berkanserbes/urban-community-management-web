import { useMemo, useState } from 'react'
import { Pencil, Plus, Power, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useCategoriesQuery } from '@/features/categories/hooks/useCategories'
import { useDepartmentsQuery } from '@/features/departments/hooks/useDepartments'
import { useDistrictsQuery } from '@/features/locations/hooks/useDistricts'
import { useProvincesQuery } from '@/features/locations/hooks/useProvinces'
import { useNeighborhoodsQuery } from '@/features/neighborhoods/hooks/useNeighborhoods'
import {
  useOrganizationDepartmentMutations,
  useOrganizationDepartmentsQuery,
  useOrganizationMutations,
  useOrganizationsQuery,
} from '@/features/organizations/hooks/useOrganizations'
import type {
  OrganizationDepartmentDto,
  OrganizationDto,
  OrganizationJurisdictionLevel,
} from '@/types/api.types'

type OrganizationForm = {
  name: string
  jurisdictionLevel: OrganizationJurisdictionLevel
  provinceId: string
  districtId: string
  neighborhoodId: string
}

type DepartmentForm = {
  departmentId: string
  displayName: string
  contactEmail: string
  contactPhone: string
  categoryIds: string[]
}

const emptyOrganization: OrganizationForm = {
  name: '',
  jurisdictionLevel: 'Province',
  provinceId: '',
  districtId: '',
  neighborhoodId: '',
}

const emptyDepartment: DepartmentForm = {
  departmentId: '',
  displayName: '',
  contactEmail: '',
  contactPhone: '',
  categoryIds: [],
}

export function AdminOrganizationsPage() {
  const organizationsQuery = useOrganizationsQuery()
  const organizationMutations = useOrganizationMutations()
  const provincesQuery = useProvincesQuery()
  const departmentsQuery = useDepartmentsQuery()
  const categoriesQuery = useCategoriesQuery()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingOrganization, setEditingOrganization] = useState<OrganizationDto | null>(null)
  const [organizationOpen, setOrganizationOpen] = useState(false)
  const [deletingOrganization, setDeletingOrganization] = useState<OrganizationDto | null>(null)
  const [organizationForm, setOrganizationForm] = useState(emptyOrganization)
  const districtsQuery = useDistrictsQuery(organizationForm.provinceId)
  const neighborhoodsQuery = useNeighborhoodsQuery({
    provinceId: organizationForm.provinceId,
    districtId: organizationForm.districtId,
  })

  const organizations = useMemo(() => organizationsQuery.data ?? [], [organizationsQuery.data])
  const effectiveSelectedId = selectedId ?? organizations[0]?.id ?? null
  const localDepartmentsQuery = useOrganizationDepartmentsQuery(effectiveSelectedId)
  const localMutations = useOrganizationDepartmentMutations(effectiveSelectedId)
  const [editingDepartment, setEditingDepartment] = useState<OrganizationDepartmentDto | null>(null)
  const [departmentOpen, setDepartmentOpen] = useState(false)
  const [deletingDepartment, setDeletingDepartment] =
    useState<OrganizationDepartmentDto | null>(null)
  const [departmentForm, setDepartmentForm] = useState(emptyDepartment)

  const selected = organizations.find((item) => item.id === effectiveSelectedId) ?? null

  const openOrganization = (item?: OrganizationDto) => {
    setEditingOrganization(item ?? null)
    setOrganizationForm(item ? {
      name: item.name,
      jurisdictionLevel: item.jurisdictionLevel,
      provinceId: item.provinceId,
      districtId: item.districtId ?? '',
      neighborhoodId: item.neighborhoodId ?? '',
    } : emptyOrganization)
    setOrganizationOpen(true)
  }

  const saveOrganization = async () => {
    try {
      const payload = {
        name: organizationForm.name,
        jurisdictionLevel: organizationForm.jurisdictionLevel,
        provinceId: organizationForm.provinceId,
        districtId: organizationForm.jurisdictionLevel !== 'Province'
          ? organizationForm.districtId
          : null,
        neighborhoodId: organizationForm.jurisdictionLevel === 'Neighborhood'
          ? organizationForm.neighborhoodId
          : null,
      }
      if (editingOrganization) {
        await organizationMutations.update.mutateAsync({ id: editingOrganization.id, ...payload })
      } else {
        const created = await organizationMutations.create.mutateAsync(payload)
        setSelectedId(created.id)
      }
      setOrganizationOpen(false)
      toast.success('Kurum kaydedildi')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kurum kaydedilemedi')
    }
  }

  const openDepartment = (item?: OrganizationDepartmentDto) => {
    setEditingDepartment(item ?? null)
    setDepartmentForm(item ? {
      departmentId: item.departmentId,
      displayName: item.displayName,
      contactEmail: item.contactEmail ?? '',
      contactPhone: item.contactPhone ?? '',
      categoryIds: item.categoryIds,
    } : emptyDepartment)
    setDepartmentOpen(true)
  }

  const saveDepartment = async () => {
    try {
      let id: string
      if (editingDepartment) {
        const updated = await localMutations.update.mutateAsync({
          id: editingDepartment.id,
          displayName: departmentForm.displayName || null,
          contactEmail: departmentForm.contactEmail || null,
          contactPhone: departmentForm.contactPhone || null,
        })
        id = updated.id
      } else {
        const created = await localMutations.create.mutateAsync({
          departmentId: departmentForm.departmentId,
          displayName: departmentForm.displayName || null,
          contactEmail: departmentForm.contactEmail || null,
          contactPhone: departmentForm.contactPhone || null,
        })
        id = created.id
      }
      await localMutations.setCategories.mutateAsync({ id, categoryIds: departmentForm.categoryIds })
      setDepartmentOpen(false)
      toast.success('Yerel birim kaydedildi')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Yerel birim kaydedilemedi')
    }
  }

  const deleteSelectedOrganization = async () => {
    if (!deletingOrganization) return

    try {
      await organizationMutations.delete.mutateAsync(deletingOrganization.id)
      setSelectedId(null)
      toast.success('Kurum silindi')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kurum silinemedi')
    } finally {
      setDeletingOrganization(null)
    }
  }

  const deleteSelectedDepartment = async () => {
    if (!deletingDepartment) return

    try {
      await localMutations.delete.mutateAsync(deletingDepartment.id)
      toast.success('Yerel birim silindi')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Yerel birim silinemedi')
    } finally {
      setDeletingDepartment(null)
    }
  }

  const toggleOrganizationActive = async (organization: OrganizationDto) => {
    try {
      await organizationMutations.setActive.mutateAsync({
        id: organization.id,
        active: !organization.isActive,
      })
      toast.success(organization.isActive ? 'Kurum pasife alındı' : 'Kurum aktifleştirildi')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kurum durumu güncellenemedi')
    }
  }

  const toggleDepartmentActive = async (department: OrganizationDepartmentDto) => {
    try {
      await localMutations.setActive.mutateAsync({
        id: department.id,
        active: !department.isActive,
      })
      toast.success(department.isActive ? 'Yerel birim pasife alındı' : 'Yerel birim aktifleştirildi')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Yerel birim durumu güncellenemedi')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kurumlar"
        description="Belediyeleri, yerel birimlerini, iletişim bilgilerini ve kategori sorumluluklarını yönetin."
        actions={<Button onClick={() => openOrganization()}><Plus className="mr-2 size-4" />Yeni Kurum</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader><CardTitle>Kurum Listesi</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {organizations.map((item) => (
              <button
                className={`w-full rounded-md border p-3 text-left ${effectiveSelectedId === item.id ? 'border-primary bg-primary/5' : ''}`}
                key={item.id}
                onClick={() => setSelectedId(item.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.neighborhoodName
                        ? `${item.provinceName} / ${item.districtName} / ${item.neighborhoodName}`
                        : item.districtName
                          ? `${item.provinceName} / ${item.districtName}`
                          : item.provinceName}
                    </p>
                  </div>
                  <span className={`text-xs ${item.isActive ? 'text-emerald-600' : 'text-destructive'}`}>
                    {item.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>{selected?.name ?? 'Kurum seçin'}</CardTitle>
                {selected && <p className="mt-1 text-sm text-muted-foreground">{selected.departmentCount} yerel birim, {selected.officialCount} Official</p>}
              </div>
              {selected && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openOrganization(selected)}><Pencil className="mr-2 size-4" />Düzenle</Button>
                  <Button size="sm" variant="outline" onClick={async () => {
                    await toggleOrganizationActive(selected)
                  }}><Power className="mr-2 size-4" />{selected.isActive ? 'Pasife Al' : 'Aktifleştir'}</Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeletingOrganization(selected)}>
                    <Trash2 className="mr-2 size-4" />Sil
                  </Button>
                  <Button size="sm" onClick={() => openDepartment()}><Plus className="mr-2 size-4" />Yerel Birim</Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(localDepartmentsQuery.data ?? []).map((item) => (
                <div className="rounded-md border p-4" key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.displayName}</p>
                      <p className="text-xs text-muted-foreground">{item.contactEmail || 'E-posta yok'} · {item.contactPhone || 'Telefon yok'}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.categoryIds.length} kategori · {item.officialCount} Official · {item.assignedReportCount} rapor</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openDepartment(item)}>Düzenle</Button>
                      <Button size="sm" variant="outline" onClick={() => toggleDepartmentActive(item)}>
                        {item.isActive ? 'Pasife Al' : 'Aktifleştir'}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeletingDepartment(item)}>
                        <Trash2 className="mr-2 size-4" />Sil
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {selected && !localDepartmentsQuery.isLoading && (localDepartmentsQuery.data ?? []).length === 0 && (
                <div className="py-10 text-center text-sm text-muted-foreground">Bu kurumda henüz yerel birim yok.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={organizationOpen} onOpenChange={setOrganizationOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingOrganization ? 'Kurumu Düzenle' : 'Yeni Kurum'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Kurum adı" value={organizationForm.name} onChange={(event) => setOrganizationForm({ ...organizationForm, name: event.target.value })} />
            <select className="w-full rounded-md border bg-background p-2 text-sm" value={organizationForm.jurisdictionLevel} onChange={(event) => setOrganizationForm({ ...organizationForm, jurisdictionLevel: event.target.value as OrganizationJurisdictionLevel, districtId: '', neighborhoodId: '' })}>
              <option value="Province">İl</option>
              <option value="District">İlçe</option>
              <option value="Neighborhood">Mahalle</option>
            </select>
            <select className="w-full rounded-md border bg-background p-2 text-sm" value={organizationForm.provinceId} onChange={(event) => setOrganizationForm({ ...organizationForm, provinceId: event.target.value, districtId: '', neighborhoodId: '' })}>
              <option value="">İl seçin</option>
              {(provincesQuery.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            {organizationForm.jurisdictionLevel !== 'Province' && (
              <select className="w-full rounded-md border bg-background p-2 text-sm" value={organizationForm.districtId} onChange={(event) => setOrganizationForm({ ...organizationForm, districtId: event.target.value, neighborhoodId: '' })}>
                <option value="">İlçe seçin</option>
                {(districtsQuery.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            )}
            {organizationForm.jurisdictionLevel === 'Neighborhood' && (
              <select className="w-full rounded-md border bg-background p-2 text-sm" value={organizationForm.neighborhoodId} onChange={(event) => setOrganizationForm({ ...organizationForm, neighborhoodId: event.target.value })}>
                <option value="">Mahalle seçin</option>
                {(neighborhoodsQuery.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            )}
            <Button className="w-full" onClick={saveOrganization} disabled={!organizationForm.name || !organizationForm.provinceId || (organizationForm.jurisdictionLevel !== 'Province' && !organizationForm.districtId) || (organizationForm.jurisdictionLevel === 'Neighborhood' && !organizationForm.neighborhoodId)}>Kaydet</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={departmentOpen} onOpenChange={setDepartmentOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingDepartment ? 'Yerel Birimi Düzenle' : 'Yeni Yerel Birim'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <select className="w-full rounded-md border bg-background p-2 text-sm" disabled={Boolean(editingDepartment)} value={departmentForm.departmentId} onChange={(event) => setDepartmentForm({ ...departmentForm, departmentId: event.target.value })}>
              <option value="">Global departman seçin</option>
              {(departmentsQuery.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <Input placeholder="Görünen birim adı" value={departmentForm.displayName} onChange={(event) => setDepartmentForm({ ...departmentForm, displayName: event.target.value })} />
            <Input placeholder="İletişim e-postası" value={departmentForm.contactEmail} onChange={(event) => setDepartmentForm({ ...departmentForm, contactEmail: event.target.value })} />
            <Input placeholder="İletişim telefonu" value={departmentForm.contactPhone} onChange={(event) => setDepartmentForm({ ...departmentForm, contactPhone: event.target.value })} />
            <div>
              <p className="mb-2 text-sm font-medium">Sorumlu kategoriler</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(categoriesQuery.data ?? []).map((category) => (
                  <label className="flex items-center gap-2 text-sm" key={category.id}>
                    <input type="checkbox" checked={departmentForm.categoryIds.includes(category.id)} onChange={(event) => setDepartmentForm({
                      ...departmentForm,
                      categoryIds: event.target.checked
                        ? [...departmentForm.categoryIds, category.id]
                        : departmentForm.categoryIds.filter((id) => id !== category.id),
                    })} />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={saveDepartment} disabled={!editingDepartment && !departmentForm.departmentId}>Kaydet</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deletingOrganization !== null}
        onOpenChange={(open) => { if (!open) setDeletingOrganization(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kurumu kalıcı olarak sil?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingOrganization?.name}</strong> kurumu kalıcı olarak silinecek.
              Kuruma bağlı yerel birimler varsa işlem reddedilir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={organizationMutations.delete.isPending}
              onClick={deleteSelectedOrganization}
            >
              {organizationMutations.delete.isPending ? 'Siliniyor…' : 'Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deletingDepartment !== null}
        onOpenChange={(open) => { if (!open) setDeletingDepartment(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yerel birimi kalıcı olarak sil?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingDepartment?.displayName}</strong> yerel birimi kalıcı olarak silinecek.
              Birime atanmış resmi kullanıcı veya rapor varsa işlem reddedilir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={localMutations.delete.isPending}
              onClick={deleteSelectedDepartment}
            >
              {localMutations.delete.isPending ? 'Siliniyor…' : 'Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
