import { useState } from 'react'
import { Megaphone, ToggleLeft, ToggleRight, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { TablePagination } from '@/components/shared/TablePagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnnouncementDialog, type AnnouncementEditData, type AnnouncementFormValues } from '@/features/announcements/components/AnnouncementDialog'
import { AnnouncementFilters } from '@/features/announcements/components/AnnouncementFilters'
import { AnnouncementTable } from '@/features/announcements/components/AnnouncementTable'
import type { CreateAnnouncementPayload } from '@/features/announcements/api/announcementsApi'
import {
  useManageableAnnouncementStatsQuery,
  useManageableAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useActivateAnnouncementMutation,
  useDeactivateAnnouncementMutation,
} from '@/features/announcements/hooks/useAnnouncements'
import type { AnnouncementDto } from '@/types/api.types'
import { useAuthStore } from '@/stores/auth.store'
import { useAnnouncementFilters } from '@/features/announcements/hooks/useAnnouncementFilters'
import { useCurrentUserQuery } from '@/features/profile/hooks/useProfile'

export function OfficialAnnouncementsPage() {
  const user = useAuthStore((state) => state.user)
  const currentUserQuery = useCurrentUserQuery(Boolean(user))
  const currentUser = currentUserQuery.data ?? user
  const createMutation = useCreateAnnouncementMutation()
  const updateMutation = useUpdateAnnouncementMutation()
  const activateMutation = useActivateAnnouncementMutation()
  const deactivateMutation = useDeactivateAnnouncementMutation()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementEditData | null>(null)

  const {
    query,
    setQuery,
    scope,
    setScope,
    activeOnly,
    setActiveOnly,
    setPageIndex,
    params,
    resetFilters,
  } = useAnnouncementFilters()
  const announcementsQuery = useManageableAnnouncementsQuery(params)
  const stats = useManageableAnnouncementStatsQuery().data

  const isSaving = createMutation.isPending || updateMutation.isPending

  const defaultScope = (currentUser?.officialJurisdictionLevel ?? 'Neighborhood') as 'Province' | 'District' | 'Neighborhood'

  const handleOpenCreate = () => {
    setEditingAnnouncement(null)
    setCreateDialogOpen(true)
  }

  const handleOpenEdit = (a: AnnouncementDto) => {
    setEditingAnnouncement({
      id: a.id,
      title: a.title,
      content: a.content,
      scope: a.scope,
      provinceId: a.provinceId,
      districtId: a.districtId,
      neighborhoodId: a.neighborhoodId,
      expiresAt: a.expiresAt,
      isActive: a.isActive,
    })
    setEditDialogOpen(true)
  }

  const handleCreateSubmit = async (values: AnnouncementFormValues) => {
    try {
      const payload: CreateAnnouncementPayload = {
        title: values.title,
        content: values.content,
        scope: values.scope,
        expiresAt: values.expiresAt || null,
        provinceId: values.scope === 'Province' ? (values.provinceId || null) : null,
        districtId: values.scope === 'District' ? (values.districtId || null) : null,
        neighborhoodId: values.scope === 'Neighborhood' ? (values.neighborhoodId || null) : null,
      }
      await createMutation.mutateAsync(payload)
      setCreateDialogOpen(false)
    } catch {
      // error handled in mutation
    }
  }

  const handleUpdateSubmit = async (values: AnnouncementFormValues) => {
    if (!editingAnnouncement) return
    try {
      await updateMutation.mutateAsync({
        id: editingAnnouncement.id,
        title: values.title,
        content: values.content,
        expiresAt: values.expiresAt || null,
      })
      setEditDialogOpen(false)
    } catch {
      // error handled in mutation
    }
  }

  const handleDeactivate = async (announcement: AnnouncementDto) => {
    try {
      await deactivateMutation.mutateAsync(announcement.id)
    } catch {
      // error handled in mutation
    }
  }

  const handleActivate = async (announcement: AnnouncementDto) => {
    try {
      await activateMutation.mutateAsync(announcement.id)
    } catch {
      // error handled in mutation
    }
  }

  const createTriggerLabel = defaultScope === 'Neighborhood'
    ? `Mahalle Duyurusu Oluştur`
    : defaultScope === 'District'
      ? `İlçe Duyurusu Oluştur`
      : `İl Duyurusu Oluştur`

  return (
    <div className="space-y-6">
      <PageHeader
        title="Duyurular"
        description="Kendi duyurularınızı oluşturun, görüntüleyin ve yönetin."
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 size-4" />
            {createTriggerLabel}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Toplam" value={String(stats?.total ?? 0)} icon={Megaphone} variant="blue" />
        <StatCard label="Aktif" value={String(stats?.active ?? 0)} icon={ToggleRight} variant="emerald" />
        <StatCard label="Pasif" value={String((stats?.total ?? 0) - (stats?.active ?? 0))} icon={ToggleLeft} variant="slate" />
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Duyuru Listesi</CardTitle>
          <AnnouncementFilters
            query={query}
            onQueryChange={setQuery}
            scope={scope}
            onScopeChange={setScope}
            activeOnly={activeOnly}
            onActiveOnlyChange={setActiveOnly}
            onReset={resetFilters}
          />
        </CardHeader>
        <CardContent>
          {announcementsQuery.isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Duyurular yükleniyor…
            </div>
          ) : announcementsQuery.isError ? (
            <div className="py-12 text-center text-sm text-destructive">
              Duyurular yüklenemedi.
            </div>
          ) : (
            <>
              <AnnouncementTable
                announcements={announcementsQuery.data?.items ?? []}
                showActions
                onEdit={handleOpenEdit}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
              />
              <TablePagination page={announcementsQuery.data} onPageChange={setPageIndex} itemLabel="duyuru" />
            </>
          )}
        </CardContent>
      </Card>

      <AnnouncementDialog
        open={createDialogOpen}
        isSaving={isSaving}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateSubmit}
      />

      <AnnouncementDialog
        open={editDialogOpen}
        editing={editingAnnouncement}
        isSaving={isSaving}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleUpdateSubmit}
      />
    </div>
  )
}
