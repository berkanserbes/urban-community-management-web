import { useState } from 'react'
import { Clock3, FileWarning, ShieldCheck, Siren } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReportsFilters } from '@/features/reports/components/ReportsFilters'
import { ReportsTable } from '@/features/reports/components/ReportsTable'
import { ReportAssignmentDialog } from '@/features/reports/components/ReportAssignmentDialog'
import { useReportFilters } from '@/features/reports/hooks/useReportFilters'
import { useManageableReportsQuery } from '@/features/reports/hooks/useReports'
import type { ReportDto } from '@/types/api.types'

export function AdminReportsPage() {
  const reportsQuery = useManageableReportsQuery()
  const [assignmentReport, setAssignmentReport] = useState<ReportDto | null>(null)
  const {
    query,
    setQuery,
    status,
    setStatus,
    priority,
    setPriority,
    assignment,
    setAssignment,
    filteredReports,
    resetFilters,
  } = useReportFilters(reportsQuery.data ?? [])

  const totalCount = filteredReports.length
  const pendingCount = filteredReports.filter((report) => report.status === 'PendingReview').length
  const inProgressCount = filteredReports.filter((report) => report.status === 'InProgress').length
  const urgentCount = filteredReports.filter((report) => report.priority === 'Urgent').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapor Yonetimi"
        description="Tum raporlari filtreleyin, onceliklendirin ve sureci takip edin."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam" value={String(totalCount)} icon={FileWarning} variant="blue" />
        <StatCard label="Bekleyen" value={String(pendingCount)} icon={Clock3} variant="amber" />
        <StatCard label="Islemde" value={String(inProgressCount)} icon={ShieldCheck} variant="emerald" />
        <StatCard label="Acil" value={String(urgentCount)} icon={Siren} variant="red" />
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Rapor Listesi</CardTitle>
          <ReportsFilters
            query={query}
            onQueryChange={setQuery}
            status={status}
            onStatusChange={setStatus}
            priority={priority}
            onPriorityChange={setPriority}
            assignment={assignment}
            onAssignmentChange={setAssignment}
            onReset={resetFilters}
          />
        </CardHeader>
        <CardContent>
          {reportsQuery.isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Raporlar yükleniyor...</div>
          ) : reportsQuery.isError ? (
            <div className="py-10 text-center text-sm text-destructive">Raporlar yüklenemedi.</div>
          ) : (
            <ReportsTable reports={filteredReports} onAssign={setAssignmentReport} />
          )}
        </CardContent>
      </Card>
      <ReportAssignmentDialog
        key={assignmentReport?.id ?? 'closed'}
        report={assignmentReport}
        onOpenChange={(open) => {
          if (!open) setAssignmentReport(null)
        }}
      />
    </div>
  )
}
