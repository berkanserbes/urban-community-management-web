import { useMemo, useState } from 'react'
import { Building2, Plus, Users, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
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
import { DepartmentsTable } from '@/features/departments/components/DepartmentsTable'
import {
  DepartmentFormDialog,
  type DepartmentFormValues,
} from '@/features/departments/components/DepartmentFormDialog'
import {
  useDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from '@/features/departments/hooks/useDepartments'
import type { DepartmentWithStatsDto } from '@/types/api.types'

export function AdminDepartmentsPage() {
  const departmentsQuery = useDepartmentsQuery()
  const createMutation = useCreateDepartmentMutation()
  const updateMutation = useUpdateDepartmentMutation()
  const deleteMutation = useDeleteDepartmentMutation()

  const [formOpen, setFormOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<DepartmentWithStatsDto | null>(null)
  const [deletingDept, setDeletingDept] = useState<DepartmentWithStatsDto | null>(null)

  const departments = useMemo(() => departmentsQuery.data ?? [], [departmentsQuery.data])

  const stats = useMemo(() => {
    const totalOfficials = departments.reduce((sum, d) => sum + d.officialCount, 0)
    const totalReports = departments.reduce((sum, d) => sum + d.assignedReportCount, 0)
    return { totalOfficials, totalReports }
  }, [departments])

  const isSaving = createMutation.isPending || updateMutation.isPending

  const handleOpenCreate = () => {
    setEditingDept(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (dept: DepartmentWithStatsDto) => {
    setEditingDept(dept)
    setFormOpen(true)
  }

  const handleFormSubmit = async (values: DepartmentFormValues) => {
    try {
      if (editingDept) {
        await updateMutation.mutateAsync({
          id: editingDept.id,
          name: values.name,
          description: values.description ?? null,
        })
        toast.success('Birim güncellendi')
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          description: values.description ?? null,
        })
        toast.success('Birim oluşturuldu')
      }
      setFormOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'İşlem başarısız')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingDept) return
    try {
      await deleteMutation.mutateAsync(deletingDept.id)
      toast.success(`"${deletingDept.name}" silindi`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Silme işlemi başarısız')
    } finally {
      setDeletingDept(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Birimler"
        description="Belediye birimlerini görüntüleyin, ekleyin ve düzenleyin."
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 size-4" />
            Yeni Birim
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Toplam Birim"
          value={String(departments.length)}
          icon={Building2}
          variant="blue"
        />
        <StatCard
          label="Toplam Yetkili"
          value={String(stats.totalOfficials)}
          icon={Users}
          variant="purple"
        />
        <StatCard
          label="Atanan Rapor"
          value={String(stats.totalReports)}
          icon={FileText}
          variant="emerald"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Birim Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          {departmentsQuery.isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Birimler yükleniyor…
            </div>
          ) : departmentsQuery.isError ? (
            <div className="py-12 text-center text-sm text-destructive">
              Birimler yüklenemedi.
            </div>
          ) : (
            <DepartmentsTable
              departments={departments}
              onEdit={handleOpenEdit}
              onDelete={(d) => setDeletingDept(d)}
            />
          )}
        </CardContent>
      </Card>

      <DepartmentFormDialog
        open={formOpen}
        editing={editingDept}
        isSaving={isSaving}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog
        open={deletingDept !== null}
        onOpenChange={(open: boolean) => { if (!open) setDeletingDept(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Birimi sil?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingDept?.name}</strong> birimini silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz; birime bağlı yetkililer ve raporlar etkilenebilir.
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
