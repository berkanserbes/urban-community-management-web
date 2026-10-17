import { useState } from 'react'
import { Megaphone, BadgeInfo, ToggleLeft, Clock3, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { TablePagination } from '@/components/shared/TablePagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { AnnouncementDialog, type AnnouncementEditData, type AnnouncementFormValues } from '@/features/announcements/components/AnnouncementDialog'
import { AnnouncementFilters } from '@/features/announcements/components/AnnouncementFilters'
import { AnnouncementTable } from '@/features/announcements/components/AnnouncementTable'
import {
  useManageableAnnouncementStatsQuery,
  useManageableAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useActivateAnnouncementMutation,
  useDeactivateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} from '@/features/announcements/hooks/useAnnouncements'
import type { AnnouncementDto as AnnouncementType } from '@/types/api.types'
import { useAnnouncementFilters } from '@/features/announcements/hooks/useAnnouncementFilters'

export function AdminAnnouncementsPage() {
  const createMutation = useCreateAnnouncementMutation()
  const updateMutation = useUpdateAnnouncementMutation()
  const activateMutation = useActivateAnnouncementMutation()
  const deactivateMutation = useDeactivateAnnouncementMutation()
  const deleteMutation = useDeleteAnnouncementMutation()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementEditData | null>(null)
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<AnnouncementType | null>(null)

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

  const handleOpenCreate = () => {
    setEditingAnnouncement(null)
    setCreateDialogOpen(true)
  }

  const handleOpenEdit = (a: AnnouncementType) => {
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
      await createMutation.mutateAsync({
        title: values.title,
        content: values.content,
        scope: values.scope,
        provinceId: values.scope === 'Province' ? (values.provinceId || null) : null,
        districtId: values.scope === 'District' ? (values.districtId || null) : null,
        neighborhoodId: values.scope === 'Neighborhood' ? (values.neighborhoodId || null) : null,
        expiresAt: values.expiresAt || null,
      })
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

  const handleDeleteConfirm = async () => {
    if (!deletingAnnouncement) return
    try {
      await deleteMutation.mutateAsync(deletingAnnouncement.id)
    } catch {
      // error handled in mutation
    } finally {
      setDeletingAnnouncement(null)
    }
  }

  const handleDeactivate = async (announcement: AnnouncementType) => {
    try {
      await deactivateMutation.mutateAsync(announcement.id)
    } catch {
      // error handled in mutation
    }
  }

  const handleActivate = async (announcement: AnnouncementType) => {
    try {
      await activateMutation.mutateAsync(announcement.id)
    } catch {
      // error handled in mutation
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Duyuru Yönetimi"
        description="Duyuruları oluşturun, kapsamlarına göre filtreleyin ve yayın durumlarını yönetin."
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 size-4" />
            Yeni Duyuru
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam" value={String(stats?.total ?? 0)} icon={Megaphone} variant="blue" />
        <StatCard label="Aktif" value={String(stats?.active ?? 0)} icon={ToggleLeft} variant="emerald" />
        <StatCard label="Tümü" value={String(stats?.allScope ?? 0)} icon={BadgeInfo} variant="purple" />
        <StatCard label="Yakın Süreli" value={String(stats?.expiringSoon ?? 0)} icon={Clock3} variant="amber" />
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
                canDelete
                onEdit={handleOpenEdit}
                onDelete={(a) => setDeletingAnnouncement(a)}
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

      <AlertDialog
        open={deletingAnnouncement !== null}
        onOpenChange={(open) => { if (!open) setDeletingAnnouncement(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duyuruyu sil?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingAnnouncement?.title}</strong> duyurusunu silmek istediğinizden emin
              misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              {deleteMutation.isPending ? 'Siliniyor…' : 'Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
