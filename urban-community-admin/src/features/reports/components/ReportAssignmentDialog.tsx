import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  useAssignReportMutation,
  useReportAssignmentOptionsQuery,
} from '@/features/reports/hooks/useReports'
import type { ReportDto } from '@/types/api.types'

type Props = {
  report: ReportDto | null
  onOpenChange: (open: boolean) => void
}

export function ReportAssignmentDialog({ report, onOpenChange }: Props) {
  const optionsQuery = useReportAssignmentOptionsQuery(report?.id ?? null, Boolean(report))
  const assignmentMutation = useAssignReportMutation()
  const [selectedId, setSelectedId] = useState(
    report?.assignedOrganizationDepartmentId ?? '',
  )

  const save = async () => {
    if (!report) return
    try {
      await assignmentMutation.mutateAsync({
        reportId: report.id,
        organizationDepartmentId: selectedId || null,
      })
      toast.success('Rapor ataması güncellendi')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Atama güncellenemedi')
    }
  }

  return (
    <Dialog open={Boolean(report)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raporu Yerel Birime Ata</DialogTitle>
          <DialogDescription>
            Rapora uygun birimi seçerek atamayı güncelleyin.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="font-medium">{report?.title}</p>
            <p className="text-sm text-muted-foreground">
              {report?.categoryName} · {report?.neighborhoodName}
            </p>
          </div>
          <select
            className="w-full rounded-md border bg-background p-2 text-sm"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            disabled={optionsQuery.isLoading}
          >
            <option value="">Atamayı kaldır</option>
            {(optionsQuery.data ?? []).map((option) => (
              <option key={option.organizationDepartmentId} value={option.organizationDepartmentId}>
                {option.organizationName} · {option.departmentName}
                {option.handlesReportCategory ? '' : ' · kategori eşlemesi yok'}
              </option>
            ))}
          </select>
          {optionsQuery.isError ? (
            <p className="text-sm text-destructive">Uygun birimler yüklenemedi.</p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Liste yalnızca raporun il veya ilçesini kapsayan aktif kurum birimlerini içerir.
          </p>
          <Button
            className="w-full"
            onClick={save}
            disabled={assignmentMutation.isPending || optionsQuery.isLoading}
          >
            {assignmentMutation.isPending ? 'Kaydediliyor...' : 'Atamayı Kaydet'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
