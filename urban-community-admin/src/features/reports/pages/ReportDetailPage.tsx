import { useLocation, useNavigate, useParams } from 'react-router'
import { useState } from 'react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import {
  ArrowLeft,
  MapPin,
  Image as ImageIcon,
  Clock,
  Activity,
  Loader2,
  Phone,
  Mail,
  Building2,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { CommentSection } from '@/features/comments/components/CommentSection'
import type { ReportDto, ReportPriority, ReportStatus } from '@/types/api.types'
import { ReportPriorityBadge, ReportStatusBadge } from '@/features/reports/components/ReportBadges'
import {
  useReportDetailQuery,
  useAllowedTransitionsQuery,
  useChangeReportStatusMutation,
  useChangeReportPriorityMutation,
} from '@/features/reports/hooks/useReportDetail'
import {
  useReportCommentsQuery,
  useCreateReportCommentMutation,
  useDeleteReportCommentMutation,
} from '@/features/comments/hooks/useComments'
import { toAbsoluteUrl } from '@/lib/utils'
import { ReportAssignmentDialog } from '@/features/reports/components/ReportAssignmentDialog'

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const

const mapStatusLabel: Record<string, string> = {
  PendingReview: 'Bekliyor',
  AiReview: 'AI İncelemede',
  Confirmed: 'Onaylandı',
  InProgress: 'İşlemde',
  Resolved: 'Çözüldü',
  Rejected: 'Reddedildi',
}

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0)
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)

  const detailQuery = useReportDetailQuery(id ?? null)
  const transitionsQuery = useAllowedTransitionsQuery(id ?? null)
  const changeStatusMutation = useChangeReportStatusMutation()
  const changePriorityMutation = useChangeReportPriorityMutation()
  const commentsQuery = useReportCommentsQuery(id ?? null)
  const createCommentMutation = useCreateReportCommentMutation()
  const deleteCommentMutation = useDeleteReportCommentMutation()

  const report = detailQuery.data
  const transitions = transitionsQuery.data ?? []
  const comments = commentsQuery.data?.pages.flatMap((page) => page.items) ?? []
  const commentPages = commentsQuery.data?.pages ?? []
  const commentCount = commentPages[commentPages.length - 1]?.totalCount ?? 0

  const isUpdatingStatus = changeStatusMutation.isPending
  const isUpdatingPriority = changePriorityMutation.isPending
  const isCreating = createCommentMutation.isPending
  const reportsBasePath = location.pathname.startsWith('/official/')
    ? '/official/reports'
    : '/admin/reports'

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return
    try {
      await changeStatusMutation.mutateAsync({ id, newStatus: newStatus as ReportStatus })
    } catch {
      // error handled in mutation
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    if (!id) return
    try {
      await changePriorityMutation.mutateAsync({ id, newPriority: newPriority as ReportPriority })
    } catch {
      // error handled in mutation
    }
  }

  const handleCreateComment = async (content: string) => {
    if (!id) return
    await createCommentMutation.mutateAsync({ reportId: id, content })
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!id) return
    await deleteCommentMutation.mutateAsync({ reportId: id, commentId })
  }

  if (detailQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (detailQuery.isError || !report) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 size-4" /> Geri
        </Button>
        <div className="py-12 text-center text-sm text-destructive">Rapor yüklenemedi.</div>
      </div>
    )
  }

  const sortedHistory = report.history ? [...report.history].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
  ) : []
  const aiReviewNote = sortedHistory.find(
    (item) =>
      item.changedByUserFullName === null &&
      item.note?.toLowerCase().includes('ai'),
  )?.note
  const selectedMediaUrl = toAbsoluteUrl(report.media[selectedMediaIndex]?.url)
  const aiReviewText = report.status === 'AiReview'
    ? 'AI incelemesi devam ediyor. Kategori, öncelik ve benzer rapor analizi tamamlanınca burada görünecek.'
    : aiReviewNote ?? 'AI inceleme notu bulunamadı.'

  return (
    <div className="space-y-6">
      <PageHeader
        title={report.title}
        description={`${report.status === 'Resolved' ? 'Çözüldü' : report.status === 'InProgress' ? 'İşlemde' : report.status === 'PendingReview' ? 'Bekliyor' : report.status === 'Confirmed' ? 'Onaylandı' : report.status === 'Rejected' ? 'Reddedildi' : 'AI İncelemede'} · ${report.priority === 'Urgent' ? 'Acil' : report.priority === 'High' ? 'Yüksek' : report.priority === 'Medium' ? 'Orta' : 'Düşük'}`}
        actions={
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 size-4" /> Geri
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Gallery */}
          {report.media.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="size-4" />
                  Medya ({report.media.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div
                    className="aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer"
                    onClick={() => setPreviewImage(selectedMediaUrl)}
                  >
                    <img
                      src={selectedMediaUrl ?? '/placeholder-image.svg'}
                      alt="Rapor medyası"
                      className="size-full object-cover"
                    />
                  </div>
                  {report.media.length > 1 && (
                    <>
                      <button
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 hover:bg-background"
                        onClick={() => setSelectedMediaIndex((i) => (i - 1 + report.media.length) % report.media.length)}
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 hover:bg-background"
                        onClick={() => setSelectedMediaIndex((i) => (i + 1) % report.media.length)}
                      >
                        <ChevronRight className="size-4" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {report.media.map((_, i) => (
                          <button
                            key={i}
                            className={`size-2 rounded-full transition-colors ${
                              i === selectedMediaIndex ? 'bg-primary' : 'bg-background/60'
                            }`}
                            onClick={() => setSelectedMediaIndex(i)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Açıklama</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap text-foreground/80">{report.description}</p>
            </CardContent>
          </Card>

          {report.similarReports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Benzer Raporlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.similarReports.map((similar) => (
                  <div
                    key={similar.reportId}
                    className="rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-2">
                        <button
                          type="button"
                          onClick={() => navigate(`${reportsBasePath}/${similar.reportId}`)}
                          className="line-clamp-2 text-left text-sm font-medium text-foreground hover:text-primary"
                        >
                          {similar.title}
                        </button>
                        <div className="flex flex-wrap items-center gap-2">
                          <ReportStatusBadge status={similar.status} />
                          <Badge variant="outline">
                            %{Math.round(similar.similarityScore * 100)} benzerlik
                          </Badge>
                        </div>
                        <p className="text-xs leading-5 text-muted-foreground">
                          {similar.reasoning}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`${reportsBasePath}/${similar.reportId}`)}
                        className="shrink-0"
                      >
                        <ExternalLink className="mr-2 size-3.5" />
                        Aç
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Map */}
          {report.latitude && report.longitude && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="size-4" />
                  Konum
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden rounded-b-lg">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <iframe
                    title="Konum"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${report.longitude - 0.01}%2C${report.latitude - 0.01}%2C${report.longitude + 0.01}%2C${report.latitude + 0.01}&layer=mapnik&marker=${report.latitude}%2C${report.longitude}`}
                    className="border-0"
                  />
                </div>
                <div className="p-3 text-xs text-muted-foreground">
                  {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardContent className="pt-6">
              <CommentSection
                comments={comments}
                totalCount={commentCount}
                hasMore={commentsQuery.hasNextPage}
                isLoadingMore={commentsQuery.isFetchingNextPage}
                onLoadMore={() => commentsQuery.fetchNextPage()}
                isLoading={commentsQuery.isLoading}
                isError={commentsQuery.isError}
                onCreateComment={handleCreateComment}
                onDeleteComment={handleDeleteComment}
                isCreating={isCreating}
                placeholder="Rapor hakkında yorum yazın..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column - sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Durum</label>
                <Select
                  value={report.status}
                  onValueChange={handleStatusChange}
                  disabled={isUpdatingStatus || transitions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {transitions.map((t) => (
                      <SelectItem key={t.newStatus} value={t.newStatus}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {transitions.length === 0 && (
                  <p className="text-xs text-muted-foreground">Geçerli durumdan geçiş yapılamaz</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Öncelik</label>
                <Select
                  value={report.priority}
                  onValueChange={handlePriorityChange}
                  disabled={isUpdatingPriority}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p === 'Low' ? 'Düşük' : p === 'Medium' ? 'Orta' : p === 'High' ? 'Yüksek' : 'Acil'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* AI Review */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4" />
                AI İncelemesi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {aiReviewText}
              </p>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Durum</span>
                  <ReportStatusBadge status={report.status} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Öncelik</span>
                  <ReportPriorityBadge priority={report.priority} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Kategori</span>
                  <span className="text-right font-medium">{report.categoryName}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Benzer rapor</span>
                  <Badge variant="outline">{report.similarReports.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detaylar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="size-3.5 text-muted-foreground shrink-0" />
                <span>{report.userFullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                <span>
                  {report.neighborhoodName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                <span>{report.categoryName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-3.5 text-muted-foreground shrink-0" />
                <span>{format(new Date(report.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}</span>
              </div>
              {report.resolvedAt && (
                <div className="flex items-center gap-2">
                  <Clock className="size-3.5 text-emerald-500 shrink-0" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {format(new Date(report.resolvedAt), 'dd MMM yyyy HH:mm', { locale: tr })} tarihinde çözüldü
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Department */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Atanan Birim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {report.assignedOrganizationName ? (
                <>
                  <div className="flex items-center gap-2">
                    <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                    <span>{report.assignedOrganizationName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                    <span>{report.assignedDepartmentName}</span>
                  </div>
                  {report.assignedDepartmentContactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="size-3.5 text-muted-foreground shrink-0" />
                      <a href={`mailto:${report.assignedDepartmentContactEmail}`} className="text-primary hover:underline">
                        {report.assignedDepartmentContactEmail}
                      </a>
                    </div>
                  )}
                  {report.assignedDepartmentContactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="size-3.5 text-muted-foreground shrink-0" />
                      <a href={`tel:${report.assignedDepartmentContactPhone}`} className="text-primary hover:underline">
                        {report.assignedDepartmentContactPhone}
                      </a>
                    </div>
                  )}
                  {report.assignmentNeedsReview && (
                    <Badge variant="destructive" className="mt-1">İnceleme gerekli</Badge>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground">Henüz bir birim atanmamış.</p>
                  <Button variant="outline" size="sm" onClick={() => setAssignmentDialogOpen(true)}>
                    Birim Ata
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="size-4" />
                Durum Geçmişi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">Henüz durum değişikliği yok.</p>
              ) : (
                <div className="space-y-0">
                  {sortedHistory.map((item, index) => (
                    <div key={item.id} className="relative pb-4 pl-6 last:pb-0">
                      {index < sortedHistory.length - 1 && (
                        <div className="absolute left-2.5 top-3 h-full w-px bg-border" />
                      )}
                      <div className="absolute left-1.5 top-1.5 size-2 rounded-full border-2 border-primary bg-background" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">
                            {item.fromStatus ? mapStatusLabel[item.fromStatus] : 'Oluşturuldu'}
                          </span>
                          <span className="text-xs text-muted-foreground">→</span>
                          <span className="text-xs font-medium">{mapStatusLabel[item.toStatus]}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.changedByUserFullName ?? 'Sistem'} · {format(new Date(item.changedAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                        </p>
                        {item.note && (
                          <p className="text-xs text-foreground/70 mt-0.5">{item.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => { if (!open) setPreviewImage(null) }}>
        <DialogContent className="max-w-4xl p-0 bg-black/90">
          <DialogTitle className="sr-only">Medya Önizleme</DialogTitle>
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-2 right-2 z-10 rounded-full bg-background/20 p-1 hover:bg-background/40"
          >
            <X className="size-5 text-white" />
          </button>
          {previewImage && (
            <img src={previewImage} alt="Medya önizleme" className="max-h-[80vh] w-full object-contain" />
          )}
        </DialogContent>
      </Dialog>

      <ReportAssignmentDialog
        key={report?.id ?? 'closed'}
        report={assignmentDialogOpen ? (report as unknown as ReportDto) : null}
        onOpenChange={(open) => { if (!open) setAssignmentDialogOpen(false) }}
      />
    </div>
  )
}
