import { Lightbulb, CheckCircle2, Clock, FileText, Clock3, ShieldCheck } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSuggestionsQuery } from '@/features/suggestions/hooks/useSuggestions'
import { useManageableReportsQuery } from '@/features/reports/hooks/useReports'
import { ReportStatusBadge, ReportPriorityBadge } from '@/features/reports/components/ReportBadges'

const STATUS_COLORS: Record<string, string> = {
  Aktif: '#3b82f6',
  İncelemede: '#f59e0b',
  Uygulamada: '#10b981',
  Kapatıldı: '#6b7280',
}

export function OfficialDashboardPage() {
  const { data: suggestions } = useSuggestionsQuery()
  const { data: reports } = useManageableReportsQuery()

  const totalSuggestions = suggestions?.length ?? 0
  const reviewingCount = (suggestions ?? []).filter((s) => s.status === 'Reviewing').length
  const implementingCount = (suggestions ?? []).filter((s) => s.status === 'Implementation').length
  const totalReports = reports?.length ?? 0
  const pendingReports = (reports ?? []).filter((r) => r.status === 'PendingReview').length
  const resolvedReports = (reports ?? []).filter((r) => r.status === 'Resolved').length
  const recentReports = (reports ?? []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  const statusChartData = [
    { name: 'Aktif', value: (suggestions ?? []).filter((s) => s.status === 'Active').length },
    { name: 'İncelemede', value: reviewingCount },
    { name: 'Uygulamada', value: implementingCount },
    { name: 'Kapatıldı', value: (suggestions ?? []).filter((s) => s.status === 'Closed').length },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Öneri yönetimi genel görünüm" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Toplam Öneri" value={String(totalSuggestions)} icon={Lightbulb} variant="blue" />
        <StatCard label="İncelemede" value={String(reviewingCount)} icon={Clock} variant="amber" />
        <StatCard label="Uygulamada" value={String(implementingCount)} icon={CheckCircle2} variant="green" />
        <StatCard label="Atanan Rapor" value={String(totalReports)} icon={FileText} variant="blue" />
        <StatCard label="Bekleyen" value={String(pendingReports)} icon={Clock3} variant="amber" />
        <StatCard label="Çözülen" value={String(resolvedReports)} icon={ShieldCheck} variant="emerald" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="w-4 h-4" />
              Öneri Durum Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalSuggestions === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Henüz öneri yok</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={statusChartData}
                  margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Öneri Sayısı" radius={[4, 4, 0, 0]}>
                    {statusChartData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {recentReports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4" />
                Son Raporlar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between px-6 py-3 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{report.title}</p>
                      <p className="text-xs text-muted-foreground">{report.neighborhoodName} · {report.categoryName}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <ReportStatusBadge status={report.status} />
                      <ReportPriorityBadge priority={report.priority} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
