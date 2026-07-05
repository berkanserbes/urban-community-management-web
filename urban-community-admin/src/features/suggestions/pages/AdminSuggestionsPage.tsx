import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Lightbulb, ThumbsUp, Clock, CheckCircle2, Archive } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
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
import { SuggestionsTable } from '@/features/suggestions/components/SuggestionsTable'
import { SuggestionDetailSheet } from '@/features/suggestions/components/SuggestionDetailSheet'
import { SuggestionEvaluationDialog } from '@/features/suggestions/components/SuggestionEvaluationDialog'
import {
  useSuggestionsQuery,
  useChangeSuggestionStatusMutation,
  useDeleteSuggestionMutation,
  useUpdateSuggestionOfficialResponseMutation,
} from '@/features/suggestions/hooks/useSuggestions'
import type { SuggestionDto, SuggestionStatus } from '@/types/api.types'

type StatusFilter = 'all' | SuggestionStatus

export function AdminSuggestionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const suggestionsQuery = useSuggestionsQuery()
  const changeStatusMutation = useChangeSuggestionStatusMutation()
  const officialResponseMutation = useUpdateSuggestionOfficialResponseMutation()
  const deleteMutation = useDeleteSuggestionMutation()

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [deletingSuggestion, setDeletingSuggestion] = useState<SuggestionDto | null>(null)
  const [evaluatingSuggestion, setEvaluatingSuggestion] = useState<SuggestionDto | null>(null)
  const [manualDetailSuggestionId, setManualDetailSuggestionId] = useState<string | null>(null)
  const detailFromUrl = searchParams.get('detail')
  const detailSuggestionId = detailFromUrl ?? manualDetailSuggestionId

  const suggestions = useMemo(() => suggestionsQuery.data ?? [], [suggestionsQuery.data])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return suggestions
    return suggestions.filter((s) => s.status === statusFilter)
  }, [suggestions, statusFilter])

  const stats = useMemo(() => ({
    total: suggestions.length,
    active: suggestions.filter((s) => s.status === 'Active').length,
    reviewing: suggestions.filter((s) => s.status === 'Reviewing').length,
    implementation: suggestions.filter((s) => s.status === 'Implementation').length,
    closed: suggestions.filter((s) => s.status === 'Closed').length,
  }), [suggestions])

  const handleChangeStatus = async (id: string, status: SuggestionStatus) => {
    if (status === 'Closed') {
      const suggestion = suggestions.find((item) => item.id === id)
      if (suggestion) setEvaluatingSuggestion(suggestion)
      return
    }

    try {
      await changeStatusMutation.mutateAsync({ id, status })
      toast.success('Öneri durumu güncellendi')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Güncelleme başarısız')
    }
  }

  const handleEvaluationSubmit = async (officialResponse: string) => {
    if (!evaluatingSuggestion) return

    try {
      await officialResponseMutation.mutateAsync({
        id: evaluatingSuggestion.id,
        officialResponse,
      })
      await changeStatusMutation.mutateAsync({
        id: evaluatingSuggestion.id,
        status: 'Closed',
      })
      toast.success('Öneri yanıtlandı ve kapatıldı')
      setEvaluatingSuggestion(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Öneri kapatılamadı')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingSuggestion) return
    try {
      await deleteMutation.mutateAsync(deletingSuggestion.id)
      toast.success('Öneri silindi')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Silme başarısız')
    } finally {
      setDeletingSuggestion(null)
    }
  }

  const openDetail = (id: string) => {
    setManualDetailSuggestionId(id)
    setSearchParams((params) => {
      const next = new URLSearchParams(params)
      next.set('detail', id)
      return next
    })
  }

  const closeDetail = (open: boolean) => {
    if (open) return
    setManualDetailSuggestionId(null)
    setSearchParams((params) => {
      const next = new URLSearchParams(params)
      next.delete('detail')
      return next
    }, { replace: true })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Öneriler"
        description="Vatandaşların gönderdiği önerileri inceleyin ve yönetin."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Toplam" value={String(stats.total)} icon={Lightbulb} variant="blue"
          active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}
        />
        <StatCard
          label="Aktif" value={String(stats.active)} icon={ThumbsUp} variant="emerald"
          active={statusFilter === 'Active'} onClick={() => setStatusFilter('Active')}
        />
        <StatCard
          label="İncelemede" value={String(stats.reviewing)} icon={Clock} variant="amber"
          active={statusFilter === 'Reviewing'} onClick={() => setStatusFilter('Reviewing')}
        />
        <StatCard
          label="Uygulamada" value={String(stats.implementation)} icon={CheckCircle2} variant="purple"
          active={statusFilter === 'Implementation'} onClick={() => setStatusFilter('Implementation')}
        />
        <StatCard
          label="Kapatıldı" value={String(stats.closed)} icon={Archive} variant="slate"
          active={statusFilter === 'Closed'} onClick={() => setStatusFilter('Closed')}
        />
      </div>
 
      <Card>
        <CardHeader>
          <CardTitle>Öneri Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          {suggestionsQuery.isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Öneriler yükleniyor…</div>
          ) : suggestionsQuery.isError ? (
            <div className="py-12 text-center text-sm text-destructive">Öneriler yüklenemedi.</div>
          ) : (
            <SuggestionsTable
              suggestions={filtered}
              canChangeStatus
              canDelete
              onChangeStatus={handleChangeStatus}
              onDelete={setDeletingSuggestion}
              onDetail={openDetail}
            />
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deletingSuggestion !== null}
        onOpenChange={(open: boolean) => { if (!open) setDeletingSuggestion(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Öneriyi sil?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingSuggestion?.title}</strong> başlıklı öneri kalıcı olarak silinecek.
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

      <SuggestionDetailSheet
        suggestionId={detailSuggestionId}
        onOpenChange={closeDetail}
      />

      <SuggestionEvaluationDialog
        key={evaluatingSuggestion?.id ?? 'closed'}
        open={evaluatingSuggestion !== null}
        suggestionTitle={evaluatingSuggestion?.title}
        initialResponse={evaluatingSuggestion?.officialResponse}
        isSaving={officialResponseMutation.isPending || changeStatusMutation.isPending}
        onOpenChange={(open) => { if (!open) setEvaluatingSuggestion(null) }}
        onSubmit={handleEvaluationSubmit}
      />
    </div>
  )
}
