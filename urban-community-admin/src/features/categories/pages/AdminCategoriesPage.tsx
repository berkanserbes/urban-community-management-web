import { useMemo, useState } from 'react'
import { Plus, Tag, FileText, BarChart3 } from 'lucide-react'
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
import { CategoriesTable } from '@/features/categories/components/CategoriesTable'
import {
  CategoryFormDialog,
  type CategoryFormValues,
} from '@/features/categories/components/CategoryFormDialog'
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '@/features/categories/hooks/useCategories'
import type { CategoryDto } from '@/types/api.types'

export function AdminCategoriesPage() {
  const categoriesQuery = useCategoriesQuery()
  const createMutation = useCreateCategoryMutation()
  const updateMutation = useUpdateCategoryMutation()
  const deleteMutation = useDeleteCategoryMutation()

  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<CategoryDto | null>(null)

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data])

  const stats = useMemo(() => {
    const totalReports = categories.reduce((sum, c) => sum + c.reportCount, 0)
    const mostUsed = categories.reduce(
      (max, c) => (c.reportCount > (max?.reportCount ?? -1) ? c : max),
      null as CategoryDto | null,
    )
    return { totalReports, mostUsed }
  }, [categories])

  const isSaving = createMutation.isPending || updateMutation.isPending

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (category: CategoryDto) => {
    setEditingCategory(category)
    setFormOpen(true)
  }

  const handleFormSubmit = async (values: CategoryFormValues) => {
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          name: values.name,
          description: values.description ?? null,
          iconUrl: values.iconUrl || null,
        })
        toast.success('Kategori güncellendi')
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          description: values.description ?? null,
          iconUrl: values.iconUrl || null,
        })
        toast.success('Kategori oluşturuldu')
      }
      setFormOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'İşlem başarısız')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return
    try {
      await deleteMutation.mutateAsync(deletingCategory.id)
      toast.success(`"${deletingCategory.name}" adlı kategori silindi`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Silme işlemi başarısız')
    } finally {
      setDeletingCategory(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategoriler"
        description="Rapor kategorilerini görüntüleyin, ekleyin ve düzenleyin."
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 size-4" />
            Yeni Kategori
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Toplam Kategori"
          value={String(categories.length)}
          icon={Tag}
          variant="blue"
        />
        <StatCard
          label="Toplam Rapor"
          value={String(stats.totalReports)}
          icon={FileText}
          variant="emerald"
        />
        <StatCard
          label="En Çok Kullanılan"
          value={stats.mostUsed?.name ?? '—'}
          icon={BarChart3}
          variant="amber"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kategori Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          {categoriesQuery.isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Kategoriler yükleniyor…
            </div>
          ) : categoriesQuery.isError ? (
            <div className="py-12 text-center text-sm text-destructive">
              Kategoriler yüklenemedi.
            </div>
          ) : (
            <CategoriesTable
              categories={categories}
              onEdit={handleOpenEdit}
              onDelete={(c) => setDeletingCategory(c)}
            />
          )}
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={formOpen}
        editing={editingCategory}
        isSaving={isSaving}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog
        open={deletingCategory !== null}
        onOpenChange={(open: boolean) => { if (!open) setDeletingCategory(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyi sil?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingCategory?.name}</strong> kategorisini silmek istediğinizden emin
              misiniz? Bu işlem geri alınamaz ve kategoriye bağlı raporlar etkilenebilir.
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
