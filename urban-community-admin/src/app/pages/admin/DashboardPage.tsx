import { FileText, Users, Lightbulb, BarChart2, Clock3, ShieldCheck, Siren } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCategoriesQuery } from '@/features/categories/hooks/useCategories'
import { useSuggestionsQuery } from '@/features/suggestions/hooks/useSuggestions'
import { useUsersQuery } from '@/features/users/hooks/useUsers'
import { useManageableReportsQuery } from '@/features/reports/hooks/useReports'
import { ReportStatusBadge, ReportPriorityBadge } from '@/features/reports/components/ReportBadges'

const SUGGESTION_COLORS: Record<string, string> = {
  Aktif: '#3b82f6',
  İncelemede: '#f59e0b',
  Uygulamada: '#10b981',
  Kapatıldı: '#6b7280',
}

const ROLE_COLORS: Record<string, string> = {
  Admin: '#8b5cf6',
  Yetkili: '#3b82f6',
  Vatandaş: '#10b981',
}

export function AdminDashboardPage() {
  const { data: categories } = useCategoriesQuery()
  const { data: suggestions } = useSuggestionsQuery()
  const { data: users } = useUsersQuery()
  const { data: reports } = useManageableReportsQuery()

  const totalSuggestions = suggestions?.length ?? 0
  const totalUsers = users?.length ?? 0
  const totalReports = reports?.length ?? 0
  const pendingReports = (reports ?? []).filter((r) => r.status === 'PendingReview').length
  const inProgressReports = (reports ?? []).filter((r) => r.status === 'InProgress').length
  const urgentReports = (reports ?? []).filter((r) => r.priority === 'Urgent').length
  const recentReports = (reports ?? []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  const categoryChartData = (categories ?? [])
    .filter((c) => c.reportCount > 0)
    .sort((a, b) => b.reportCount - a.reportCount)
    .slice(0, 8)
    .map((c) => ({ name: c.name, 'Rapor Sayısı': c.reportCount }))

  const suggestionStatusData = [
    {
      name: 'Aktif',
      value: (suggestions ?? []).filter((s) => s.status === 'Active').length,
    },
    {
      name: 'İncelemede',
      value: (suggestions ?? []).filter((s) => s.status === 'Reviewing').length,
    },
    {
      name: 'Uygulamada',
      value: (suggestions ?? []).filter((s) => s.status === 'Implementation').length,
    },
    {
      name: 'Kapatıldı',
      value: (suggestions ?? []).filter((s) => s.status === 'Closed').length,
    },
  ].filter((d) => d.value > 0)

  const userRoleData = [
    {
      name: 'Admin',
      value: (users ?? []).filter((u) => u.role === 'Admin').length,
    },
    {
      name: 'Yetkili',
      value: (users ?? []).filter((u) => u.role === 'Official').length,
    },
    {
      name: 'Vatandaş',
      value: (users ?? []).filter((u) => u.role === 'Citizen').length,
    },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Sisteme genel bakış" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Raporlar" value={String(totalReports)} icon={FileText} variant="blue" />
        <StatCard label="Bekleyen" value={String(pendingReports)} icon={Clock3} variant="amber" />
        <StatCard label="İşlemde" value={String(inProgressReports)} icon={ShieldCheck} variant="emerald" />
        <StatCard label="Acil" value={String(urgentReports)} icon={Siren} variant="red" />
        <StatCard label="Öneriler" value={String(totalSuggestions)} icon={Lightbulb} variant="amber" />
        <StatCard label="Kullanıcılar" value={String(totalUsers)} icon={Users} variant="purple" />
      </div>

      {/* Category report bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart2 className="w-4 h-4" />
            Kategori Bazlı Rapor Sayısı
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryChartData.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Henüz rapor yok</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryChartData} margin={{ top: 4, right: 16, left: 0, bottom: 48 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="Rapor Sayısı" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Two pie charts side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="w-4 h-4" />
              Öneri Durum Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suggestionStatusData.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Henüz öneri yok</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={suggestionStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {suggestionStatusData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={SUGGESTION_COLORS[entry.name] ?? '#cbd5e1'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" />
              Kullanıcı Rol Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userRoleData.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Henüz kullanıcı yok</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {userRoleData.map((entry) => (
                      <Cell key={entry.name} fill={ROLE_COLORS[entry.name] ?? '#cbd5e1'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
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
  )
}
