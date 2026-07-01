import { ClipboardList, Clock3, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReportsFilters } from '@/features/reports/components/ReportsFilters'
import { ReportsTable } from '@/features/reports/components/ReportsTable'
import { useReportFilters } from '@/features/reports/hooks/useReportFilters'
import { useManageableReportsQuery } from '@/features/reports/hooks/useReports'

export function OfficialReportsPage() {
  const reportsQuery = useManageableReportsQuery()
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

  const pendingCount = filteredReports.filter((report) => report.status === 'PendingReview').length
  const resolvedCount = filteredReports.filter((report) => report.status === 'Resolved').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raporlarim"
        description="Birimine atanan raporlari takip et ve durumlarini guncelle."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Atanan" value={String(filteredReports.length)} icon={ClipboardList} variant="blue" />
        <StatCard label="Bekleyen" value={String(pendingCount)} icon={Clock3} variant="amber" />
        <StatCard label="Cozulen" value={String(resolvedCount)} icon={CheckCircle2} variant="emerald" />
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Atanan Raporlar</CardTitle>
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
            <ReportsTable reports={filteredReports} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
